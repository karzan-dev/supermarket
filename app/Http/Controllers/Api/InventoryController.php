<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryController extends Controller
{
    public function damage()
    {
        $damageQuery = StockMovement::query()->where('movement_type', 'DAMAGE');
        $stats = (clone $damageQuery)
            ->selectRaw('COUNT(DISTINCT product_id) as affected_products, COALESCE(SUM(quantity), 0) as damaged_quantity')
            ->first();
        $movements = (clone $damageQuery)
            ->with(['product:id,barcode,name_ku', 'user:id,name'])
            ->latest('created_at')
            ->limit(100)
            ->get()
            ->map(fn (StockMovement $movement) => [
                'id' => $movement->id,
                'product_id' => $movement->product_id,
                'name_ku' => $movement->product?->name_ku,
                'barcode' => $movement->product?->barcode,
                'quantity' => (float) $movement->quantity,
                'damage_reason' => $movement->damage_reason,
                'previous_quantity' => (float) $movement->previous_quantity,
                'new_quantity' => (float) $movement->new_quantity,
                'notes' => $movement->notes,
                'user_name' => $movement->user?->name,
                'created_at' => $movement->created_at?->format('Y-m-d H:i'),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'affected_products' => (int) ($stats->affected_products ?? 0),
                'damaged_quantity' => (float) ($stats->damaged_quantity ?? 0),
                'movements' => $movements,
            ],
        ]);
    }

    public function recordDamage(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1|max:9999999999',
            'damage_reason' => 'required|in:BROKEN,SPOILED,EXPIRED,OPENED_USED,CONTAMINATED,TRANSPORT,STORAGE,OTHER',
            'notes' => 'nullable|string|max:2000',
        ]);

        $movement = DB::transaction(function () use ($data, $request) {
            $product = Product::query()->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->findOrFail($data['product_id']);

            $previousHundredths = (int) round((float) $product->quantity * 100);
            $damagedHundredths = (int) round((float) $data['quantity'] * 100);
            if ($damagedHundredths > $previousHundredths) {
                throw ValidationException::withMessages([
                    'quantity' => 'The damaged quantity cannot exceed the available stock.',
                ]);
            }

            $newHundredths = $previousHundredths - $damagedHundredths;
            $previousQuantity = number_format($previousHundredths / 100, 2, '.', '');
            $damagedQuantity = number_format($damagedHundredths / 100, 2, '.', '');
            $newQuantity = number_format($newHundredths / 100, 2, '.', '');

            $product->update(['quantity' => $newQuantity]);
            $movement = StockMovement::create([
                'product_id' => $product->id,
                'movement_type' => 'DAMAGE',
                'damage_reason' => $data['damage_reason'],
                'quantity' => $damagedQuantity,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $newQuantity,
                'reference_type' => 'DAMAGE',
                'user_id' => (int) $request->user()->id,
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
            ]);

            ActivityLog::log(
                'PRODUCT_DAMAGE',
                'PRODUCT',
                $product->id,
                "Recorded {$damagedQuantity} damaged units of {$product->name_ku} ({$data['damage_reason']})",
                (int) $request->user()->id,
            );

            return $movement;
        });

        return response()->json([
            'success' => true,
            'data' => $movement->load('product:id,barcode,name_ku', 'user:id,name'),
        ], 201);
    }

    public function movements()
    {
        $totals = StockMovement::query()
            ->selectRaw("
                COALESCE(SUM(CASE WHEN movement_type = 'SALE' THEN ABS(quantity) ELSE 0 END), 0) as sold_quantity,
                COALESCE(SUM(CASE WHEN movement_type = 'PURCHASE' THEN ABS(quantity) ELSE 0 END), 0) as purchased_quantity
            ")
            ->first();

        $movements = StockMovement::with([
            'product:id,barcode,name_ku',
            'user:id,name',
        ])
            ->latest('created_at')
            ->limit(500)
            ->get()
            ->map(fn (StockMovement $movement) => [
                'id' => $movement->id,
                'product_id' => $movement->product_id,
                'barcode' => $movement->product?->barcode,
                'name_ku' => $movement->product?->name_ku,
                'movement_type' => $movement->movement_type,
                'quantity' => (float) $movement->quantity,
                'previous_quantity' => (float) $movement->previous_quantity,
                'new_quantity' => (float) $movement->new_quantity,
                'reference_type' => $movement->reference_type,
                'reference_id' => $movement->reference_id,
                'user_name' => $movement->user?->name,
                'notes' => $movement->notes,
                'created_at' => $movement->created_at?->toISOString(),
            ]);

        return response()->json([
            'success' => true,
            'data' => $movements,
            'totals' => [
                'sold_quantity' => (float) $totals->sold_quantity,
                'purchased_quantity' => (float) $totals->purchased_quantity,
            ],
        ]);
    }

    public function adjust(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'new_quantity' => 'required|numeric|min:0',
            'reason' => 'required|in:ADJUSTMENT,DAMAGE,EXPIRED,OTHER',
            'notes' => 'nullable|string|max:2000',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $request->user()?->id ?? ($data['user_id'] ?? 1);

        $movement = DB::transaction(function () use ($data, $userId) {
            $product = Product::query()->lockForUpdate()->findOrFail($data['product_id']);
            $previousQuantity = (float) $product->quantity;
            $newQuantity = (float) $data['new_quantity'];

            $product->update(['quantity' => $newQuantity]);

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'movement_type' => $data['reason'],
                'quantity' => abs($newQuantity - $previousQuantity),
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $newQuantity,
                'reference_type' => 'ADJUSTMENT',
                'user_id' => $userId,
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
            ]);

            ActivityLog::log(
                'STOCK_ADJUSTMENT',
                'PRODUCT',
                $product->id,
                "Stock changed from {$previousQuantity} to {$newQuantity}",
                $userId,
            );

            return $movement;
        });

        return response()->json([
            'success' => true,
            'data' => $movement->load('product:id,barcode,name_ku', 'user:id,name'),
        ]);
    }
}
