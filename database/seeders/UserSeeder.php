<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'ADMIN' => [
                'display_name_ku' => 'بەڕێوەبەری سەرەکی',
                'display_name_en' => 'Super Administrator',
                'display_name_ar' => 'مدير النظام الرئيسي',
                'description' => 'دەسەڵاتی تەواو بەسەر سەرجەم بەش و داتاکاندا',
            ],
            'MANAGER' => [
                'display_name_ku' => 'بەڕێوەبەری لق / کۆگا',
                'display_name_en' => 'Store Manager',
                'display_name_ar' => 'مدير الفرع والمخزن',
                'description' => 'بەڕێوەبردنی کۆگا، کڕین، فرۆشتن و کڕیاران',
            ],
            'CASHIER' => [
                'display_name_ku' => 'کاشێر / فرۆشیار',
                'display_name_en' => 'POS Cashier',
                'display_name_ar' => 'محاسب كاشير',
                'description' => 'تەنها دەسەڵاتی تۆمارکردنی فرۆشتن لە کاشێر',
            ],
        ];

        $roleIds = [];
        foreach ($roles as $name => $attributes) {
            $roleIds[$name] = Role::updateOrCreate(['name' => $name], $attributes)->id;
        }

        if (User::where('role_id', $roleIds['ADMIN'])->exists()) {
            return;
        }

        $password = (string) env('INITIAL_ADMIN_PASSWORD', '');
        if (strlen($password) < 12) {
            throw new RuntimeException(
                'Set INITIAL_ADMIN_PASSWORD to a unique value of at least 12 characters before creating the first administrator.',
            );
        }

        User::create([
            'name' => (string) env('INITIAL_ADMIN_NAME', 'System Administrator'),
            'username' => (string) env('INITIAL_ADMIN_USERNAME', 'admin'),
            'password' => Hash::make($password),
            'role_id' => $roleIds['ADMIN'],
            'status' => 'ACTIVE',
            'language_pref' => 'ku',
        ]);
    }
}
