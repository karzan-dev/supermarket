<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Services\ProductExpiryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'unit'])->where('status', 'ACTIVE');
        $expiryFilter = $request->query('expiry_status');
        if ($expiryFilter !== null) {
            $request->validate([
                'expiry_status' => 'in:all,expired,today,urgent,within_3,within_7,within_15,within_30,no_expiry',
            ]);
            if ($expiryFilter !== 'all') {
                app(ProductExpiryService::class)->applyFilter($query, $expiryFilter);
            }
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name_ku', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'low') {
                $query->lowStock();
            } elseif ($request->stock_status === 'out') {
                $query->outOfStock();
            } elseif ($request->stock_status === 'expiring') {
                $query->expiringSoon(app(ProductExpiryService::class)->settings()['warning_days']);
            }
        }

        $products = $query->latest('id')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'barcode' => $p->barcode,
                'sku' => $p->sku,
                'name_ku' => $p->name_ku,
                'category_id' => $p->category_id,
                'unit_id' => $p->unit_id,
                'purchase_price' => (float) $p->purchase_price,
                'selling_price' => (float) $p->selling_price,
                'wholesale_price' => (float) $p->wholesale_price,
                'quantity' => (float) $p->quantity,
                'min_stock' => (float) $p->min_stock,
                'expiry_date' => $p->expiry_date ? $p->expiry_date->format('Y-m-d') : null,
                'image' => $p->image ? asset('storage/'.ltrim($p->image, '/')) : null,
                'description' => $p->description,
                'status' => $p->status,
                'category_ku' => $p->category ? $p->category->name_ku : '',
                'category_en' => $p->category ? $p->category->name_en : '',
                'category_ar' => $p->category ? $p->category->name_ar : '',
                'unit_ku' => $p->unit ? $p->unit->name_ku : '',
                'unit_en' => $p->unit ? $p->unit->name_en : '',
                'unit_ar' => $p->unit ? $p->unit->name_ar : '',
                'unit_code' => $p->unit ? $p->unit->short_code : '',
            ];
        });

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string|unique:products,barcode',
            'name_ku' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'unit_id' => 'required|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'quantity' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'description' => 'nullable|string',
        ], [
            'barcode.unique' => 'ئەم بارکۆدە پێشتر بەکار هاتووە.',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = DB::transaction(function () use ($validated) {
            $validated['sku'] = 'SKU-TEMP-'.Str::uuid();
            $product = Product::create($validated);
            $product->update(['sku' => 'SKU-'.$product->id]);

            return $product;
        });

        ActivityLog::log('CREATE', 'PRODUCT', $product->id, "Added product {$product->name_ku} ({$product->barcode})");

        return response()->json(['success' => true, 'data' => $product], 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'unit'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product->setAttribute(
                'image',
                $product->image ? asset('storage/'.ltrim($product->image, '/')) : null,
            ),
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'barcode' => "required|string|unique:products,barcode,{$id}",
            'name_ku' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'unit_id' => 'required|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'quantity' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_image' => 'nullable|boolean',
            'description' => 'nullable|string',
        ], [
            'barcode.unique' => 'ئەم بارکۆدە پێشتر بەکار هاتووە.',
        ]);

        $oldImage = $product->image;
        $removeOldImage = (bool) ($validated['remove_image'] ?? false);
        unset($validated['remove_image']);
        $newImage = $request->hasFile('image')
            ? $request->file('image')->store('products', 'public')
            : null;
        if ($newImage) {
            $validated['image'] = $newImage;
        } elseif ($removeOldImage) {
            $validated['image'] = null;
        }

        try {
            DB::transaction(fn () => $product->update($validated));
        } catch (Throwable $error) {
            if ($newImage) {
                Storage::disk('public')->delete($newImage);
            }
            throw $error;
        }

        if (($newImage || $removeOldImage) && $oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        ActivityLog::log('UPDATE', 'PRODUCT', $product->id, "Updated product {$product->name_ku} ({$product->barcode})");

        return response()->json([
            'success' => true,
            'data' => $product->fresh()->setAttribute(
                'image',
                $product->image ? asset('storage/'.ltrim($product->image, '/')) : null,
            ),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'INACTIVE']);

        ActivityLog::log('DELETE', 'PRODUCT', $product->id, "Archived product {$product->name_ku}");

        return response()->json(['success' => true, 'message' => 'Product removed']);
    }

    public function findByBarcode($barcode)
    {
        $product = Product::with(['category', 'unit'])
            ->where('barcode', $barcode)
            ->where('status', 'ACTIVE')
            ->first();

        if (! $product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product->setAttribute(
                'image',
                $product->image ? asset('storage/'.ltrim($product->image, '/')) : null,
            ),
        ]);
    }
}
