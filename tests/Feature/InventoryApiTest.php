<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\StockMovement;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_adjustment_updates_product_and_appears_in_movement_history(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/inventory/adjust', [
            'product_id' => $product->id,
            'new_quantity' => 12.5,
            'reason' => 'DAMAGE',
            'notes' => 'Damaged package',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.movement_type', 'DAMAGE');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => '12.50',
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'movement_type' => 'DAMAGE',
            'quantity' => '7.50',
            'previous_quantity' => '20.00',
            'new_quantity' => '12.50',
        ]);

        $this->getJson('/api/inventory/movements')
            ->assertOk()
            ->assertJsonPath('data.0.barcode', $product->barcode)
            ->assertJsonPath('data.0.movement_type', 'DAMAGE');
    }

    public function test_stock_adjustment_rejects_negative_quantity(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/inventory/adjust', [
            'product_id' => $product->id,
            'new_quantity' => -1,
            'reason' => 'ADJUSTMENT',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('new_quantity');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => '20.00',
        ]);
    }

    public function test_movement_totals_include_all_sales_and_purchases_even_when_history_is_limited(): void
    {
        $product = $this->createProduct();

        StockMovement::create([
            'product_id' => $product->id,
            'movement_type' => 'PURCHASE',
            'quantity' => 7,
            'previous_quantity' => 20,
            'new_quantity' => 27,
            'user_id' => auth()->id(),
            'created_at' => now()->subMinute(),
        ]);

        for ($index = 0; $index < 501; $index++) {
            StockMovement::create([
                'product_id' => $product->id,
                'movement_type' => 'SALE',
                'quantity' => 1,
                'previous_quantity' => 20,
                'new_quantity' => 19,
                'user_id' => auth()->id(),
                'created_at' => now(),
            ]);
        }

        $this->getJson('/api/inventory/movements')
            ->assertOk()
            ->assertJsonCount(500, 'data')
            ->assertJsonPath('totals.sold_quantity', 501)
            ->assertJsonPath('totals.purchased_quantity', 7);
    }

    public function test_damage_recording_decreases_stock_and_keeps_reason_and_stock_snapshots(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/inventory/damage', [
            'product_id' => $product->id,
            'quantity' => '3',
            'damage_reason' => 'BROKEN',
            'notes' => 'Broken during shelf restocking',
        ])->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.damage_reason', 'BROKEN')
            ->assertJsonPath('data.quantity', '3.00');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => '17.00',
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'movement_type' => 'DAMAGE',
            'damage_reason' => 'BROKEN',
            'quantity' => '3.00',
            'previous_quantity' => '20.00',
            'new_quantity' => '17.00',
            'notes' => 'Broken during shelf restocking',
        ]);

        $this->getJson('/api/inventory/damage')
            ->assertOk()
            ->assertJsonPath('data.movements.0.damage_reason', 'BROKEN')
            ->assertJsonPath('data.movements.0.previous_quantity', 20)
            ->assertJsonPath('data.movements.0.new_quantity', 17);
    }

    public function test_damage_recording_rejects_quantity_above_stock_without_changing_inventory(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/inventory/damage', [
            'product_id' => $product->id,
            'quantity' => '21',
            'damage_reason' => 'EXPIRED',
        ])->assertUnprocessable()->assertJsonValidationErrors('quantity');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => '20.00',
        ]);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_damage_recording_rejects_fractional_quantity(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/inventory/damage', [
            'product_id' => $product->id,
            'quantity' => '1.5',
            'damage_reason' => 'BROKEN',
        ])->assertUnprocessable()->assertJsonValidationErrors('quantity');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => '20.00',
        ]);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_pending_sku_migration_preserves_existing_product_skus(): void
    {
        $product = $this->createProduct();
        $migration = require database_path('migrations/2026_10_07_000002_normalize_product_skus.php');

        $migration->up();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'sku' => 'TEST-SKU-001',
        ]);
    }

    private function createProduct(): Product
    {
        $role = Role::create([
            'name' => 'ADMIN',
            'display_name_ku' => 'بەڕێوەبەر',
            'display_name_en' => 'Administrator',
            'display_name_ar' => 'مدير',
        ]);

        $user = User::create([
            'name' => 'Test Admin',
            'username' => 'test-admin',
            'password' => 'password',
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);
        (new RolePermissionSeeder)->run();
        $this->actingAs($user, 'sanctum');

        $category = Category::create([
            'name_ku' => 'تاقیکردنەوە',
            'name_en' => 'Test',
            'name_ar' => 'اختبار',
        ]);

        $unit = Unit::create([
            'name_ku' => 'دانە',
            'name_en' => 'Piece',
            'name_ar' => 'قطعة',
            'short_code' => 'pcs',
        ]);

        return Product::create([
            'barcode' => 'TEST-001',
            'sku' => 'TEST-SKU-001',
            'name_ku' => 'کاڵای تاقیکردنەوە',
            'name_en' => 'Test item',
            'name_ar' => 'عنصر اختبار',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'purchase_price' => 100,
            'selling_price' => 150,
            'quantity' => 20,
            'min_stock' => 5,
        ]);
    }
}
