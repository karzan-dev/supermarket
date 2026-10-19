<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'ADMIN'],
            [
                'display_name_ku' => 'بەڕێوەبەری سەرەکی',
                'display_name_en' => 'Super Administrator',
                'display_name_ar' => 'مدير النظام الرئيسي',
                'description' => 'Full access to all modules and data',
            ],
        );

        $this->call(UserSeeder::class);
    }
}
