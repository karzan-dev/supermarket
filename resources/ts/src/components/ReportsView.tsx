import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, BarChart3, LoaderCircle, Search,
} from 'lucide-react';
import {
  BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const REPORTS = [
  'overview', 'sales', 'products', 'movements', 'damaged', 'purchases', 'suppliers',
  'supplier-payments', 'customers', 'customer-payments', 'expenses', 'returns',
  'cash', 'shifts', 'users', 'activity', 'categories', 'units',
] as const;
type ReportKey = typeof REPORTS[number];
type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

type ReportRow = Record<string, string | number | null>;
interface ReportResponse {
  report: ReportKey;
  period: { start: string; end: string };
  summary: Record<string, number | null>;
  rows: { data: ReportRow[]; current_page: number; last_page: number; total: number };
  filters: {
    categories: { id: number; name_ku: string; name_en: string; name_ar: string }[];
    customers: { id: number; name: string }[];
    suppliers: { id: number; name: string }[];
    users: { id: number; name: string }[];
    units: { id: number; name_ku: string; name_en: string; name_ar: string; short_code: string }[];
  };
}
interface OverviewResponse {
  period: { start: string; end: string };
  summary: Record<string, number | null>;
  trend: { date: string; sales: number; profit: number; invoices: number }[];
  expense_categories: { name_ku: string; name_en: string; name_ar: string; total: number }[];
  top_products: { id: number; name_ku: string; name_en?: string | null; name_ar?: string | null; quantity: number; revenue: number; profit: number }[];
  payment_methods: { payment_method: string; payment_status: string; invoices: number; amount: number }[];
}

const PERIODS: DateRange[] = ['today', 'yesterday', 'week', 'month', 'year', 'custom'];
const REPORT_PAGE_SIZE = 10;
const OVERVIEW_TABLE_PAGE_SIZE = 5;
const CURRENCY_FIELDS = new Set([
  'total_sales', 'gross_sales', 'net_sales', 'cogs', 'gross_profit', 'total_purchases', 'expenses', 'net_profit',
  'returns', 'discounts', 'average_invoice', 'cash_in', 'cash_out', 'cash_balance',
  'total', 'subtotal', 'discount', 'cost_of_goods', 'profit', 'cash_received', 'change_amount',
  'stock_value', 'unit_margin', 'sales_revenue', 'gross_profit', 'total_refund', 'amount', 'paid_amount',
  'remaining_amount', 'total_purchases', 'total_paid', 'debt', 'period_purchase_total', 'period_purchase_paid',
  'period_purchase_due', 'period_sales', 'period_revenue', 'expected_balance', 'counted_balance', 'variance',
  'balance_before', 'balance_after', 'opening_balance', 'total_payments',
]);
const IDENTIFIER_FIELDS = new Set(['invoice_number', 'barcode', 'sku', 'phone', 'transaction_number', 'source_id', 'entity_id']);
const DATE_FIELDS = new Set(['created_at', 'opened_at', 'closed_at', 'date', 'expiry_date', 'last_login']);

const REPORT_SUMMARIES: Partial<Record<ReportKey, string[]>> = {
  overview: ['total_sales', 'gross_profit', 'net_profit', 'total_purchases', 'expenses', 'cash_balance', 'customer_debt', 'supplier_debt'],
  sales: ['count', 'revenue', 'net_sales', 'discounts', 'cogs', 'profit'],
  products: ['count', 'stock_value', 'low_stock', 'out_of_stock'],
  movements: ['count', 'quantity'],
  damaged: ['count', 'quantity'],
  purchases: ['count', 'total', 'paid', 'due'],
  suppliers: ['count', 'debt', 'period_purchases'],
  'supplier-payments': ['count', 'total_payments'],
  customers: ['count', 'purchases', 'debt'],
  'customer-payments': ['count', 'total_payments'],
  expenses: ['count', 'total'],
  returns: ['count', 'refunded'],
  cash: ['count', 'in', 'out'],
  shifts: ['count', 'variance'],
  users: ['count'],
  activity: ['count'],
  categories: ['count', 'products'],
  units: ['count', 'products'],
};
const REPORT_COLUMN_LABELS: Record<string, string> = {
  id: 'reportColId', invoice_number: 'invoiceNumber', created_at: 'date', opened_at: 'date',
  closed_at: 'closedAt', subtotal: 'subtotal', discount: 'discount', total: 'total',
  cash_received: 'cashReceived', change_amount: 'changeAmount',
  cost_of_goods: 'cogs', profit: 'grossProfit', payment_method: 'paymentMethod',
  payment_status: 'status', cashier: 'cashier', customer: 'customer', barcode: 'barcode',
  sku: 'sku', name_ku: 'name', category: 'category', unit: 'unit', quantity: 'quantity',
  purchase_price: 'purchasePrice', selling_price: 'sellingPrice', wholesale_price: 'wholesalePrice',
  expiry_date: 'expiryDate', status: 'status', stock_value: 'stockValue', unit_margin: 'unitMargin',
  margin_percent: 'profitMargin', sold_quantity: 'quantitySold', sales_revenue: 'sales',
  gross_profit: 'grossProfit', movement_type: 'transactionType', damage_reason: 'damageReason',
  previous_quantity: 'previous', new_quantity: 'new', notes: 'notes', supplier: 'supplier',
  user: 'user', paid_amount: 'paidAmount', remaining_amount: 'due', amount: 'amount',
  description: 'description', transaction_number: 'transactionNumber', type: 'transactionType',
  direction: 'direction', balance_before: 'balanceBefore', balance_after: 'balanceAfter',
  reason: 'reason', source_type: 'sourceType', source_id: 'sourceId', company: 'company',
  phone: 'phone', total_purchases: 'totalPurchases', total_paid: 'totalPaid', debt: 'debt',
  invoice_count: 'invoiceCount', period_sales: 'periodSales', date: 'date', payment_type: 'transactionType',
  period_purchase_count: 'purchaseCount', period_purchase_total: 'periodPurchases',
  period_purchase_paid: 'paidAmount', period_purchase_due: 'due', expected_balance: 'expectedBalance',
  counted_balance: 'countedBalance', variance: 'variance', opening_balance: 'openingBalance',
  closing_notes: 'notes', opening_notes: 'notes', role: 'role', last_login: 'lastLogin',
  sales_count: 'invoiceCount', sales_total: 'sales', action: 'action', entity: 'entity',
  entity_id: 'entityId', name_en: 'nameEnglish', name_ar: 'nameArabic', product_count: 'productCount',
  stock_quantity: 'stockQuantity', period_quantity_sold: 'quantitySold', period_revenue: 'sales',
};

export const ReportsView: React.FC = () => {
  const { t, formatCurrency, getLocalizedName, language, theme, settings, refreshTrigger } = useApp();
  const [report, setReport] = useState<ReportKey>('overview');
  const [range, setRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [topProductsPage, setTopProductsPage] = useState(1);
  const [paymentMethodsPage, setPaymentMethodsPage] = useState(1);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = useCallback((target: ReportKey, pageNumber = 1) => {
    const params = new URLSearchParams({ report: target, range, language, per_page: String(REPORT_PAGE_SIZE), page: String(pageNumber) });
    if (range === 'custom' && startDate && endDate) {
      params.set('start_date', startDate);
      params.set('end_date', endDate);
    }
    if (search.trim()) params.set('search', search.trim());
    if (userId) params.set('user_id', userId);
    if (categoryId) params.set('category_id', categoryId);
    if (customerId) params.set('customer_id', customerId);
    if (supplierId) params.set('supplier_id', supplierId);
    if (unitId) params.set('unit_id', unitId);
    if (paymentMethod) params.set('payment_method', paymentMethod);
    if (status) params.set('status', status);
    if (sortBy) {
      params.set('sort_by', sortBy);
      params.set('sort_direction', sortDirection);
    }
    return params.toString();
  }, [range, language, startDate, endDate, search, userId, categoryId, customerId, supplierId, unitId, paymentMethod, status, sortBy, sortDirection]);

  useEffect(() => {
    if (range === 'custom' && (!startDate || !endDate)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      setReportData(null);
      setOverview(null);
      apiRequest<ReportResponse | OverviewResponse>(`/api/reports?${queryString(report, page)}`)
        .then(response => {
          if (cancelled) return;
          if (report === 'overview') setOverview(response.data as OverviewResponse);
          else setReportData(response.data as ReportResponse);
        })
        .catch(cause => {
          if (!cancelled) setError(cause instanceof Error ? cause.message : t('error'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [report, range, startDate, endDate, search, userId, categoryId, customerId, supplierId, unitId, paymentMethod, status, page, refreshTrigger, queryString, t]);

  useEffect(() => {
    setTopProductsPage(1);
    setPaymentMethodsPage(1);
  }, [report, range, startDate, endDate]);

  const selectReport = (selected: ReportKey) => {
    setPage(1);
    setSortBy('');
    setSortDirection('desc');
    setReport(selected);
  };

  const summary = report === 'overview' ? overview?.summary : reportData?.summary;
  const summaryKeys = REPORT_SUMMARIES[report] ?? [];
  const rows = reportData?.rows.data ?? [];
  const overviewProducts = overview?.top_products ?? [];
  const overviewPaymentMethods = overview?.payment_methods ?? [];
  const topProductsPageCount = Math.ceil(overviewProducts.length / OVERVIEW_TABLE_PAGE_SIZE);
  const paymentMethodsPageCount = Math.ceil(overviewPaymentMethods.length / OVERVIEW_TABLE_PAGE_SIZE);
  const paginatedTopProducts = overviewProducts.slice((topProductsPage - 1) * OVERVIEW_TABLE_PAGE_SIZE, topProductsPage * OVERVIEW_TABLE_PAGE_SIZE);
  const paginatedPaymentMethods = overviewPaymentMethods.slice((paymentMethodsPage - 1) * OVERVIEW_TABLE_PAGE_SIZE, paymentMethodsPage * OVERVIEW_TABLE_PAGE_SIZE);
  const firstRow = rows[0];
  const columns = firstRow ? Object.keys(firstRow) : [];
  const isDark = theme === 'dark';
  const trend = overview?.trend ?? [];

  return (
    <section id="report-print" className="space-y-5">
      <header className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <BarChart3 className="size-5 text-teal-700 dark:text-teal-400" /> {t('reports')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('reportCenterDescription')}</p>
        </div>
      </header>

      <nav aria-label={t('reportNavigation')} className="flex gap-2 overflow-x-auto pb-1 print:hidden">
        {REPORTS.map(item => (
          <button key={item} type="button" onClick={() => selectReport(item)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${report === item ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            {t(`report_${item}`)}
          </button>
        ))}
      </nav>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {PERIODS.map(item => (
            <button key={item} type="button" onClick={() => { setPage(1); setRange(item); }} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${range === item ? 'bg-white text-teal-800 shadow-xs dark:bg-slate-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {t(item === 'week' ? 'thisWeek' : item === 'month' ? 'thisMonth' : item === 'year' ? 'thisYear' : item)}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {range === 'custom' && <>
            <input aria-label={t('fromDate')} type="date" value={startDate} onChange={event => { setStartDate(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <input aria-label={t('toDate')} type="date" min={startDate} value={endDate} onChange={event => { setEndDate(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </>}
          <label className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input autoFocus value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={t('search')} className="w-full rounded-lg border border-slate-300 bg-white py-2 ps-9 pe-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          {report !== 'overview' && reportData && <>
            <select aria-label={t('performedBy')} value={userId} onChange={event => { setUserId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allUsers')}</option>
              {reportData.filters.users.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {['sales', 'expenses', 'products', 'categories'].includes(report) && <select aria-label={t('categories')} value={categoryId} onChange={event => { setCategoryId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allCategories')}</option>
              {reportData.filters.categories.map(item => <option key={item.id} value={item.id}>{getLocalizedName(item)}</option>)}
            </select>}
            {['sales', 'customers', 'customer-payments', 'returns'].includes(report) && <select aria-label={t('customers')} value={customerId} onChange={event => { setCustomerId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allCustomers')}</option>
              {reportData.filters.customers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>}
            {['purchases', 'suppliers', 'supplier-payments'].includes(report) && <select aria-label={t('suppliers')} value={supplierId} onChange={event => { setSupplierId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allSuppliers')}</option>
              {reportData.filters.suppliers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>}
            {report === 'products' && <select aria-label={t('units')} value={unitId} onChange={event => { setUnitId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allUnits')}</option>
              {reportData.filters.units.map(item => <option key={item.id} value={item.id}>{getLocalizedName(item)}</option>)}
            </select>}
            {['sales', 'supplier-payments', 'customer-payments'].includes(report) && <select aria-label={t('paymentMethod')} value={paymentMethod} onChange={event => { setPaymentMethod(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allPaymentMethods')}</option>
              {['CASH', 'CARD', 'CREDIT', 'BANK'].map(item => <option key={item} value={item}>{t(`payment_${item}`)}</option>)}
            </select>}
            {['sales', 'purchases', 'movements', 'products', 'cash', 'activity'].includes(report) && <select aria-label={t('status')} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">{t('allStatuses')}</option>
              {(report === 'products' ? ['ACTIVE', 'INACTIVE', 'LOW', 'OUT', 'NEGATIVE', 'EXPIRED', 'EXPIRING', 'SLOW', 'FAST'] :
                report === 'sales' ? ['PAID', 'PARTIAL', 'DUE'] :
                  report === 'purchases' ? ['PAID', 'PARTIAL', 'DUE'] :
                    report === 'movements' ? ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'EXPIRED', 'OTHER'] :
                      report === 'cash' ? ['CASH_IN', 'CASH_OUT', 'SALE', 'RETURN', 'EXPENSE', 'ADJUSTMENT', 'SHIFT_ADJUSTMENT'] :
                        ['CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'RETURN']).map(item => <option key={item} value={item}>{t(`reportStatus_${item}`)}</option>)}
            </select>}
          </>}
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold">{settings.store_name} · {t(`report_${report}`)}</h1>
        <p>{overview?.period.start ?? reportData?.period.start} – {overview?.period.end ?? reportData?.period.end}</p>
      </div>

      {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        <AlertTriangle className="size-4 shrink-0" /> {error}
      </div>}
      {loading && <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"><LoaderCircle className="size-4 animate-spin" /> {t('loading')}</div>}
      {!loading && !error && summary && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryKeys.map(key => {
            const value = summary[key];
            return <article key={key} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t(`reportMetric_${key}`)}</p>
              <p className="mt-2 break-all text-xl font-black font-mono text-slate-900 dark:text-white">{value === null ? '—' : CURRENCY_FIELDS.has(key) ? formatCurrency(value ?? 0) : new Intl.NumberFormat(language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en').format(value ?? 0)}</p>
              {report === 'overview' && key === 'total_sales' && summary.sales_change_percent !== null && summary.sales_change_percent !== undefined &&
                <p className="mt-1 text-[11px] text-slate-500">{t('previousPeriod')}: {summary.sales_change_percent > 0 ? '+' : ''}{summary.sales_change_percent}%</p>}
              {report === 'overview' && key === 'net_profit' && summary.profit_change_percent !== null && summary.profit_change_percent !== undefined &&
                <p className="mt-1 text-[11px] text-slate-500">{t('previousPeriod')}: {summary.profit_change_percent > 0 ? '+' : ''}{summary.profit_change_percent}%</p>}
            </article>;
          })}
        </div>
      )}

      {report === 'overview' && overview && !loading && !error && <>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{t('salesTrend')}</h2>
          {trend.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">{t('reportNoData')}</p> :
            <div className="h-72"><Line data={{
              labels: trend.map(item => item.date),
              datasets: [
                { label: t('sales'), data: trend.map(item => item.sales), borderColor: '#0f766e', backgroundColor: '#14b8a6', tension: 0.25 },
                { label: t('grossProfit'), data: trend.map(item => item.profit), borderColor: '#0284c7', backgroundColor: '#38bdf8', tension: 0.25 },
              ],
            }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: isDark ? '#cbd5e1' : '#475569' } } } }} /></div>}
        </section>
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-800">{t('topSellingProducts')}</h2>
            {overview.top_products.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">{t('reportNoData')}</p> :
              <>
                <div className="overflow-x-auto"><table className="w-full min-w-[28rem] text-start text-xs"><thead><tr className="bg-slate-50 dark:bg-slate-950"><th className="p-3 text-start">{t('products')}</th><th className="p-3 text-end">{t('quantity')}</th><th className="p-3 text-end">{t('sales')}</th><th className="p-3 text-end">{t('grossProfit')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{paginatedTopProducts.map(product => <tr key={product.id}><td className="p-3 font-semibold">{getLocalizedName(product)}</td><td className="p-3 text-end font-mono">{product.quantity}</td><td className="p-3 text-end font-mono">{formatCurrency(product.revenue)}</td><td className="p-3 text-end font-mono">{formatCurrency(product.profit)}</td></tr>)}</tbody></table></div>
                <TablePagination currentPage={topProductsPage} pageCount={topProductsPageCount} onPageChange={setTopProductsPage} t={t} />
              </>}
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-800">{t('paymentMethod')}</h2>
            {overview.payment_methods.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">{t('reportNoData')}</p> :
              <>
                <div className="overflow-x-auto"><table className="w-full text-start text-xs"><thead><tr className="bg-slate-50 dark:bg-slate-950"><th className="p-3 text-start">{t('paymentMethod')}</th><th className="p-3 text-start">{t('status')}</th><th className="p-3 text-end">{t('invoiceCount')}</th><th className="p-3 text-end">{t('total')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{paginatedPaymentMethods.map((item, index) => <tr key={`${item.payment_method}-${item.payment_status}-${(paymentMethodsPage - 1) * OVERVIEW_TABLE_PAGE_SIZE + index}`}><td className="p-3">{t(`payment_${item.payment_method}`)}</td><td className="p-3">{t(`reportStatus_${item.payment_status}`)}</td><td className="p-3 text-end">{item.invoices}</td><td className="p-3 text-end font-mono">{formatCurrency(item.amount)}</td></tr>)}</tbody></table></div>
                <TablePagination currentPage={paymentMethodsPage} pageCount={paymentMethodsPageCount} onPageChange={setPaymentMethodsPage} t={t} />
              </>}
          </section>
        </div>
      </>}

      {report !== 'overview' && reportData && !loading && !error && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t(`report_${report}`)}</h2>
            <span className="text-xs text-slate-500">{t('totalRecords')}: {new Intl.NumberFormat().format(reportData.rows.total)}</span>
          </div>
          {rows.length === 0 ? <p className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">{t('reportNoData')}</p> :
            <div className="overflow-x-auto"><table className="w-full min-w-[52rem] text-start text-xs">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">{columns.map(column => {
                const isSorted = sortBy === column;
                const SortIcon = isSorted ? sortDirection === 'asc' ? ArrowUp : ArrowDown : ArrowUpDown;
                const label = t(REPORT_COLUMN_LABELS[column] ?? column);
                return <th key={column} aria-sort={isSorted ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'} className="whitespace-nowrap px-3 py-3 text-start font-semibold">
                  <button type="button" aria-label={`${t('sortReportBy')} ${label}`} onClick={() => {
                    setPage(1);
                    if (isSorted) setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
                    else { setSortBy(column); setSortDirection('asc'); }
                  }} className="inline-flex items-center gap-1">
                    {label}<SortIcon className="size-3.5" aria-hidden="true" />
                  </button>
                </th>;
              })}</tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, index) => <tr key={`${row.id ?? row.invoice_number ?? index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {columns.map(column => {
                    const value = row[column];
                    const amount = value !== null && value !== '' && CURRENCY_FIELDS.has(column);
                    const numeric = !IDENTIFIER_FIELDS.has(column) && value !== null && value !== '' &&
                      (typeof value === 'number' || (typeof value === 'string' && Number.isFinite(Number(value))));
                    const translated = column === 'direction' && typeof value === 'string'
                      ? t(value === 'IN' ? 'reportStatus_CASH_IN' : 'reportStatus_CASH_OUT')
                      : typeof value === 'string' && (['payment_status', 'type', 'movement_type', 'damage_reason', 'status', 'role', 'action'].includes(column))
                        ? t(`reportStatus_${value}`)
                        : column === 'payment_method' && typeof value === 'string'
                          ? t(`payment_${value}`)
                          : value;
                    const formattedDate = DATE_FIELDS.has(column) && typeof value === 'string'
                      ? formatReportDate(value, language)
                      : null;
                    return <td key={column} className={`max-w-72 px-3 py-3 ${amount || numeric ? 'text-end font-mono' : ''} ${column.includes('notes') || column === 'description' ? 'truncate' : ''}`} title={value == null ? '' : String(value)}>
                      {value == null || value === '' ? '—' : formattedDate ?? (amount ? formatCurrency(Number(value)) : numeric ? new Intl.NumberFormat(language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en', { maximumFractionDigits: 2 }).format(Number(value)) : String(translated))}
                    </td>;
                  })}
                </tr>)}
              </tbody>
            </table></div>}
          {reportData.rows.last_page > 1 && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800 print:hidden">
            <span className="text-slate-500">{t('page')} {reportData.rows.current_page} / {reportData.rows.last_page}</span>
            <div className="flex gap-2">
                  <button type="button" disabled={reportData.rows.current_page <= 1} onClick={() => setPage(current => current - 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('previousPage')}</button>
              <button type="button" disabled={reportData.rows.current_page >= reportData.rows.last_page} onClick={() => setPage(current => current + 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('nextPage')}</button>
            </div>
          </div>}
        </section>
      )}
    </section>
  );
};

function TablePagination({
  currentPage,
  pageCount,
  onPageChange,
  t,
}: {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-xs dark:border-slate-800 print:hidden">
      <span className="text-slate-500">{t('page')} {currentPage} / {pageCount}</span>
      <div className="flex gap-2">
        <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('previousPage')}</button>
        <button type="button" disabled={currentPage >= pageCount} onClick={() => onPageChange(currentPage + 1)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('nextPage')}</button>
      </div>
    </div>
  );
}

function formatReportDate(value: string, language: string): string {
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const locale = language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
