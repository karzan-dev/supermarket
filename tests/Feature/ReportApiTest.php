<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExpenseCategory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sale;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_endpoints_are_authorized_and_return_for_all_modules(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');

        foreach ([
            'overview', 'sales', 'products', 'movements', 'damaged', 'purchases', 'suppliers',
            'supplier-payments', 'customers', 'customer-payments', 'expenses', 'returns',
            'cash', 'shifts', 'users', 'activity', 'categories', 'units',
        ] as $report) {
            $response = $this->getJson('/api/reports?report='.$report.'&range=today&sort_by=id&sort_direction=asc');
            $response->assertOk()->assertJsonPath('success', true);
            $this->get('/api/reports/export?report='.$report.'&range=today&language=ku')
                ->assertOk()->streamedContent();
        }

        $this->getJson('/api/reports?report=sales&sort_by=untrusted')->assertUnprocessable();
    }

    public function test_report_permissions_are_enforced_for_api_and_export(): void
    {
        $cashier = $this->createUser('CASHIER');
        $cashier->role->permissions()->detach(
            Permission::query()->where('name', 'reports.view')->value('id'),
        );
        $this->actingAs($cashier, 'sanctum');

        $this->getJson('/api/reports')->assertForbidden();
        $this->get('/api/reports/export?report=sales')->assertForbidden();
    }

    public function test_return_sale_search_can_filter_by_complete_date_range_and_barcode(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $product = $this->createProduct();
        $saleId = $this->postJson('/api/pos/complete-sale', [
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10]],
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk()->json('data.sale.id');

        $today = now()->toDateString();
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today)
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/sales/search?start_date='.$today.'&end_date='.$today)
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today)
            ->assertUnprocessable();
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date=2026-10-11&end_date=2026-10-10')
            ->assertUnprocessable();

        Sale::query()->whereKey($saleId)->update(['created_at' => now()->setTime(11, 59, 59)]);
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=morning')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=noon')
            ->assertOk()->assertJsonCount(0, 'data');

        Sale::query()->whereKey($saleId)->update(['created_at' => now()->setTime(12, 0, 0)]);
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=morning')
            ->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=noon')
            ->assertOk()->assertJsonCount(1, 'data');

        Sale::query()->whereKey($saleId)->update(['created_at' => now()->setTime(0, 0, 0)]);
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=midnight')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/sales/search?query='.urlencode($product->barcode).'&start_date='.$today.'&end_date='.$today.'&time_period=unknown')
            ->assertUnprocessable();
    }

    public function test_overview_uses_real_sales_returns_and_expenses_for_profit(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '0.00'])->assertCreated();
        $product = $this->createProduct();

        $sale = $this->postJson('/api/pos/complete-sale', [
            'items' => [['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 10]],
            'payment_method' => 'CASH',
            'cash_received' => '20.00',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk()->json('data.sale');

        $this->postJson('/api/returns/process', [
            'sale_id' => $sale['id'],
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'reason' => 'Test return',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk();

        $expenseCategory = ExpenseCategory::create([
            'name_ku' => 'خەرجی',
            'name_en' => 'Expense',
            'name_ar' => 'مصروف',
        ]);
        $this->postJson('/api/expenses', [
            'category_id' => $expenseCategory->id,
            'amount' => '3.00',
            'date' => now()->toDateString(),
            'description' => 'Report test expense',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated();
        $this->assertDatabaseHas('expenses', [
            'description' => 'Report test expense',
        ]);

        $summary = $this->getJson('/api/reports?report=overview&range=today')
            ->assertOk()->json('data.summary');

        $this->assertArrayNotHasKey('tax', $summary);
        $this->assertEqualsWithDelta(3, (float) $summary['expenses'], 0.001);
        $this->assertEqualsWithDelta(10, (float) $summary['total_sales'], 0.001);
        $this->assertEqualsWithDelta(5, (float) $summary['cogs'], 0.001);
        $this->assertEqualsWithDelta(5, (float) $summary['gross_profit'], 0.001);
        $this->assertEqualsWithDelta(2, (float) $summary['net_profit'], 0.001);
        $this->assertEqualsWithDelta(10, (float) $summary['returns'], 0.001);
        $this->assertEqualsWithDelta(7, (float) $summary['cash_balance'], 0.001);

        $salesSummary = $this->getJson('/api/reports?report=sales&range=today')->assertOk()->json('data.summary');
        $this->assertEqualsWithDelta(10, (float) $salesSummary['net_sales'], 0.001);

        $salesRows = $this->getJson('/api/reports?report=sales&range=today&sort_by=total&sort_direction=desc')
            ->assertOk()->json('data.rows.data');
        $this->assertCount(1, $salesRows);
        $this->assertArrayNotHasKey('tax', $salesRows[0]);
        $this->assertEqualsWithDelta(20, (float) $salesRows[0]['total'], 0.001);
        $productRows = $this->getJson('/api/reports?report=products&range=today')
            ->assertOk()->json('data.rows.data');
        $this->assertCount(1, $productRows);
        $this->assertEqualsWithDelta(20, (float) $productRows[0]['sales_revenue'], 0.001);
        $returnRows = $this->getJson('/api/reports?report=returns&range=today')
            ->assertOk()->json('data.rows.data');
        $this->assertCount(1, $returnRows);

        $salesCsv = $this->get('/api/reports/export?report=sales&range=today&language=en')->assertOk()->streamedContent();
        $this->assertStringContainsString($sale['invoice_number'], $salesCsv);
        $this->assertStringNotContainsString('Tax', $salesCsv);

        $overviewCsv = $this->get('/api/reports/export?report=overview&range=today&language=en')->assertOk()->streamedContent();
        $this->assertStringContainsString('Net profit', $overviewCsv);
        $this->assertStringContainsString('Top products', $overviewCsv);
    }

    private function createUser(string $roleName): User
    {
        $role = Role::create([
            'name' => $roleName,
            'display_name_ku' => $roleName,
            'display_name_en' => $roleName,
            'display_name_ar' => $roleName,
        ]);
        $user = User::create([
            'name' => ucfirst(strtolower($roleName)),
            'username' => strtolower($roleName).'-report-test',
            'password' => 'Secure-Test-Password-123',
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ]);
        (new RolePermissionSeeder)->run();

        return $user->fresh('role.permissions');
    }

    private function createProduct(): Product
    {
        $category = Category::create([
            'name_ku' => 'کاڵا',
            'name_en' => 'Product',
            'name_ar' => 'المنتج',
        ]);
        $unit = Unit::create([
            'name_ku' => 'دانە',
            'name_en' => 'Piece',
            'name_ar' => 'قطعة',
            'short_code' => 'pcs',
        ]);

        return Product::create([
            'barcode' => 'REPORT-TEST-001',
            'sku' => 'REPORT-TEST-001',
            'name_ku' => 'کاڵای تاقیکردنەوە',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'purchase_price' => 5,
            'selling_price' => 10,
            'quantity' => 10,
            'min_stock' => 1,
        ]);
    }
}
