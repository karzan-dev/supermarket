<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_type', 50); // SALE_PAYMENT, DEBT_PAYMENT, SUPPLIER_PAYMENT, REFUND
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('party_type', 50)->nullable(); // CUSTOMER, SUPPLIER
            $table->unsignedBigInteger('party_id')->nullable();
            $table->decimal('amount', 14, 2);
            $table->string('payment_method', 50)->default('CASH');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('payment_type');
            $table->index('party_type');
            $table->index('party_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
