<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('total_purchases', 14, 2)->default(0.00);
            $table->decimal('total_paid', 14, 2)->default(0.00);
            $table->decimal('debt', 14, 2)->default(0.00);
            $table->timestamps();

            $table->index('name');
            $table->index('phone');
            $table->index('debt');
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('company', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('total_purchases', 14, 2)->default(0.00);
            $table->decimal('total_paid', 14, 2)->default(0.00);
            $table->decimal('debt', 14, 2)->default(0.00);
            $table->timestamps();

            $table->index('name');
            $table->index('company');
            $table->index('debt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('customers');
    }
};
