<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $products = DB::table('products')
            ->where(function ($query) {
                $query->whereNull('sku')->orWhereRaw("TRIM(sku) = ''");
            })
            ->orderBy('id')
            ->get(['id']);

        foreach ($products as $product) {
            $baseSku = 'SKU-'.$product->id;
            $sku = $baseSku;
            $suffix = 1;

            while (DB::table('products')->where('sku', $sku)->exists()) {
                $sku = $baseSku.'-'.$suffix++;
            }

            DB::table('products')
                ->where('id', $product->id)
                ->update(['sku' => $sku]);
        }
    }

    public function down(): void
    {
    }
};
