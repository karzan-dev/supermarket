<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    private string|false $previousAdminPassword;

    protected function setUp(): void
    {
        parent::setUp();

        $this->previousAdminPassword = getenv('INITIAL_ADMIN_PASSWORD');
        putenv('INITIAL_ADMIN_PASSWORD=Test-Admin-Password-2026');
    }

    protected function tearDown(): void
    {
        if ($this->previousAdminPassword === false) {
            putenv('INITIAL_ADMIN_PASSWORD');
        } else {
            putenv("INITIAL_ADMIN_PASSWORD={$this->previousAdminPassword}");
        }

        parent::tearDown();
    }

    public function test_seeded_admin_can_log_in_and_reseeding_does_not_duplicate_users(): void
    {
        $this->seed(UserSeeder::class);
        $this->seed(RolePermissionSeeder::class);

        $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'Test-Admin-Password-2026',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.username', 'admin')
            ->assertJsonPath('user.role', 'ADMIN')
            ->assertJsonPath('user.permissions.0', 'activity_logs.view')
            ->assertJsonStructure(['token']);

        $originalPassword = User::where('username', 'admin')->value('password');

        $this->seed(UserSeeder::class);

        $this->assertSame(1, User::where('username', 'admin')->count());
        $this->assertSame(1, User::count());
        $this->assertSame($originalPassword, User::where('username', 'admin')->value('password'));
    }
}
