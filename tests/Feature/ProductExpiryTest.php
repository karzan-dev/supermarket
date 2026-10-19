<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\Unit;
use App\Models\User;
use App\Services\ProductExpiryService;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductExpiryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    private Unit $unit;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-08 12:00:00');
        $role = Role::create([
            'name' => 'ADMIN',
            'display_name_ku' => 'بەڕێوەبەر',
            'display_name_en' => 'Administrator',
            'display_name_ar' => 'مدير',
        ]);
        $this->admin = User::create([
            'name' => 'Expiry Admin',
            'username' => 'expiry-admin',
            'password' => 'password',
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);
        (new RolePermissionSeeder)->run();
        $this->category = Category::create([
            'name_ku' => 'تاقیکردنەوە',
            'name_en' => 'Test',
            'name_ar' => 'اختبار',
        ]);
        $this->unit = Unit::create([
            'name_ku' => 'دانە',
            'name_en' => 'Piece',
            'name_ar' => 'قطعة',
            'short_code' => 'pcs',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_expiry_classification_handles_boundaries_and_missing_dates(): void
    {
        Setting::set('expiry_warning_days', '7', 'expiry');
        $service = app(ProductExpiryService::class);

        $this->assertSame('no_expiry', $service->classify(null));
        $this->assertSame('expired', $service->classify(Carbon::parse('2026-10-07')));
        $this->assertSame('today', $service->classify(Carbon::parse('2026-10-08')));
        $this->assertSame('soon', $service->classify(Carbon::parse('2026-10-15')));
        $this->assertSame('safe', $service->classify(Carbon::parse('2026-10-16')));
    }

    public function test_tax_setting_is_hidden_and_legacy_updates_are_ignored(): void
    {
        Setting::set('tax_percentage', '18');
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonMissingPath('data.tax_percentage');

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/settings', [
                'tax_percentage' => '18',
                'expiry_alerts_enabled' => true,
                'expiry_warning_days' => 7,
                'expiry_urgent_days' => 3,
                'expiry_alerts_expired' => true,
                'expiry_alerts_bell' => true,
                'expiry_alerts_dashboard' => true,
            ])
            ->assertOk()
            ->assertJsonMissingPath('data.tax_percentage');

        $this->assertDatabaseHas('settings', ['key_name' => 'tax_percentage', 'key_value' => '18']);
    }

    public function test_expiry_alert_endpoint_returns_one_alert_per_in_stock_product(): void
    {
        $expired = $this->createProduct('EXPIRED', '2026-10-07');
        $today = $this->createProduct('TODAY', '2026-10-08');
        $soon = $this->createProduct('SOON', '2026-10-15');
        $this->createProduct('SAFE', '2026-10-16');
        $this->createProduct('NO-DATE', null);
        $this->createProduct('NO-STOCK', '2026-10-09', 0);

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/notifications/expiry')
            ->assertOk()
            ->assertJsonPath('data.warning_days', 7)
            ->assertJsonCount(3, 'data.alerts')
            ->assertJsonPath('data.alerts.0.id', $expired->id)
            ->assertJsonPath('data.alerts.0.days_remaining', -1)
            ->assertJsonPath('data.alerts.0.alert_type', 'expired')
            ->assertJsonPath('data.alerts.0.severity', 'critical')
            ->assertJsonPath('data.alerts.1.id', $today->id)
            ->assertJsonPath('data.alerts.1.alert_type', 'today')
            ->assertJsonPath('data.alerts.2.id', $soon->id)
            ->assertJsonPath('data.alerts.2.alert_type', 'soon');
    }

    public function test_alert_feed_respects_enabled_and_expired_preferences(): void
    {
        $this->createProduct('EXPIRED', '2026-10-07');
        $this->createProduct('TODAY', '2026-10-08');
        Setting::set('expiry_alerts_expired', '0', 'expiry');

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/notifications/expiry')
            ->assertOk()
            ->assertJsonCount(1, 'data.alerts')
            ->assertJsonPath('data.alerts.0.alert_type', 'today');

        Setting::set('expiry_alerts_enabled', '0', 'expiry');
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/notifications/expiry')
            ->assertOk()
            ->assertJsonCount(0, 'data.alerts');
    }

    public function test_inventory_expiry_filters_use_real_dates_and_leave_null_dates_out_of_expired(): void
    {
        $expired = $this->createProduct('EXPIRED', '2026-10-07');
        $today = $this->createProduct('TODAY', '2026-10-08');
        $this->createProduct('FUTURE', '2026-10-11');
        $noDate = $this->createProduct('NO-DATE', null);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/products?expiry_status=expired')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expired->id);
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/products?expiry_status=today')
            ->assertOk()
            ->assertJsonPath('data.0.id', $today->id);
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/products?expiry_status=within_3')
            ->assertOk()
            ->assertJsonCount(2, 'data');
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/products?expiry_status=no_expiry')
            ->assertOk()
            ->assertJsonPath('data.0.id', $noDate->id);
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/products?expiry_status=urgent')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_dashboard_expiry_totals_use_configured_period_and_expired_stock(): void
    {
        $this->createProduct('EXPIRED', '2026-10-07', 4);
        $this->createProduct('TODAY', '2026-10-08', 2);
        $this->createProduct('URGENT-LIMIT', '2026-10-11', 1);
        $this->createProduct('WARNING-LIMIT', '2026-10-15', 3);
        $this->createProduct('OUTSIDE-WARNING', '2026-10-16', 9);
        Setting::set('expiry_warning_days', '7', 'expiry');

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('data.inventory.expired_products', 1)
            ->assertJsonPath('data.inventory.expiring_within_period', 3)
            ->assertJsonPath('data.inventory.expiring_soon', 3)
            ->assertJsonPath('data.inventory.expired_stock_quantity', 4)
            ->assertJsonPath('data.inventory.urgent_expiry_products', 3);
    }

    public function test_damage_inventory_page_data_reports_products_and_recent_movements(): void
    {
        $damagedProduct = $this->createProduct('DAMAGED-1', null);
        $anotherDamagedProduct = $this->createProduct('DAMAGED-2', null);

        foreach ([2.5, 1.5] as $quantity) {
            StockMovement::create([
                'product_id' => $damagedProduct->id,
                'movement_type' => 'DAMAGE',
                'quantity' => $quantity,
                'previous_quantity' => 20,
                'new_quantity' => 20 - $quantity,
                'reference_type' => 'ADJUSTMENT',
                'user_id' => $this->admin->id,
                'notes' => 'Damaged packaging',
                'created_at' => now(),
            ]);
        }
        StockMovement::create([
            'product_id' => $anotherDamagedProduct->id,
            'movement_type' => 'DAMAGE',
            'quantity' => 3,
            'previous_quantity' => 20,
            'new_quantity' => 17,
            'reference_type' => 'ADJUSTMENT',
            'user_id' => $this->admin->id,
            'notes' => 'Broken item',
            'created_at' => now(),
        ]);
        StockMovement::create([
            'product_id' => $anotherDamagedProduct->id,
            'movement_type' => 'ADJUSTMENT',
            'quantity' => 4,
            'previous_quantity' => 17,
            'new_quantity' => 13,
            'reference_type' => 'ADJUSTMENT',
            'user_id' => $this->admin->id,
            'created_at' => now(),
        ]);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/inventory/damage')
            ->assertOk()
            ->assertJsonPath('data.affected_products', 2)
            ->assertJsonPath('data.damaged_quantity', 7)
            ->assertJsonCount(3, 'data.movements')
            ->assertJsonFragment([
                'name_ku' => $anotherDamagedProduct->name_ku,
                'barcode' => $anotherDamagedProduct->barcode,
                'notes' => 'Broken item',
            ]);
    }

    public function test_settings_require_a_manager_and_validate_expiry_periods(): void
    {
        $cashierRole = Role::create([
            'name' => 'CASHIER',
            'display_name_ku' => 'کاشێر',
            'display_name_en' => 'Cashier',
            'display_name_ar' => 'كاشير',
        ]);
        $cashier = User::create([
            'name' => 'Cashier',
            'username' => 'expiry-cashier',
            'password' => 'password',
            'role_id' => $cashierRole->id,
            'status' => 'ACTIVE',
        ]);
        $payload = $this->validSettings();

        $this->actingAs($cashier, 'sanctum')
            ->postJson('/api/settings', $payload)
            ->assertForbidden();

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/settings', array_merge($payload, [
                'expiry_warning_days' => '3',
                'expiry_urgent_days' => '7',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('expiry_urgent_days');

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/settings', $payload)
            ->assertOk();

        $this->assertDatabaseHas('settings', [
            'key_name' => 'expiry_warning_days',
            'key_value' => '15',
            'group_name' => 'expiry',
        ]);
    }

    public function test_expiry_notifications_require_authentication(): void
    {
        $this->getJson('/api/notifications/expiry')->assertUnauthorized();
    }

    private function validSettings(): array
    {
        return [
            'expiry_alerts_enabled' => '1',
            'expiry_warning_days' => '15',
            'expiry_urgent_days' => '3',
            'expiry_alerts_expired' => '1',
            'expiry_alerts_bell' => '1',
            'expiry_alerts_dashboard' => '1',
        ];
    }

    private function createProduct(string $barcode, ?string $expiryDate, float $quantity = 5): Product
    {
        return Product::create([
            'barcode' => $barcode,
            'sku' => 'SKU-'.$barcode,
            'name_ku' => 'کاڵای '.$barcode,
            'category_id' => $this->category->id,
            'unit_id' => $this->unit->id,
            'purchase_price' => 100,
            'selling_price' => 150,
            'quantity' => $quantity,
            'min_stock' => 1,
            'expiry_date' => $expiryDate,
        ]);
    }
}
