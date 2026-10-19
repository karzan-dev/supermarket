<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\StockMovement;
use App\Services\CashRegisterLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReturnController extends Controller
{
    public function index()
    {
        $returns = SaleReturn::with(['user:id,name', 'customer:id,name', 'items.product'])->latest()->get();

        return response()->json(['success' => true, 'data' => $returns]);
    }

    public function findByInvoice($invoiceNumber)
    {
        $sale = Sale::with(['items.product', 'customer', 'user:id,name'])
            ->where('invoice_number', $invoiceNumber)
            ->first();

        if (! $sale) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }

        $this->appendReturnedQuantities(collect([$sale]));

        return response()->json(['success' => true, 'data' => $sale]);
    }

    public function searchSales(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string|min:1|max:100|required_without_all:start_date,end_date',
            'start_date' => 'nullable|date_format:Y-m-d|required_with:end_date',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date|required_with:start_date',
            'time_period' => 'nullable|in:morning,noon,evening,maghrib,night,midnight',
        ]);
        $term = trim($validated['query'] ?? '');
        $timeRanges = [
            'morning' => ['05:00:00', '12:00:00'],
            'noon' => ['12:00:00', '17:00:00'],
            'evening' => ['17:00:00', '19:00:00'],
            'maghrib' => ['19:00:00', '20:00:00'],
            'night' => ['20:00:00', null],
            'midnight' => ['00:00:00', '05:00:00'],
        ];

        $sales = Sale::with(['items.product', 'customer', 'user:id,name'])
            ->when($term !== '', function ($salesQuery) use ($term) {
                $salesQuery->where(function ($query) use ($term) {
                    $query->where('invoice_number', 'like', "%{$term}%")
                        ->orWhereHas('items.product', function ($productQuery) use ($term) {
                            $productQuery->where('barcode', 'like', "%{$term}%")
                                ->orWhere('name_ku', 'like', "%{$term}%");
                        });
                    });
            })
            ->when(isset($validated['start_date']), fn ($query) => $query->whereDate('created_at', '>=', $validated['start_date']))
            ->when(isset($validated['end_date']), fn ($query) => $query->whereDate('created_at', '<=', $validated['end_date']))
            ->when(isset($validated['time_period']), function ($query) use ($validated, $timeRanges) {
                [$startTime, $endTime] = $timeRanges[$validated['time_period']];
                $query->whereTime('created_at', '>=', $startTime);
                if ($endTime !== null) {
                    $query->whereTime('created_at', '<', $endTime);
                }
            })
            ->latest('id')
            ->limit(30)
            ->get();

        $this->appendReturnedQuantities($sales);

        return response()->json(['success' => true, 'data' => $sales]);
    }

    private function appendReturnedQuantities($sales): void
    {
        if ($sales->isEmpty()) {
            return;
        }

        $returnedQuantities = DB::table('returns')
            ->join('return_items', 'returns.id', '=', 'return_items.return_id')
            ->whereIn('returns.sale_id', $sales->pluck('id'))
            ->selectRaw('returns.sale_id, return_items.product_id, SUM(return_items.quantity) as returned_quantity')
            ->groupBy('returns.sale_id', 'return_items.product_id')
            ->get()
            ->keyBy(fn ($row) => $row->sale_id.':'.$row->product_id);

        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $key = $sale->id.':'.$item->product_id;
                $item->setAttribute('returned_quantity', (float) ($returnedQuantities->get($key)->returned_quantity ?? 0));
            }
        }
    }

    public function processReturn(Request $request, CashRegisterLedger $cashLedger)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:255',
            'idempotency_key' => 'required|uuid|max:64',
        ]);

        $userId = (int) $request->user()->id;
        $saleId = (int) $validated['sale_id'];
        $items = $validated['items'];
        $normalizedItems = collect($items)->groupBy('product_id')
            ->map(fn ($group) => number_format((float) $group->sum('quantity'), 2, '.', ''))
            ->sortKeys()
            ->all();
        $requestHash = hash('sha256', json_encode([
            $saleId,
            $normalizedItems,
            $validated['reason'] ?? 'گێڕانەوەی کاڵا',
        ], JSON_THROW_ON_ERROR));
        $idempotencyKey = $validated['idempotency_key'];
        $existingReturn = SaleReturn::query()->where('idempotency_key', $idempotencyKey)->first();
        if ($existingReturn) {
            return $this->idempotentResponse($existingReturn, $userId, $requestHash);
        }

        return DB::transaction(function () use ($saleId, $items, $request, $userId, $cashLedger, $idempotencyKey, $requestHash) {
            $sale = Sale::lockForUpdate()->findOrFail($saleId);
            $existingReturn = SaleReturn::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existingReturn) {
                return $this->idempotentResponse($existingReturn, $userId, $requestHash);
            }

            $totalRefund = 0;
            $itemsToReturn = [];
            $requestedQuantities = [];

            foreach ($items as $item) {
                $qty = (float) $item['quantity'];
                $productId = (int) $item['product_id'];
                $requestedQuantities[$productId] = ($requestedQuantities[$productId] ?? 0) + $qty;
            }

            foreach ($requestedQuantities as $productId => $quantity) {
                $saleItem = SaleItem::query()->where('sale_id', $sale->id)
                    ->where('product_id', $productId)->lockForUpdate()->first();
                if (! $saleItem) {
                    throw ValidationException::withMessages(['items' => 'A returned product was not part of the original sale.']);
                }

                $alreadyReturned = (float) ReturnItem::query()
                    ->whereHas('return', fn ($query) => $query->where('sale_id', $sale->id))
                    ->where('product_id', $productId)
                    ->sum('quantity');
                if ($alreadyReturned + $quantity > (float) $saleItem->quantity) {
                    throw ValidationException::withMessages([
                        'items' => 'The return quantity exceeds the quantity sold and not previously returned.',
                    ]);
                }

                $price = (float) $saleItem->unit_price;
                $discountFactor = (float) $sale->subtotal > 0 ? (float) $sale->total / (float) $sale->subtotal : 0;
                $refundUnitPrice = round($price * $discountFactor, 2);
                $lineTotal = round($quantity * $refundUnitPrice, 2);
                $totalRefund += $lineTotal;

                $itemsToReturn[] = [
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'unit_price' => $refundUnitPrice,
                    'total' => $lineTotal,
                ];
            }

            // 1. Create Return record
            $return = SaleReturn::create([
                'sale_id' => $sale->id,
                'invoice_number' => $sale->invoice_number,
                'customer_id' => $sale->customer_id,
                'user_id' => $userId,
                'total_refund' => $totalRefund,
                'reason' => $request->input('reason') ?? 'گێڕانەوەی کاڵا',
                'idempotency_key' => $idempotencyKey,
                'request_hash' => $requestHash,
            ]);

            // 2. Insert items and restore inventory
            foreach ($itemsToReturn as $entry) {
                ReturnItem::create([
                    'return_id' => $return->id,
                    'product_id' => $entry['product_id'],
                    'quantity' => $entry['quantity'],
                    'unit_price' => $entry['unit_price'],
                    'total' => $entry['total'],
                ]);

                $product = Product::lockForUpdate()->find($entry['product_id']);
                $prevQty = (float) $product->quantity;
                $newQty = $prevQty + $entry['quantity'];

                $product->update(['quantity' => $newQty]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'RETURN',
                    'quantity' => $entry['quantity'],
                    'previous_quantity' => $prevQty,
                    'new_quantity' => $newQty,
                    'reference_type' => 'RETURN',
                    'reference_id' => $return->id,
                    'user_id' => $userId,
                    'notes' => "گێڕانەوە لە وەسڵی {$sale->invoice_number}",
                    'created_at' => now(),
                ]);
            }

            $cashRefund = $totalRefund;
            $customer = $sale->customer_id ? Customer::lockForUpdate()->find($sale->customer_id) : null;
            if ($customer && $sale->payment_method === 'CREDIT') {
                $debtOffset = min((float) $customer->debt, $totalRefund);
                if ($debtOffset > 0) {
                    $customer->decrement('debt', $debtOffset);
                    $cashRefund = round($totalRefund - $debtOffset, 2);
                }
            }

            if ($cashRefund > 0) {
                Payment::create([
                    'payment_type' => 'REFUND',
                    'reference_id' => $return->id,
                    'party_type' => $customer ? 'CUSTOMER' : null,
                    'party_id' => $customer?->id,
                    'amount' => $cashRefund,
                    'payment_method' => 'CASH',
                    'user_id' => $userId,
                    'notes' => "گەڕاندنەوەی پارە بۆ وەسڵی {$sale->invoice_number}",
                    'created_at' => now(),
                ]);
                $cashLedger->record(
                    'RETURN',
                    'OUT',
                    (string) $cashRefund,
                    $userId,
                    "Cash refund for {$sale->invoice_number}",
                    $request->input('reason'),
                    'RETURN',
                    $return->id,
                );
            }

            ActivityLog::log('RETURN', 'SALE', $sale->id, "گێڕانەوەی کاڵا لە وەسڵی {$sale->invoice_number} بە کۆی {$totalRefund}", $userId);

            return response()->json([
                'success' => true,
                'message' => 'Return processed successfully',
                'data' => $return->load('items.product'),
            ]);
        });
    }

    private function idempotentResponse(SaleReturn $return, int $userId, string $requestHash)
    {
        if ($return->user_id !== $userId || $return->request_hash !== $requestHash) {
            abort(409, 'The idempotency key has already been used for a different return.');
        }

        return response()->json([
            'success' => true,
            'message' => 'Return already processed',
            'data' => $return->load('items.product'),
        ]);
    }
}
