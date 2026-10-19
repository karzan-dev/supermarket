<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use App\Services\ProductExpiryService;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->format('Y-m-d');

        // Today sales, profit, count
        $todaySales = Sale::whereDate('created_at', $today)
            ->selectRaw('COALESCE(SUM(total), 0) as total_sales, COALESCE(SUM(profit), 0) as total_profit, COUNT(*) as invoice_count')
            ->first();

        $todayPurchases = Purchase::whereDate('created_at', $today)
            ->selectRaw('COALESCE(SUM(total), 0) as total_purchases')
            ->first();

        $todayExpenses = Expense::whereDate('date', $today)
            ->selectRaw('COALESCE(SUM(amount), 0) as total_expenses')
            ->first();

        $salesAmt = (float) ($todaySales->total_sales ?? 0);
        $profitAmt = (float) ($todaySales->total_profit ?? 0);
        $purchasesAmt = (float) ($todayPurchases->total_purchases ?? 0);
        $expensesAmt = (float) ($todayExpenses->total_expenses ?? 0);

        // Product inventory stats
        $totalProducts = Product::where('status', 'ACTIVE')->count();
        $lowStock = Product::where('status', 'ACTIVE')->whereColumn('quantity', '<=', 'min_stock')->where('quantity', '>', 0)->count();
        $outOfStock = Product::where('status', 'ACTIVE')->where('quantity', '<=', 0)->count();
        $expiryService = app(ProductExpiryService::class);
        $expirySettings = $expiryService->settings();
        $expirySummary = $expiryService->summary($expirySettings);
        $expiringSoon = $expirySummary['expiring_within_period'];
        // Customer & Supplier Debts
        $customerStats = Customer::selectRaw('COUNT(*) as total_customers, COALESCE(SUM(debt), 0) as total_customer_debt')->first();
        $supplierStats = Supplier::selectRaw('COUNT(*) as total_suppliers, COALESCE(SUM(debt), 0) as total_supplier_debt')->first();

        // 7-Day sales trend
        $salesTrend = Sale::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as sale_date, COALESCE(SUM(total), 0) as daily_total, COALESCE(SUM(profit), 0) as daily_profit')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('sale_date', 'asc')
            ->get();

        // Top 5 Products
        $topProducts = SaleItem::join('products', 'sale_items.product_id', '=', 'products.id')
            ->select('products.id', 'products.name_ku',
                DB::raw('SUM(sale_items.quantity) as total_qty'),
                DB::raw('SUM(sale_items.total) as total_revenue'))
            ->groupBy('products.id', 'products.name_ku')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // Sales by Category
        $categorySales = SaleItem::join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name_ku', 'categories.name_en', 'categories.name_ar',
                DB::raw('SUM(sale_items.total) as category_total'))
            ->groupBy('categories.id', 'categories.name_ku', 'categories.name_en', 'categories.name_ar')
            ->orderByDesc('category_total')
            ->get();

        // Recent sales with cashier & customer
        $recentSales = Sale::with(['user:id,name', 'customer:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'invoice_number' => $s->invoice_number,
                    'total' => $s->total,
                    'profit' => $s->profit,
                    'payment_method' => $s->payment_method,
                    'payment_status' => $s->payment_status,
                    'customer_name' => $s->customer ? $s->customer->name : null,
                    'cashier_name' => $s->user ? $s->user->name : '',
                    'created_at' => $s->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'sales' => $salesAmt,
                    'profit' => $profitAmt,
                    'invoices' => (int) ($todaySales->invoice_count ?? 0),
                    'purchases' => $purchasesAmt,
                    'expenses' => $expensesAmt,
                    'net_today' => $profitAmt - $expensesAmt,
                ],
                'inventory' => [
                    'total_products' => $totalProducts,
                    'low_stock' => $lowStock,
                    'out_of_stock' => $outOfStock,
                    'expiring_soon' => $expiringSoon,
                    'expired_products' => $expirySummary['expired_products'],
                    'expiring_within_period' => $expirySummary['expiring_within_period'],
                    'expired_stock_quantity' => $expirySummary['expired_stock_quantity'],
                    'urgent_expiry_products' => $expirySummary['urgent_expiry_products'],
                    'expiry_warning_days' => $expirySettings['warning_days'],
                ],
                'customers' => [
                    'total_customers' => (int) ($customerStats->total_customers ?? 0),
                    'total_customer_debt' => (float) ($customerStats->total_customer_debt ?? 0),
                ],
                'suppliers' => [
                    'total_suppliers' => (int) ($supplierStats->total_suppliers ?? 0),
                    'total_supplier_debt' => (float) ($supplierStats->total_supplier_debt ?? 0),
                ],
                'salesTrend' => $salesTrend,
                'topProducts' => $topProducts,
                'categorySales' => $categorySales,
                'recentSales' => $recentSales,
            ],
        ]);
    }
}
