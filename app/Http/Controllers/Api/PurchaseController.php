<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with(['supplier:id,name,company', 'user:id,name'])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $purchases]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => 'required|string|unique:purchases,invoice_number',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.purchase_price' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $userId = (int) $request->user()->id;
        $items = $request->items;
        $paidAmount = (float) $request->paid_amount;
        $supplierId = $request->supplier_id;
        $receiptImage = $request->file('receipt_image')?->store('purchase-receipts', 'public');

        try {
            return DB::transaction(function () use ($items, $paidAmount, $supplierId, $request, $userId, $receiptImage) {
                $total = 0;
                $itemsData = [];

                foreach ($items as $item) {
                    $qty = (float) $item['quantity'];
                    $price = (float) $item['purchase_price'];
                    $itemTotal = $qty * $price;
                    $total += $itemTotal;

                    $itemsData[] = [
                        'product_id' => $item['product_id'],
                        'quantity' => $qty,
                        'purchase_price' => $price,
                        'total' => $itemTotal,
                    ];
                }

                $remainingAmount = max(0, $total - $paidAmount);
                $paymentStatus = $remainingAmount == 0 ? 'PAID' : ($paidAmount > 0 ? 'PARTIAL' : 'DUE');

                // 1. Create Purchase
                $purchase = Purchase::create([
                    'invoice_number' => $request->invoice_number,
                    'receipt_image' => $receiptImage,
                    'supplier_id' => $supplierId,
                    'user_id' => $userId,
                    'total' => $total,
                    'paid_amount' => $paidAmount,
                    'remaining_amount' => $remainingAmount,
                    'payment_status' => $paymentStatus,
                    'notes' => $request->notes,
                ]);

                // 2. Insert items and replenish inventory
                $previousPrices = [];
                foreach ($itemsData as $entry) {
                    $product = Product::lockForUpdate()->findOrFail($entry['product_id']);
                    $previousPrices[$product->id] ??= (float) $product->purchase_price;
                    PurchaseItem::create([
                        'purchase_id' => $purchase->id,
                        'product_id' => $entry['product_id'],
                        'quantity' => $entry['quantity'],
                        'purchase_price' => $entry['purchase_price'],
                        'previous_purchase_price' => $previousPrices[$product->id],
                        'total' => $entry['total'],
                    ]);

                    $prevQty = (float) $product->quantity;
                    $newQty = $prevQty + $entry['quantity'];

                    // Update product stock and optionally cost price
                    $product->update([
                        'quantity' => $newQty,
                        'purchase_price' => $entry['purchase_price'],
                    ]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => 'PURCHASE',
                        'quantity' => $entry['quantity'],
                        'previous_quantity' => $prevQty,
                        'new_quantity' => $newQty,
                        'reference_type' => 'PURCHASE',
                        'reference_id' => $purchase->id,
                        'user_id' => $userId,
                        'notes' => "کڕین لە دابینکەر - پسوولەی {$request->invoice_number}",
                        'created_at' => now(),
                    ]);
                }

                // 3. Update Supplier balance
                $supplier = Supplier::lockForUpdate()->find($supplierId);
                $supplier->increment('total_purchases', $total);
                $supplier->increment('total_paid', $paidAmount);
                if ($remainingAmount > 0) {
                    $supplier->increment('debt', $remainingAmount);
                }

                // 4. Log Payment if any
                if ($paidAmount > 0) {
                    $payment = Payment::create([
                        'payment_type' => 'SUPPLIER_PAYMENT',
                        'reference_id' => $purchase->id,
                        'party_type' => 'SUPPLIER',
                        'party_id' => $supplierId,
                        'amount' => $paidAmount,
                        'payment_method' => 'CASH',
                        'user_id' => $userId,
                        'notes' => "پارەدان بۆ کڕینی پسوولەی {$request->invoice_number}",
                        'created_at' => now(),
                    ]);
                }

                ActivityLog::log('PURCHASE', 'PURCHASE', $purchase->id, "کڕینی کاڵا لە دابینکەر {$supplier->name} بە کۆی {$total}", $userId);

                return response()->json([
                    'success' => true,
                    'message' => 'Purchase recorded successfully',
                    'data' => $purchase->load(['supplier', 'items.product']),
                ], 201);
            });
        } catch (Throwable $error) {
            if ($receiptImage) {
                Storage::disk('public')->delete($receiptImage);
            }

            throw $error;
        }
    }

    public function show($id)
    {
        $purchase = Purchase::with(['supplier', 'items.product', 'user:id,name'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $purchase]);
    }

    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => "required|string|max:50|unique:purchases,invoice_number,{$purchase->id}",
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.purchase_price' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $newImage = $request->file('receipt_image')?->store('purchase-receipts', 'public');
        $oldImage = $purchase->receipt_image;
        $userId = (int) $request->user()->id;

        try {
            $updatedPurchase = DB::transaction(function () use ($data, $purchase, $newImage, $userId) {
                $purchase = Purchase::query()->lockForUpdate()->with('items')->findOrFail($purchase->id);
                $oldItems = $purchase->items;
                $oldTotal = (float) $purchase->total;
                $oldPaid = (float) $purchase->paid_amount;
                $oldRemaining = (float) $purchase->remaining_amount;
                $oldSupplierId = (int) $purchase->supplier_id;
                $newPaid = (float) $data['paid_amount'];

                $lines = collect($data['items'])->map(fn (array $item) => [
                    'product_id' => (int) $item['product_id'],
                    'quantity' => (float) $item['quantity'],
                    'purchase_price' => (float) $item['purchase_price'],
                    'total' => (float) $item['quantity'] * (float) $item['purchase_price'],
                ]);
                $newTotal = (float) $lines->sum('total');
                $newRemaining = max(0, $newTotal - $newPaid);

                $oldQuantities = $oldItems->groupBy('product_id')
                    ->map(fn ($items) => (float) $items->sum('quantity'));
                $newQuantities = $lines->groupBy('product_id')
                    ->map(fn ($items) => (float) $items->sum('quantity'));
                $productIds = $oldQuantities->keys()->merge($newQuantities->keys())->unique()->sort()->values();
                $products = Product::query()->whereIn('id', $productIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

                foreach ($productIds as $productId) {
                    $product = $products->get($productId);
                    $previousQuantity = (float) $product->quantity;
                    $quantityDelta = (float) $newQuantities->get($productId, 0) - (float) $oldQuantities->get($productId, 0);
                    $newQuantity = $previousQuantity + $quantityDelta;

                    if ($newQuantity < 0) {
                        throw ValidationException::withMessages([
                            'items' => ["ناتوانرێت کڕین دەستکاری یان بسڕدرێتەوە؛ کاڵای {$product->name_ku} لە کۆگا بە بڕی پێویست بوونی نییە."],
                        ]);
                    }

                    if ($quantityDelta != 0.0) {
                        $product->update(['quantity' => $newQuantity]);
                        StockMovement::create([
                            'product_id' => $product->id,
                            'movement_type' => 'ADJUSTMENT',
                            'quantity' => abs($quantityDelta),
                            'previous_quantity' => $previousQuantity,
                            'new_quantity' => $newQuantity,
                            'reference_type' => 'PURCHASE_EDIT',
                            'reference_id' => $purchase->id,
                            'user_id' => $userId,
                            'notes' => "ڕێکخستنەوەی کۆگا بەهۆی دەستکاری پسوولەی {$purchase->invoice_number}",
                            'created_at' => now(),
                        ]);
                    }
                }

                $previousPrices = $oldItems->groupBy('product_id')->map(function ($items) {
                    $itemWithPreviousPrice = $items->first(fn (PurchaseItem $item) => $item->previous_purchase_price !== null);

                    return $itemWithPreviousPrice?->previous_purchase_price;
                });
                $purchase->items()->delete();
                foreach ($lines as $line) {
                    $productId = $line['product_id'];
                    PurchaseItem::create([
                        'purchase_id' => $purchase->id,
                        ...$line,
                        'previous_purchase_price' => $previousPrices->get($productId)
                            ?? (float) $products->get($productId)->purchase_price,
                    ]);
                }

                $status = $newRemaining == 0 ? 'PAID' : ($newPaid > 0 ? 'PARTIAL' : 'DUE');
                $purchase->update([
                    'invoice_number' => $data['invoice_number'],
                    'supplier_id' => $data['supplier_id'],
                    'total' => $newTotal,
                    'paid_amount' => $newPaid,
                    'remaining_amount' => $newRemaining,
                    'payment_status' => $status,
                    'notes' => $data['notes'] ?? null,
                    'receipt_image' => $newImage ?? $purchase->receipt_image,
                ]);

                $this->refreshSupplierBalances(
                    $oldSupplierId,
                    $oldTotal,
                    $oldPaid,
                    $oldRemaining,
                    (int) $data['supplier_id'],
                    $newTotal,
                    $newPaid,
                    $newRemaining,
                );
                $this->syncPurchasePayment($purchase, (int) $data['supplier_id'], $newPaid);
                foreach ($productIds as $productId) {
                    $purchasePrice = PurchaseItem::query()
                        ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $productId)
                        ->orderByDesc('purchases.created_at')
                        ->orderByDesc('purchases.id')
                        ->orderByDesc('purchase_items.id')
                        ->value('purchase_items.purchase_price');

                    if ($purchasePrice !== null) {
                        $products->get($productId)->update(['purchase_price' => $purchasePrice]);
                    } elseif ($previousPrices->get($productId) !== null) {
                        $products->get($productId)->update(['purchase_price' => $previousPrices->get($productId)]);
                    }
                }

                ActivityLog::log('UPDATE', 'PURCHASE', $purchase->id, "دەستکاریی کڕینی پسوولەی {$purchase->invoice_number}", $userId);

                return $purchase->fresh()->load(['supplier', 'items.product']);
            });
        } catch (Throwable $error) {
            if ($newImage) {
                Storage::disk('public')->delete($newImage);
            }

            if ($error instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => $error->validator->errors()->first(),
                ], 422);
            }

            throw $error;
        }

        if ($newImage && $oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return response()->json(['success' => true, 'data' => $updatedPurchase]);
    }

    public function destroy(Request $request, $id)
    {
        $userId = (int) $request->user()->id;
        $image = null;

        try {
            DB::transaction(function () use ($id, $userId, &$image) {
                $purchase = Purchase::query()->lockForUpdate()->with('items')->findOrFail($id);
                $supplierId = (int) $purchase->supplier_id;
                $total = (float) $purchase->total;
                $paid = (float) $purchase->paid_amount;
                $remaining = (float) $purchase->remaining_amount;
                $image = $purchase->receipt_image;

                $quantities = $purchase->items->groupBy('product_id')
                    ->map(fn ($items) => (float) $items->sum('quantity'));
                $products = Product::query()->whereIn('id', $quantities->keys())->orderBy('id')->lockForUpdate()->get()->keyBy('id');

                foreach ($quantities as $productId => $quantity) {
                    $product = $products->get($productId);
                    $previousQuantity = (float) $product->quantity;
                    $newQuantity = $previousQuantity - $quantity;
                    if ($newQuantity < 0) {
                        throw ValidationException::withMessages([
                            'purchase' => ["ناتوانرێت ئەم کڕینە بسڕدرێتەوە؛ کاڵای {$product->name_ku} لە کۆگا بە بڕی پێویست بوونی نییە."],
                        ]);
                    }

                    $product->update(['quantity' => $newQuantity]);
                    StockMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => 'ADJUSTMENT',
                        'quantity' => $quantity,
                        'previous_quantity' => $previousQuantity,
                        'new_quantity' => $newQuantity,
                        'reference_type' => 'PURCHASE_REVERSAL',
                        'reference_id' => $purchase->id,
                        'user_id' => $userId,
                        'notes' => "گەڕاندنەوەی کاڵا بەهۆی سڕینەوەی پسوولەی {$purchase->invoice_number}",
                        'created_at' => now(),
                    ]);
                }

                $this->refreshSupplierBalances($supplierId, $total, $paid, $remaining, $supplierId, 0, 0, 0);
                Payment::query()->where('payment_type', 'SUPPLIER_PAYMENT')
                    ->where('reference_id', $purchase->id)
                    ->delete();

                foreach ($quantities->keys() as $productId) {
                    $previousPrice = $purchase->items->firstWhere('product_id', $productId)?->previous_purchase_price;
                    $latestPrice = PurchaseItem::query()
                        ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $productId)
                        ->where('purchase_items.purchase_id', '!=', $purchase->id)
                        ->orderByDesc('purchases.created_at')
                        ->orderByDesc('purchases.id')
                        ->orderByDesc('purchase_items.id')
                        ->value('purchase_items.purchase_price');
                    if ($latestPrice !== null) {
                        $products->get($productId)->update(['purchase_price' => $latestPrice]);
                    } elseif ($previousPrice !== null) {
                        $products->get($productId)->update(['purchase_price' => $previousPrice]);
                    }
                }

                ActivityLog::log('DELETE', 'PURCHASE', $purchase->id, "سڕینەوەی کڕینی پسوولەی {$purchase->invoice_number}", $userId);
                $purchase->delete();
            });
        } catch (ValidationException $error) {
            return response()->json([
                'success' => false,
                'message' => $error->validator->errors()->first(),
            ], 422);
        }

        if ($image) {
            Storage::disk('public')->delete($image);
        }

        return response()->json(['success' => true, 'message' => 'Purchase deleted']);
    }

    private function refreshSupplierBalances(
        int $oldSupplierId,
        float $oldTotal,
        float $oldPaid,
        float $oldRemaining,
        int $newSupplierId,
        float $newTotal,
        float $newPaid,
        float $newRemaining,
    ): void {
        $supplierIds = collect([$oldSupplierId, $newSupplierId])->unique()->sort();
        $suppliers = Supplier::query()->whereIn('id', $supplierIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

        if ($oldSupplierId === $newSupplierId) {
            $supplier = $suppliers->get($oldSupplierId);
            $supplier->update([
                'total_purchases' => max(0, (float) $supplier->total_purchases - $oldTotal + $newTotal),
                'total_paid' => max(0, (float) $supplier->total_paid - $oldPaid + $newPaid),
                'debt' => max(0, (float) $supplier->debt + $newRemaining - $oldRemaining),
            ]);

            return;
        }

        $oldSupplier = $suppliers->get($oldSupplierId);
        $oldSupplier->update([
            'total_purchases' => max(0, (float) $oldSupplier->total_purchases - $oldTotal),
            'total_paid' => max(0, (float) $oldSupplier->total_paid - $oldPaid),
            'debt' => max(0, (float) $oldSupplier->debt - $oldRemaining),
        ]);

        $newSupplier = $suppliers->get($newSupplierId);
        $newSupplier->update([
            'total_purchases' => (float) $newSupplier->total_purchases + $newTotal,
            'total_paid' => (float) $newSupplier->total_paid + $newPaid,
            'debt' => (float) $newSupplier->debt + $newRemaining,
        ]);
    }

    private function syncPurchasePayment(Purchase $purchase, int $supplierId, float $paidAmount): void
    {
        $payment = Payment::query()->where('payment_type', 'SUPPLIER_PAYMENT')
            ->where('reference_id', $purchase->id)
            ->first();

        if ($paidAmount <= 0) {
            $payment?->delete();

            return;
        }

        $values = [
            'party_id' => $supplierId,
            'amount' => $paidAmount,
            'notes' => "پارەدان بۆ کڕینی پسوولەی {$purchase->invoice_number}",
        ];
        if ($payment) {
            $payment->update($values);

            return;
        }

        Payment::create([
            'payment_type' => 'SUPPLIER_PAYMENT',
            'reference_id' => $purchase->id,
            'party_type' => 'SUPPLIER',
            'party_id' => $supplierId,
            'amount' => $paidAmount,
            'payment_method' => 'CASH',
            'user_id' => $purchase->user_id,
            'notes' => $values['notes'],
            'created_at' => now(),
        ]);
    }
}
