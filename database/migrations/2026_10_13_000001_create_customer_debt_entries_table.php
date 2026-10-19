<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Debts entered by hand, e.g. copied from the shop's paper notebook.
        Schema::create('customer_debt_entries', function (Blueprint $table) {
            // Explicit: some MySQL setups default to MyISAM (no transactions, no foreign keys).
            $table->engine = 'InnoDB';
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->decimal('amount', 14, 2);
            $table->date('debt_date');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('idempotency_key')->unique();
            $table->timestamps();

            $table->index(['customer_id', 'debt_date']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_debt_entries');
    }
};
