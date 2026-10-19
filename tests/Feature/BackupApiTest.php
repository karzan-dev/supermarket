<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BackupApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_download_importable_sql_backup_with_password_hashes_but_without_tokens(): void
    {
        $role = Role::create([
            'name' => 'ADMIN',
            'display_name_ku' => 'Admin',
            'display_name_en' => 'Admin',
            'display_name_ar' => 'Admin',
        ]);
        $admin = User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);
        DB::table('settings')->insert([
            'key_name' => 'store_name',
            'key_value' => "Oscar's store",
            'group_name' => 'general',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->get('/api/backup')->assertOk();
        $backup = $response->streamedContent();

        $this->assertStringContainsString('INSERT INTO `settings`', $backup);
        $this->assertStringContainsString("'Oscar''s store'", $backup);
        $this->assertStringContainsString('`password`', $backup);
        $this->assertStringNotContainsString('`remember_token`', $backup);
        $this->assertStringContainsString('SET FOREIGN_KEY_CHECKS=0;', $backup);
        $this->assertStringContainsString('SET FOREIGN_KEY_CHECKS=1;', $backup);
    }

    public function test_non_admin_users_cannot_download_backup(): void
    {
        $role = Role::create([
            'name' => 'CASHIER',
            'display_name_ku' => 'Cashier',
            'display_name_en' => 'Cashier',
            'display_name_ar' => 'Cashier',
        ]);
        $cashier = User::create([
            'name' => 'Cashier',
            'username' => 'cashier',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);

        $this->actingAs($cashier, 'sanctum')->getJson('/api/backup')->assertForbidden();
    }
}
