<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashRegisterAccount;
use App\Models\CashRegisterShift;
use App\Models\CashRegisterTransaction;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\ProductExpiryService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private const REPORTS = [
        'overview', 'sales', 'products', 'movements', 'purchases', 'suppliers',
        'supplier-payments', 'customers', 'customer-payments', 'expenses', 'returns',
        'damaged', 'cash', 'shifts', 'users', 'activity', 'categories', 'units',
    ];

    public function index(Request $request)
    {
        $filters = $this->validatedFilters($request);
        [$start, $end, $previousStart, $previousEnd] = $this->dateBounds($filters);
        $report = $filters['report'];

        if ($report === 'overview') {
            return response()->json([
                'success' => true,
                'data' => $this->overview($start, $end, $previousStart, $previousEnd),
            ]);
        }

        $query = $this->reportQuery($report, $filters, $start, $end);
        $rows = $query->paginate($filters['per_page'])->withQueryString();
        $summary = $this->reportSummary($report, $filters, $start, $end);

        return response()->json([
            'success' => true,
            'data' => [
                'report' => $report,
                'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
                'summary' => $summary,
                'rows' => $rows,
                'filters' => [
                    'categories' => DB::table('categories')->orderBy('name_ku')->get(['id', 'name_ku', 'name_en', 'name_ar']),
                    'customers' => DB::table('customers')->orderBy('name')->get(['id', 'name']),
                    'suppliers' => DB::table('suppliers')->orderBy('name')->get(['id', 'name']),
                    'users' => User::query()->where('status', 'ACTIVE')->orderBy('name')->get(['id', 'name']),
                    'units' => DB::table('units')->orderBy('name_ku')->get(['id', 'name_ku', 'name_en', 'name_ar', 'short_code']),
                ],
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validatedFilters($request, true);
        [$start, $end, $previousStart, $previousEnd] = $this->dateBounds($filters);
        $report = $filters['report'];
        $overview = $report === 'overview'
            ? $this->overview($start, $end, $previousStart, $previousEnd)
            : null;
        $query = $overview === null ? $this->reportQuery($report, $filters, $start, $end) : null;
        $language = $filters['language'];
        $labels = $this->exportLabels($language);
        $summary = $overview['summary'] ?? $this->reportSummary($report, $filters, $start, $end);
        $columns = $this->reportColumnKeys($report);

        return response()->streamDownload(function () use ($query, $overview, $summary, $columns, $report, $labels, $start, $end): void {
            $stream = fopen('php://output', 'w');
            if ($stream === false) {
                throw new \RuntimeException('Unable to create report export stream.');
            }
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, [$labels['title'], $labels[$report] ?? $report]);
            fputcsv($stream, [$labels['generated'], now()->toDateTimeString()]);
            fputcsv($stream, [$labels['period'], $start->toDateString().' - '.$end->toDateString()]);
            fputcsv($stream, []);
            fputcsv($stream, [$labels['summary']]);
            fputcsv($stream, [$labels['metric'], $labels['value']]);
            foreach ($summary as $key => $value) {
                fputcsv($stream, [$labels['metric_'.$key] ?? $key, $this->safeCsvValue($value)]);
            }

            if ($overview !== null) {
                fputcsv($stream, []);
                fputcsv($stream, [$labels['top_products']]);
                fputcsv($stream, [$labels['name_ku'], $labels['quantity'], $labels['sales_revenue'], $labels['gross_profit']]);
                foreach ($overview['top_products'] as $product) {
                    fputcsv($stream, [
                        $this->safeCsvValue($product->name_ku),
                        $this->safeCsvValue($product->quantity),
                        $this->safeCsvValue($product->revenue),
                        $this->safeCsvValue($product->profit),
                    ]);
                }
                fclose($stream);

                return;
            }

            fputcsv($stream, []);
            fputcsv($stream, array_map(fn (string $key): string => $labels[$key] ?? $key, $columns));
            $hasRows = false;
            (clone $query)->reorder()->orderBy($this->reportIdColumn($report))->chunk(500, function ($rows) use ($stream, $columns, $labels, &$hasRows): void {
                foreach ($rows as $row) {
                    $values = $row instanceof Model
                        ? $row->getAttributes()
                        : (array) $row;
                    fputcsv($stream, array_map(fn (string $key) => $this->localizedCsvValue($key, $values[$key] ?? null, $labels), $columns));
                    $hasRows = true;
                }
            });
            if (! $hasRows) {
                fputcsv($stream, [$labels['empty']]);
            }
            fclose($stream);
        }, 'report-'.$report.'-'.$start->toDateString().'-'.$end->toDateString().'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function safeCsvValue(mixed $value): mixed
    {
        if (is_string($value) && ! is_numeric($value) && preg_match('/^[\t\r ]*[=+\-@]/', $value) === 1) {
            return "'".$value;
        }

        return $value;
    }

    private function localizedCsvValue(string $column, mixed $value, array $labels): mixed
    {
        if (! is_string($value)) {
            return $this->safeCsvValue($value);
        }

        $translationKey = match ($column) {
            'payment_method' => 'payment_'.$value,
            'direction' => 'direction_'.$value,
            'payment_status', 'status', 'type', 'payment_type', 'movement_type', 'action' => 'status_'.$value,
            'role' => 'role_'.$value,
            default => null,
        };

        return $this->safeCsvValue($translationKey !== null ? ($labels[$translationKey] ?? $value) : $value);
    }

    private function reportColumnKeys(string $report): array
    {
        return match ($report) {
            'sales' => ['id', 'invoice_number', 'created_at', 'subtotal', 'discount', 'total', 'cost_of_goods', 'profit', 'payment_method', 'payment_status', 'cash_received', 'change_amount', 'cashier', 'customer'],
            'products' => ['id', 'barcode', 'sku', 'name_ku', 'category', 'unit', 'quantity', 'purchase_price', 'selling_price', 'wholesale_price', 'expiry_date', 'status', 'stock_value', 'unit_margin', 'margin_percent', 'sold_quantity', 'sales_revenue', 'gross_profit'],
            'movements', 'damaged' => ['id', 'created_at', 'name_ku', 'barcode', 'movement_type', 'damage_reason', 'quantity', 'previous_quantity', 'new_quantity', 'notes', 'user'],
            'purchases' => ['id', 'invoice_number', 'created_at', 'supplier', 'user', 'total', 'paid_amount', 'remaining_amount', 'payment_status', 'notes'],
            'suppliers' => ['id', 'name', 'company', 'phone', 'total_purchases', 'total_paid', 'debt', 'period_purchase_count', 'period_purchase_total', 'period_purchase_paid', 'period_purchase_due'],
            'supplier-payments' => ['id', 'created_at', 'supplier', 'payment_type', 'payment_method', 'amount', 'notes', 'user'],
            'customers' => ['id', 'name', 'phone', 'total_purchases', 'total_paid', 'debt', 'invoice_count', 'period_sales'],
            'customer-payments' => ['id', 'created_at', 'customer', 'payment_type', 'payment_method', 'amount', 'notes', 'user'],
            'expenses' => ['id', 'date', 'category', 'amount', 'description', 'user'],
            'returns' => ['id', 'created_at', 'invoice_number', 'customer', 'total_refund', 'reason', 'user'],
            'cash' => ['id', 'transaction_number', 'created_at', 'type', 'direction', 'amount', 'balance_before', 'balance_after', 'reason', 'source_type', 'source_id', 'user'],
            'shifts' => ['id', 'opened_at', 'closed_at', 'cashier', 'closed_by', 'opening_balance', 'expected_balance', 'counted_balance', 'variance', 'opening_notes', 'closing_notes'],
            'users' => ['id', 'name', 'role', 'status', 'last_login', 'created_at', 'sales_count', 'sales_total'],
            'activity' => ['id', 'created_at', 'user', 'action', 'entity', 'entity_id', 'description'],
            'categories' => ['id', 'name_ku', 'name_en', 'name_ar', 'status', 'product_count', 'stock_quantity', 'period_sales'],
            'units' => ['id', 'name_ku', 'name_en', 'name_ar', 'short_code', 'product_count', 'stock_quantity', 'period_quantity_sold', 'period_revenue'],
            default => [],
        };
    }

    private function validatedFilters(Request $request, bool $forExport = false): array
    {
        $data = $request->validate([
            'report' => 'nullable|in:'.implode(',', self::REPORTS),
            'range' => 'nullable|in:today,yesterday,week,month,year,custom',
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'search' => 'nullable|string|max:100',
            'user_id' => 'nullable|integer|exists:users,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'product_id' => 'nullable|integer|exists:products,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            'payment_method' => 'nullable|in:CASH,CARD,CREDIT,BANK',
            'status' => 'nullable|string|max:30',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'language' => 'nullable|in:ku,en,ar',
            'sort_by' => 'nullable|string|max:50',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);
        $data['report'] = $data['report'] ?? 'overview';
        $data['range'] = $data['range'] ?? 'month';
        $data['per_page'] = $forExport ? 100 : (int) ($data['per_page'] ?? 25);
        $data['language'] = $data['language'] ?? 'ku';

        if ($data['range'] === 'custom' && (! isset($data['start_date']) || ! isset($data['end_date']))) {
            abort(422, 'Both start_date and end_date are required for a custom date range.');
        }

        return $data;
    }

    private function dateBounds(array $filters): array
    {
        $today = now();
        [$start, $end] = match ($filters['range']) {
            'today' => [$today->copy()->startOfDay(), $today->copy()->endOfDay()],
            'yesterday' => [$today->copy()->subDay()->startOfDay(), $today->copy()->subDay()->endOfDay()],
            'week' => [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()],
            'year' => [$today->copy()->startOfYear(), $today->copy()->endOfYear()],
            'custom' => [Carbon::parse($filters['start_date'])->startOfDay(), Carbon::parse($filters['end_date'])->endOfDay()],
            default => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()],
        };
        $days = $start->diffInDays($end) + 1;

        return [$start, $end, $start->copy()->subDays($days), $start->copy()->subSecond()];
    }

    private function overview(Carbon $start, Carbon $end, Carbon $previousStart, Carbon $previousEnd): array
    {
        $sales = Sale::query()->whereBetween('created_at', [$start, $end]);
        $salesStats = (clone $sales)->selectRaw(
            'COALESCE(SUM(total),0) total, COALESCE(SUM(cost_of_goods),0) cogs, COALESCE(SUM(profit),0) profit, COUNT(*) invoices, COALESCE(SUM(discount),0) discounts'
        )->first();
        [$returns, $returnCogs] = $this->returnImpact($start, $end);
        $expenses = Expense::query()->whereBetween('date', [$start, $end])->sum('amount');
        $purchases = Purchase::query()->whereBetween('created_at', [$start, $end])->sum('total');
        $previous = Sale::query()->whereBetween('created_at', [$previousStart, $previousEnd])
            ->selectRaw('COALESCE(SUM(total),0) total, COALESCE(SUM(profit),0) profit')->first();
        $previousExpenses = (float) Expense::query()->whereBetween('date', [$previousStart, $previousEnd])->sum('amount');
        $expenseTotal = (float) $expenses;
        $currentReturnImpact = $returns - (float) $returnCogs;
        [$previousReturns, $previousReturnCogs] = $this->returnImpact($previousStart, $previousEnd);
        $currentNetProfit = (float) $salesStats->profit - $currentReturnImpact - $expenseTotal;
        $previousNetProfit = (float) $previous->profit - ($previousReturns - $previousReturnCogs) - $previousExpenses;
        $expenseCategories = Expense::query()->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->whereBetween('expenses.date', [$start, $end])
            ->selectRaw('expense_categories.name_ku, expense_categories.name_en, expense_categories.name_ar, SUM(expenses.amount) total')
            ->groupBy('expense_categories.id', 'expense_categories.name_ku', 'expense_categories.name_en', 'expense_categories.name_ar')
            ->orderByDesc('total')->limit(8)->get();
        $trend = Sale::query()->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date, SUM(total) as sales, SUM(profit) as profit, COUNT(*) as invoices')
            ->groupBy(DB::raw('DATE(created_at)'))->orderBy('date')->get();
        $cogs = max(0, (float) $salesStats->cogs - (float) $returnCogs);
        $grossProfit = (float) $salesStats->profit - $currentReturnImpact;
        $totalSales = (float) $salesStats->total - $returns;

        return [
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
            'summary' => [
                'total_sales' => $totalSales,
                'gross_sales' => (float) $salesStats->total,
                'cogs' => $cogs,
                'gross_profit' => $grossProfit,
                'total_purchases' => (float) $purchases,
                'expenses' => $expenseTotal,
                'net_profit' => $grossProfit - $expenseTotal,
                'invoices' => (int) $salesStats->invoices,
                'returns' => $returns,
                'discounts' => (float) $salesStats->discounts,
                'average_invoice' => (int) $salesStats->invoices > 0 ? $totalSales / (int) $salesStats->invoices : 0,
                'sales_change_percent' => $this->percentChange($totalSales, (float) $previous->total - $previousReturns),
                'profit_change_percent' => $this->percentChange($currentNetProfit, $previousNetProfit),
                'total_products' => Product::query()->where('status', 'ACTIVE')->count(),
                'low_stock' => Product::query()->where('status', 'ACTIVE')->whereColumn('quantity', '<=', 'min_stock')->where('quantity', '>', 0)->count(),
                'out_of_stock' => Product::query()->where('status', 'ACTIVE')->where('quantity', '<=', 0)->count(),
                'customers' => DB::table('customers')->count(),
                'customer_debt' => (float) DB::table('customers')->sum('debt'),
                'suppliers' => DB::table('suppliers')->count(),
                'supplier_debt' => (float) DB::table('suppliers')->sum('debt'),
                'users' => User::query()->where('status', 'ACTIVE')->count(),
                'cash_balance' => (float) (CashRegisterAccount::query()->find(1)?->balance ?? 0),
                'cash_in' => (float) CashRegisterTransaction::query()->whereBetween('created_at', [$start, $end])->where('direction', 'IN')->sum('amount'),
                'cash_out' => (float) CashRegisterTransaction::query()->whereBetween('created_at', [$start, $end])->where('direction', 'OUT')->sum('amount'),
            ],
            'trend' => $trend,
            'expense_categories' => $expenseCategories,
            'top_products' => SaleItem::query()->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->whereBetween('sales.created_at', [$start, $end])
                ->selectRaw('products.id, products.name_ku, SUM(sale_items.quantity) quantity, SUM(sale_items.total) revenue, SUM(sale_items.profit) profit')
                ->groupBy('products.id', 'products.name_ku')
                ->orderByDesc('quantity')->limit(10)->get(),
            'payment_methods' => Sale::query()->whereBetween('created_at', [$start, $end])
                ->selectRaw('payment_method, payment_status, COUNT(*) invoices, SUM(total) amount')
                ->groupBy('payment_method', 'payment_status')->get(),
        ];
    }

    private function percentChange(float $current, float $previous): ?float
    {
        return $previous == 0.0 ? null : round((($current - $previous) / abs($previous)) * 100, 2);
    }

    private function returnImpact(Carbon $start, Carbon $end): array
    {
        $returns = (float) SaleReturn::query()->whereBetween('created_at', [$start, $end])->sum('total_refund');
        $saleItemCosts = DB::table('sale_items')
            ->selectRaw('sale_id, product_id, SUM(quantity * purchase_cost) / NULLIF(SUM(quantity),0) as unit_cost')
            ->groupBy('sale_id', 'product_id');
        $returnCogs = (float) ReturnItem::query()
            ->join('returns', 'return_items.return_id', '=', 'returns.id')
            ->joinSub($saleItemCosts, 'sale_item_costs', function ($join) {
                $join->on('sale_item_costs.product_id', '=', 'return_items.product_id')
                    ->on('sale_item_costs.sale_id', '=', 'returns.sale_id');
            })
            ->whereBetween('returns.created_at', [$start, $end])
            ->selectRaw('COALESCE(SUM(return_items.quantity * sale_item_costs.unit_cost),0) as amount')
            ->value('amount');

        return [$returns, $returnCogs];
    }

    private function reportQuery(string $report, array $filters, Carbon $start, Carbon $end)
    {
        $search = trim($filters['search'] ?? '');

        $query = match ($report) {
            'sales' => Sale::query()->leftJoin('users', 'sales.user_id', '=', 'users.id')
                ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
                ->select('sales.id', 'sales.invoice_number', 'sales.created_at', 'sales.subtotal', 'sales.discount', 'sales.total', 'sales.cost_of_goods', 'sales.profit', 'sales.payment_method', 'sales.payment_status', 'sales.cash_received', 'sales.change_amount', 'users.name as cashier', 'customers.name as customer'),
            'products' => Product::query()->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->leftJoin('units', 'products.unit_id', '=', 'units.id')
                ->leftJoinSub(
                    DB::table('sale_items')->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                        ->whereBetween('sales.created_at', [$start, $end])
                        ->selectRaw('sale_items.product_id, SUM(sale_items.quantity) as sold_quantity, SUM(sale_items.total) as sales_revenue, SUM(sale_items.profit) as gross_profit')
                        ->groupBy('sale_items.product_id'),
                    'sales_performance',
                    function ($join) {
                        $join->on('sales_performance.product_id', '=', 'products.id');
                    },
                )
                ->select('products.id', 'products.barcode', 'products.sku', 'products.name_ku', 'categories.name_ku as category', 'units.name_ku as unit', 'products.quantity', 'products.purchase_price', 'products.selling_price', 'products.wholesale_price', 'products.expiry_date', 'products.status')
                ->selectRaw('(products.quantity * products.purchase_price) as stock_value')
                ->selectRaw('(products.selling_price - products.purchase_price) as unit_margin')
                ->selectRaw('CASE WHEN products.selling_price > 0 THEN ROUND(((products.selling_price - products.purchase_price) / products.selling_price) * 100, 2) ELSE 0 END as margin_percent')
                ->selectRaw('COALESCE(sales_performance.sold_quantity,0) as sold_quantity, COALESCE(sales_performance.sales_revenue,0) as sales_revenue, COALESCE(sales_performance.gross_profit,0) as gross_profit'),
            'movements', 'damaged' => StockMovement::query()->join('products', 'stock_movements.product_id', '=', 'products.id')
                ->leftJoin('users', 'stock_movements.user_id', '=', 'users.id')
                ->select('stock_movements.id', 'stock_movements.created_at', 'products.name_ku', 'products.barcode', 'stock_movements.movement_type', 'stock_movements.damage_reason', 'stock_movements.quantity', 'stock_movements.previous_quantity', 'stock_movements.new_quantity', 'stock_movements.notes', 'users.name as user'),
            'purchases' => Purchase::query()->leftJoin('suppliers', 'purchases.supplier_id', '=', 'suppliers.id')
                ->leftJoin('users', 'purchases.user_id', '=', 'users.id')
                ->select('purchases.id', 'purchases.invoice_number', 'purchases.created_at', 'suppliers.name as supplier', 'users.name as user', 'purchases.total', 'purchases.paid_amount', 'purchases.remaining_amount', 'purchases.payment_status', 'purchases.notes'),
            'suppliers' => DB::table('suppliers')
                ->leftJoinSub(DB::table('purchases')->whereBetween('created_at', [$start, $end])
                    ->selectRaw('supplier_id, COUNT(*) as purchase_count, SUM(total) as purchase_total, SUM(paid_amount) as purchase_paid, SUM(remaining_amount) as purchase_due')
                    ->groupBy('supplier_id'), 'period_purchases', function ($join) {
                        $join->on('period_purchases.supplier_id', '=', 'suppliers.id');
                    })
                ->select('suppliers.id', 'suppliers.name', 'suppliers.company', 'suppliers.phone', 'suppliers.total_purchases', 'suppliers.total_paid', 'suppliers.debt')
                ->selectRaw('COALESCE(period_purchases.purchase_count,0) as period_purchase_count, COALESCE(period_purchases.purchase_total,0) as period_purchase_total, COALESCE(period_purchases.purchase_paid,0) as period_purchase_paid, COALESCE(period_purchases.purchase_due,0) as period_purchase_due'),
            'supplier-payments' => DB::table('payments')->leftJoin('suppliers', 'payments.party_id', '=', 'suppliers.id')
                ->leftJoin('users', 'payments.user_id', '=', 'users.id')
                ->where('payments.party_type', 'SUPPLIER')
                ->select('payments.id', 'payments.created_at', 'suppliers.name as supplier', 'payments.payment_type', 'payments.payment_method', 'payments.amount', 'payments.notes', 'users.name as user'),
            'customers' => DB::table('customers')
                ->leftJoinSub(DB::table('sales')->whereBetween('created_at', [$start, $end])
                    ->selectRaw('customer_id, COUNT(*) as invoice_count, SUM(total) as period_sales')
                    ->groupBy('customer_id'), 'period_sales', function ($join) {
                        $join->on('period_sales.customer_id', '=', 'customers.id');
                    })
                ->select('customers.id', 'customers.name', 'customers.phone', 'customers.total_purchases', 'customers.total_paid', 'customers.debt')
                ->selectRaw('COALESCE(period_sales.invoice_count,0) as invoice_count, COALESCE(period_sales.period_sales,0) as period_sales'),
            'customer-payments' => DB::table('payments')->leftJoin('customers', 'payments.party_id', '=', 'customers.id')
                ->leftJoin('users', 'payments.user_id', '=', 'users.id')
                ->where('payments.party_type', 'CUSTOMER')
                ->select('payments.id', 'payments.created_at', 'customers.name as customer', 'payments.payment_type', 'payments.payment_method', 'payments.amount', 'payments.notes', 'users.name as user'),
            'expenses' => Expense::query()->leftJoin('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
                ->leftJoin('users', 'expenses.user_id', '=', 'users.id')
                ->select('expenses.id', 'expenses.date', 'expense_categories.name_ku as category', 'expenses.amount', 'expenses.description', 'users.name as user'),
            'returns' => SaleReturn::query()->leftJoin('users', 'returns.user_id', '=', 'users.id')
                ->leftJoin('customers', 'returns.customer_id', '=', 'customers.id')
                ->select('returns.id', 'returns.created_at', 'returns.invoice_number', 'customers.name as customer', 'returns.total_refund', 'returns.reason', 'users.name as user'),
            'cash' => CashRegisterTransaction::query()->leftJoin('users', 'cash_register_transactions.user_id', '=', 'users.id')
                ->select('cash_register_transactions.id', 'cash_register_transactions.transaction_number', 'cash_register_transactions.created_at', 'cash_register_transactions.type', 'cash_register_transactions.direction', 'cash_register_transactions.amount', 'cash_register_transactions.balance_before', 'cash_register_transactions.balance_after', 'cash_register_transactions.reason', 'cash_register_transactions.source_type', 'cash_register_transactions.source_id', 'users.name as user'),
            'shifts' => CashRegisterShift::query()->leftJoin('users as opened_by_user', 'cash_register_shifts.opened_by', '=', 'opened_by_user.id')
                ->leftJoin('users as closed_by_user', 'cash_register_shifts.closed_by', '=', 'closed_by_user.id')
                ->select('cash_register_shifts.id', 'cash_register_shifts.opened_at', 'cash_register_shifts.closed_at', 'opened_by_user.name as cashier', 'closed_by_user.name as closed_by', 'cash_register_shifts.opening_balance', 'cash_register_shifts.expected_balance', 'cash_register_shifts.counted_balance', 'cash_register_shifts.variance', 'cash_register_shifts.opening_notes', 'cash_register_shifts.closing_notes'),
            'users' => DB::table('users')->leftJoin('roles', 'users.role_id', '=', 'roles.id')
                ->select('users.id', 'users.name', 'roles.name as role', 'users.status', 'users.last_login', 'users.created_at')
                ->selectSub(DB::table('sales')->selectRaw('COUNT(*)')->whereColumn('sales.user_id', 'users.id')->whereBetween('sales.created_at', [$start, $end]), 'sales_count')
                ->selectSub(DB::table('sales')->selectRaw('COALESCE(SUM(total),0)')->whereColumn('sales.user_id', 'users.id')->whereBetween('sales.created_at', [$start, $end]), 'sales_total'),
            'activity' => DB::table('activity_logs')->leftJoin('users', 'activity_logs.user_id', '=', 'users.id')
                ->select('activity_logs.id', 'activity_logs.created_at', 'users.name as user', 'activity_logs.action', 'activity_logs.entity', 'activity_logs.entity_id', 'activity_logs.description'),
            'catalog' => DB::table('categories')->selectRaw("'category' as type, id, name_ku, name_en, name_ar, status, (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id) as related_count")
                ->unionAll(DB::table('units')->selectRaw("'unit' as type, id, name_ku, name_en, name_ar, NULL as status, (SELECT COUNT(*) FROM products WHERE products.unit_id = units.id) as related_count")),
            'categories' => DB::table('categories')
                ->select('categories.id', 'categories.name_ku', 'categories.name_en', 'categories.name_ar', 'categories.status')
                ->selectSub(DB::table('products')->selectRaw('COUNT(*)')->whereColumn('products.category_id', 'categories.id'), 'product_count')
                ->selectSub(DB::table('products')->selectRaw('COALESCE(SUM(quantity),0)')->whereColumn('products.category_id', 'categories.id'), 'stock_quantity')
                ->selectSub(DB::table('sale_items')->join('sales', 'sale_items.sale_id', '=', 'sales.id')->join('products', 'sale_items.product_id', '=', 'products.id')->selectRaw('COALESCE(SUM(sale_items.total),0)')->whereColumn('products.category_id', 'categories.id')->whereBetween('sales.created_at', [$start, $end]), 'period_sales'),
            'units' => DB::table('units')
                ->select('units.id', 'units.name_ku', 'units.name_en', 'units.name_ar', 'units.short_code')
                ->selectSub(DB::table('products')->selectRaw('COUNT(*)')->whereColumn('products.unit_id', 'units.id'), 'product_count')
                ->selectSub(DB::table('products')->selectRaw('COALESCE(SUM(quantity),0)')->whereColumn('products.unit_id', 'units.id'), 'stock_quantity')
                ->selectSub(DB::table('sale_items')->join('sales', 'sale_items.sale_id', '=', 'sales.id')->join('products', 'sale_items.product_id', '=', 'products.id')->selectRaw('COALESCE(SUM(sale_items.quantity),0)')->whereColumn('products.unit_id', 'units.id')->whereBetween('sales.created_at', [$start, $end]), 'period_quantity_sold')
                ->selectSub(DB::table('sale_items')->join('sales', 'sale_items.sale_id', '=', 'sales.id')->join('products', 'sale_items.product_id', '=', 'products.id')->selectRaw('COALESCE(SUM(sale_items.total),0)')->whereColumn('products.unit_id', 'units.id')->whereBetween('sales.created_at', [$start, $end]), 'period_revenue'),
            default => Sale::query()->select('sales.id', 'sales.invoice_number', 'sales.total'),
        };

        if ($report === 'catalog') {
            $query = DB::query()->fromSub($query, 'catalog')->select('catalog.*');
            if ($search !== '') {
                $query->where(function ($builder) use ($search) {
                    $builder->where('catalog.name_ku', 'like', '%'.$search.'%')
                        ->orWhere('catalog.name_en', 'like', '%'.$search.'%')
                        ->orWhere('catalog.name_ar', 'like', '%'.$search.'%');
                });
            }
            if (isset($filters['status'])) {
                $query->where('catalog.status', $filters['status'] === 'ACTIVE' ? 1 : 0);
            }

            return $query->orderByDesc('catalog.id');
        }

        $dateColumn = match ($report) {
            'products', 'customers', 'catalog', 'suppliers', 'users', 'categories', 'units' => null,
            'expenses' => 'expenses.date',
            'supplier-payments', 'customer-payments' => 'payments.created_at',
            'movements', 'damaged' => 'stock_movements.created_at',
            'cash' => 'cash_register_transactions.created_at',
            'shifts' => 'cash_register_shifts.opened_at',
            'activity' => 'activity_logs.created_at',
            'returns' => 'returns.created_at',
            'purchases' => 'purchases.created_at',
            default => 'sales.created_at',
        };
        if ($dateColumn) {
            $query->whereBetween($dateColumn, [$start, $end]);
        }

        $filterColumns = [
            'sales' => ['user_id' => 'sales.user_id', 'customer_id' => 'sales.customer_id', 'payment_method' => 'sales.payment_method', 'status' => 'sales.payment_status'],
            'products' => ['category_id' => 'products.category_id', 'product_id' => 'products.id'],
            'movements' => ['product_id' => 'stock_movements.product_id', 'user_id' => 'stock_movements.user_id', 'status' => 'stock_movements.movement_type'],
            'damaged' => ['product_id' => 'stock_movements.product_id', 'user_id' => 'stock_movements.user_id'],
            'purchases' => ['supplier_id' => 'purchases.supplier_id', 'user_id' => 'purchases.user_id', 'status' => 'purchases.payment_status'],
            'supplier-payments' => ['supplier_id' => 'payments.party_id', 'user_id' => 'payments.user_id', 'payment_method' => 'payments.payment_method', 'status' => 'payments.payment_type'],
            'suppliers' => ['supplier_id' => 'suppliers.id'],
            'customers' => ['customer_id' => 'customers.id'],
            'customer-payments' => ['customer_id' => 'payments.party_id', 'user_id' => 'payments.user_id', 'payment_method' => 'payments.payment_method', 'status' => 'payments.payment_type'],
            'expenses' => ['user_id' => 'expenses.user_id', 'category_id' => 'expenses.category_id'],
            'returns' => ['user_id' => 'returns.user_id', 'customer_id' => 'returns.customer_id'],
            'cash' => ['user_id' => 'cash_register_transactions.user_id', 'status' => 'cash_register_transactions.type'],
            'shifts' => ['user_id' => 'cash_register_shifts.opened_by'],
            'users' => ['user_id' => 'users.id'],
            'activity' => ['user_id' => 'activity_logs.user_id', 'status' => 'activity_logs.action'],
        ][$report] ?? [];

        foreach ($filterColumns as $key => $column) {
            if (isset($filters[$key])) {
                $query->where($column, $filters[$key]);
            }
        }
        if ($report === 'products' && isset($filters['unit_id'])) {
            $query->where('products.unit_id', $filters['unit_id']);
        }
        if ($report === 'products' && isset($filters['status'])) {
            $expiryWarningDays = app(ProductExpiryService::class)->settings()['warning_days'];
            match ($filters['status']) {
                'ACTIVE', 'INACTIVE' => $query->where('products.status', $filters['status']),
                'LOW' => $query->where('products.status', 'ACTIVE')->whereColumn('products.quantity', '<=', 'products.min_stock')->where('products.quantity', '>', 0),
                'OUT' => $query->where('products.status', 'ACTIVE')->where('products.quantity', '<=', 0),
                'NEGATIVE' => $query->where('products.quantity', '<', 0),
                'EXPIRED' => $query->whereNotNull('products.expiry_date')->whereDate('products.expiry_date', '<', now()->toDateString())->where('products.quantity', '>', 0),
                'EXPIRING' => $query->whereNotNull('products.expiry_date')->whereDate('products.expiry_date', '>=', now()->toDateString())->whereDate('products.expiry_date', '<=', now()->addDays($expiryWarningDays)->toDateString())->where('products.quantity', '>', 0),
                'SLOW' => $query->whereRaw('COALESCE(sales_performance.sold_quantity,0) < 5'),
                'FAST' => $query->whereRaw('COALESCE(sales_performance.sold_quantity,0) >= 5'),
                default => null,
            };
        }
        if ($report === 'sales' && isset($filters['category_id'])) {
            $query->whereExists(function ($subquery) use ($filters) {
                $subquery->selectRaw('1')->from('sale_items')->join('products', 'sale_items.product_id', '=', 'products.id')
                    ->whereColumn('sale_items.sale_id', 'sales.id')->where('products.category_id', $filters['category_id']);
            });
        }
        if ($report === 'sales' && isset($filters['product_id'])) {
            $query->whereExists(function ($subquery) use ($filters) {
                $subquery->selectRaw('1')->from('sale_items')
                    ->whereColumn('sale_items.sale_id', 'sales.id')->where('sale_items.product_id', $filters['product_id']);
            });
        }
        if (in_array($report, ['movements', 'damaged'], true) && $report === 'damaged') {
            $query->where('stock_movements.movement_type', 'DAMAGE');
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($report, $search) {
                match ($report) {
                    'sales' => $builder->where('sales.invoice_number', 'like', '%'.$search.'%')
                        ->orWhere('customers.name', 'like', '%'.$search.'%')
                        ->orWhereExists(function ($subquery) use ($search) {
                            $subquery->selectRaw('1')->from('sale_items')->join('products', 'sale_items.product_id', '=', 'products.id')
                                ->whereColumn('sale_items.sale_id', 'sales.id')
                                ->where(function ($productQuery) use ($search) {
                                    $productQuery->where('products.name_ku', 'like', '%'.$search.'%')
                                        ->orWhere('products.barcode', 'like', '%'.$search.'%')
                                        ->orWhere('products.sku', 'like', '%'.$search.'%');
                                });
                        }),
                    'products' => $builder->where('products.name_ku', 'like', '%'.$search.'%')->orWhere('products.barcode', 'like', '%'.$search.'%')->orWhere('products.sku', 'like', '%'.$search.'%'),
                    'movements', 'damaged' => $builder->where('products.name_ku', 'like', '%'.$search.'%')->orWhere('products.barcode', 'like', '%'.$search.'%'),
                    'purchases' => $builder->where('purchases.invoice_number', 'like', '%'.$search.'%')->orWhere('suppliers.name', 'like', '%'.$search.'%'),
                    'suppliers' => $builder->where('suppliers.name', 'like', '%'.$search.'%')->orWhere('suppliers.company', 'like', '%'.$search.'%'),
                    'supplier-payments' => $builder->where('suppliers.name', 'like', '%'.$search.'%')->orWhere('payments.notes', 'like', '%'.$search.'%'),
                    'customers' => $builder->where('customers.name', 'like', '%'.$search.'%')->orWhere('customers.phone', 'like', '%'.$search.'%'),
                    'customer-payments' => $builder->where('customers.name', 'like', '%'.$search.'%')->orWhere('payments.notes', 'like', '%'.$search.'%'),
                    'expenses' => $builder->where('expense_categories.name_ku', 'like', '%'.$search.'%')->orWhere('expenses.description', 'like', '%'.$search.'%'),
                    'returns' => $builder->where('returns.invoice_number', 'like', '%'.$search.'%')->orWhere('returns.reason', 'like', '%'.$search.'%'),
                    'cash' => $builder->where('cash_register_transactions.transaction_number', 'like', '%'.$search.'%')->orWhere('cash_register_transactions.reason', 'like', '%'.$search.'%'),
                    'shifts' => $builder->where('opened_by_user.name', 'like', '%'.$search.'%')->orWhere('closed_by_user.name', 'like', '%'.$search.'%'),
                    'users' => $builder->where('users.name', 'like', '%'.$search.'%')->orWhere('users.username', 'like', '%'.$search.'%'),
                    'activity' => $builder->where('activity_logs.description', 'like', '%'.$search.'%')->orWhere('activity_logs.entity', 'like', '%'.$search.'%'),
                    default => $builder,
                };
            });
        }

        $idColumn = match ($report) {
            'sales' => 'sales.id',
            'products' => 'products.id',
            'movements', 'damaged' => 'stock_movements.id',
            'purchases' => 'purchases.id',
            'suppliers' => 'suppliers.id',
            'customers' => 'customers.id',
            'expenses' => 'expenses.id',
            'returns' => 'returns.id',
            'cash' => 'cash_register_transactions.id',
            'users' => 'users.id',
            'activity' => 'activity_logs.id',
            default => 'id',
        };
        $sortBy = $filters['sort_by'] ?? '';
        $sortableColumns = $this->sortableColumns($report);
        if ($sortBy !== '' && ! isset($sortableColumns[$sortBy])) {
            abort(422, 'The selected report column cannot be sorted.');
        }
        $sortColumn = $sortBy !== '' ? $sortableColumns[$sortBy] : $idColumn;
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        $query->orderBy($sortColumn, $sortDirection);
        if ($sortColumn !== $idColumn) {
            $query->orderByDesc($idColumn);
        }

        return $query;
    }

    private function sortableColumns(string $report): array
    {
        return match ($report) {
            'sales' => [
                'id' => 'sales.id', 'invoice_number' => 'sales.invoice_number', 'created_at' => 'sales.created_at',
                'subtotal' => 'sales.subtotal', 'discount' => 'sales.discount',
                'total' => 'sales.total', 'cost_of_goods' => 'sales.cost_of_goods', 'profit' => 'sales.profit',
                'payment_method' => 'sales.payment_method', 'payment_status' => 'sales.payment_status',
                'cash_received' => 'sales.cash_received', 'change_amount' => 'sales.change_amount',
                'cashier' => 'users.name', 'customer' => 'customers.name',
            ],
            'products' => [
                'id' => 'products.id', 'barcode' => 'products.barcode', 'sku' => 'products.sku',
                'name_ku' => 'products.name_ku', 'category' => 'categories.name_ku', 'unit' => 'units.name_ku',
                'quantity' => 'products.quantity', 'purchase_price' => 'products.purchase_price',
                'selling_price' => 'products.selling_price', 'wholesale_price' => 'products.wholesale_price',
                'expiry_date' => 'products.expiry_date', 'status' => 'products.status', 'stock_value' => 'stock_value',
                'unit_margin' => 'unit_margin', 'margin_percent' => 'margin_percent',
                'sold_quantity' => 'sales_performance.sold_quantity', 'sales_revenue' => 'sales_performance.sales_revenue',
                'gross_profit' => 'sales_performance.gross_profit',
            ],
            'movements', 'damaged' => [
                'id' => 'stock_movements.id', 'created_at' => 'stock_movements.created_at',
                'name_ku' => 'products.name_ku', 'barcode' => 'products.barcode',
                'movement_type' => 'stock_movements.movement_type', 'damage_reason' => 'stock_movements.damage_reason',
                'quantity' => 'stock_movements.quantity', 'previous_quantity' => 'stock_movements.previous_quantity',
                'new_quantity' => 'stock_movements.new_quantity', 'notes' => 'stock_movements.notes', 'user' => 'users.name',
            ],
            'purchases' => [
                'id' => 'purchases.id', 'invoice_number' => 'purchases.invoice_number',
                'created_at' => 'purchases.created_at', 'supplier' => 'suppliers.name', 'user' => 'users.name',
                'total' => 'purchases.total', 'paid_amount' => 'purchases.paid_amount',
                'remaining_amount' => 'purchases.remaining_amount', 'payment_status' => 'purchases.payment_status',
                'notes' => 'purchases.notes',
            ],
            'suppliers' => [
                'id' => 'suppliers.id', 'name' => 'suppliers.name', 'company' => 'suppliers.company',
                'phone' => 'suppliers.phone', 'total_purchases' => 'suppliers.total_purchases',
                'total_paid' => 'suppliers.total_paid', 'debt' => 'suppliers.debt',
                'period_purchase_count' => 'period_purchase_count', 'period_purchase_total' => 'period_purchase_total',
                'period_purchase_paid' => 'period_purchase_paid', 'period_purchase_due' => 'period_purchase_due',
            ],
            'supplier-payments', 'customer-payments' => [
                'id' => 'payments.id', 'created_at' => 'payments.created_at', 'supplier' => 'suppliers.name',
                'customer' => 'customers.name', 'payment_type' => 'payments.payment_type',
                'payment_method' => 'payments.payment_method', 'amount' => 'payments.amount',
                'notes' => 'payments.notes', 'user' => 'users.name',
            ],
            'customers' => [
                'id' => 'customers.id', 'name' => 'customers.name', 'phone' => 'customers.phone',
                'total_purchases' => 'customers.total_purchases', 'total_paid' => 'customers.total_paid',
                'debt' => 'customers.debt', 'invoice_count' => 'invoice_count', 'period_sales' => 'period_sales',
            ],
            'expenses' => [
                'id' => 'expenses.id', 'date' => 'expenses.date', 'category' => 'expense_categories.name_ku',
                'amount' => 'expenses.amount', 'description' => 'expenses.description', 'user' => 'users.name',
            ],
            'returns' => [
                'id' => 'returns.id', 'created_at' => 'returns.created_at',
                'invoice_number' => 'returns.invoice_number', 'customer' => 'customers.name',
                'total_refund' => 'returns.total_refund', 'reason' => 'returns.reason', 'user' => 'users.name',
            ],
            'cash' => [
                'id' => 'cash_register_transactions.id', 'transaction_number' => 'cash_register_transactions.transaction_number',
                'created_at' => 'cash_register_transactions.created_at', 'type' => 'cash_register_transactions.type',
                'direction' => 'cash_register_transactions.direction', 'amount' => 'cash_register_transactions.amount',
                'balance_before' => 'cash_register_transactions.balance_before',
                'balance_after' => 'cash_register_transactions.balance_after',
                'reason' => 'cash_register_transactions.reason', 'source_type' => 'cash_register_transactions.source_type',
                'source_id' => 'cash_register_transactions.source_id', 'user' => 'users.name',
            ],
            'shifts' => [
                'id' => 'cash_register_shifts.id', 'opened_at' => 'cash_register_shifts.opened_at',
                'closed_at' => 'cash_register_shifts.closed_at', 'cashier' => 'opened_by_user.name',
                'closed_by' => 'closed_by_user.name', 'opening_balance' => 'cash_register_shifts.opening_balance',
                'expected_balance' => 'cash_register_shifts.expected_balance',
                'counted_balance' => 'cash_register_shifts.counted_balance', 'variance' => 'cash_register_shifts.variance',
            ],
            'users' => [
                'id' => 'users.id', 'name' => 'users.name', 'role' => 'roles.name', 'status' => 'users.status',
                'last_login' => 'users.last_login', 'created_at' => 'users.created_at',
                'sales_count' => 'sales_count', 'sales_total' => 'sales_total',
            ],
            'activity' => [
                'id' => 'activity_logs.id', 'created_at' => 'activity_logs.created_at', 'user' => 'users.name',
                'action' => 'activity_logs.action', 'entity' => 'activity_logs.entity',
                'entity_id' => 'activity_logs.entity_id', 'description' => 'activity_logs.description',
            ],
            'categories' => [
                'id' => 'categories.id', 'name_ku' => 'categories.name_ku', 'name_en' => 'categories.name_en',
                'name_ar' => 'categories.name_ar', 'status' => 'categories.status',
                'product_count' => 'product_count', 'stock_quantity' => 'stock_quantity', 'period_sales' => 'period_sales',
            ],
            'units' => [
                'id' => 'units.id', 'name_ku' => 'units.name_ku', 'name_en' => 'units.name_en',
                'name_ar' => 'units.name_ar', 'short_code' => 'units.short_code',
                'product_count' => 'product_count', 'stock_quantity' => 'stock_quantity',
                'period_quantity_sold' => 'period_quantity_sold', 'period_revenue' => 'period_revenue',
            ],
            default => [],
        };
    }

    private function reportSummary(string $report, array $filters, Carbon $start, Carbon $end): array
    {
        $filtered = $this->reportQuery($report, $filters, $start, $end);

        return match ($report) {
            'sales' => [
                ...$this->aggregate($filtered, 'COUNT(sales.id) as count, COALESCE(SUM(sales.total),0) as revenue, COALESCE(SUM(sales.total - (SELECT COALESCE(SUM(returns.total_refund),0) FROM returns WHERE returns.sale_id = sales.id)),0) as net_sales, COALESCE(SUM(sales.discount),0) as discounts, COALESCE(SUM(sales.cost_of_goods),0) as cogs, COALESCE(SUM(sales.profit),0) as profit'),
            ],
            'products' => [
                ...$this->aggregate($filtered, 'COUNT(products.id) as count, COALESCE(SUM(products.quantity * products.purchase_price),0) as stock_value, SUM(CASE WHEN products.quantity <= products.min_stock AND products.quantity > 0 THEN 1 ELSE 0 END) as low_stock, SUM(CASE WHEN products.quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock'),
            ],
            'movements', 'damaged' => [
                ...$this->aggregate($filtered, 'COUNT(stock_movements.id) as count, COALESCE(SUM(stock_movements.quantity),0) as quantity'),
            ],
            'purchases' => [
                ...$this->aggregate($filtered, 'COUNT(purchases.id) as count, COALESCE(SUM(purchases.total),0) as total, COALESCE(SUM(purchases.paid_amount),0) as paid, COALESCE(SUM(purchases.remaining_amount),0) as due'),
            ],
            'suppliers' => [...$this->aggregate($filtered, 'COUNT(suppliers.id) as count, COALESCE(SUM(suppliers.debt),0) as debt, COALESCE(SUM(period_purchases.purchase_total),0) as period_purchases')],
            'supplier-payments', 'customer-payments' => [...$this->aggregate($filtered, 'COUNT(payments.id) as count, COALESCE(SUM(payments.amount),0) as total_payments')],
            'customers' => [...$this->aggregate($filtered, 'COUNT(customers.id) as count, COALESCE(SUM(customers.debt),0) as debt, COALESCE(SUM(period_sales.period_sales),0) as purchases')],
            'expenses' => [...$this->aggregate($filtered, 'COUNT(expenses.id) as count, COALESCE(SUM(expenses.amount),0) as total')],
            'returns' => [...$this->aggregate($filtered, 'COUNT(returns.id) as count, COALESCE(SUM(returns.total_refund),0) as refunded')],
            'cash' => [...$this->aggregate($filtered, "COUNT(cash_register_transactions.id) as count, COALESCE(SUM(CASE WHEN cash_register_transactions.direction='IN' THEN cash_register_transactions.amount ELSE 0 END),0) as `in`, COALESCE(SUM(CASE WHEN cash_register_transactions.direction='OUT' THEN cash_register_transactions.amount ELSE 0 END),0) as `out`")],
            'shifts' => [...$this->aggregate($filtered, 'COUNT(cash_register_shifts.id) as count, COALESCE(SUM(cash_register_shifts.variance),0) as variance')],
            'users' => [...$this->aggregate($filtered, 'COUNT(users.id) as count')],
            'activity' => [...$this->aggregate($filtered, 'COUNT(activity_logs.id) as count')],
            'categories' => [...$this->aggregate($filtered, 'COUNT(categories.id) as count, COALESCE(SUM((SELECT COUNT(*) FROM products WHERE products.category_id = categories.id)),0) as products')],
            'units' => [...$this->aggregate($filtered, 'COUNT(units.id) as count, COALESCE(SUM((SELECT COUNT(*) FROM products WHERE products.unit_id = units.id)),0) as products')],
            'catalog' => ['categories' => DB::table('categories')->count(), 'units' => DB::table('units')->count()],
            default => [],
        };
    }

    private function aggregate($query, string $columns): array
    {
        $base = clone $query;
        if ($base instanceof Builder) {
            $base = $base->getQuery();
        }
        $base->columns = null;
        $base->setBindings([], 'select');
        $base->orders = null;
        $base->unionOrders = null;
        $base->limit = null;
        $base->offset = null;

        return (array) $base->selectRaw($columns)->first();
    }

    private function exportLabels(string $language): array
    {
        $labels = [
            'en' => ['title' => 'Supermarket report', 'generated' => 'Generated at', 'empty' => 'No records', 'overview' => 'Overview', 'sales' => 'Sales', 'products' => 'Products and inventory', 'movements' => 'Inventory movements', 'purchases' => 'Purchases', 'suppliers' => 'Suppliers', 'supplier-payments' => 'Supplier payments', 'customers' => 'Customers', 'customer-payments' => 'Customer payments', 'expenses' => 'Expenses', 'returns' => 'Sales returns', 'damaged' => 'Damaged products', 'cash' => 'Cash register', 'shifts' => 'Cashier shifts', 'users' => 'Users', 'activity' => 'Activity log', 'categories' => 'Categories', 'units' => 'Units', 'catalog' => 'Categories and units', 'id' => 'ID', 'invoice_number' => 'Invoice number', 'created_at' => 'Date', 'total' => 'Total', 'amount' => 'Amount', 'name_ku' => 'Name', 'barcode' => 'Barcode', 'quantity' => 'Quantity', 'payment_method' => 'Payment method', 'payment_status' => 'Payment status', 'description' => 'Description', 'user' => 'User', 'empty_rows' => 'No records'],
            'ar' => ['title' => 'تقرير المتجر', 'generated' => 'تاريخ الإنشاء', 'empty' => 'لا توجد سجلات', 'overview' => 'نظرة عامة', 'sales' => 'المبيعات', 'products' => 'المنتجات والمخزون', 'movements' => 'حركات المخزون', 'purchases' => 'المشتريات', 'suppliers' => 'الموردون', 'supplier-payments' => 'مدفوعات الموردين', 'customers' => 'العملاء', 'customer-payments' => 'مدفوعات العملاء', 'expenses' => 'المصروفات', 'returns' => 'مرتجعات المبيعات', 'damaged' => 'المنتجات التالفة', 'cash' => 'الصندوق', 'shifts' => 'ورديات أمين الصندوق', 'users' => 'المستخدمون', 'activity' => 'سجل النشاط', 'categories' => 'الفئات', 'units' => 'الوحدات', 'catalog' => 'الفئات والوحدات', 'id' => 'المعرف', 'invoice_number' => 'رقم الفاتورة', 'created_at' => 'التاريخ', 'total' => 'الإجمالي', 'amount' => 'المبلغ', 'name_ku' => 'الاسم', 'barcode' => 'الباركود', 'quantity' => 'الكمية', 'payment_method' => 'طريقة الدفع', 'payment_status' => 'حالة الدفع', 'description' => 'الوصف', 'user' => 'المستخدم', 'empty_rows' => 'لا توجد سجلات'],
            'ku' => ['title' => 'ڕاپۆرتی فرۆشگا', 'generated' => 'کاتی دروستکردن', 'empty' => 'هیچ تۆمارێک نییە', 'overview' => 'پوختە', 'sales' => 'فرۆشتن', 'products' => 'کاڵا و کۆگا', 'movements' => 'جووڵەکانی کۆگا', 'purchases' => 'کڕین', 'suppliers' => 'دابینکەران', 'supplier-payments' => 'پارەدانی دابینکەر', 'customers' => 'کڕیاران', 'customer-payments' => 'پارەدانی کڕیار', 'expenses' => 'خەرجییەکان', 'returns' => 'گەڕاندنەوەی فرۆشتن', 'damaged' => 'کاڵای خەساربوو', 'cash' => 'قاسە', 'shifts' => 'شێفتی کاشێر', 'users' => 'بەکارهێنەران', 'activity' => 'تۆماری چالاکی', 'categories' => 'پۆلەکان', 'units' => 'یەکەکان', 'catalog' => 'پۆل و یەکەکان', 'id' => 'ژمارە', 'invoice_number' => 'ژمارەی وەسڵ', 'created_at' => 'بەروار', 'total' => 'کۆی گشتی', 'amount' => 'بڕ', 'name_ku' => 'ناو', 'barcode' => 'بارکۆد', 'quantity' => 'بڕ', 'payment_method' => 'شێوازی پارەدان', 'payment_status' => 'دۆخی پارەدان', 'description' => 'وەسف', 'user' => 'بەکارهێنەر', 'empty_rows' => 'هیچ تۆمارێک نییە'],
        ];

        $localized = [
            'en' => [
                'period' => 'Date range', 'summary' => 'Summary totals', 'metric' => 'Metric', 'value' => 'Value',
                'top_products' => 'Top products', 'name' => 'Name', 'name_ku' => 'Product name', 'name_en' => 'English name',
                'name_ar' => 'Arabic name', 'barcode' => 'Barcode', 'sku' => 'SKU', 'category' => 'Category',
                'unit' => 'Unit', 'quantity' => 'Quantity', 'purchase_price' => 'Purchase price',
                'selling_price' => 'Selling price', 'wholesale_price' => 'Wholesale price', 'expiry_date' => 'Expiry date',
                'status' => 'Status', 'stock_value' => 'Stock value', 'unit_margin' => 'Unit margin',
                'margin_percent' => 'Profit margin (%)', 'sold_quantity' => 'Quantity sold', 'sales_revenue' => 'Sales revenue',
                'gross_profit' => 'Gross profit', 'movement_type' => 'Movement type', 'damage_reason' => 'Damage reason',
                'previous_quantity' => 'Previous quantity', 'new_quantity' => 'New quantity', 'notes' => 'Notes',
                'supplier' => 'Supplier', 'customer' => 'Customer', 'paid_amount' => 'Paid amount',
                'remaining_amount' => 'Amount due', 'amount' => 'Amount', 'description' => 'Description',
                'transaction_number' => 'Transaction number', 'type' => 'Type', 'direction' => 'Direction',
                'balance_before' => 'Balance before', 'balance_after' => 'Balance after', 'reason' => 'Reason',
                'source_type' => 'Source type', 'source_id' => 'Source ID', 'company' => 'Company', 'phone' => 'Phone',
                'total_purchases' => 'Total purchases', 'total_paid' => 'Total paid', 'debt' => 'Outstanding debt',
                'invoice_count' => 'Invoice count', 'period_sales' => 'Sales in period', 'payment_type' => 'Payment type',
                'period_purchase_count' => 'Purchases in period', 'period_purchase_total' => 'Purchase total in period',
                'period_purchase_paid' => 'Paid in period', 'period_purchase_due' => 'Due in period',
                'expected_balance' => 'Expected balance', 'counted_balance' => 'Counted balance', 'variance' => 'Variance',
                'opening_balance' => 'Opening balance', 'closing_notes' => 'Closing notes', 'opening_notes' => 'Opening notes',
                'role' => 'Role', 'last_login' => 'Last login', 'action' => 'Action', 'entity' => 'Entity',
                'entity_id' => 'Entity ID', 'product_count' => 'Product count', 'stock_quantity' => 'Stock quantity',
                'period_quantity_sold' => 'Quantity sold in period', 'period_revenue' => 'Revenue in period',
                'cost_of_goods' => 'Cost of goods sold', 'cash_received' => 'Cash received', 'change_amount' => 'Change',
                'cashier' => 'Cashier', 'subtotal' => 'Subtotal', 'discount' => 'Discount', 'profit' => 'Profit',
                'total_refund' => 'Refund amount', 'created_at' => 'Date and time', 'date' => 'Date',
                'closed_at' => 'Closed at', 'opened_at' => 'Opened at', 'user' => 'User',
                'metric_total_sales' => 'Net sales', 'metric_gross_sales' => 'Gross sales', 'metric_cogs' => 'Cost of goods sold',
                'metric_gross_profit' => 'Gross profit', 'metric_total_purchases' => 'Purchases', 'metric_expenses' => 'Expenses',
                'metric_net_profit' => 'Net profit', 'metric_invoices' => 'Invoices', 'metric_returns' => 'Refunds',
                'metric_discounts' => 'Discounts', 'metric_average_invoice' => 'Average invoice',
                'metric_sales_change_percent' => 'Sales change (%)', 'metric_profit_change_percent' => 'Profit change (%)',
                'metric_total_products' => 'Products', 'metric_low_stock' => 'Low stock', 'metric_out_of_stock' => 'Out of stock',
                'metric_customers' => 'Customers', 'metric_customer_debt' => 'Customer debt', 'metric_suppliers' => 'Suppliers',
                'metric_supplier_debt' => 'Supplier debt', 'metric_users' => 'Active users', 'metric_cash_balance' => 'Cash balance',
                'metric_cash_in' => 'Cash in', 'metric_cash_out' => 'Cash out', 'metric_count' => 'Records',
                'metric_revenue' => 'Revenue', 'metric_profit' => 'Profit', 'metric_stock_value' => 'Stock value',
                'metric_quantity' => 'Quantity', 'metric_total' => 'Total', 'metric_paid' => 'Paid',
                'metric_due' => 'Amount due', 'metric_debt' => 'Debt', 'metric_period_purchases' => 'Purchases in period',
                'metric_total_payments' => 'Total payments', 'metric_purchases' => 'Purchases', 'metric_refunded' => 'Refunded',
                'metric_in' => 'Cash in', 'metric_out' => 'Cash out', 'metric_variance' => 'Cash variance',
                'metric_products' => 'Products', 'metric_categories' => 'Categories', 'metric_units' => 'Units',
                'payment_CASH' => 'Cash', 'payment_CARD' => 'Card', 'payment_CREDIT' => 'Credit', 'payment_BANK' => 'Bank',
                'direction_IN' => 'In', 'direction_OUT' => 'Out', 'role_ADMIN' => 'Administrator',
                'role_MANAGER' => 'Manager', 'role_CASHIER' => 'Cashier',
                'status_PAID' => 'Paid', 'status_PARTIAL' => 'Partially paid', 'status_DUE' => 'Due',
                'status_ACTIVE' => 'Active', 'status_INACTIVE' => 'Inactive', 'status_LOW' => 'Low stock',
                'status_OUT' => 'Out of stock', 'status_NEGATIVE' => 'Negative stock', 'status_EXPIRED' => 'Expired',
                'status_EXPIRING' => 'Expiring soon', 'status_SLOW' => 'Slow-moving', 'status_FAST' => 'Fast-moving',
                'status_CASH_IN' => 'Cash in', 'status_CASH_OUT' => 'Cash out', 'status_SALE' => 'Sale',
                'status_RETURN' => 'Return', 'status_EXPENSE' => 'Expense', 'status_ADJUSTMENT' => 'Adjustment',
                'status_SHIFT_ADJUSTMENT' => 'Shift adjustment', 'status_PURCHASE' => 'Purchase',
                'status_DAMAGE' => 'Damage', 'status_OTHER' => 'Other', 'status_CREATE' => 'Created',
                'status_UPDATE' => 'Updated', 'status_DELETE' => 'Deleted', 'status_PAYMENT' => 'Payment',
            ],
            'ku' => [
                'period' => 'ماوەی بەروار', 'summary' => 'کۆی پوختە', 'metric' => 'پێوەر', 'value' => 'بەها',
                'top_products' => 'باشترین کاڵاکان', 'name' => 'ناو', 'name_ku' => 'ناوی کاڵا',
                'name_en' => 'ناو بە ئینگلیزی', 'name_ar' => 'ناو بە عەرەبی', 'barcode' => 'بارکۆد',
                'sku' => 'کۆدی کاڵا', 'category' => 'پۆل', 'unit' => 'یەکە', 'quantity' => 'بڕ',
                'purchase_price' => 'نرخی کڕین', 'selling_price' => 'نرخی فرۆشتن', 'wholesale_price' => 'نرخی کۆ',
                'expiry_date' => 'بەرواری بەسەرچوون', 'status' => 'دۆخ', 'stock_value' => 'بەهای کۆگا',
                'unit_margin' => 'قازانجی یەکە', 'margin_percent' => 'ڕێژەی قازانج', 'sold_quantity' => 'بڕی فرۆشراو',
                'sales_revenue' => 'داهاتی فرۆشتن', 'gross_profit' => 'قازانجی گشتی', 'movement_type' => 'جۆری جووڵە',
                'damage_reason' => 'هۆکاری خەساربوون', 'previous_quantity' => 'بڕی پێشوو', 'new_quantity' => 'بڕی نوێ',
                'notes' => 'تێبینی', 'supplier' => 'دابینکەر', 'customer' => 'کڕیار', 'paid_amount' => 'بڕی دراو',
                'remaining_amount' => 'قەرزی ماوە', 'amount' => 'بڕی پارە', 'description' => 'وەسف',
                'transaction_number' => 'ژمارەی مامەڵە', 'type' => 'جۆر', 'direction' => 'ئاڕاستە',
                'balance_before' => 'باڵانسی پێشوو', 'balance_after' => 'باڵانسی نوێ', 'reason' => 'هۆکار',
                'source_type' => 'جۆری سەرچاوە', 'source_id' => 'ژمارەی سەرچاوە', 'company' => 'کۆمپانیا',
                'phone' => 'تەلەفۆن', 'total_purchases' => 'کۆی کڕین', 'total_paid' => 'کۆی دراو',
                'debt' => 'قەرزی ماوە', 'invoice_count' => 'ژمارەی پسوڵە', 'period_sales' => 'فرۆشی ئەم ماوەیە',
                'payment_type' => 'جۆری پارەدان', 'period_purchase_count' => 'ژمارەی کڕینی ئەم ماوەیە',
                'period_purchase_total' => 'کۆی کڕینی ئەم ماوەیە', 'period_purchase_paid' => 'پارەی دراوی ئەم ماوەیە',
                'period_purchase_due' => 'قەرزی ئەم ماوەیە', 'expected_balance' => 'باڵانسی چاوەڕوانکراو',
                'counted_balance' => 'باڵانسی ژمێردراو', 'variance' => 'جیاوازی', 'opening_balance' => 'باڵانسی کردنەوە',
                'closing_notes' => 'تێبینی داخستن', 'opening_notes' => 'تێبینی کردنەوە', 'role' => 'ڕۆڵ',
                'last_login' => 'دوایین چوونەژوورەوە', 'action' => 'کردار', 'entity' => 'بابەت',
                'entity_id' => 'ژمارەی بابەت', 'product_count' => 'ژمارەی کاڵا', 'stock_quantity' => 'بڕی کۆگا',
                'period_quantity_sold' => 'بڕی فرۆشراوی ئەم ماوەیە', 'period_revenue' => 'داهاتی ئەم ماوەیە',
                'cost_of_goods' => 'تێچووی کاڵای فرۆشراو', 'cash_received' => 'پارەی وەرگیراو',
                'change_amount' => 'پارەی گەڕاوە', 'cashier' => 'کاشێر', 'subtotal' => 'کۆی پێش داشکاندن',
                'discount' => 'داشکاندن', 'profit' => 'قازانج', 'total_refund' => 'بڕی گەڕاوە',
                'created_at' => 'بەروار و کات', 'date' => 'بەروار', 'closed_at' => 'کاتی داخستن',
                'opened_at' => 'کاتی کردنەوە', 'user' => 'بەکارهێنەر',
                'metric_total_sales' => 'فرۆشی پاک', 'metric_gross_sales' => 'کۆی فرۆشتن',
                'metric_cogs' => 'تێچووی کاڵای فرۆشراو', 'metric_gross_profit' => 'قازانجی گشتی',
                'metric_total_purchases' => 'کۆی کڕین', 'metric_expenses' => 'خەرجییەکان', 'metric_net_profit' => 'قازانجی پاک',
                'metric_invoices' => 'ژمارەی پسوڵە', 'metric_returns' => 'پارەی گەڕاوە', 'metric_discounts' => 'داشکاندن',
                'metric_average_invoice' => 'ناوەندی پسوڵە',
                'metric_sales_change_percent' => 'گۆڕانی فرۆشتن (%)', 'metric_profit_change_percent' => 'گۆڕانی قازانج (%)',
                'metric_total_products' => 'کۆی کاڵاکان', 'metric_low_stock' => 'کۆگای کەم',
                'metric_out_of_stock' => 'لە کۆگا نەماوە', 'metric_customers' => 'کڕیاران',
                'metric_customer_debt' => 'قەرزی کڕیاران', 'metric_suppliers' => 'دابینکەران',
                'metric_supplier_debt' => 'قەرزی دابینکەران', 'metric_users' => 'بەکارهێنەرانی چالاک',
                'metric_cash_balance' => 'باڵانسی قاسە', 'metric_cash_in' => 'پارەی هاتوو',
                'metric_cash_out' => 'پارەی دەرچوو', 'metric_count' => 'ژمارەی تۆمار',
                'metric_revenue' => 'داهات', 'metric_profit' => 'قازانج', 'metric_stock_value' => 'بەهای کۆگا',
                'metric_quantity' => 'بڕ', 'metric_total' => 'کۆی گشتی', 'metric_paid' => 'دراو',
                'metric_due' => 'قەرزی ماوە', 'metric_debt' => 'قەرز', 'metric_period_purchases' => 'کڕینی ئەم ماوەیە',
                'metric_total_payments' => 'کۆی پارەدان', 'metric_purchases' => 'کڕین', 'metric_refunded' => 'پارەی گەڕاوە',
                'metric_in' => 'پارەی هاتوو', 'metric_out' => 'پارەی دەرچوو', 'metric_variance' => 'جیاوازی',
                'metric_products' => 'کاڵاکان', 'metric_categories' => 'پۆلەکان', 'metric_units' => 'یەکەکان',
                'payment_CASH' => 'نەقد', 'payment_CARD' => 'کارت', 'payment_CREDIT' => 'قەرز', 'payment_BANK' => 'بانک',
                'direction_IN' => 'هاتوو', 'direction_OUT' => 'دەرچوو', 'role_ADMIN' => 'بەڕێوەبەر',
                'role_MANAGER' => 'بەڕێوەبەر', 'role_CASHIER' => 'کاشێر',
                'status_PAID' => 'دراوە', 'status_PARTIAL' => 'بەشێک دراوە', 'status_DUE' => 'قەرزدار',
                'status_ACTIVE' => 'چالاک', 'status_INACTIVE' => 'ناچالاک', 'status_LOW' => 'کۆگای کەم',
                'status_OUT' => 'لە کۆگا نەماوە', 'status_NEGATIVE' => 'کۆگای نەرێنی', 'status_EXPIRED' => 'بەسەرچوو',
                'status_EXPIRING' => 'بە نزیکی بەسەردەچێت', 'status_SLOW' => 'فرۆشی کەم', 'status_FAST' => 'فرۆشی خێرا',
                'status_CASH_IN' => 'زیادکردنی پارە', 'status_CASH_OUT' => 'دەرهێنانی پارە', 'status_SALE' => 'فرۆشتن',
                'status_RETURN' => 'گەڕاندنەوە', 'status_EXPENSE' => 'خەرجی', 'status_ADJUSTMENT' => 'ڕێکخستن',
                'status_SHIFT_ADJUSTMENT' => 'ڕێکخستنی شێفت', 'status_PURCHASE' => 'کڕین',
                'status_DAMAGE' => 'خەساربوو', 'status_OTHER' => 'هۆکاری تر', 'status_CREATE' => 'دروستکردن',
                'status_UPDATE' => 'نوێکردنەوە', 'status_DELETE' => 'سڕینەوە', 'status_PAYMENT' => 'پارەدان',
            ],
            'ar' => [
                'period' => 'الفترة الزمنية', 'summary' => 'إجماليات الملخص', 'metric' => 'المؤشر', 'value' => 'القيمة',
                'top_products' => 'أفضل المنتجات', 'name' => 'الاسم', 'name_ku' => 'اسم المنتج',
                'name_en' => 'الاسم بالإنجليزية', 'name_ar' => 'الاسم بالعربية', 'barcode' => 'الباركود',
                'sku' => 'رمز المنتج', 'category' => 'الفئة', 'unit' => 'الوحدة', 'quantity' => 'الكمية',
                'purchase_price' => 'سعر الشراء', 'selling_price' => 'سعر البيع', 'wholesale_price' => 'سعر الجملة',
                'expiry_date' => 'تاريخ الانتهاء', 'status' => 'الحالة', 'stock_value' => 'قيمة المخزون',
                'unit_margin' => 'هامش الوحدة', 'margin_percent' => 'هامش الربح (%)', 'sold_quantity' => 'الكمية المباعة',
                'sales_revenue' => 'إيرادات المبيعات', 'gross_profit' => 'إجمالي الربح', 'movement_type' => 'نوع الحركة',
                'damage_reason' => 'سبب التلف', 'previous_quantity' => 'الكمية السابقة', 'new_quantity' => 'الكمية الجديدة',
                'notes' => 'ملاحظات', 'supplier' => 'المورد', 'customer' => 'العميل', 'paid_amount' => 'المبلغ المدفوع',
                'remaining_amount' => 'المبلغ المستحق', 'amount' => 'المبلغ', 'description' => 'الوصف',
                'transaction_number' => 'رقم المعاملة', 'type' => 'النوع', 'direction' => 'الاتجاه',
                'balance_before' => 'الرصيد السابق', 'balance_after' => 'الرصيد الجديد', 'reason' => 'السبب',
                'source_type' => 'نوع المصدر', 'source_id' => 'معرف المصدر', 'company' => 'الشركة',
                'phone' => 'الهاتف', 'total_purchases' => 'إجمالي المشتريات', 'total_paid' => 'إجمالي المدفوع',
                'debt' => 'الدين المستحق', 'invoice_count' => 'عدد الفواتير', 'period_sales' => 'مبيعات الفترة',
                'payment_type' => 'نوع الدفع', 'period_purchase_count' => 'مشتريات الفترة',
                'period_purchase_total' => 'إجمالي مشتريات الفترة', 'period_purchase_paid' => 'المدفوع في الفترة',
                'period_purchase_due' => 'المستحق في الفترة', 'expected_balance' => 'الرصيد المتوقع',
                'counted_balance' => 'الرصيد المعدود', 'variance' => 'الفرق', 'opening_balance' => 'الرصيد الافتتاحي',
                'closing_notes' => 'ملاحظات الإغلاق', 'opening_notes' => 'ملاحظات الفتح', 'role' => 'الدور',
                'last_login' => 'آخر تسجيل دخول', 'action' => 'الإجراء', 'entity' => 'الكيان',
                'entity_id' => 'معرف الكيان', 'product_count' => 'عدد المنتجات', 'stock_quantity' => 'كمية المخزون',
                'period_quantity_sold' => 'الكمية المباعة في الفترة', 'period_revenue' => 'إيرادات الفترة',
                'cost_of_goods' => 'تكلفة البضائع المباعة', 'cash_received' => 'النقد المستلم',
                'change_amount' => 'الباقي', 'cashier' => 'الكاشير', 'subtotal' => 'المجموع الفرعي',
                'discount' => 'الخصم', 'profit' => 'الربح', 'total_refund' => 'مبلغ الاسترداد',
                'created_at' => 'التاريخ والوقت', 'date' => 'التاريخ', 'closed_at' => 'وقت الإغلاق',
                'opened_at' => 'وقت الفتح', 'user' => 'المستخدم',
                'metric_total_sales' => 'صافي المبيعات', 'metric_gross_sales' => 'إجمالي المبيعات',
                'metric_cogs' => 'تكلفة البضائع المباعة', 'metric_gross_profit' => 'إجمالي الربح',
                'metric_total_purchases' => 'المشتريات', 'metric_expenses' => 'المصروفات', 'metric_net_profit' => 'صافي الربح',
                'metric_invoices' => 'الفواتير', 'metric_returns' => 'المبالغ المستردة', 'metric_discounts' => 'الخصومات',
                'metric_average_invoice' => 'متوسط الفاتورة',
                'metric_sales_change_percent' => 'تغير المبيعات (%)', 'metric_profit_change_percent' => 'تغير الأرباح (%)',
                'metric_total_products' => 'المنتجات', 'metric_low_stock' => 'مخزون منخفض',
                'metric_out_of_stock' => 'نفد المخزون', 'metric_customers' => 'العملاء',
                'metric_customer_debt' => 'ديون العملاء', 'metric_suppliers' => 'الموردون',
                'metric_supplier_debt' => 'ديون الموردين', 'metric_users' => 'المستخدمون النشطون',
                'metric_cash_balance' => 'رصيد الصندوق', 'metric_cash_in' => 'نقد داخل الصندوق',
                'metric_cash_out' => 'نقد خارج الصندوق', 'metric_count' => 'السجلات',
                'metric_revenue' => 'الإيرادات', 'metric_profit' => 'الربح', 'metric_stock_value' => 'قيمة المخزون',
                'metric_quantity' => 'الكمية', 'metric_total' => 'الإجمالي', 'metric_paid' => 'المدفوع',
                'metric_due' => 'المستحق', 'metric_debt' => 'الدين', 'metric_period_purchases' => 'مشتريات الفترة',
                'metric_total_payments' => 'إجمالي المدفوعات', 'metric_purchases' => 'المشتريات', 'metric_refunded' => 'المسترد',
                'metric_in' => 'نقد داخل', 'metric_out' => 'نقد خارج', 'metric_variance' => 'فرق الصندوق',
                'metric_products' => 'المنتجات', 'metric_categories' => 'الفئات', 'metric_units' => 'الوحدات',
                'payment_CASH' => 'نقداً', 'payment_CARD' => 'بطاقة', 'payment_CREDIT' => 'آجل', 'payment_BANK' => 'بنك',
                'direction_IN' => 'داخل', 'direction_OUT' => 'خارج', 'role_ADMIN' => 'مسؤول',
                'role_MANAGER' => 'مدير', 'role_CASHIER' => 'كاشير',
                'status_PAID' => 'مدفوع', 'status_PARTIAL' => 'مدفوع جزئياً', 'status_DUE' => 'مستحق',
                'status_ACTIVE' => 'نشط', 'status_INACTIVE' => 'غير نشط', 'status_LOW' => 'مخزون منخفض',
                'status_OUT' => 'نفد المخزون', 'status_NEGATIVE' => 'مخزون سالب', 'status_EXPIRED' => 'منتهي الصلاحية',
                'status_EXPIRING' => 'قارب على الانتهاء', 'status_SLOW' => 'بطيء الحركة', 'status_FAST' => 'سريع الحركة',
                'status_CASH_IN' => 'إيداع نقدي', 'status_CASH_OUT' => 'سحب نقدي', 'status_SALE' => 'بيع',
                'status_RETURN' => 'مرتجع', 'status_EXPENSE' => 'مصروف', 'status_ADJUSTMENT' => 'تسوية',
                'status_SHIFT_ADJUSTMENT' => 'تسوية الوردية', 'status_PURCHASE' => 'شراء',
                'status_DAMAGE' => 'تالف', 'status_OTHER' => 'أخرى', 'status_CREATE' => 'إنشاء',
                'status_UPDATE' => 'تحديث', 'status_DELETE' => 'حذف', 'status_PAYMENT' => 'دفعة',
            ],
        ];

        return array_merge($labels[$language], $localized[$language]);
    }

    private function reportIdColumn(string $report): string
    {
        return match ($report) {
            'sales' => 'sales.id',
            'products' => 'products.id',
            'movements', 'damaged' => 'stock_movements.id',
            'purchases' => 'purchases.id',
            'supplier-payments', 'customer-payments' => 'payments.id',
            'suppliers' => 'suppliers.id',
            'customers' => 'customers.id',
            'expenses' => 'expenses.id',
            'returns' => 'returns.id',
            'cash' => 'cash_register_transactions.id',
            'shifts' => 'cash_register_shifts.id',
            'users' => 'users.id',
            'activity' => 'activity_logs.id',
            'categories' => 'categories.id',
            'units' => 'units.id',
            default => 'id',
        };
    }
}
