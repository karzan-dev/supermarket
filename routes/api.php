<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\CashRegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerDebtController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use App\Services\ProductExpiryService;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'framework' => 'Laravel 12 (PHP 8.3+)',
        'database' => 'MySQL 8.0 (InnoDB utf8mb4)',
        'system' => 'فرۆشگای من - Supermarket Management System',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/test', fn () => response()->json([
    'success' => true,
    'message' => 'API is working',
]));

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/notifications/expiry', function (ProductExpiryService $expiryService) {
        $settings = $expiryService->settings();

        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => $settings['enabled'],
                'show_bell' => $settings['show_bell'],
                'show_dashboard' => $settings['show_dashboard'],
                'warning_days' => $settings['warning_days'],
                'alerts' => $expiryService->notifications($settings),
            ],
        ]);
    })->middleware('permission:dashboard.view');

    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
        ->middleware('permission:dashboard.view');

    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:products.view');
    Route::get('/products/{id}', [ProductController::class, 'show'])->middleware('permission:products.view');
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'findByBarcode'])->middleware('permission:products.view');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.manage');
    Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('permission:products.manage');

    Route::get('/inventory/damage', [InventoryController::class, 'damage'])->middleware('permission:damage.view');
    Route::post('/inventory/damage', [InventoryController::class, 'recordDamage'])->middleware('permission:inventory.manage');
    Route::get('/inventory/movements', [InventoryController::class, 'movements'])->middleware('permission:inventory.view');
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->middleware('permission:inventory.manage');

    Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:categories.view');
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:categories.manage');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->middleware('permission:categories.manage');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->middleware('permission:categories.manage');

    Route::get('/units', [UnitController::class, 'index'])->middleware('permission:units.view');
    Route::post('/units', [UnitController::class, 'store'])->middleware('permission:units.manage');
    Route::put('/units/{id}', [UnitController::class, 'update'])->middleware('permission:units.manage');
    Route::delete('/units/{id}', [UnitController::class, 'destroy'])->middleware('permission:units.manage');

    Route::get('/pos/summary', [PosController::class, 'summary'])->middleware('permission:pos.use');
    Route::post('/pos/complete-sale', [PosController::class, 'completeSale'])->middleware('permission:pos.use');

    Route::get('/cash-register', [CashRegisterController::class, 'dashboard'])->middleware('permission:cash.view');
    Route::get('/cash-register/transactions', [CashRegisterController::class, 'transactions'])->middleware('permission:cash.view');
    Route::get('/cash-register/users', [CashRegisterController::class, 'users'])->middleware('permission:cash.view');
    Route::get('/cash-register/export', [CashRegisterController::class, 'export'])->middleware('permission:cash.view');
    Route::post('/cash-register/transactions', [CashRegisterController::class, 'store'])->middleware('permission:cash.manage');
    Route::post('/cash-register/shifts/open', [CashRegisterController::class, 'openShift'])->middleware('permission:cash.manage');
    Route::post('/cash-register/shifts/close', [CashRegisterController::class, 'closeShift'])->middleware('permission:cash.manage');

    Route::get('/purchases', [PurchaseController::class, 'index'])->middleware('permission:purchases.view');
    Route::get('/purchases/{id}', [PurchaseController::class, 'show'])->middleware('permission:purchases.view');
    Route::post('/purchases', [PurchaseController::class, 'store'])->middleware('permission:purchases.manage');
    Route::put('/purchases/{id}', [PurchaseController::class, 'update'])->middleware('permission:purchases.manage');
    Route::delete('/purchases/{id}', [PurchaseController::class, 'destroy'])->middleware('permission:purchases.manage');

    Route::get('/customers/debt-alerts', [CustomerDebtController::class, 'alerts'])->middleware('permission:customers.view');
    Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:customers.view');
    Route::get('/customers/{id}', [CustomerController::class, 'show'])->middleware('permission:customers.view');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('permission:customers.manage');
    Route::put('/customers/{id}', [CustomerController::class, 'update'])->middleware('permission:customers.manage');
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])->middleware('permission:customers.manage');
    Route::post('/customers/{id}/pay-debt', [CustomerController::class, 'payDebt'])->middleware('permission:customers.manage');
    Route::get('/customers/{id}/debt-history', [CustomerDebtController::class, 'history'])->middleware('permission:customers.view');
    Route::post('/customers/{id}/notebook-debts', [CustomerDebtController::class, 'store'])->middleware('permission:customers.manage');
    Route::delete('/customers/{id}/notebook-debts/{entryId}', [CustomerDebtController::class, 'destroy'])->middleware('permission:customers.manage');

    Route::get('/suppliers', [SupplierController::class, 'index'])->middleware('permission:suppliers.view');
    Route::get('/suppliers/{id}', [SupplierController::class, 'show'])->middleware('permission:suppliers.view');
    Route::post('/suppliers', [SupplierController::class, 'store'])->middleware('permission:suppliers.manage');
    Route::put('/suppliers/{id}', [SupplierController::class, 'update'])->middleware('permission:suppliers.manage');
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy'])->middleware('permission:suppliers.manage');
    Route::post('/suppliers/{id}/pay-debt', [SupplierController::class, 'payDebt'])->middleware('permission:suppliers.manage');

    Route::get('/expenses', [ExpenseController::class, 'index'])->middleware('permission:expenses.view');
    Route::get('/expense-categories', [ExpenseController::class, 'categories'])->middleware('permission:expenses.view');
    Route::post('/expense-categories', [ExpenseController::class, 'storeCategory'])->middleware('permission:expenses.manage');
    Route::delete('/expense-categories/{id}', [ExpenseController::class, 'destroyCategory'])->middleware('permission:expenses.manage');
    Route::post('/expenses', [ExpenseController::class, 'store'])->middleware('permission:expenses.manage');
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy'])->middleware('permission:expenses.manage');

    Route::get('/returns', [ReturnController::class, 'index'])->middleware('permission:returns.view');
    Route::get('/sales/search', [ReturnController::class, 'searchSales'])->middleware('permission:returns.view');
    Route::get('/sales/by-invoice/{invoiceNumber}', [ReturnController::class, 'findByInvoice'])->middleware('permission:returns.view');
    Route::post('/returns/process', [ReturnController::class, 'processReturn'])->middleware('permission:returns.manage');

    Route::get('/reports', [ReportController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/reports/export', [ReportController::class, 'export'])->middleware('permission:reports.view');

    Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.manage');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.manage');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.manage');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:users.manage');

    Route::get('/settings', [SettingController::class, 'index'])->middleware('permission:settings.view');
    Route::post('/settings', [SettingController::class, 'update'])->middleware('permission:settings.manage');
    Route::get('/backup', [BackupController::class, 'download']);

    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->middleware('permission:activity_logs.view');
});
