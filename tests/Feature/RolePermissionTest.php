<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_endpoints_reject_unauthenticated_requests(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
        $this->getJson('/api/dashboard/stats')->assertUnauthorized();
        $this->postJson('/api/products', [])->assertUnauthorized();
    }

    public function test_cashier_can_access_checkout_data_but_not_management_modules(): void
    {
        $this->createUsers();
        $token = $this->login('cashier');

        $this->withToken($token)->getJson('/api/products')->assertOk();
        $this->withToken($token)->getJson('/api/customers')->assertOk();
        $this->withToken($token)->getJson('/api/settings')->assertOk();
        $this->withToken($token)->getJson('/api/dashboard/stats')->assertForbidden();
        $this->withToken($token)->getJson('/api/users')->assertForbidden();
        $this->withToken($token)->postJson('/api/products', [])->assertForbidden();
        $this->withToken($token)->getJson('/api/activity-logs')->assertForbidden();
    }

    public function test_manager_can_operate_but_cannot_manage_staff_settings_or_logs(): void
    {
        $this->createUsers();
        $token = $this->login('manager');

        $this->withToken($token)->getJson('/api/dashboard/stats')->assertOk();
        $this->withToken($token)->getJson('/api/purchases')->assertOk();
        $this->withToken($token)->getJson('/api/users')->assertForbidden();
        $this->withToken($token)->postJson('/api/settings', [])->assertForbidden();
        $this->withToken($token)->getJson('/api/activity-logs')->assertForbidden();
    }

    public function test_admin_has_full_access_and_login_returns_permission_list(): void
    {
        $this->createUsers();
        $login = $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'Secure-Test-Password-123',
        ])->assertOk();
        $this->assertContains('users.manage', $login->json('user.permissions'));
        $this->assertContains('settings.manage', $login->json('user.permissions'));
        $this->assertContains('activity_logs.view', $login->json('user.permissions'));

        $this->withToken($login->json('token'))->getJson('/api/users')->assertOk();
        $this->withToken($login->json('token'))->getJson('/api/activity-logs')->assertOk();
    }

    public function test_custom_user_permissions_override_role_defaults(): void
    {
        $this->createUsers();
        $adminToken = $this->login('admin');
        $cashierRole = Role::where('name', 'CASHIER')->firstOrFail();

        $this->withToken($adminToken)->postJson('/api/users', [
            'name' => 'Products Clerk',
            'username' => 'products.clerk',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
            'language_pref' => 'en',
            'permissions' => ['products.view'],
        ])->assertCreated();

        $clerk = User::where('username', 'products.clerk')->firstOrFail();
        self::assertTrue($clerk->permissions_customized);
        self::assertSame(['products.view'], $clerk->permissions());

        $this->actingAs($clerk, 'sanctum')->getJson('/api/products')->assertOk();
        $this->postJson('/api/products', [])->assertForbidden();
        $this->getJson('/api/customers')->assertForbidden();
        $this->getJson('/api/dashboard/stats')->assertForbidden();
    }

    public function test_manage_permission_also_grants_view_access_for_its_module(): void
    {
        $this->createUsers();
        $adminToken = $this->login('admin');
        $cashierRole = Role::where('name', 'CASHIER')->firstOrFail();

        $this->withToken($adminToken)->postJson('/api/users', [
            'name' => 'Product Manager',
            'username' => 'product.manager',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
            'language_pref' => 'en',
            'permissions' => ['products.manage'],
        ])->assertCreated();

        $productManager = User::where('username', 'product.manager')->firstOrFail();
        self::assertTrue($productManager->hasPermission('products.view'));
        self::assertSame(['products.manage'], $productManager->permissions());
        $this->actingAs($productManager, 'sanctum')->getJson('/api/products')->assertOk();
    }

    public function test_custom_settings_manager_can_view_and_update_settings(): void
    {
        $this->createUsers();
        $adminToken = $this->login('admin');
        $cashierRole = Role::where('name', 'CASHIER')->firstOrFail();

        $this->withToken($adminToken)->postJson('/api/users', [
            'name' => 'Settings Manager',
            'username' => 'settings.manager',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
            'language_pref' => 'en',
            'permissions' => ['settings.manage'],
        ])->assertCreated();

        $settingsManager = User::where('username', 'settings.manager')->firstOrFail();
        self::assertTrue($settingsManager->hasPermission('settings.view'));

        $this->actingAs($settingsManager, 'sanctum')
            ->getJson('/api/settings')
            ->assertOk();
        $this->postJson('/api/settings', [
            'expiry_alerts_enabled' => true,
            'expiry_warning_days' => 7,
            'expiry_urgent_days' => 3,
            'expiry_alerts_expired' => true,
            'expiry_alerts_bell' => true,
            'expiry_alerts_dashboard' => true,
        ])->assertOk();
    }

    public function test_staff_cannot_grant_permissions_they_do_not_have_or_assign_admin_role(): void
    {
        $this->createUsers();
        $adminToken = $this->login('admin');
        $cashierRole = Role::where('name', 'CASHIER')->firstOrFail();

        $this->withToken($adminToken)->postJson('/api/users', [
            'name' => 'Delegated User Manager',
            'username' => 'user.manager',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
            'language_pref' => 'en',
            'permissions' => ['users.manage'],
        ])->assertCreated();

        $userManager = User::where('username', 'user.manager')->firstOrFail();
        $payload = [
            'name' => 'New Staff',
            'username' => 'new.staff',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
            'language_pref' => 'en',
            'permissions' => ['settings.manage'],
        ];

        $this->actingAs($userManager, 'sanctum')
            ->postJson('/api/users', $payload)
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot assign permissions you do not have.');

        $payload['role_id'] = Role::where('name', 'ADMIN')->firstOrFail()->id;
        $payload['permissions'] = ['users.manage'];
        $this->postJson('/api/users', $payload)
            ->assertForbidden()
            ->assertJsonPath('message', 'Only an administrator can assign the administrator role.');

        $admin = User::where('username', 'admin')->firstOrFail();
        $this->deleteJson("/api/users/{$admin->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Only an administrator can delete another administrator.');
    }

    public function test_inactive_staff_tokens_cannot_access_authenticated_endpoints(): void
    {
        $this->createUsers();
        $token = $this->login('cashier');
        User::where('username', 'cashier')->update(['status' => 'SUSPENDED']);

        $this->withToken($token)->getJson('/api/products')->assertForbidden();
        $this->withToken($token)->getJson('/api/auth/me')->assertForbidden();
    }

    public function test_login_is_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', [
                'username' => 'unknown',
                'password' => 'incorrect',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/auth/login', [
            'username' => 'unknown',
            'password' => 'incorrect',
        ])->assertTooManyRequests();
    }

    public function test_administrator_cannot_remove_own_admin_access(): void
    {
        $this->createUsers();
        $token = $this->login('admin');
        $admin = User::where('username', 'admin')->firstOrFail();
        $managerRole = Role::where('name', 'MANAGER')->firstOrFail();

        $this->withToken($token)->putJson("/api/users/{$admin->id}", [
            'name' => $admin->name,
            'username' => $admin->username,
            'role_id' => $managerRole->id,
            'status' => 'ACTIVE',
            'permissions' => [],
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot remove administrator access from your own account.');
    }

    private function createUsers(): void
    {
        foreach (['ADMIN' => 'admin', 'MANAGER' => 'manager', 'CASHIER' => 'cashier'] as $roleName => $username) {
            $role = Role::create([
                'name' => $roleName,
                'display_name_ku' => $roleName,
                'display_name_en' => $roleName,
                'display_name_ar' => $roleName,
            ]);
            User::create([
                'name' => ucfirst($username),
                'username' => $username,
                'password' => 'Secure-Test-Password-123',
                'role_id' => $role->id,
                'status' => 'ACTIVE',
            ]);
        }

        (new RolePermissionSeeder)->run();
    }

    private function login(string $username): string
    {
        return $this->postJson('/api/auth/login', [
            'username' => $username,
            'password' => 'Secure-Test-Password-123',
        ])->assertOk()->json('token');
    }
}
