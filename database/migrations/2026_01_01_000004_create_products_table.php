<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('barcode', 100)->unique();
            $table->string('sku', 100)->unique();
            $table->string('name_ku', 150);
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->foreignId('unit_id')->constrained('units')->onDelete('restrict');
            $table->decimal('purchase_price', 12, 2)->default(0.00);
            $table->decimal('selling_price', 12, 2)->default(0.00);
            $table->decimal('wholesale_price', 12, 2)->default(0.00);
            $table->decimal('quantity', 12, 2)->default(0.00);
            $table->decimal('min_stock', 12, 2)->default(5.00);
            $table->date('expiry_date')->nullable();
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            // Indexes for POS real-time scanning & inventory analytics
            $table->index('barcode');
            $table->index('sku');
            $table->index('category_id');
            $table->index('quantity');
            $table->index('expiry_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
