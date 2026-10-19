<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
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

    public function run(): void
    {
        $permissions = [];
        foreach (self::PERMISSIONS as $name => [$module, $description]) {
            $permissions[$name] = Permission::updateOrCreate(
                ['name' => $name],
                ['module' => $module, 'description' => $description],
            )->id;
        }

        $managerPermissions = array_values(array_filter(
            array_keys(self::PERMISSIONS),
            fn (string $name): bool => ! in_array($name, [
                'users.manage',
                'settings.manage',
                'activity_logs.view',
            ], true),
        ));
        $cashierPermissions = [
            'pos.use',
            'products.view',
            'categories.view',
            'units.view',
            'customers.view',
            'settings.view',
            'cash.view',
            'cash.manage',
        ];

        foreach (['ADMIN', 'MANAGER', 'CASHIER'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();
            if (! $role) {
                continue;
            }

            $names = match ($roleName) {
                'MANAGER' => $managerPermissions,
                'CASHIER' => $cashierPermissions,
                default => array_keys(self::PERMISSIONS),
            };

            $role->permissions()->sync(collect($names)->map(
                fn (string $name): int => $permissions[$name],
            )->all());
        }
    }
}
