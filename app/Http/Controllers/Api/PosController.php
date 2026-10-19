<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashRegisterAccount;
use App\Models\CashRegisterShift;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Services\CashRegisterLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PosController extends Controller
{
    public function summary()
    {
        $today = now()->toDateString();
        $sales = (float) Sale::query()->whereDate('created_at', $today)->sum('total');
        $refunds = (float) SaleReturn::query()->whereDate('created_at', $today)->sum('total_refund');

        return response()->json([
            'success' => true,
            'data' => ['today_net_sales' => round($sales - $refunds, 2)],
        ]);
    }

    public function completeSale(Request $request, CashRegisterLedger $cashLedger)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'customer_id' => 'nullable|exists:customers,id',
            'customer' => 'nullable|array',
            'customer.name' => 'required_with:customer|string|max:100',
            'customer.phone' => 'required_with:customer|string|max:30',
            'customer.address' => 'required_with:customer|string',
            'payment_method' => 'required|in:CASH,CARD,CREDIT',
            'discount' => 'nullable|numeric|min:0',
            'cash_received' => 'required_if:payment_method,CASH|nullable|numeric|min:0|decimal:0,2',
            'idempotency_key' => 'required|uuid|max:64',
            'notes' => 'nullable|string',
        ]);

        $userId = (int) $request->user()->id;
        $items = $validated['items'];
        $discount = (float) ($validated['discount'] ?? 0);
        $paymentMethod = $validated['payment_method'];
        $customerId = $validated['customer_id'] ?? null;
        $customerData = $validated['customer'] ?? null;
        $cashReceived = (float) ($validated['cash_received'] ?? 0);
        $idempotencyKey = $validated['idempotency_key'];
        $existingSale = Sale::query()->with(['customer:id,name,phone', 'user:id,name', 'items.product'])
            ->where('idempotency_key', $idempotencyKey)
            ->first();
        if ($existingSale) {
            if ($existingSale->user_id !== $userId) {
                abort(409, 'This idempotency key is already associated with another sale.');
            }

            return $this->saleResponse($existingSale);
        }
        if ($paymentMethod === 'CREDIT' && ! $customerId && ! $customerData) {
            throw ValidationException::withMessages([
                'customer' => 'تکایە کڕیارێک هەڵبژێرە یان زانیاریی کڕیاری نوێ پڕبکەرەوە.',
            ]);
        }
        if ($paymentMethod !== 'CREDIT' && ($customerId || $customerData)) {
            throw ValidationException::withMessages([
                'customer' => 'زانیاریی کڕیار تەنها بۆ فرۆشتنی قەرز پەسەندە.',
            ]);
        }

        return DB::transaction(function () use ($items, $discount, $paymentMethod, $customerId, $customerData, $cashReceived, $request, $userId, $idempotencyKey, $cashLedger) {
            $subtotal = 0;
            $costOfGoods = 0;
            $saleItemsToInsert = [];

            // 1. Lock products in a stable order and validate total requested stock per product.
            $requestedQuantities = [];
            foreach ($items as $item) {
                $productId = (int) $item['product_id'];
                $requestedQuantities[$productId] = ($requestedQuantities[$productId] ?? 0.0) + (float) $item['quantity'];
            }
            ksort($requestedQuantities);

            $productsById = [];
            $allowNegative = Setting::get('allow_negative_stock', '0') === '1';
            foreach ($requestedQuantities as $productId => $requestedQuantity) {
                $product = Product::lockForUpdate()->findOrFail($productId);
                if (! $allowNegative && $product->quantity < $requestedQuantity) {
                    throw ValidationException::withMessages([
                        'items' => "بڕی بەردەست لە {$product->name_ku} بەش ناکات (بەردەست: {$product->quantity})",
                    ]);
                }
                $productsById[$productId] = $product;
            }

            // 2. Compute totals and prepare sale items.
            foreach ($items as $item) {
                $product = $productsById[(int) $item['product_id']];
                $qty = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $lineSubtotal = $qty * $unitPrice;
                $itemTotal = $lineSubtotal;
                $itemCost = $qty * (float) $product->purchase_price;
                $itemProfit = $itemTotal - $itemCost;

                $subtotal += $lineSubtotal;
                $costOfGoods += $itemCost;

                $saleItemsToInsert[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'purchase_cost' => (float) $product->purchase_price,
                    'discount' => 0,
                    'total' => $itemTotal,
                    'profit' => $itemProfit,
                ];
            }

            $saleDiscount = min($discount, $subtotal);
            $total = max(0, $subtotal - $saleDiscount);
            if ($paymentMethod === 'CASH' && $cashReceived < $total) {
                throw ValidationException::withMessages([
                    'cash_received' => 'The cash received must cover the sale total.',
                ]);
            }
            if ($paymentMethod === 'CREDIT' && $cashReceived > $total) {
                throw ValidationException::withMessages([
                    'cash_received' => 'پارەی دراو نابێت لە کۆی فرۆشتن زیاتر بێت.',
                ]);
            }
            $customer = $paymentMethod === 'CREDIT'
                ? ($customerId ? Customer::lockForUpdate()->findOrFail($customerId) : Customer::create($customerData))
                : null;
            $customerId = $customer?->id;
            $paidAmount = $paymentMethod === 'CREDIT' ? $cashReceived : $total;
            $totalProfit = $total - $costOfGoods;
            $changeAmount = $paymentMethod === 'CASH' && $cashReceived > $total ? $cashReceived - $total : 0;
            $paymentStatus = $paymentMethod === 'CREDIT'
                ? ($paidAmount <= 0 ? 'DUE' : ($paidAmount < $total ? 'PARTIAL' : 'PAID'))
                : 'PAID';

            // 2. Generate unique daily invoice number: INV-YYYYMMDD-XXXX
            $datePrefix = 'INV-'.now()->format('Ymd').'-';
            $todayCount = Sale::where('invoice_number', 'like', "{$datePrefix}%")->count() + 1;
            $invoiceNumber = $datePrefix.str_pad($todayCount, 3, '0', STR_PAD_LEFT);

            // 3. Insert Sale
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => $userId,
                'customer_id' => $customerId,
                'subtotal' => $subtotal,
                'discount' => $saleDiscount,
                'tax' => 0,
                'total' => $total,
                'cost_of_goods' => $costOfGoods,
                'profit' => $totalProfit,
                'cash_received' => $paymentMethod === 'CREDIT' ? $paidAmount : $cashReceived,
                'change_amount' => $changeAmount,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'notes' => $request->notes,
                'idempotency_key' => $idempotencyKey,
            ]);

            // 4. Insert Items and Deduct Inventory
            $createdItems = [];
            foreach ($saleItemsToInsert as $entry) {
                $product = $entry['product'];
                $prevQty = (float) $product->quantity;
                $newQty = $prevQty - $entry['quantity'];

                // Deduct stock
                $product->update(['quantity' => $newQty]);

                // Create Sale Item
                $saleItem = SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $entry['quantity'],
                    'unit_price' => $entry['unit_price'],
                    'purchase_cost' => $entry['purchase_cost'],
                    'discount' => $entry['discount'],
                    'total' => $entry['total'],
                    'profit' => $entry['profit'],
                ]);

                // Log Stock Movement
                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'SALE',
                    'quantity' => $entry['quantity'],
                    'previous_quantity' => $prevQty,
                    'new_quantity' => $newQty,
                    'reference_type' => 'SALE',
                    'reference_id' => $sale->id,
                    'user_id' => $userId,
                    'notes' => "فرۆشتنی وەسڵ {$invoiceNumber}",
                    'created_at' => now(),
                ]);

                $createdItems[] = [
                    'id' => $saleItem->id,
                    'product_id' => $product->id,
                    'name_ku' => $product->name_ku,
                    'barcode' => $product->barcode,
                    'quantity' => $entry['quantity'],
                    'unit_price' => $entry['unit_price'],
                    'discount' => $entry['discount'],
                    'total' => $entry['total'],
                ];
            }

            // 5. Customer debt management if Credit
            if ($customer) {
                $customer->increment('total_purchases', $total);
                $customer->increment('total_paid', $paidAmount);
                $remainingDebt = max(0, $total - $paidAmount);
                if ($remainingDebt > 0) {
                    $customer->increment('debt', $remainingDebt);
                }
            }

            // 6. Payment Record
            if ($paymentMethod !== 'CREDIT' || $paidAmount > 0) {
                $payment = Payment::create([
                    'payment_type' => 'SALE_PAYMENT',
                    'reference_id' => $sale->id,
                    'party_type' => 'CUSTOMER',
                    'party_id' => $customerId,
                    'amount' => $paidAmount,
                    'payment_method' => $paymentMethod === 'CREDIT' ? 'CASH' : $paymentMethod,
                    'user_id' => $userId,
                    'notes' => "پارەدان بۆ وەسڵی {$invoiceNumber}",
                    'created_at' => now(),
                ]);

                if ($paymentMethod === 'CASH') {
                    $shift = $this->activeCashShift($userId);
                    $cashLedger->record(
                        'SALE',
                        'IN',
                        (string) $total,
                        $userId,
                        "Cash sale {$invoiceNumber}",
                        $request->notes,
                        'SALE',
                        $sale->id,
                        $idempotencyKey,
                        $shift->id,
                    );
                } elseif ($paymentMethod === 'CREDIT' && $paidAmount > 0) {
                    $shift = $this->activeCashShift($userId);
                    $cashLedger->record(
                        'CUSTOMER_PAYMENT',
                        'IN',
                        (string) $paidAmount,
                        $userId,
                        "Cash received for credit sale {$invoiceNumber}",
                        $request->notes,
                        'PAYMENT',
                        $payment->id,
                        shiftId: $shift->id,
                    );
                }
            }

            // 7. Activity Log
            ActivityLog::log('SALE', 'SALE', $sale->id, "تەواوکردنی فرۆشتنی وەسڵ {$invoiceNumber} بە بڕی {$total}", $userId);

            return response()->json([
                'success' => true,
                'message' => 'Sale completed successfully',
                'data' => [
                    'sale' => $sale->load(['customer:id,name,phone', 'user:id,name']),
                    'items' => $createdItems,
                ],
            ]);
        });
    }

    private function activeCashShift(int $userId): CashRegisterShift
    {
        $account = CashRegisterAccount::query()->lockForUpdate()->findOrFail(1);
        $shift = CashRegisterShift::query()->whereNotNull('active_slot')->lockForUpdate()->first();
        if ($shift) {
            return $shift;
        }

        return CashRegisterShift::create([
            'opened_by' => $userId,
            'active_slot' => 1,
            'opening_balance' => $account->balance,
            'opened_at' => now(),
        ]);
    }

    private function saleResponse(Sale $sale)
    {
        $items = $sale->items->map(fn (SaleItem $item) => [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'name_ku' => $item->product?->name_ku,
            'barcode' => $item->product?->barcode,
            'quantity' => $item->quantity,
            'unit_price' => $item->unit_price,
            'discount' => $item->discount,
            'total' => $item->total,
        ])->values();

        return response()->json([
            'success' => true,
            'message' => 'Sale completed successfully',
            'data' => ['sale' => $sale, 'items' => $items],
        ]);
    }
}
