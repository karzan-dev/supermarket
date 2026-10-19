<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ku', 100);
            $table->string('name_en', 100);
            $table->string('name_ar', 100);
            $table->string('icon', 50)->default('Layers');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name_ku', 50);
            $table->string('name_en', 50);
            $table->string('name_ar', 50);
            $table->string('short_code', 15);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
        Schema::dropIfExists('categories');
    }
};
