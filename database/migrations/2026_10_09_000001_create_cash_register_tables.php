<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_register_accounts', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->decimal('balance', 14, 2)->default(0);
            $table->timestamps();
        });

        DB::table('cash_register_accounts')->insert([
            'id' => 1,
            'balance' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('cash_register_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opened_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('closed_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->unsignedTinyInteger('active_slot')->nullable()->unique();
            $table->decimal('opening_balance', 14, 2);
            $table->decimal('expected_balance', 14, 2)->nullable();
            $table->decimal('counted_balance', 14, 2)->nullable();
            $table->decimal('variance', 14, 2)->nullable();
            $table->text('opening_notes')->nullable();
            $table->text('closing_notes')->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['opened_by', 'opened_at']);
        });

        Schema::create('cash_register_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number', 32)->unique()->nullable();
            $table->foreignId('shift_id')->nullable()->constrained('cash_register_shifts')->onDelete('restrict');
            $table->string('type', 32);
            $table->enum('direction', ['IN', 'OUT']);
            $table->decimal('amount', 14, 2);
            $table->decimal('balance_before', 14, 2);
            $table->decimal('balance_after', 14, 2);
            $table->string('reason', 255);
            $table->text('notes')->nullable();
            $table->string('source_type', 40)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at');

            $table->unique(['source_type', 'source_id']);
            $table->index(['type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['transaction_number']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->string('idempotency_key', 64)->nullable()->unique();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('idempotency_key', 64)->nullable()->unique();
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->string('idempotency_key', 64)->nullable()->unique();
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->string('request_hash', 64)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn('idempotency_key');
        });
        Schema::table('returns', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn(['idempotency_key', 'request_hash']);
        });
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn('idempotency_key');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn('idempotency_key');
        });
        Schema::dropIfExists('cash_register_transactions');
        Schema::dropIfExists('cash_register_shifts');
        Schema::dropIfExists('cash_register_accounts');
    }
};
