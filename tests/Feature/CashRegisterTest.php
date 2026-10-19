<?php

namespace Tests\Feature;

use App\Models\CashRegisterShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\ExpenseCategory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CashRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_open_manage_and_close_a_shift_with_audited_variance(): void
    {
        $cashier = $this->createUser('CASHIER');
        $this->actingAs($cashier, 'sanctum');

        $this->getJson('/api/cash-register')->assertOk();
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])
            ->assertCreated()
            ->assertJsonPath('data.opening_balance', '100.00');

        $key = (string) Str::uuid();
        $payload = [
            'type' => 'CASH_IN',
            'amount' => '30.55',
            'reason' => 'Float top-up',
            'idempotency_key' => $key,
        ];
        $this->postJson('/api/cash-register/transactions', $payload)->assertCreated();
        $this->postJson('/api/cash-register/transactions', $payload)->assertCreated();

        $this->assertDatabaseCount('cash_register_transactions', 2);
        $this->postJson('/api/cash-register/transactions', [
            'type' => 'CASH_OUT',
            'amount' => '200.00',
            'reason' => 'Over balance',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->postJson('/api/cash-register/transactions', [
            'type' => 'CASH_OUT',
            'amount' => '0',
            'reason' => 'Zero',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertUnprocessable()->assertJsonValidationErrors('amount');

        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '130.55']);
        $this->postJson('/api/cash-register/shifts/close', [
            'counted_balance' => '120.00',
            'notes' => 'Short by ten fifty-five',
        ])->assertOk()->assertJsonPath('data.variance', '-10.55');

        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '120.00']);
        $this->assertDatabaseHas('cash_register_transactions', ['type' => 'SHIFT_ADJUSTMENT', 'direction' => 'OUT', 'amount' => '10.55']);
        $this->assertNull(CashRegisterShift::query()->whereNotNull('active_slot')->first());
        $this->postJson('/api/cash-register/transactions', [
            'type' => 'CASH_IN',
            'amount' => '1',
            'reason' => 'Must fail without a shift',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertUnprocessable();
    }

    public function test_purchase_create_edit_and_delete_do_not_change_cash_register_balance(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '0.00'])->assertCreated();
        $supplier = Supplier::create(['name' => 'Purchase test supplier']);
        $product = $this->createProduct();
        $payload = [
            'supplier_id' => $supplier->id,
            'invoice_number' => 'PUR-CASH-TEST-001',
            'items' => [['product_id' => $product->id, 'quantity' => 2, 'purchase_price' => 50]],
            'paid_amount' => 50,
        ];

        $purchaseId = $this->postJson('/api/purchases', $payload)
            ->assertCreated()
            ->json('data.id');
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '0.00']);
        $this->assertDatabaseCount('cash_register_transactions', 0);

        $payload['paid_amount'] = 75;
        $this->putJson("/api/purchases/{$purchaseId}", $payload)->assertOk();
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '0.00']);
        $this->assertDatabaseCount('cash_register_transactions', 0);

        $this->deleteJson("/api/purchases/{$purchaseId}")->assertOk();
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '0.00']);
        $this->assertDatabaseCount('cash_register_transactions', 0);
    }

    public function test_pos_cash_sale_is_idempotent_card_sales_do_not_change_cash_and_returns_are_linked(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])->assertCreated();
        $product = $this->createProduct();
        $saleKey = (string) Str::uuid();
        $cashSale = [
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10]],
            'payment_method' => 'CASH',
            'cash_received' => '12.00',
            'idempotency_key' => $saleKey,
        ];

        $saleResponse = $this->postJson('/api/pos/complete-sale', $cashSale)->assertOk();
        $saleId = $saleResponse->json('data.sale.id');
        $this->postJson('/api/pos/complete-sale', $cashSale)->assertOk()->assertJsonPath('data.sale.id', $saleId);
        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '110.00']);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'quantity' => '9.00']);

        $this->postJson('/api/pos/complete-sale', [
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10]],
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk();
        $this->assertDatabaseCount('sales', 2);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '110.00']);

        $returnKey = (string) Str::uuid();
        $returnPayload = [
            'sale_id' => $saleId,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'reason' => 'Customer return',
            'idempotency_key' => $returnKey,
        ];
        $returnId = $this->postJson('/api/returns/process', $returnPayload)->assertOk()->json('data.id');
        $this->postJson('/api/returns/process', $returnPayload)->assertOk()->assertJsonPath('data.id', $returnId);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '100.00']);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'quantity' => '9.00']);
        $this->getJson('/api/sales/by-invoice/'.$saleResponse->json('data.sale.invoice_number'))
            ->assertOk()
            ->assertJsonPath('data.items.0.returned_quantity', 1);
        $this->getJson('/api/pos/summary')->assertOk()->assertJsonPath('data.today_net_sales', 10);
        $this->postJson('/api/returns/process', [
            'sale_id' => $saleId,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'idempotency_key' => (string) Str::uuid(),
        ])->assertUnprocessable();
        $this->assertDatabaseCount('cash_register_transactions', 3);
    }

    public function test_pos_cash_sale_automatically_opens_a_shift_when_none_is_open(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $product = $this->createProduct();

        $this->postJson('/api/pos/complete-sale', [
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10]],
            'payment_method' => 'CASH',
            'cash_received' => '10.00',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk();

        $shift = CashRegisterShift::query()->whereNotNull('active_slot')->firstOrFail();
        $this->assertSame($manager->id, $shift->opened_by);
        $this->assertDatabaseHas('cash_register_transactions', [
            'type' => 'SALE',
            'shift_id' => $shift->id,
            'amount' => '10.00',
        ]);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '10.00']);
    }

    public function test_expense_posts_once_and_deletion_does_not_fake_a_cash_refund(): void
    {
        $admin = $this->createUser('ADMIN');
        $this->actingAs($admin, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])->assertCreated();
        $category = ExpenseCategory::create([
            'name_ku' => 'خەرجی',
            'name_en' => 'Expense',
            'name_ar' => 'مصروف',
        ]);

        $expensePayload = [
            'category_id' => $category->id,
            'amount' => '25.00',
            'date' => now()->toDateString(),
            'description' => 'Cleaning materials',
            'idempotency_key' => (string) Str::uuid(),
        ];
        $expense = $this->postJson('/api/expenses', $expensePayload)->assertCreated()->json('data.id');
        $this->postJson('/api/expenses', $expensePayload)->assertOk()->assertJsonPath('data.id', $expense);
        $this->assertDatabaseCount('expenses', 1);
        $this->assertDatabaseCount('cash_register_transactions', 2);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '75.00']);

        $this->deleteJson("/api/expenses/{$expense}")->assertOk();
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '75.00']);
        $this->assertDatabaseHas('cash_register_transactions', ['type' => 'EXPENSE', 'direction' => 'OUT', 'amount' => '25.00']);
        $this->assertDatabaseMissing('cash_register_transactions', ['type' => 'ADJUSTMENT']);
        $this->assertDatabaseCount('cash_register_transactions', 2);
    }

    public function test_paid_purchase_creation_and_deletion_do_not_change_cash_register(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])->assertCreated();
        $supplier = Supplier::create(['name' => 'Purchase delete supplier']);
        $product = $this->createProduct();

        $purchaseId = $this->postJson('/api/purchases', [
            'supplier_id' => $supplier->id,
            'invoice_number' => 'PUR-DELETE-TEST',
            'items' => [['product_id' => $product->id, 'quantity' => 2, 'purchase_price' => 5]],
            'paid_amount' => 5,
        ])->assertCreated()->json('data.id');

        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '100.00']);
        $this->assertDatabaseCount('cash_register_transactions', 1);

        $this->deleteJson("/api/purchases/{$purchaseId}")->assertOk();

        $this->assertDatabaseMissing('purchases', ['id' => $purchaseId]);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '100.00']);
        $this->assertDatabaseCount('cash_register_transactions', 1);
    }

    public function test_supplier_with_purchase_history_cannot_be_deleted(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])->assertCreated();
        $supplier = Supplier::create(['name' => 'Supplier with purchase history']);
        $product = $this->createProduct();
        $purchaseId = $this->postJson('/api/purchases', [
            'supplier_id' => $supplier->id,
            'invoice_number' => 'PUR-SUPPLIER-DELETE-TEST',
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'purchase_price' => 5]],
            'paid_amount' => 5,
        ])->assertCreated()->json('data.id');

        $this->deleteJson("/api/suppliers/{$supplier->id}")
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'ناتوانرێت دابینکەر بسڕدرێتەوە چونکە پسوڵەی کڕینی پێوەبەستراوە. بۆ پاراستنی مێژووی کڕینەکان، دابینکەرەکە لەبری سڕینەوە دەستکاری بکە.');

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
        $this->assertDatabaseHas('purchases', ['id' => $purchaseId, 'supplier_id' => $supplier->id]);
    }

    public function test_customer_and_supplier_debt_payments_are_idempotent_and_only_cash_changes_register(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])->assertCreated();
        $customer = Customer::create(['name' => 'Cash Test Customer', 'debt' => '50.00']);
        $supplier = Supplier::create(['name' => 'Cash Test Supplier', 'debt' => '40.00']);

        $customerPayment = [
            'amount' => '15.00',
            'idempotency_key' => (string) Str::uuid(),
        ];
        $this->postJson("/api/customers/{$customer->id}/pay-debt", $customerPayment)->assertCreated();
        $this->postJson("/api/customers/{$customer->id}/pay-debt", $customerPayment)->assertOk();
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'debt' => '35.00']);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '115.00']);

        $supplierPayment = [
            'amount' => '10.00',
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ];
        $this->postJson("/api/suppliers/{$supplier->id}/pay-debt", $supplierPayment)->assertCreated();
        $this->postJson("/api/suppliers/{$supplier->id}/pay-debt", $supplierPayment)->assertOk();
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'debt' => '30.00']);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '115.00']);
        $this->assertDatabaseCount('payments', 2);
        $this->assertDatabaseCount('cash_register_transactions', 2);
    }

    public function test_supplier_debt_can_be_paid_by_card_or_bank_without_cash_in_register(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $supplier = Supplier::create(['name' => 'Non-cash payment supplier', 'debt' => '20.00']);

        foreach (['CARD', 'BANK'] as $method) {
            $this->postJson("/api/suppliers/{$supplier->id}/pay-debt", [
                'amount' => '5.00',
                'payment_method' => $method,
                'idempotency_key' => (string) Str::uuid(),
            ])->assertCreated();
        }

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'debt' => '10.00']);
        $this->assertDatabaseHas('cash_register_accounts', ['id' => 1, 'balance' => '0.00']);
        $this->assertDatabaseCount('cash_register_transactions', 0);
    }

    public function test_cash_register_permissions_are_checked_on_server(): void
    {
        $cashier = $this->createUser('CASHIER');
        $cashier->role->permissions()->detach(
            Permission::query()->where('name', 'cash.manage')->value('id'),
        );
        $this->actingAs($cashier, 'sanctum');

        $this->getJson('/api/cash-register')->assertOk();
        $this->postJson('/api/cash-register/shifts/open', ['opening_balance' => '0'])->assertForbidden();
    }

    public function test_custom_cash_manager_can_close_another_users_shift(): void
    {
        $shiftOpener = $this->createUser('MANAGER');
        $this->actingAs($shiftOpener, 'sanctum')
            ->postJson('/api/cash-register/shifts/open', ['opening_balance' => '100.00'])
            ->assertCreated();

        $cashier = $this->createUser('CASHIER');
        $cashier->update(['permissions_customized' => true]);
        $cashier->customPermissions()->sync([
            Permission::query()->where('name', 'cash.manage')->value('id'),
        ]);

        $this->actingAs($cashier, 'sanctum')->getJson('/api/cash-register')->assertOk();
        $this->postJson('/api/cash-register/shifts/close', [
            'counted_balance' => '100.00',
        ])->assertOk();

        $this->assertDatabaseHas('cash_register_shifts', [
            'opened_by' => $shiftOpener->id,
            'closed_by' => $cashier->id,
        ]);
    }

    public function test_duplicate_pos_product_lines_are_aggregated_for_stock_validation_and_deduction(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $product = $this->createProduct();

        $this->postJson('/api/pos/complete-sale', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 8, 'unit_price' => 10],
                ['product_id' => $product->id, 'quantity' => 8, 'unit_price' => 10],
            ],
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertUnprocessable();

        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertDatabaseCount('stock_movements', 0);
        self::assertEquals(10, (float) $product->fresh()->quantity);

        $this->postJson('/api/pos/complete-sale', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4, 'unit_price' => 10],
                ['product_id' => $product->id, 'quantity' => 4, 'unit_price' => 10],
            ],
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk();

        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('sale_items', 2);
        $this->assertDatabaseCount('stock_movements', 2);
        self::assertEquals(2, (float) $product->fresh()->quantity);
    }

    public function test_pos_respects_allow_negative_stock_setting(): void
    {
        $manager = $this->createUser('MANAGER');
        $this->actingAs($manager, 'sanctum');
        $product = $this->createProduct();
        Setting::set('allow_negative_stock', '1');

        $this->postJson('/api/pos/complete-sale', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 6, 'unit_price' => 10],
                ['product_id' => $product->id, 'quantity' => 6, 'unit_price' => 10],
            ],
            'payment_method' => 'CARD',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertOk();

        self::assertEquals(-2, (float) $product->fresh()->quantity);
        $this->assertDatabaseCount('sale_items', 2);
        $this->assertDatabaseCount('stock_movements', 2);
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
            'username' => strtolower($roleName).'-cash-test',
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
            'name_en' => 'Products',
            'name_ar' => 'المنتجات',
        ]);
        $unit = Unit::create([
            'name_ku' => 'دانە',
            'name_en' => 'Piece',
            'name_ar' => 'قطعة',
            'short_code' => 'pcs',
        ]);

        return Product::create([
            'barcode' => 'CASH-TEST-001',
            'sku' => 'CASH-TEST-001',
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
