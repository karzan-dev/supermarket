<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PERMISSIONS = [
        'cash.view' => 'View the cash-register balance and transaction history',
        'cash.manage' => 'Manage cash movements and cashier shifts',
    ];

    public function up(): void
    {
        foreach (self::PERMISSIONS as $name => $description) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name],
                ['module' => 'cash-register', 'description' => $description],
            );
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('name', array_keys(self::PERMISSIONS))
            ->pluck('id', 'name');

        foreach (DB::table('roles')->whereIn('name', ['ADMIN', 'MANAGER', 'CASHIER'])->get() as $role) {
            foreach (self::PERMISSIONS as $name => $_description) {
                DB::table('role_permissions')->updateOrInsert([
                    'role_id' => $role->id,
                    'permission_id' => $permissionIds[$name],
                ], []);
            }
        }
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('name', array_keys(self::PERMISSIONS))
            ->select('id');

        DB::table('role_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('name', array_keys(self::PERMISSIONS))->delete();
    }
};
