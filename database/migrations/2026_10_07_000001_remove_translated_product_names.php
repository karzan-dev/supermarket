<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('products', 'name_en')) {
                $columns[] = 'name_en';
            }

            if (Schema::hasColumn('products', 'name_ar')) {
                $columns[] = 'name_ar';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'name_en')) {
                $table->string('name_en', 150)->nullable();
            }

            if (!Schema::hasColumn('products', 'name_ar')) {
                $table->string('name_ar', 150)->nullable();
            }
        });
    }
};
