<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->decimal('subtotal', 14, 2);
            $table->decimal('discount', 14, 2)->default(0.00);
            $table->decimal('tax', 14, 2)->default(0.00);
            $table->decimal('total', 14, 2);
            $table->decimal('cost_of_goods', 14, 2)->default(0.00);
            $table->decimal('profit', 14, 2)->default(0.00);
            $table->decimal('cash_received', 14, 2)->default(0.00);
            $table->decimal('change_amount', 14, 2)->default(0.00);
            $table->enum('payment_method', ['CASH', 'CARD', 'CREDIT'])->default('CASH');
            $table->enum('payment_status', ['PAID', 'PARTIAL', 'DUE'])->default('PAID');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('created_at');
            $table->index('user_id');
            $table->index('customer_id');
            $table->index('payment_method');
            $table->index('payment_status');
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('purchase_cost', 12, 2);
            $table->decimal('discount', 12, 2)->default(0.00);
            $table->decimal('total', 14, 2);
            $table->decimal('profit', 14, 2);

            $table->index('sale_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
