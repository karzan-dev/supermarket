<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PERMISSIONS = [
        'dashboard.view' => ['dashboard', 'View dashboard and business statistics'],
        'pos.use' => ['pos', 'Process point-of-sale transactions'],
        'products.view' => ['products', 'View products and barcode details'],
        'products.manage' => ['products', 'Create, edit and archive products'],
        'categories.view' => ['categories', 'View categories'],
        'categories.manage' => ['categories', 'Manage categories'],
        'units.view' => ['units', 'View units'],
        'units.manage' => ['units', 'Manage units'],
        'inventory.view' => ['inventory', 'View inventory and stock movements'],
        'inventory.manage' => ['inventory', 'Adjust inventory and record damage'],
        'damage.view' => ['damaged-products', 'View damaged product records'],
        'purchases.view' => ['purchases', 'View purchases'],
        'purchases.manage' => ['purchases', 'Manage purchases'],
        'returns.view' => ['returns', 'View and search sales for returns'],
        'returns.manage' => ['returns', 'Process returns and refunds'],
        'customers.view' => ['customers', 'View customers'],
        'customers.manage' => ['customers', 'Manage customers and debt payments'],
        'suppliers.view' => ['suppliers', 'View suppliers'],
        'suppliers.manage' => ['suppliers', 'Manage suppliers and payments'],
        'expenses.view' => ['expenses', 'View expenses and expense categories'],
        'expenses.manage' => ['expenses', 'Manage expenses'],
        'cash.view' => ['cash-register', 'View the cash-register balance and transaction history'],
        'cash.manage' => ['cash-register', 'Manage cash movements and cashier shifts'],
        'reports.view' => ['reports', 'View business reports'],
        'users.manage' => ['users', 'Manage staff accounts'],
        'settings.view' => ['settings', 'Read store configuration required by the application'],
        'settings.manage' => ['settings', 'Manage system settings'],
        'activity_logs.view' => ['activity-logs', 'View system activity logs'],
    ];

    public function up(): void
    {
        foreach (self::PERMISSIONS as $name => [$module, $description]) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name],
                ['module' => $module, 'description' => $description],
            );
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('name', array_keys(self::PERMISSIONS))
            ->pluck('id', 'name');

        foreach (DB::table('roles')->whereIn('name', ['ADMIN', 'MANAGER', 'CASHIER'])->get() as $role) {
            $names = match ($role->name) {
                'MANAGER' => array_values(array_filter(
                    array_keys(self::PERMISSIONS),
                    fn (string $name): bool => ! in_array($name, [
                        'users.manage',
                        'settings.manage',
                        'activity_logs.view',
                    ], true),
                )),
                'CASHIER' => [
                    'pos.use',
                    'products.view',
                    'categories.view',
                    'units.view',
                    'customers.view',
                    'settings.view',
                    'cash.view',
                    'cash.manage',
                ],
                default => array_keys(self::PERMISSIONS),
            };

            foreach ($names as $name) {
                DB::table('role_permissions')->updateOrInsert([
                    'role_id' => $role->id,
                    'permission_id' => $permissionIds[$name],
                ], []);
            }
        }
    }

    public function down(): void
    {
        DB::table('role_permissions')
            ->whereIn('permission_id', DB::table('permissions')->whereIn('name', array_keys(self::PERMISSIONS))->select('id'))
            ->delete();
        DB::table('permissions')->whereIn('name', array_keys(self::PERMISSIONS))->delete();
    }
};
