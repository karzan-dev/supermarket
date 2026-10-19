import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '../api';
import type { AppSettings, ExpiryAlert, ToastItem, User, UserRole } from '../types';

export type Language = 'ku' | 'en' | 'ar';
export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'cashier'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'damaged-products'
  | 'purchases'
  | 'returns'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'cash-register'
  | 'reports'
  | 'users'
  | 'settings'
  | 'backup'
  | 'activity-logs';
export type AppTheme = 'light' | 'dark';

const TAB_PERMISSIONS: Record<NavTab, string> = {
  dashboard: 'dashboard.view',
  pos: 'pos.use',
  cashier: 'pos.use',
  products: 'products.view',
  categories: 'categories.view',
  inventory: 'inventory.view',
  'damaged-products': 'damage.view',
  purchases: 'purchases.view',
  returns: 'returns.view',
  customers: 'customers.view',
  suppliers: 'suppliers.view',
  expenses: 'expenses.view',
  'cash-register': 'cash.view',
  reports: 'reports.view',
  users: 'users.manage',
  settings: 'settings.view',
  backup: 'settings.manage',
  'activity-logs': 'activity_logs.view',
};

export function userCanAccessTab(user: User | null, tab: NavTab): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (tab === 'backup') return false;
  const permission = TAB_PERMISSIONS[tab];
  return Boolean(user.permissions?.includes(permission)
    || (permission.endsWith('.view') && user.permissions?.includes(permission.replace('.view', '.manage'))));
}

type LocalizedName = {
  name_ku?: string | null | undefined;
  name_en?: string | null | undefined;
  name_ar?: string | null | undefined;
};

type LoginCredentials = { username: string; password: string };

interface AppContextValue {
  user: User | null;
  language: Language;
  setLanguage: (language: Language) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isRtl: boolean;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  expiryAlerts: ExpiryAlert[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  inventoryExpiryFilter: string;
  setInventoryExpiryFilter: (filter: string) => void;
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number | string | null | undefined) => string;
  getLocalizedName: (item: LocalizedName) => string;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const SETTINGS_DEFAULTS: AppSettings = {
  store_name: 'سەنگەر مارکێت',
  store_name_en: 'Singer Markat',
  store_name_ar: 'المغنية ماركات',
  store_phone: '',
  store_address: '',
  currency: 'IQD',
  invoice_prefix: 'INV-',
  receipt_footer: '',
  default_language: 'ku',
  allow_negative_stock: '0',
  low_stock_threshold: '5',
  expiry_alerts_enabled: '1',
  expiry_warning_days: '7',
  expiry_urgent_days: '3',
  expiry_alerts_expired: '1',
  expiry_alerts_bell: '1',
  expiry_alerts_dashboard: '1',
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ku: {
    'damaged-products': 'خەساربوو',
    dashboard: 'داشبۆرد', pos: 'خاڵی فرۆشتن', products: 'کاڵاکان', categories: 'پۆلەکان', units: 'یەکەکان',
    cashier: 'کاشێر',
    inventory: 'کۆگا',
    purchases: 'کڕین', returns: 'گەڕاندنەوەی فرۆشتن', customers: 'کڕیاران', suppliers: 'دابینکەران',
    expenses: 'خەرجییەکان', 'cash-register': 'قاسە', reports: 'ڕاپۆرتەکان', users: 'بەکارهێنەران', settings: 'ڕێکخستنەکان', backup: 'پاشەکەوتی داتا', activityLogs: 'تۆماری چالاکی', 'activity-logs': 'تۆماری چالاکی',
    backupDescription: 'هەموو داتاکانی فرۆشگا و ڕێکخستنەکانت وەک فایلێکی SQL دابگرە.',
    backupSecurityNote: 'پاشەکەوتەکە hashی وشەی نهێنیی بەکارهێنەران لەخۆدەگرێت بۆ گواستنەوەی هەژمارەکان؛ tokenەکان تێیدا نین. فایلەکە بە پارێزراوی هەڵبگرە.',
    backupImportInstruction: 'لە سیستەمی مەبەستدا هەمان وەشانی بەرنامە دابمەزرێنە و migrationەکان جێبەجێ بکە، پاشان فایلە SQL ـەکە لە داتابەیسێکی بەتاڵ import بکە.',
    createBackup: 'دروستکردنی پاشەکەوت',
    backupReady: 'پاشەکەوتەکە بە سەرکەوتوویی داگیرا.',
    search: 'گەڕان', actions: 'کردارەکان', add: 'زیادکردن', edit: 'دەستکاری', delete: 'سڕینەوە', save: 'پاشەکەوتکردن',
    cancel: 'پاشگەزبوونەوە', confirm: 'پشتڕاستکردنەوە', loading: 'بارکردن...', noData: 'هیچ داتایەک نییە',
    name: 'ناو', phone: 'تەلەفۆن', address: 'ناونیشان', date: 'بەروار', status: 'دۆخ', quantity: 'بڕ',
    barcode: 'بارکۆد', price: 'نرخ', total: 'کۆی گشتی', notes: 'تێبینی', language: 'زمان', theme: 'ڕووکار',
    login: 'چوونەژوورەوە', logout: 'چوونەدەرەوە', username: 'ناوی بەکارهێنەر', password: 'وشەی نهێنی',
    showPassword: 'پیشاندانی وشەی نهێنی', hidePassword: 'شاردنەوەی وشەی نهێنی',
    addProduct: 'زیادکردنی کاڵا', addCustomer: 'زیادکردنی کڕیار', addSupplier: 'زیادکردنی دابینکەر',
    addPurchase: 'تۆمارکردنی کڕین', editPurchase: 'دەستکاری کڕین',
    addExpense: 'زیادکردنی خەرجی', addCategory: 'زیادکردنی پۆل', addUnit: 'زیادکردنی یەکە',
    customerDebts: 'قەرزی کڕیاران', debt: 'قەرز', payDebt: 'دانەوەی قەرز', totalPurchases: 'کۆی کڕین',
    totalSoldQuantity: 'کۆی بڕی فرۆش', totalPurchasedQuantity: 'کۆی بڕی کڕین',
    paymentMethod: 'شێوازی پارەدان', cash: 'نەقد', card: 'کارت', credit: 'قەرز', print: 'چاپکردن',
    appTagline: 'سیستەمی بەڕێوەبردنی فرۆشگا', openModule: 'کردنەوە', allModules: 'هەموو بەشەکان',
    todaySales: 'فرۆشی ئەمڕۆ', todayProfit: 'قازانجی ئەمڕۆ', totalProducts: 'کۆی کاڵاکان', lowStockItems: 'کەمبوونی کۆگا',
    outOfStock: 'لە کۆگا نەماوە', inStock: 'لە کۆگادایە', lowStock: 'کۆگای کەم', stockAdjustment: 'ڕێکخستنی کۆگا',
    invoiceNumber: 'ژمارەی پسوڵە', purchaseReceiptImage: 'وێنەی پسوڵەی کڕین',
    totalAmount: 'بڕی پارە', error: 'هەڵە', itemDeleted: 'بە سەرکەوتوویی سڕایەوە',
    cashBalance: 'باڵانسی قاسە', cashIn: 'زیادکردنی پارە', cashOut: 'دەرهێنانی پارە',
    cashSales: 'فرۆشتنی نەقدی', cashReturns: 'پارەی گەڕاوە', cashAdjustments: 'گۆڕانکارییەکان',
    cashTransactions: 'مامەڵەکانی قاسە', transactionNumber: 'ژمارەی مامەڵە', transactionType: 'جۆری مامەڵە',
    balanceBefore: 'باڵانسی پێشوو', balanceAfter: 'باڵانسی نوێ', reason: 'هۆکار', performedBy: 'ئەنجامدەر',
    amount: 'بڕی پارە', allTypes: 'هەموو جۆرەکان', allUsers: 'هەموو بەکارهێنەران',
    fromDate: 'لە بەروار', toDate: 'تا بەروار', timeOfDay: 'کاتی ڕۆژ', allDay: 'هەموو کاتەکان',
    time_morning: 'بەیانی (05:00–12:00)', time_noon: 'نیوەڕۆ (12:00–17:00)',
    time_evening: 'ئێوارە (17:00–19:00)', time_maghrib: 'مەغریب (19:00–20:00)',
    time_night: 'شەو (20:00–24:00)', time_midnight: 'نیوەشەو (00:00–05:00)',
    exportCsv: 'دەرکردنی CSV', printReport: 'چاپکردنی ڕاپۆرت',
    openShift: 'کردنەوەی شێفت', closeShift: 'داخستنی شێفت', shiftOpen: 'شێفت کراوەتەوە',
    openingBalance: 'باڵانسی سەرەتایی', expectedBalance: 'باڵانسی چاوەڕوانکراو',
    countedBalance: 'باڵانسی ژمێردراو', shiftVariance: 'جیاوازی', shiftOpenedBy: 'کاشێری شێفت',
    enterReason: 'هۆکار بنووسە', cashInSource: 'سەرچاوەی پارە', other: 'هۆکاری تر',
    manualTransaction: 'مامەڵەی دەستی', cashInType: 'زیادکردن', cashOutType: 'دەرهێنان',
    cashSaleType: 'فرۆشتنی نەقدی', returnType: 'گەڕاندنەوە', customerPaymentType: 'پارەدانی کڕیار',
    supplierPaymentType: 'پارەدانی دابینکەر', expenseType: 'خەرجی', adjustmentType: 'ڕێکخستن',
    transactionStatus: 'دۆخی مامەڵە', completed: 'تەواوبوو', noOpenShift: 'هیچ شێفتێکی کراوە نییە',
    confirmCashOut: 'دڵنیایت لە دەرهێنانی ئەم بڕە پارەیە؟', confirmCloseCashRegister: 'دڵنیایت لە داخستنی شێفت و تۆمارکردنی جیاوازی باڵانس؟',
    cashOutReason: 'هۆکاری دەرهێنان', cashInReason: 'هۆکاری زیادکردن', searchTransaction: 'گەڕان بە ژمارەی مامەڵە',
    capitalSource: 'سەرمایەی زیادکراو', otherSource: 'سەرچاوەی تر', transferReason: 'گواستنەوەی پارە', recipient: 'وەرگر',
    reportCenterDescription: 'ڕاپۆرت و شیکاریی ورد لەسەر داتای ڕاستەقینەی فرۆشگا.',
    reportNavigation: 'بەشەکانی ڕاپۆرت', reportNoData: 'هیچ داتایەک بۆ ئەم فلتەرە نییە.',
    reportTitle: 'ناونیشانی ڕاپۆرت', sortReportBy: 'ڕیزکردن بە', generatedAt: 'کاتی دروستکردن', dateRange: 'ماوەی بەروار',
    reportMetric: 'پێوەر', reportValue: 'بەها', previousPeriod: 'بەراورد بە ماوەی پێشوو',
    exportExcel: 'دەرکردنی Excel', printPdf: 'چاپ / پاشەکەوتکردنی PDF', totalRecords: 'کۆی تۆمارەکان',
    allCategories: 'هەموو پۆلەکان', allCustomers: 'هەموو کڕیاران', allSuppliers: 'هەموو دابینکەران',
    allUnits: 'هەموو یەکەکان', allPaymentMethods: 'هەموو شێوازەکانی پارەدان', allStatuses: 'هەموو دۆخەکان',
    report_overview: 'پوختەی گشتی', report_sales: 'فرۆشتن و POS', report_products: 'کاڵا و کۆگا',
    report_movements: 'جووڵەکانی کۆگا', report_damaged: 'کاڵای خەساربوو', report_purchases: 'کڕین',
    report_suppliers: 'دابینکەران و قەرز', 'report_supplier-payments': 'پارەدانی دابینکەر',
    report_customers: 'کڕیاران و قەرز', 'report_customer-payments': 'پارەدانی کڕیار',
    report_expenses: 'خەرجییەکان', report_returns: 'گەڕاندنەوە و گەڕاندنەوەی پارە',
    report_cash: 'مامەڵەکانی قاسە', report_shifts: 'شێفت و ژماردنی قاسە',
    report_users: 'کارایی بەکارهێنەران', report_activity: 'تۆماری چالاکی',
    report_categories: 'پۆلەکان', report_units: 'یەکە و پێوانەکان',
    reportMetric_total_sales: 'فرۆشی پاک دوای گەڕاندنەوە', reportMetric_gross_sales: 'کۆی فرۆشتن',
    reportMetric_gross_profit: 'قازانجی گشتی', reportMetric_net_profit: 'قازانجی پاک دوای خەرجی',
    reportMetric_total_purchases: 'کۆی کڕین', reportMetric_expenses: 'خەرجییەکان',
    reportMetric_cash_balance: 'باڵانسی ئێستای قاسە', reportMetric_customer_debt: 'قەرزی کڕیاران',
    reportMetric_supplier_debt: 'قەرزی دابینکەران', reportMetric_cogs: 'تێچووی کاڵای فرۆشراو',
    reportMetric_invoices: 'ژمارەی پسوڵەکان', reportMetric_returns: 'پارەی گەڕاوە',
    reportMetric_discounts: 'داشکاندن', reportMetric_average_invoice: 'ناوەندی پسوڵە',
    reportMetric_total_products: 'کۆی کاڵاکان', reportMetric_low_stock: 'کۆگای کەم',
    reportMetric_out_of_stock: 'لە کۆگا نەماوە', reportMetric_customers: 'کۆی کڕیاران',
    reportMetric_suppliers: 'کۆی دابینکەران', reportMetric_users: 'بەکارهێنەرانی چالاک',
    reportMetric_cash_in: 'پارەی چووە ناو قاسە', reportMetric_cash_out: 'پارەی دەرچوو لە قاسە',
    reportMetric_count: 'ژمارەی تۆمار', reportMetric_revenue: 'داهاتی فرۆشتن',
    reportMetric_net_sales: 'فرۆشی پاک دوای گەڕاندنەوە',
    reportMetric_profit: 'قازانج', reportMetric_stock_value: 'بەهای کۆگا',
    reportMetric_quantity: 'بڕ', reportMetric_total: 'کۆی گشتی', reportMetric_paid: 'پارەی دراو',
    reportMetric_due: 'ماوەی قەرز', reportMetric_debt: 'قەرز', reportMetric_period_purchases: 'کڕینی ئەم ماوەیە',
    reportMetric_total_payments: 'کۆی پارەدان', reportMetric_purchases: 'کڕین',
    reportMetric_refunded: 'پارەی گەڕاوە', reportMetric_in: 'پارەی هاتوو', reportMetric_out: 'پارەی دەرچوو',
    reportMetric_variance: 'جیاوازی ژماردن', reportMetric_products: 'کاڵاکان',
    reportMetric_categories: 'پۆلەکان', reportMetric_units: 'یەکەکان',
    reportColId: 'ژمارە', subtotal: 'کۆی پێش داشکاندن', discount: 'داشکاندن', cogs: 'تێچووی کاڵا',
    grossProfit: 'قازانجی گشتی', customer: 'کڕیار', sku: 'کۆدی کاڵا',
    category: 'پۆل', unit: 'یەکە', purchasePrice: 'نرخی کڕین', sellingPrice: 'نرخی فرۆشتن',
    totalPurchaseValue: 'کۆی نرخی کڕین', totalSellingValue: 'کۆی نرخی فرۆشتن',
    wholesalePrice: 'نرخی کۆ', expiryDate: 'بەرواری بەسەرچوون', stockValue: 'بەهای کۆگا',
    unitMargin: 'قازانجی یەکە', profitMargin: 'ڕێژەی قازانج', quantitySold: 'بڕی فرۆشراو',
    damageReason: 'هۆکاری خەساربوون', previous: 'پێشوو', new: 'نوێ', supplier: 'دابینکەر',
    paidAmount: 'بڕی دراو', due: 'قەرزی ماوە',
    direction: 'ئاڕاستە', sourceType: 'جۆری سەرچاوە', sourceId: 'ژمارەی سەرچاوە',
    company: 'کۆمپانیا', totalPaid: 'کۆی دراو', invoiceCount: 'ژمارەی پسوڵە',
    periodSales: 'فرۆشی ئەم ماوەیە', purchaseCount: 'ژمارەی کڕین', periodPurchases: 'کڕینی ئەم ماوەیە',
    closedAt: 'کاتی داخستن', role: 'ڕۆڵ', lastLogin: 'دوایین چوونەژوورەوە',
    action: 'کردار', entity: 'بابەت', entityId: 'ژمارەی بابەت', nameEnglish: 'ناو بە ئینگلیزی',
    nameArabic: 'ناو بە عەرەبی', productCount: 'ژمارەی کاڵا', stockQuantity: 'بڕی کۆگا',
    payment_CASH: 'نەقد', payment_CARD: 'کارت', payment_CREDIT: 'قەرز', payment_BANK: 'بانک',
    reportStatus_PAID: 'دراوە', reportStatus_PARTIAL: 'بەشێک دراوە', reportStatus_DUE: 'قەرزدار',
    reportStatus_ACTIVE: 'چالاک', reportStatus_INACTIVE: 'ناچالاک', reportStatus_LOW: 'کۆگای کەم',
    reportStatus_OUT: 'لە کۆگا نەماوە', reportStatus_NEGATIVE: 'کۆگای نەرێنی',
    reportStatus_EXPIRED: 'بەسەرچوو', reportStatus_EXPIRING: 'بە نزیکی بەسەردەچێت',
    reportStatus_SLOW: 'فرۆشی کەم', reportStatus_FAST: 'فرۆشی خێرا',
    reportStatus_CASH_IN: 'زیادکردنی پارە', reportStatus_CASH_OUT: 'دەرهێنانی پارە',
    reportStatus_SALE: 'فرۆشتن', reportStatus_RETURN: 'گەڕاندنەوە', reportStatus_EXPENSE: 'خەرجی',
    reportStatus_ADJUSTMENT: 'ڕێکخستنی کۆگا', reportStatus_SHIFT_ADJUSTMENT: 'ڕێکخستنی شێفت',
    reportStatus_PURCHASE: 'کڕین', reportStatus_DAMAGE: 'خەساربوو', reportStatus_OTHER: 'هۆکاری تر',
    reportStatus_CREATE: 'دروستکردن', reportStatus_UPDATE: 'نوێکردنەوە', reportStatus_DELETE: 'سڕینەوە',
    reportStatus_PAYMENT: 'پارەدان', reportStatus_CASH: 'نەقد', reportStatus_CARD: 'کارت',
    reportStatus_CREDIT: 'قەرز', reportStatus_BANK: 'بانک', reportStatus_IN: 'هاتوو',
  },
  en: {
    'damaged-products': 'Damaged products',
    dashboard: 'Dashboard', pos: 'Point of sale', products: 'Products', categories: 'Categories', units: 'Units',
    cashier: 'Cashier',
    inventory: 'Inventory',
    purchases: 'Purchases', returns: 'Sales returns', customers: 'Customers', suppliers: 'Suppliers',
    expenses: 'Expenses', 'cash-register': 'Cash register', reports: 'Reports', users: 'Users', settings: 'Settings', backup: 'Data backup', activityLogs: 'Activity log', 'activity-logs': 'Activity log',
    backupDescription: 'Download all supermarket data and settings as an SQL file.',
    backupSecurityNote: 'The backup includes hashed user passwords so accounts can be moved; access tokens are excluded. Store the file securely.',
    backupImportInstruction: 'Install the same application version on the destination, run its migrations, then import this SQL file into an empty database.',
    createBackup: 'Create backup',
    backupReady: 'The backup was downloaded successfully.',
    search: 'Search', actions: 'Actions', add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    confirm: 'Confirm', loading: 'Loading...', noData: 'No data found', name: 'Name', phone: 'Phone', address: 'Address',
    date: 'Date', status: 'Status', quantity: 'Quantity', barcode: 'Barcode', price: 'Price', total: 'Total', notes: 'Notes',
    language: 'Language', theme: 'Theme', login: 'Sign in', logout: 'Sign out', username: 'Username', password: 'Password',
    showPassword: 'Show password', hidePassword: 'Hide password',
    addProduct: 'Add product', addCustomer: 'Add customer', addSupplier: 'Add supplier',
    addPurchase: 'Record purchase', editPurchase: 'Edit purchase',
    addExpense: 'Add expense', addCategory: 'Add category', addUnit: 'Add unit', customerDebts: 'Customer debts',
    debt: 'Debt', payDebt: 'Record payment', totalPurchases: 'Total purchases', paymentMethod: 'Payment method',
    totalSoldQuantity: 'Total quantity sold', totalPurchasedQuantity: 'Total quantity purchased',
    cash: 'Cash', card: 'Card', credit: 'Credit', print: 'Print', appTagline: 'Supermarket management system',
    openModule: 'Open', allModules: 'All modules', todaySales: "Today's sales", todayProfit: "Today's profit",
    totalProducts: 'Total products', lowStockItems: 'Low stock', outOfStock: 'Out of stock', inStock: 'In stock',
    lowStock: 'Low stock', stockAdjustment: 'Adjust stock', invoiceNumber: 'Invoice number',
    purchaseReceiptImage: 'Purchase receipt image', totalAmount: 'Amount',
    error: 'Error', itemDeleted: 'Deleted successfully',
    cashBalance: 'Cash balance', cashIn: 'Cash in', cashOut: 'Cash out',
    cashSales: 'Cash sales', cashReturns: 'Cash refunds', cashAdjustments: 'Adjustments',
    cashTransactions: 'Cash transactions', transactionNumber: 'Transaction #', transactionType: 'Transaction type',
    balanceBefore: 'Balance before', balanceAfter: 'Balance after', reason: 'Reason', performedBy: 'Performed by',
    amount: 'Amount', allTypes: 'All types', allUsers: 'All users',
    fromDate: 'From date', toDate: 'To date', timeOfDay: 'Time of day', allDay: 'All times',
    time_morning: 'Morning (05:00–12:00)', time_noon: 'Noon (12:00–17:00)',
    time_evening: 'Evening (17:00–19:00)', time_maghrib: 'Maghrib (19:00–20:00)',
    time_night: 'Night (20:00–24:00)', time_midnight: 'Midnight (00:00–05:00)',
    exportCsv: 'Export CSV', printReport: 'Print report',
    openShift: 'Open shift', closeShift: 'Close shift', shiftOpen: 'Shift is open',
    openingBalance: 'Opening balance', expectedBalance: 'Expected balance',
    countedBalance: 'Counted balance', shiftVariance: 'Variance', shiftOpenedBy: 'Shift cashier',
    enterReason: 'Enter a reason', cashInSource: 'Cash source', other: 'Other',
    manualTransaction: 'Manual transaction', cashInType: 'Cash in', cashOutType: 'Cash out',
    cashSaleType: 'Cash sale', returnType: 'Refund', customerPaymentType: 'Customer payment',
    supplierPaymentType: 'Supplier payment', expenseType: 'Expense', adjustmentType: 'Adjustment',
    transactionStatus: 'Status', completed: 'Completed', noOpenShift: 'No shift is currently open',
    confirmCashOut: 'Are you sure you want to withdraw this amount?',
    confirmCloseCashRegister: 'Close this shift and record the cash-count variance?',
    cashOutReason: 'Cash-out reason', cashInReason: 'Cash-in reason', searchTransaction: 'Search transaction number',
    capitalSource: 'Added capital', otherSource: 'Other source', transferReason: 'Cash transfer', recipient: 'Recipient',
    reportCenterDescription: 'Detailed reports and analytics from real store data.',
    reportNavigation: 'Report sections', reportNoData: 'No records match these filters.',
    reportTitle: 'Report title', sortReportBy: 'Sort by', generatedAt: 'Generated at', dateRange: 'Date range',
    reportMetric: 'Metric', reportValue: 'Value', previousPeriod: 'Compared with previous period',
    exportExcel: 'Export Excel', printPdf: 'Print / Save PDF', totalRecords: 'Total records',
    allCategories: 'All categories', allCustomers: 'All customers', allSuppliers: 'All suppliers',
    allUnits: 'All units', allPaymentMethods: 'All payment methods', allStatuses: 'All statuses',
    report_overview: 'Overview', report_sales: 'Sales and POS', report_products: 'Products and stock',
    report_movements: 'Inventory movements', report_damaged: 'Damaged products', report_purchases: 'Purchases',
    report_suppliers: 'Suppliers and debt', 'report_supplier-payments': 'Supplier payments',
    report_customers: 'Customers and debt', 'report_customer-payments': 'Customer payments',
    report_expenses: 'Expenses', report_returns: 'Returns and refunds', report_cash: 'Cash movements',
    report_shifts: 'Shifts and reconciliation', report_users: 'User performance', report_activity: 'Activity log',
    report_categories: 'Categories', report_units: 'Units and measures',
    reportMetric_total_sales: 'Net sales after returns', reportMetric_gross_sales: 'Gross sales',
    reportMetric_gross_profit: 'Gross profit', reportMetric_net_profit: 'Net profit after expenses',
    reportMetric_total_purchases: 'Total purchases', reportMetric_expenses: 'Expenses',
    reportMetric_cash_balance: 'Current cash balance', reportMetric_customer_debt: 'Customer debt',
    reportMetric_supplier_debt: 'Supplier debt', reportMetric_cogs: 'Cost of goods sold',
    reportMetric_invoices: 'Invoices', reportMetric_returns: 'Refunds', reportMetric_discounts: 'Discounts',
    reportMetric_average_invoice: 'Average invoice',
    reportMetric_total_products: 'Products', reportMetric_low_stock: 'Low stock',
    reportMetric_out_of_stock: 'Out of stock', reportMetric_customers: 'Customers',
    reportMetric_suppliers: 'Suppliers', reportMetric_users: 'Active users', reportMetric_cash_in: 'Cash in',
    reportMetric_cash_out: 'Cash out', reportMetric_count: 'Records', reportMetric_revenue: 'Sales revenue',
    reportMetric_net_sales: 'Net sales after returns',
    reportMetric_profit: 'Profit', reportMetric_stock_value: 'Stock value', reportMetric_quantity: 'Quantity',
    reportMetric_total: 'Total', reportMetric_paid: 'Paid', reportMetric_due: 'Amount due',
    reportMetric_debt: 'Debt', reportMetric_period_purchases: 'Purchases in period',
    reportMetric_total_payments: 'Total payments', reportMetric_purchases: 'Purchases',
    reportMetric_refunded: 'Refunded', reportMetric_in: 'Cash in', reportMetric_out: 'Cash out',
    reportMetric_variance: 'Cash variance', reportMetric_products: 'Products',
    reportMetric_categories: 'Categories', reportMetric_units: 'Units',
    reportColId: 'ID', subtotal: 'Subtotal', discount: 'Discount', cogs: 'COGS', grossProfit: 'Gross profit',
    customer: 'Customer', sku: 'SKU', category: 'Category', unit: 'Unit',
    purchasePrice: 'Purchase price', sellingPrice: 'Selling price', wholesalePrice: 'Wholesale price',
    totalPurchaseValue: 'Total purchase value', totalSellingValue: 'Total selling value',
    expiryDate: 'Expiry date', stockValue: 'Stock value', unitMargin: 'Unit margin',
    profitMargin: 'Profit margin', quantitySold: 'Quantity sold', damageReason: 'Damage reason',
    previous: 'Previous', new: 'New', supplier: 'Supplier', paidAmount: 'Paid amount', due: 'Due',
    direction: 'Direction', sourceType: 'Source type',
    sourceId: 'Source ID', company: 'Company', totalPaid: 'Total paid', invoiceCount: 'Invoices',
    periodSales: 'Sales in period', purchaseCount: 'Purchase count', periodPurchases: 'Purchases in period',
    closedAt: 'Closed at', role: 'Role', lastLogin: 'Last login',
    action: 'Action', entity: 'Entity', entityId: 'Entity ID', nameEnglish: 'English name',
    nameArabic: 'Arabic name', productCount: 'Products', stockQuantity: 'Stock quantity',
    payment_CASH: 'Cash', payment_CARD: 'Card', payment_CREDIT: 'Credit', payment_BANK: 'Bank',
    reportStatus_PAID: 'Paid', reportStatus_PARTIAL: 'Partially paid', reportStatus_DUE: 'Due',
    reportStatus_ACTIVE: 'Active', reportStatus_INACTIVE: 'Inactive', reportStatus_LOW: 'Low stock',
    reportStatus_OUT: 'Out of stock', reportStatus_NEGATIVE: 'Negative stock',
    reportStatus_EXPIRED: 'Expired', reportStatus_EXPIRING: 'Expiring soon',
    reportStatus_SLOW: 'Slow-moving', reportStatus_FAST: 'Fast-moving',
    reportStatus_CASH_IN: 'Cash in', reportStatus_CASH_OUT: 'Cash out', reportStatus_SALE: 'Sale',
    reportStatus_RETURN: 'Return', reportStatus_EXPENSE: 'Expense', reportStatus_ADJUSTMENT: 'Adjustment',
    reportStatus_SHIFT_ADJUSTMENT: 'Shift adjustment', reportStatus_PURCHASE: 'Purchase',
    reportStatus_DAMAGE: 'Damage', reportStatus_OTHER: 'Other', reportStatus_CREATE: 'Created',
    reportStatus_UPDATE: 'Updated', reportStatus_DELETE: 'Deleted', reportStatus_PAYMENT: 'Payment',
    reportStatus_CASH: 'Cash', reportStatus_CARD: 'Card', reportStatus_CREDIT: 'Credit',
    reportStatus_BANK: 'Bank', reportStatus_IN: 'In',
  },
  ar: {
    'damaged-products': 'المنتجات التالفة',
    dashboard: 'لوحة المعلومات', pos: 'نقطة البيع', products: 'المنتجات', categories: 'الفئات', units: 'الوحدات',
    cashier: 'الكاشير',
    inventory: 'المخزون',
    purchases: 'المشتريات', returns: 'مرتجعات المبيعات', customers: 'العملاء', suppliers: 'الموردون',
    expenses: 'المصروفات', 'cash-register': 'الصندوق', reports: 'التقارير', users: 'المستخدمون', settings: 'الإعدادات', backup: 'نسخ البيانات احتياطيًا', activityLogs: 'سجل النشاط', 'activity-logs': 'سجل النشاط',
    backupDescription: 'نزّل جميع بيانات المتجر والإعدادات في ملف SQL.',
    backupSecurityNote: 'تتضمن النسخة تجزئات كلمات مرور المستخدمين لنقل الحسابات، ولا تتضمن رموز الوصول. احفظ الملف بأمان.',
    backupImportInstruction: 'ثبّت الإصدار نفسه من التطبيق في النظام الجديد وشغّل الترحيلات، ثم استورد ملف SQL إلى قاعدة بيانات فارغة.',
    createBackup: 'إنشاء نسخة احتياطية',
    backupReady: 'تم تنزيل النسخة الاحتياطية بنجاح.',
    search: 'بحث', actions: 'الإجراءات', add: 'إضافة', edit: 'تعديل', delete: 'حذف', save: 'حفظ', cancel: 'إلغاء',
    confirm: 'تأكيد', loading: 'جار التحميل...', noData: 'لا توجد بيانات', name: 'الاسم', phone: 'الهاتف',
    address: 'العنوان', date: 'التاريخ', status: 'الحالة', quantity: 'الكمية', barcode: 'الباركود', price: 'السعر',
    total: 'الإجمالي', notes: 'ملاحظات', language: 'اللغة', theme: 'المظهر', login: 'تسجيل الدخول', logout: 'تسجيل الخروج',
    username: 'اسم المستخدم', password: 'كلمة المرور', addProduct: 'إضافة منتج', addCustomer: 'إضافة عميل',
    showPassword: 'إظهار كلمة المرور', hidePassword: 'إخفاء كلمة المرور',
    addSupplier: 'إضافة مورد', addPurchase: 'تسجيل مشتريات', editPurchase: 'تعديل المشتريات',
    addExpense: 'إضافة مصروف', addCategory: 'إضافة فئة',
    addUnit: 'إضافة وحدة', customerDebts: 'ديون العملاء', debt: 'الدين', payDebt: 'تسجيل دفعة',
    totalPurchases: 'إجمالي المشتريات', paymentMethod: 'طريقة الدفع', cash: 'نقداً', card: 'بطاقة', credit: 'آجل',
    totalSoldQuantity: 'إجمالي الكمية المباعة', totalPurchasedQuantity: 'إجمالي الكمية المشتراة',
    print: 'طباعة', appTagline: 'نظام إدارة المتجر', openModule: 'فتح', allModules: 'كل الأقسام',
    cashBalance: 'رصيد الصندوق', cashIn: 'إيداع نقدي', cashOut: 'سحب نقدي',
    cashSales: 'المبيعات النقدية', cashReturns: 'المبالغ المستردة', cashAdjustments: 'التسويات',
    cashTransactions: 'معاملات الصندوق', transactionNumber: 'رقم المعاملة', transactionType: 'نوع المعاملة',
    balanceBefore: 'الرصيد السابق', balanceAfter: 'الرصيد اللاحق', reason: 'السبب', performedBy: 'بواسطة',
    amount: 'المبلغ', allTypes: 'كل الأنواع', allUsers: 'كل المستخدمين',
    fromDate: 'من تاريخ', toDate: 'إلى تاريخ', timeOfDay: 'وقت اليوم', allDay: 'كل الأوقات',
    time_morning: 'الصباح (05:00–12:00)', time_noon: 'الظهر (12:00–17:00)',
    time_evening: 'المساء (17:00–19:00)', time_maghrib: 'المغرب (19:00–20:00)',
    time_night: 'الليل (20:00–24:00)', time_midnight: 'منتصف الليل (00:00–05:00)',
    exportCsv: 'تصدير CSV', printReport: 'طباعة التقرير',
    openShift: 'فتح الوردية', closeShift: 'إغلاق الوردية', shiftOpen: 'الوردية مفتوحة',
    openingBalance: 'الرصيد الافتتاحي', expectedBalance: 'الرصيد المتوقع',
    countedBalance: 'الرصيد المعدود', shiftVariance: 'الفرق', shiftOpenedBy: 'أمين الصندوق',
    enterReason: 'أدخل السبب', cashInSource: 'مصدر النقد', other: 'سبب آخر',
    manualTransaction: 'معاملة يدوية', cashInType: 'إيداع', cashOutType: 'سحب',
    cashSaleType: 'بيع نقدي', returnType: 'استرداد', customerPaymentType: 'دفعة عميل',
    supplierPaymentType: 'دفعة مورد', expenseType: 'مصروف', adjustmentType: 'تسوية',
    transactionStatus: 'الحالة', completed: 'مكتملة', noOpenShift: 'لا توجد وردية مفتوحة',
    confirmCashOut: 'هل أنت متأكد من سحب هذا المبلغ؟',
    confirmCloseCashRegister: 'هل تريد إغلاق الوردية وتسجيل فرق النقد؟',
    cashOutReason: 'سبب السحب', cashInReason: 'سبب الإيداع', searchTransaction: 'البحث برقم المعاملة',
    capitalSource: 'رأس مال مضاف', otherSource: 'مصدر آخر', transferReason: 'تحويل نقدي', recipient: 'المستلم',
    reportCenterDescription: 'تقارير وتحليلات تفصيلية من بيانات المتجر الحقيقية.',
    reportNavigation: 'أقسام التقارير', reportNoData: 'لا توجد سجلات تطابق هذه المرشحات.',
    reportTitle: 'عنوان التقرير', sortReportBy: 'ترتيب حسب', generatedAt: 'تاريخ الإنشاء', dateRange: 'الفترة الزمنية',
    reportMetric: 'المؤشر', reportValue: 'القيمة', previousPeriod: 'مقارنة بالفترة السابقة',
    exportExcel: 'تصدير Excel', printPdf: 'طباعة / حفظ PDF', totalRecords: 'إجمالي السجلات',
    allCategories: 'كل الفئات', allCustomers: 'كل العملاء', allSuppliers: 'كل الموردين',
    allUnits: 'كل الوحدات', allPaymentMethods: 'كل طرق الدفع', allStatuses: 'كل الحالات',
    report_overview: 'نظرة عامة', report_sales: 'المبيعات ونقطة البيع', report_products: 'المنتجات والمخزون',
    report_movements: 'حركات المخزون', report_damaged: 'المنتجات التالفة', report_purchases: 'المشتريات',
    report_suppliers: 'الموردون والديون', 'report_supplier-payments': 'مدفوعات الموردين',
    report_customers: 'العملاء والديون', 'report_customer-payments': 'مدفوعات العملاء',
    report_expenses: 'المصروفات', report_returns: 'المرتجعات والمبالغ المستردة',
    report_cash: 'حركات الصندوق', report_shifts: 'الورديات والتسوية',
    report_users: 'أداء المستخدمين', report_activity: 'سجل النشاط',
    report_categories: 'الفئات', report_units: 'الوحدات والقياسات',
    reportMetric_total_sales: 'صافي المبيعات بعد المرتجعات', reportMetric_gross_sales: 'إجمالي المبيعات',
    reportMetric_gross_profit: 'إجمالي الربح', reportMetric_net_profit: 'صافي الربح بعد المصروفات',
    reportMetric_total_purchases: 'إجمالي المشتريات', reportMetric_expenses: 'المصروفات',
    reportMetric_cash_balance: 'رصيد الصندوق الحالي', reportMetric_customer_debt: 'ديون العملاء',
    reportMetric_supplier_debt: 'ديون الموردين', reportMetric_cogs: 'تكلفة البضائع المباعة',
    reportMetric_invoices: 'الفواتير', reportMetric_returns: 'المبالغ المستردة',
    reportMetric_discounts: 'الخصومات',
    reportMetric_average_invoice: 'متوسط الفاتورة', reportMetric_total_products: 'المنتجات',
    reportMetric_low_stock: 'مخزون منخفض', reportMetric_out_of_stock: 'نفد المخزون',
    reportMetric_customers: 'العملاء', reportMetric_suppliers: 'الموردون',
    reportMetric_users: 'المستخدمون النشطون', reportMetric_cash_in: 'نقد داخل الصندوق',
    reportMetric_cash_out: 'نقد خارج الصندوق', reportMetric_count: 'السجلات',
    reportMetric_revenue: 'إيرادات المبيعات', reportMetric_net_sales: 'صافي المبيعات بعد المرتجعات',
    reportMetric_profit: 'الربح',
    reportMetric_stock_value: 'قيمة المخزون', reportMetric_quantity: 'الكمية',
    reportMetric_total: 'الإجمالي', reportMetric_paid: 'المدفوع', reportMetric_due: 'المتبقي',
    reportMetric_debt: 'الدين', reportMetric_period_purchases: 'مشتريات الفترة',
    reportMetric_total_payments: 'إجمالي المدفوعات', reportMetric_purchases: 'المشتريات',
    reportMetric_refunded: 'المبالغ المستردة', reportMetric_in: 'نقد داخل', reportMetric_out: 'نقد خارج',
    reportMetric_variance: 'فرق الصندوق', reportMetric_products: 'المنتجات',
    reportMetric_categories: 'الفئات', reportMetric_units: 'الوحدات',
    reportColId: 'المعرف', subtotal: 'المجموع الفرعي', discount: 'الخصم',
    cogs: 'تكلفة البضائع',     grossProfit: 'إجمالي الربح',
    customer: 'العميل', sku: 'رمز المنتج', category: 'الفئة', unit: 'الوحدة',
    purchasePrice: 'سعر الشراء', sellingPrice: 'سعر البيع', wholesalePrice: 'سعر الجملة',
    totalPurchaseValue: 'إجمالي قيمة الشراء', totalSellingValue: 'إجمالي قيمة البيع',
    expiryDate: 'تاريخ الانتهاء', stockValue: 'قيمة المخزون', unitMargin: 'هامش الوحدة',
    profitMargin: 'هامش الربح', quantitySold: 'الكمية المباعة', damageReason: 'سبب التلف',
    previous: 'السابق', new: 'الجديد', supplier: 'المورد', paidAmount: 'المبلغ المدفوع',
    due: 'المتبقي', direction: 'الاتجاه',
    sourceType: 'نوع المصدر', sourceId: 'معرف المصدر', company: 'الشركة',
    totalPaid: 'إجمالي المدفوع', invoiceCount: 'الفواتير', periodSales: 'مبيعات الفترة',
    purchaseCount: 'عدد المشتريات', periodPurchases: 'مشتريات الفترة', closedAt: 'وقت الإغلاق',
    role: 'الدور', lastLogin: 'آخر تسجيل دخول', action: 'الإجراء', entity: 'الكيان',
    entityId: 'معرف الكيان', nameEnglish: 'الاسم بالإنجليزية', nameArabic: 'الاسم بالعربية',
    productCount: 'المنتجات', stockQuantity: 'كمية المخزون',
    payment_CASH: 'نقداً', payment_CARD: 'بطاقة', payment_CREDIT: 'آجل', payment_BANK: 'بنك',
    reportStatus_PAID: 'مدفوع', reportStatus_PARTIAL: 'مدفوع جزئياً', reportStatus_DUE: 'مستحق',
    reportStatus_ACTIVE: 'نشط', reportStatus_INACTIVE: 'غير نشط', reportStatus_LOW: 'مخزون منخفض',
    reportStatus_OUT: 'نفد المخزون', reportStatus_NEGATIVE: 'مخزون سالب',
    reportStatus_EXPIRED: 'منتهي الصلاحية', reportStatus_EXPIRING: 'قارب على الانتهاء',
    reportStatus_SLOW: 'بطيء الحركة', reportStatus_FAST: 'سريع الحركة',
    reportStatus_CASH_IN: 'إيداع نقدي', reportStatus_CASH_OUT: 'سحب نقدي',
    reportStatus_SALE: 'بيع', reportStatus_RETURN: 'مرتجع', reportStatus_EXPENSE: 'مصروف',
    reportStatus_ADJUSTMENT: 'تسوية', reportStatus_SHIFT_ADJUSTMENT: 'تسوية الوردية',
    reportStatus_PURCHASE: 'شراء', reportStatus_DAMAGE: 'تالف', reportStatus_OTHER: 'أخرى',
    reportStatus_CREATE: 'إنشاء', reportStatus_UPDATE: 'تحديث', reportStatus_DELETE: 'حذف',
    reportStatus_PAYMENT: 'دفعة', reportStatus_CASH: 'نقداً', reportStatus_CARD: 'بطاقة',
    reportStatus_CREDIT: 'آجل', reportStatus_BANK: 'بنك', reportStatus_IN: 'داخل',
    todaySales: 'مبيعات اليوم', todayProfit: 'أرباح اليوم', totalProducts: 'إجمالي المنتجات', lowStockItems: 'مخزون منخفض',
    outOfStock: 'نفد المخزون', inStock: 'متوفر', lowStock: 'مخزون منخفض', stockAdjustment: 'تعديل المخزون',
    invoiceNumber: 'رقم الفاتورة', purchaseReceiptImage: 'صورة فاتورة الشراء',
    totalAmount: 'المبلغ', error: 'خطأ', itemDeleted: 'تم الحذف بنجاح',
  },
};

const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  ku: Object.fromEntries([
      ["actions", "کردارەکان"],
      ["active", "چالاک"],
      ["addItem", "زیادکردنی کاڵا"],
      ["addUser", "زیادکردنی بەکارهێنەر"],
      ["adjustmentManual", "ڕێکخستنی دەستی"],
      ["allCaughtUp", "هەموو شتێک ڕێکە"],
      ["analyticsView", "شیکاری"],
      ["apply", "جێبەجێکردن"],
      ["cart", "سەبەتە"],
      ["cashReceived", "پارەی وەرگیراو"],
      ["cashAmountBelowTotal", "پارەی وەرگیراو نابێت لە کۆی گشتی کەمتر بێت"],
      ["cashierMode", "دۆخی کاشێر"],
      ["fullScreen", "دۆخی شاشەی تەواو"],
      ["exitFullScreen", "گەڕانەوە بۆ شاشەی ئاسایی"],
      ["cashierName", "ناوی کاشێر"],
      ["category", "پۆل"],
      ["changeAmount", "پارەی گەڕاوە"],
      ["cogs", "تێچووی کاڵای فرۆشراو"],
      ["company", "کۆمپانیا"],
      ["completeSale", "تەواوکردنی فرۆشتن"],
      ["currentStock", "کۆگای ئێستا"],
      ["customRange", "ماوەی دیاریکراو"],
      ["customer", "کڕیار"],
      ["damage", "زیان"],
      ["decrease", "کەمکردنەوە"],
      ["defaultLanguage", "زمانی بنەڕەت"],
      ["deleteCategory", "سڕینەوەی پۆل"],
      ["deleteConfirm", "دڵنیایت لە سڕینەوە؟"],
      ["deleteCustomer", "سڕینەوەی کڕیار"],
      ["deleteExpense", "سڕینەوەی خەرجی"],
      ["deleteUnit", "سڕینەوەی یەکە"],
      ["description", "وەسف"],
      ["discount", "داشکاندن"],
      ["exitCashierMode", "دەرچوون لە دۆخی کاشێر"],
      ["expired", "بەسەرچوو"],
      ["expiryDate", "بەرواری بەسەرچوون"],
      ["exportCSV", "هەناردەکردنی CSV"],
      ["grandTotal", "کۆی گشتی"],
      ["grossProfit", "قازانجی گشتی"],
      ["homeModules", "بەشەکانی سەرەکی"],
      ["increase", "زیادکردن"],
      ["inventoryOverview", "پوختەی کۆگا"],
      ["invoiceCount", "ژمارەی پسوڵەکان"],
      ["invoiceDate", "بەرواری پسوڵە"],
      ["invoiceNotFound", "پسوڵەکە نەدۆزرایەوە"],
      ["items", "کاڵاکان"],
      ["loginFailed", "چوونەژوورەوە سەرکەوتوو نەبوو"],
      ["minStock", "کەمترین بڕ بۆ ئاگاداری"],
      ["nameAr", "ناو بە عەرەبی"],
      ["nameEn", "ناو بە ئینگلیزی"],
      ["nameKu", "ناو بە کوردی"],
      ["productName", "ناوی کاڵا"],
      ["netProfit", "قازانجی پاک"],
      ["newQuantity", "بڕی نوێ"],
      ["onlyWithDebt", "تەنها قەرزداران"],
      ["openTerminal", "کردنەوەی کاشێر"],
      ["other", "هیتر"],
      ["paid", "دراو"],
      ["printInvoice", "چاپکردنی پسوڵە"],
      ["printReceipt", "چاپکردنی وەسڵ"],
      ["processReturn", "تۆمارکردنی گەڕاندنەوە"],
      ["productNotFound", "کاڵا نەدۆزرایەوە"],
      ["purchasePrice", "نرخی کڕین"],
      ["receiptThankYou", "سوپاس بۆ سەردانەکەتان"],
      ["receiptThermal58", "پرینتەری گەرمایی ٥٨ ملم"],
      ["receiptThermal80", "پرینتەری گەرمایی ٨٠ ملم"],
      ["receiptTitle", "وەسڵی فرۆشتن"],
      ["recentTransactions", "مامەڵە نوێیەکان"],
      ["refresh", "نوێکردنەوە"],
      ["refundTotal", "کۆی گەڕاندنەوە"],
      ["returnHistory", "مێژووی گەڕاندنەوە"],
      ["returnProcessed", "گەڕاندنەوەکە تۆمار کرا"],
      ["returnQuantity", "بڕی گەڕێنراوە"],
      ["alreadyReturned", "پێشتر گەڕێنراوە"],
      ["returnableQuantity", "ماوە بۆ گەڕاندنەوە"],
      ["returnQuantityTooHigh", "بڕی گەڕاندنەوە لە بڕی فرۆشراو زیاترە"],
      ["returnReason", "هۆکاری گەڕاندنەوە"],
      ["sales", "فرۆشتن"],
      ["salesByCategory", "فرۆشتن بەپێی پۆل"],
      ["salesTrend", "ڕەوتی فرۆشتن"],
      ["searchModules", "گەڕان بەدوای بەشەکاندا"],
      ["selectCustomerForCredit", "بۆ فرۆشتنی قەرز، تکایە کڕیارێک هەڵبژێرە"],
      ["selectReturnQuantity", "بڕی گەڕاندنەوە دیاری بکە"],
      ["shortCode", "کۆدی کورت"],
      ["stockMovements", "جوڵەکانی کۆگا"],
      ["storeInformation", "زانیاری فرۆشگا"],
      ["systemStatusOperational", "سیستەم کار دەکات"],
      ["thisMonth", "ئەم مانگە"],
      ["thisWeek", "ئەم هەفتەیە"],
      ["thisYear", "ئەم ساڵە"],
      ["today", "ئەمڕۆ"],
      ["topSellingProducts", "کاڵا پرفرۆشەکان"],
      ["totalExpenses", "کۆی خەرجییەکان"],
      ["totalInventoryValue", "بەهای کۆگا"],
      ["unit", "یەکە"],
      ["view", "بینین"],
      ["welcomeBack", "بەخێربێیتەوە"],
      ["wholesalePrice", "نرخی جوملە"],
      ["yesterday", "دوێنێ"],
      ["yes", "بەڵێ"],
      ["no", "نەخێر"],
      ["light", "ڕووناک"],
      ["dark", "تاریک"],
      ["role", "ڕۆڵ"],
      ["status", "دۆخ"],
      ["name", "ناو"],
      ["address", "ناونیشان"],
      ["date", "بەروار"],
      ["phone", "تەلەفۆن"],
      ["quantity", "بڕ"],
      ["barcode", "بارکۆد"],
      ["price", "نرخ"],
      ["sellingPrice", "نرخی فرۆشتن"],
      ["total", "کۆ"],
      ["notes", "تێبینی"],
      ["language", "زمان"],
      ["theme", "ڕووکار"],
      ["login", "چوونەژوورەوە"],
      ["logout", "چوونەدەرەوە"],
      ["password", "وشەی نهێنی"],
      ["username", "ناوی بەکارهێنەر"],
      ["products", "کاڵاکان"],
      ["purchases", "کڕین"],
      ["reports", "ڕاپۆرتەکان"],
      ["settings", "ڕێکخستنەکان"],
      ["suppliers", "دابینکەران"],
      ["customers", "کڕیاران"],
      ["categories", "پۆلەکان"],
      ["units", "یەکەکان"],
      ["expenses", "خەرجییەکان"],
      ["inventory", "جووڵەکانی کۆگا"],
      ["pos", "خاڵی فرۆشتن"],
      ["returns", "گەڕاندنەوەی فرۆشتن"],
      ["activityLogs", "تۆماری چالاکی"],
      ["customerDebts", "قەرزی کڕیاران"],
      ["paymentMethod", "شێوازی پارەدان"],
      ["appTagline", "سیستەمی بەڕێوەبردنی فرۆشگا"],
      ["openModule", "کردنەوە"],
      ["lowStock", "کۆگای کەم"],
      ["lowStockItems", "کاڵای کۆگاکەم"],
      ["outOfStock", "لە کۆگا نەماوە"],
      ["inStock", "لە کۆگادایە"],
      ["todayProfit", "قازانجی ئەمڕۆ"],
      ["todaySales", "فرۆشی ئەمڕۆ"],
      ["totalProducts", "کۆی کاڵاکان"],
      ["totalAmount", "بڕی پارە"],
      ["subtotal", "کۆی لاوەکی"],
      ["cash", "نەقد"],
      ["card", "کارت"],
      ["credit", "قەرز"],
      ["edit", "دەستکاری"],
      ["delete", "سڕینەوە"],
      ["save", "پاشەکەوتکردن"],
      ["cancel", "پاشگەزبوونەوە"],
      ["confirm", "پشتڕاستکردنەوە"],
      ["loading", "بارکردن..."],
      ["noData", "هیچ داتایەک نییە"],
      ["error", "هەڵە"],
      ["itemDeleted", "بە سەرکەوتوویی سڕایەوە"],
      ["addCategory", "زیادکردنی پۆل"],
      ["addCustomer", "زیادکردنی کڕیار"],
      ["addExpense", "زیادکردنی خەرجی"],
      ["addProduct", "زیادکردنی کاڵا"],
      ["addPurchase", "تۆمارکردنی کڕین"],
      ["addSupplier", "زیادکردنی دابینکەر"],
      ["addUnit", "زیادکردنی یەکە"],
      ["saved", "پاشەکەوت کرا"],
      ["search", "گەڕان"],
      ["supplier", "دابینکەر"],
      ["role", "ڕۆڵ"],
      ["addUser", "زیادکردنی بەکارهێنەر"],
      ["active", "چالاک"],
      ["inactive", "ناچالاک"],
      ["suspended", "ڕاگیراو"],
      ["allowNegativeStock", "ڕێگەدان بە کۆگای نەرێنی"],
      ["defaultLanguage", "زمانی بنەڕەت"],
      ["paid", "دراو"],
      ["debt", "قەرز"],
      ["payDebt", "دانەوەی قەرز"],
      ["totalPurchases", "کۆی کڕین"],
      ["description", "وەسف"],
      ["expiryDate", "بەرواری بەسەرچوون"],
      ["minStock", "کەمترین بڕ بۆ ئاگاداری"],
      ["invoiceNumber", "ژمارەی پسوڵە"],
      ["print", "چاپکردن"],
      ["cart", "سەبەتە"],
      ["cashierMode", "دۆخی کاشێر"],
      ["completeSale", "تەواوکردنی فرۆشتن"],
      ["walkInCustomer", "کڕیاری ئاسایی"],
      ["weightKg", "کێش (کیلۆگرام)"],
      ["discount", "داشکاندن"],
      ["cashReceived", "پارەی وەرگیراو"],
      ["grandTotal", "کۆی گشتی"],
      ["changeAmount", "پارەی گەڕاوە"]
  ]) as Record<string, string>,
  en: Object.fromEntries([
      ["actions", "Actions"],
      ["active", "Active"],
      ["addItem", "Add item"],
      ["addUser", "Add user"],
      ["adjustmentManual", "Manual adjustment"],
      ["allCaughtUp", "You are all caught up"],
      ["analyticsView", "Analytics"],
      ["apply", "Apply"],
      ["cart", "Cart"],
      ["cashReceived", "Cash received"],
      ["cashAmountBelowTotal", "Cash received must be at least the total."],
      ["cashierMode", "Cashier mode"],
      ["fullScreen", "Full screen"],
      ["exitFullScreen", "Exit full screen"],
      ["cashierName", "Cashier name"],
      ["category", "Category"],
      ["changeAmount", "Change"],
      ["cogs", "Cost of goods sold"],
      ["company", "Company"],
      ["completeSale", "Complete sale"],
      ["weightKg", "Weight (kg)"],
      ["currentStock", "Current stock"],
      ["customRange", "Custom range"],
      ["customer", "Customer"],
      ["damage", "Damaged"],
      ["decrease", "Decrease"],
      ["defaultLanguage", "Default language"],
      ["deleteCategory", "Delete category"],
      ["deleteConfirm", "Are you sure you want to delete this?"],
      ["deleteCustomer", "Delete customer"],
      ["deleteExpense", "Delete expense"],
      ["deleteUnit", "Delete unit"],
      ["description", "Description"],
      ["discount", "Discount"],
      ["exitCashierMode", "Exit cashier mode"],
      ["expired", "Expired"],
      ["expiryDate", "Expiry date"],
      ["exportCSV", "Export CSV"],
      ["grandTotal", "Grand total"],
      ["grossProfit", "Gross profit"],
      ["homeModules", "Main modules"],
      ["increase", "Increase"],
      ["inventoryOverview", "Inventory overview"],
      ["invoiceCount", "Invoice count"],
      ["invoiceDate", "Invoice date"],
      ["invoiceNotFound", "Invoice not found"],
      ["items", "Items"],
      ["loginFailed", "Login failed"],
      ["minStock", "Minimum quantity for alert"],
      ["nameAr", "Arabic name"],
      ["nameEn", "English name"],
      ["nameKu", "Kurdish name"],
      ["productName", "Product name"],
      ["netProfit", "Net profit"],
      ["newQuantity", "New quantity"],
      ["onlyWithDebt", "With debt only"],
      ["openTerminal", "Open cashier"],
      ["other", "Other"],
      ["paid", "Paid"],
      ["printInvoice", "Print invoice"],
      ["printReceipt", "Print receipt"],
      ["processReturn", "Process return"],
      ["productNotFound", "Product not found"],
      ["purchasePrice", "Purchase price"],
      ["receiptThankYou", "Thank you for your visit"],
      ["receiptThermal58", "58 mm thermal printer"],
      ["receiptThermal80", "80 mm thermal printer"],
      ["receiptTitle", "Sales receipt"],
      ["recentTransactions", "Recent transactions"],
      ["refresh", "Refresh"],
      ["refundTotal", "Total refund"],
      ["returnHistory", "Return history"],
      ["returnProcessed", "Return processed"],
      ["returnQuantity", "Return quantity"],
      ["alreadyReturned", "Already returned"],
      ["returnableQuantity", "Remaining returnable"],
      ["returnQuantityTooHigh", "Return quantity exceeds amount sold"],
      ["returnReason", "Return reason"],
      ["sales", "Sales"],
      ["salesByCategory", "Sales by category"],
      ["salesTrend", "Sales trend"],
      ["searchModules", "Search modules"],
      ["selectCustomerForCredit", "Select a customer for credit sales"],
      ["selectReturnQuantity", "Select return quantity"],
      ["shortCode", "Short code"],
      ["stockMovements", "Stock movements"],
      ["storeInformation", "Store information"],
      ["systemStatusOperational", "System operational"],
      ["thisMonth", "This month"],
      ["thisWeek", "This week"],
      ["thisYear", "This year"],
      ["today", "Today"],
      ["topSellingProducts", "Top-selling products"],
      ["totalExpenses", "Total expenses"],
      ["totalInventoryValue", "Inventory value"],
      ["unit", "Unit"],
      ["view", "View"],
      ["welcomeBack", "Welcome back"],
      ["wholesalePrice", "Wholesale price"],
      ["yesterday", "Yesterday"],
      ["yes", "Yes"],
      ["no", "No"],
      ["light", "Light"],
      ["dark", "Dark"],
      ["role", "Role"],
      ["status", "Status"],
      ["name", "Name"],
      ["address", "Address"],
      ["date", "Date"],
      ["phone", "Phone"],
      ["quantity", "Quantity"],
      ["barcode", "Barcode"],
      ["price", "Price"],
      ["sellingPrice", "Selling price"],
      ["total", "Total"],
      ["notes", "Notes"],
      ["language", "Language"],
      ["theme", "Theme"],
      ["login", "Sign in"],
      ["logout", "Sign out"],
      ["password", "Password"],
      ["username", "Username"],
      ["products", "Products"],
      ["purchases", "Purchases"],
      ["reports", "Reports"],
      ["settings", "Settings"],
      ["suppliers", "Suppliers"],
      ["customers", "Customers"],
      ["categories", "Categories"],
      ["units", "Units"],
      ["expenses", "Expenses"],
      ["inventory", "Stock movements"],
      ["pos", "Point of sale"],
      ["returns", "Sales returns"],
      ["activityLogs", "Activity log"],
      ["customerDebts", "Customer debts"],
      ["paymentMethod", "Payment method"],
      ["appTagline", "Supermarket management system"],
      ["openModule", "Open"],
      ["lowStock", "Low stock"],
      ["lowStockItems", "Low-stock items"],
      ["outOfStock", "Out of stock"],
      ["inStock", "In stock"],
      ["todayProfit", "Today's profit"],
      ["todaySales", "Today's sales"],
      ["totalProducts", "Total products"],
      ["totalAmount", "Amount"],
      ["subtotal", "Subtotal"],
      ["cash", "Cash"],
      ["card", "Card"],
      ["credit", "Credit"],
      ["edit", "Edit"],
      ["delete", "Delete"],
      ["save", "Save"],
      ["cancel", "Cancel"],
      ["confirm", "Confirm"],
      ["loading", "Loading..."],
      ["noData", "No data found"],
      ["error", "Error"],
      ["itemDeleted", "Deleted successfully"],
      ["addCategory", "Add category"],
      ["addCustomer", "Add customer"],
      ["addExpense", "Add expense"],
      ["addProduct", "Add product"],
      ["addPurchase", "Record purchase"],
      ["addSupplier", "Add supplier"],
      ["addUnit", "Add unit"],
      ["saved", "Saved"],
      ["search", "Search"],
      ["supplier", "Supplier"],
      ["addUser", "Add user"],
      ["active", "Active"],
      ["inactive", "Inactive"],
      ["suspended", "Suspended"],
      ["allowNegativeStock", "Allow negative stock"],
      ["paid", "Paid"],
      ["debt", "Debt"],
      ["payDebt", "Record payment"],
      ["totalPurchases", "Total purchases"],
      ["description", "Description"],
      ["expiryDate", "Expiry date"],
      ["minStock", "Minimum quantity for alert"],
      ["invoiceNumber", "Invoice number"],
      ["print", "Print"],
      ["cart", "Cart"],
      ["cashierMode", "Cashier mode"],
      ["completeSale", "Complete sale"],
      ["walkInCustomer", "Walk-in customer"],
      ["discount", "Discount"],
      ["cashReceived", "Cash received"],
      ["grandTotal", "Grand total"],
      ["changeAmount", "Change"]
  ]) as Record<string, string>,
  ar: Object.fromEntries([
      ["actions", "الإجراءات"],
      ["active", "نشط"],
      ["addItem", "إضافة صنف"],
      ["addUser", "إضافة مستخدم"],
      ["adjustmentManual", "تعديل يدوي"],
      ["allCaughtUp", "كل شيء محدث"],
      ["analyticsView", "التحليلات"],
      ["apply", "تطبيق"],
      ["cart", "السلة"],
      ["cashReceived", "المبلغ المستلم"],
      ["cashAmountBelowTotal", "يجب ألا يقل المبلغ المستلم عن الإجمالي."],
      ["cashierMode", "وضع الكاشير"],
      ["fullScreen", "ملء الشاشة"],
      ["exitFullScreen", "الخروج من ملء الشاشة"],
      ["cashierName", "اسم الكاشير"],
      ["category", "الفئة"],
      ["changeAmount", "الباقي"],
      ["cogs", "تكلفة البضائع المباعة"],
      ["company", "الشركة"],
      ["completeSale", "إتمام البيع"],
      ["weightKg", "الوزن (كغم)"],
      ["currentStock", "المخزون الحالي"],
      ["customRange", "نطاق مخصص"],
      ["customer", "العميل"],
      ["damage", "تالف"],
      ["decrease", "تقليل"],
      ["defaultLanguage", "اللغة الافتراضية"],
      ["deleteCategory", "حذف الفئة"],
      ["deleteConfirm", "هل أنت متأكد من الحذف؟"],
      ["deleteCustomer", "حذف العميل"],
      ["deleteExpense", "حذف المصروف"],
      ["deleteUnit", "حذف الوحدة"],
      ["description", "الوصف"],
      ["discount", "الخصم"],
      ["exitCashierMode", "الخروج من وضع الكاشير"],
      ["expired", "منتهي الصلاحية"],
      ["expiryDate", "تاريخ انتهاء الصلاحية"],
      ["exportCSV", "تصدير CSV"],
      ["grandTotal", "الإجمالي الكلي"],
      ["grossProfit", "إجمالي الربح"],
      ["homeModules", "الأقسام الرئيسية"],
      ["increase", "زيادة"],
      ["inventoryOverview", "نظرة عامة على المخزون"],
      ["invoiceCount", "عدد الفواتير"],
      ["invoiceDate", "تاريخ الفاتورة"],
      ["invoiceNotFound", "لم يتم العثور على الفاتورة"],
      ["items", "الأصناف"],
      ["loginFailed", "فشل تسجيل الدخول"],
      ["minStock", "الحد الأدنى للكمية للتنبيه"],
      ["nameAr", "الاسم بالعربية"],
      ["nameEn", "الاسم بالإنجليزية"],
      ["nameKu", "الاسم بالكردية"],
      ["productName", "اسم المنتج"],
      ["netProfit", "صافي الربح"],
      ["newQuantity", "الكمية الجديدة"],
      ["onlyWithDebt", "ذوو الديون فقط"],
      ["openTerminal", "فتح الكاشير"],
      ["other", "أخرى"],
      ["paid", "مدفوع"],
      ["printInvoice", "طباعة الفاتورة"],
      ["printReceipt", "طباعة الإيصال"],
      ["processReturn", "معالجة المرتجع"],
      ["productNotFound", "لم يتم العثور على المنتج"],
      ["purchasePrice", "سعر الشراء"],
      ["receiptThankYou", "شكراً لزيارتكم"],
      ["receiptThermal58", "طابعة حرارية 58 مم"],
      ["receiptThermal80", "طابعة حرارية 80 مم"],
      ["receiptTitle", "إيصال البيع"],
      ["recentTransactions", "المعاملات الأخيرة"],
      ["refresh", "تحديث"],
      ["refundTotal", "إجمالي المبلغ المسترد"],
      ["returnHistory", "سجل المرتجعات"],
      ["returnProcessed", "تمت معالجة المرتجع"],
      ["returnQuantity", "كمية الإرجاع"],
      ["alreadyReturned", "تم إرجاعه سابقًا"],
      ["returnableQuantity", "المتبقي للإرجاع"],
      ["returnQuantityTooHigh", "كمية الإرجاع تتجاوز الكمية المباعة"],
      ["returnReason", "سبب الإرجاع"],
      ["sales", "المبيعات"],
      ["salesByCategory", "المبيعات حسب الفئة"],
      ["salesTrend", "اتجاه المبيعات"],
      ["searchModules", "البحث في الأقسام"],
      ["selectCustomerForCredit", "اختر عميلاً للبيع الآجل"],
      ["selectReturnQuantity", "حدد كمية الإرجاع"],
      ["shortCode", "الرمز المختصر"],
      ["stockMovements", "حركات المخزون"],
      ["storeInformation", "معلومات المتجر"],
      ["systemStatusOperational", "النظام يعمل"],
      ["thisMonth", "هذا الشهر"],
      ["thisWeek", "هذا الأسبوع"],
      ["thisYear", "هذه السنة"],
      ["today", "اليوم"],
      ["topSellingProducts", "الأكثر مبيعاً"],
      ["totalExpenses", "إجمالي المصروفات"],
      ["totalInventoryValue", "قيمة المخزون"],
      ["unit", "الوحدة"],
      ["view", "عرض"],
      ["welcomeBack", "مرحباً بعودتك"],
      ["wholesalePrice", "سعر الجملة"],
      ["yesterday", "أمس"],
      ["yes", "نعم"],
      ["no", "لا"],
      ["light", "فاتح"],
      ["dark", "داكن"],
      ["role", "الدور"],
      ["status", "الحالة"],
      ["name", "الاسم"],
      ["address", "العنوان"],
      ["date", "التاريخ"],
      ["phone", "الهاتف"],
      ["quantity", "الكمية"],
      ["barcode", "الباركود"],
      ["price", "السعر"],
      ["sellingPrice", "سعر البيع"],
      ["total", "الإجمالي"],
      ["notes", "ملاحظات"],
      ["language", "اللغة"],
      ["theme", "المظهر"],
      ["login", "تسجيل الدخول"],
      ["logout", "تسجيل الخروج"],
      ["password", "كلمة المرور"],
      ["username", "اسم المستخدم"],
      ["products", "المنتجات"],
      ["purchases", "المشتريات"],
      ["reports", "التقارير"],
      ["settings", "الإعدادات"],
      ["suppliers", "الموردون"],
      ["customers", "العملاء"],
      ["categories", "الفئات"],
      ["units", "الوحدات"],
      ["expenses", "المصروفات"],
      ["inventory", "حركات المخزون"],
      ["pos", "نقطة البيع"],
      ["returns", "مرتجعات المبيعات"],
      ["activityLogs", "سجل النشاط"],
      ["customerDebts", "ديون العملاء"],
      ["paymentMethod", "طريقة الدفع"],
      ["appTagline", "نظام إدارة المتجر"],
      ["openModule", "فتح"],
      ["lowStock", "مخزون منخفض"],
      ["lowStockItems", "أصناف منخفضة المخزون"],
      ["outOfStock", "نفد المخزون"],
      ["inStock", "متوفر"],
      ["todayProfit", "أرباح اليوم"],
      ["todaySales", "مبيعات اليوم"],
      ["totalProducts", "إجمالي المنتجات"],
      ["totalAmount", "المبلغ"],
      ["subtotal", "المجموع الفرعي"],
      ["cash", "نقداً"],
      ["card", "بطاقة"],
      ["credit", "آجل"],
      ["edit", "تعديل"],
      ["delete", "حذف"],
      ["save", "حفظ"],
      ["cancel", "إلغاء"],
      ["confirm", "تأكيد"],
      ["loading", "جار التحميل..."],
      ["noData", "لا توجد بيانات"],
      ["error", "خطأ"],
      ["itemDeleted", "تم الحذف بنجاح"],
      ["addCategory", "إضافة فئة"],
      ["addCustomer", "إضافة عميل"],
      ["addExpense", "إضافة مصروف"],
      ["addProduct", "إضافة منتج"],
      ["addPurchase", "تسجيل مشتريات"],
      ["addSupplier", "إضافة مورد"],
      ["addUnit", "إضافة وحدة"],
      ["saved", "تم الحفظ"],
      ["search", "بحث"],
      ["supplier", "المورد"],
      ["addUser", "إضافة مستخدم"],
      ["active", "نشط"],
      ["inactive", "غير نشط"],
      ["suspended", "موقوف"],
      ["allowNegativeStock", "السماح بمخزون سالب"],
      ["debt", "الدين"],
      ["payDebt", "تسجيل دفعة"],
      ["totalPurchases", "إجمالي المشتريات"],
      ["invoiceNumber", "رقم الفاتورة"],
      ["print", "طباعة"],
      ["completeSale", "إتمام البيع"],
      ["walkInCustomer", "عميل نقدي"],
      ["changeAmount", "الباقي"]
  ]) as Record<string, string>,
};

const CONTEXTUAL_TRANSLATIONS: Record<Language, Record<string, string>> = {
  ku: {
    expiryAlerts: 'ئاگادارکردنەوەی بەسەرچوونی ماددەکان',
    expiryAlertsDescription: 'ئاگادارکردنەوەی بەرواری بەسەرچوونی کاڵاکانی کۆگا ڕێکبخە.',
    expiryAlertsEnabled: 'چالاککردنی ئاگادارکردنەوەکانی بەسەرچوون',
    expiryWarningDays: 'ماوەی ئاگادارکردنەوە (ڕۆژ)',
    expiryUrgentDays: 'ماوەی ئاگادارکردنەوەی خێرا (ڕۆژ)',
    expiryExpiredEnabled: 'ئاگادارکردنەوە بۆ کاڵای بەسەرچوو',
    expiryBellEnabled: 'پیشاندانی ئاگادارکردنەوە لە زەنگ',
    expiryDashboardEnabled: 'پیشاندانی ئاماری بەسەرچوون لە داشبۆرد',
    allProducts: 'هەموو کاڵاکان',
    expiredProducts: 'کاڵای بەسەرچوو',
    expiringToday: 'ئەمڕۆ بەسەردەچێت',
    expiringWithin: 'بەسەردەچێت لە ماوەی',
    productsWithoutExpiry: 'کاڵا بێ بەرواری بەسەرچوون',
    expiryStatus: 'دۆخی بەسەرچوون',
    expiryAlertEmpty: 'هیچ ئاگادارکردنەوەیەکی بەسەرچوون نییە',
    expiryDaysRemaining: 'ڕۆژ ماوە',
    expiryDaysOverdue: 'ڕۆژ بەسەریدا تێپەڕیوە',
    expiresToday: 'ئەمڕۆ بەسەردەچێت',
    expiringSoon: 'بەم نزیکانە بەسەردەچێت',
    expiryUrgent: 'پێویستی بە سەرنجی خێرا هەیە',
    expiredStockQuantity: 'بڕی کۆگای بەسەرچوو',
    urgentExpiryProducts: 'کاڵای پێویستی بە سەرنجی خێرا',
    expiringWithinPeriod: 'کاڵای بەسەردەچوو لە ماوەی ئاگادارکردنەوە',
    expiryNotifications: 'ئاگادارکردنەوەکانی بەسەرچوون',
    days: 'ڕۆژ',
    damagedProducts: 'کاڵای خەساربوو',
    damagedProductsDescription: 'کاڵاکانی خەساربوون کە لە جووڵەکانی کۆگادا تۆمار کراون.',
    damagedItems: 'کاڵای خەساربوو',
    damagedQuantity: 'بڕی کاڵای خەساربوو',
    increaseQuantity: 'زیادکردنی بڕ',
    decreaseQuantity: 'کەمکردنەوەی بڕ',
    recentDamage: 'تۆمارەکانی خەساربوونی دوایی',
    noDamagedProducts: 'هیچ کاڵایەکی خەساربوو تۆمار نەکراوە',
    recordDamagedProduct: 'تۆمارکردنی کاڵای خەساربوو',
    damageProductLookupHint: 'کاڵاکە بە بارکۆد یان ناو بدۆزەرەوە؛ بڕی خەساربوو لە کۆگا کەم دەکرێتەوە.',
    searchProductByNameOrBarcode: 'گەڕان بە ناو یان بارکۆد',
    scanOrEnterProduct: 'بارکۆد سکەن بکە یان ناو/بارکۆد بنووسە',
    availableStock: 'بڕی بەردەست',
    damageReason: 'هۆکاری خەساربوون',
    damageBroken: 'شکاو یان تێکچوو',
    damageSpoiled: 'خراپبوون',
    damageExpired: 'بەسەرچوون',
    damageOpenedUsed: 'پاکەت کراوەتەوە یان بۆ بەکارهێنانی دوکان بەکار هاتووە',
    damageContaminated: 'پیسبوون',
    damageTransport: 'خەسار لە گواستنەوە',
    damageStorage: 'خەساری هەڵگرتن یان پلەی گەرمی',
    damageOther: 'هۆکاری تر',
    damageNotesPlaceholder: 'وردەکاریی زیاتر لەبارەی خەسارەکە...',
    recordDamage: 'تۆمارکردنی خەسار',
    damageRecorded: 'خەسارەکە تۆمار کرا و بڕی کۆگا نوێ کرایەوە.',
    reason: 'هۆکار', entity: 'بابەت', system: 'سیستەم', previous: 'پێشوو', new: 'نوێ',
    sevenDays: '٧ ڕۆژ', refreshDashboardStats: 'نوێکردنەوەی ئامارەکانی داشبۆرد',
    selectLanguage: 'هەڵبژاردنی زمان', mainNavigation: 'ناڤیگەیشنی سەرەکی',
    openNavigation: 'کردنەوەی ناڤیگەیشن', closeNavigation: 'داخستنی ناڤیگەیشن',
    dismissNotification: 'لابردنی ئاگادارکردنەوە', toggleTheme: 'گۆڕینی ڕووکار',
    customerNamePlaceholder: 'ناوی کڕیار', customerAddressPlaceholder: 'شار یان گەڕەک',
    expenseNotePlaceholder: 'وەسڵ، کرێ، هۆکار...', categoryUnitPlaceholder: 'کیلۆگرام، پاکەت...',
    close: 'داخستن', more: 'زیاتر',
    generateBarcode: 'دروستکردنی بارکۆد', scanBarcode: 'سکانی بارکۆد',
    cameraScanner: 'بارکۆدەکە لە بەرامبەر کامێرا دابنێ',
    barcodeScanUnsupported: 'سکانی بارکۆد لەم وێبگەڕەدا پشتگیری ناکرێت',
    barcodeScanFailed: 'سکانی بارکۆد سەرکەوتوو نەبوو',
    barcodeAlreadyUsed: 'ئەم بارکۆدە پێشتر بەکار هاتووە.',
    printBarcode: 'چاپکردنی بارکۆد',
    printPopupBlocked: 'پەنجەرەی چاپکردن لەلایەن وێبگەڕەوە بلۆک کراوە.',
    barcodePrintFailed: 'دروستکردنی بارکۆدی چاپ سەرکەوتوو نەبوو.',
    cameraPermissionError: 'دەستگەیشتن بە کامێرا ڕێگەپێدراو نییە',
    productImage: 'وێنەی کاڵا',
    receiptImageHint: 'وێنە بگرە یان لە JPG، PNG یان WebP هەڵیبژێرە؛ تا ٥ مێگابایت',
    imageFileHint: 'JPG، PNG یان WebP؛ تا ٥ مێگابایت',
    enlargeImage: 'گەورەکردنی وێنە',
    removeImage: 'سڕینەوەی وێنە',
    selectImage: 'هەڵبژاردنی وێنە',
    replaceImage: 'گۆڕینی وێنە',
    showing: 'پیشاندانی', of: 'لە', page: 'پەڕە',
    previousPage: 'پێشوو', nextPage: 'دواتر',
    saveShortcut: 'پاشەکەوت', clearShortcut: 'پاککردنەوە',
    storeName: 'ناوی فرۆشگا', storeNameEn: 'ناوی فرۆشگا بە ئینگلیزی',
    storeNameAr: 'ناوی فرۆشگا بە عەرەبی', currency: 'دراو',
    invoicePrefix: 'پێشگری ژمارەی پسوڵە',
    receiptFooter: 'دەقی کۆتایی وەسڵ', lowStockThreshold: 'سنووری ئاگادارکردنەوەی کۆگای کەم',
    partial: 'بەشێکی دراو', due: 'قەرزدار',
    create: 'دروستکردن', update: 'نوێکردنەوە', payment: 'پارەدان',
    logout: 'چوونەدەرەوە', return: 'گەڕاندنەوە', stock_adjustment: 'گۆڕینی بڕی کۆگا',
    user: 'بەکارهێنەر', sale: 'فرۆشتن', purchase: 'کڕین', product: 'کاڵا',
    customer: 'کڕیار', supplier: 'دابینکەر', category: 'پۆل', expense: 'خەرجی',
    setting: 'ڕێکخستن', unit: 'یەکە', demo_data: 'داتای نموونە',
    adminRole: 'بەڕێوەبەری سیستەم', managerRole: 'بەڕێوەبەر', cashierRole: 'کاشێر',
    permissions: 'دەسەڵاتەکان', permissionsDescription: 'دیاری بکە ئەم بەکارهێنەرە لە کام بەشدا چی بکات. بەڕێوەبردن هەروەها مۆڵەتی بینین دەدات.',
    permissionView: 'بینین', permissionManage: 'بەڕێوەبردن', permissionUse: 'بەکارهێنان',
    selectAllPermissions: 'هەڵبژاردنی هەموو', clearAllPermissions: 'پاککردنەوەی هەڵبژاردن',
    adminPermissionsLocked: 'بەڕێوەبەری سیستەم هەموو دەسەڵاتەکانی هەیە و ناتوانرێت سنووردار بکرێت.',
    allModules: 'هەموو بەشەکان', users: 'بەکارهێنەران', stockAdjustment: 'ڕێکخستنی کۆگا',
  },
  en: {
    expiryAlerts: 'Product Expiry Alerts',
    expiryAlertsDescription: 'Configure alerts for inventory products approaching or past expiry.',
    expiryAlertsEnabled: 'Enable expiry notifications',
    expiryWarningDays: 'Warning period (days)',
    expiryUrgentDays: 'Urgent warning level (days)',
    expiryExpiredEnabled: 'Include already expired products',
    expiryBellEnabled: 'Show alerts in notification bell',
    expiryDashboardEnabled: 'Show expiry statistics on dashboard',
    allProducts: 'All products',
    expiredProducts: 'Expired products',
    expiringToday: 'Expiring today',
    expiringWithin: 'Expiring within',
    productsWithoutExpiry: 'Products without expiry date',
    expiryStatus: 'Expiry status',
    expiryAlertEmpty: 'No expiry alerts',
    expiryDaysRemaining: 'days remaining',
    expiryDaysOverdue: 'days overdue',
    expiresToday: 'Expires today',
    expiringSoon: 'Expiring soon',
    expiryUrgent: 'Needs urgent attention',
    expiredStockQuantity: 'Expired stock quantity',
    urgentExpiryProducts: 'Products needing urgent attention',
    expiringWithinPeriod: 'Expiring within warning period',
    expiryNotifications: 'Expiry notifications',
    days: 'days',
    damagedProducts: 'Damaged products',
    damagedProductsDescription: 'Products recorded as damaged in inventory movements.',
    damagedItems: 'Damaged products',
    damagedQuantity: 'Damaged quantity',
    increaseQuantity: 'Increase quantity',
    decreaseQuantity: 'Decrease quantity',
    recentDamage: 'Recent damage records',
    noDamagedProducts: 'No damaged products have been recorded',
    recordDamagedProduct: 'Record damaged product',
    damageProductLookupHint: 'Find a product by barcode or name. The damaged quantity will be deducted from stock.',
    searchProductByNameOrBarcode: 'Search by name or barcode',
    scanOrEnterProduct: 'Scan a barcode or enter a product name/barcode',
    availableStock: 'Available stock',
    damageReason: 'Damage reason',
    damageBroken: 'Broken or crushed',
    damageSpoiled: 'Spoiled',
    damageExpired: 'Expired',
    damageOpenedUsed: 'Opened or used in store',
    damageContaminated: 'Contaminated',
    damageTransport: 'Damaged during transport',
    damageStorage: 'Storage or temperature damage',
    damageOther: 'Other reason',
    damageNotesPlaceholder: 'Additional details about the damage...',
    recordDamage: 'Record damage',
    damageRecorded: 'Damage recorded and stock updated.',
    reason: 'Reason', entity: 'Entity', system: 'System', previous: 'Previous', new: 'New',
    sevenDays: '7 days', refreshDashboardStats: 'Refresh dashboard statistics',
    selectLanguage: 'Select language', mainNavigation: 'Main navigation',
    openNavigation: 'Open navigation', closeNavigation: 'Close navigation',
    dismissNotification: 'Dismiss notification', toggleTheme: 'Toggle theme',
    customerNamePlaceholder: 'Customer name', customerAddressPlaceholder: 'City or neighborhood',
    expenseNotePlaceholder: 'Receipt, rent, reason...', categoryUnitPlaceholder: 'Kilogram, pack...',
    close: 'Close', more: 'More',
    generateBarcode: 'Generate barcode', scanBarcode: 'Scan barcode',
    cameraScanner: 'Point the camera at a barcode',
    barcodeScanUnsupported: 'Barcode scanning is not supported in this browser',
    barcodeScanFailed: 'Could not scan the barcode',
    barcodeAlreadyUsed: 'This barcode has already been used.',
    printBarcode: 'Print barcode',
    printPopupBlocked: 'The print window was blocked by the browser.',
    barcodePrintFailed: 'Could not generate a printable barcode.',
    cameraPermissionError: 'Camera access was not allowed',
    productImage: 'Product image',
    receiptImageHint: 'Take a photo or choose a JPG, PNG, or WebP image; up to 5 MB',
    imageFileHint: 'JPG, PNG, or WebP; up to 5 MB',
    enlargeImage: 'Enlarge image',
    removeImage: 'Remove image',
    selectImage: 'Select image',
    replaceImage: 'Replace image',
    showing: 'Showing', of: 'of', page: 'Page',
    previousPage: 'Previous', nextPage: 'Next',
    saveShortcut: 'Save', clearShortcut: 'Clear form',
    storeName: 'Store name', storeNameEn: 'Store name in English',
    storeNameAr: 'Store name in Arabic', currency: 'Currency',
    invoicePrefix: 'Invoice prefix',
    receiptFooter: 'Receipt footer', lowStockThreshold: 'Low-stock alert threshold',
    partial: 'Partial', due: 'Due',
    create: 'Create', update: 'Update', payment: 'Payment',
    logout: 'Log out', return: 'Return', stock_adjustment: 'Stock adjustment',
    user: 'User', sale: 'Sale', purchase: 'Purchase', product: 'Product',
    customer: 'Customer', supplier: 'Supplier', category: 'Category', expense: 'Expense',
    setting: 'Setting', unit: 'Unit', demo_data: 'Demo data',
    adminRole: 'Administrator', managerRole: 'Manager', cashierRole: 'Cashier',
    permissions: 'Permissions', permissionsDescription: 'Choose what this user can view and manage. Manage also grants view access.',
    permissionView: 'View', permissionManage: 'Manage', permissionUse: 'Use',
    selectAllPermissions: 'Select all', clearAllPermissions: 'Clear selection',
    adminPermissionsLocked: 'System administrators always have full access and cannot be restricted.',
    allModules: 'All modules', users: 'Users', stockAdjustment: 'Stock adjustment',
  },
  ar: {
    expiryAlerts: 'تنبيهات انتهاء صلاحية المنتجات',
    expiryAlertsDescription: 'اضبط تنبيهات المنتجات التي تقترب صلاحيتها أو انتهت.',
    expiryAlertsEnabled: 'تفعيل تنبيهات انتهاء الصلاحية',
    expiryWarningDays: 'فترة التنبيه (بالأيام)',
    expiryUrgentDays: 'مستوى التنبيه العاجل (بالأيام)',
    expiryExpiredEnabled: 'تضمين المنتجات منتهية الصلاحية',
    expiryBellEnabled: 'عرض التنبيهات في جرس الإشعارات',
    expiryDashboardEnabled: 'عرض إحصاءات الصلاحية في لوحة المعلومات',
    allProducts: 'كل المنتجات',
    expiredProducts: 'منتجات منتهية الصلاحية',
    expiringToday: 'تنتهي اليوم',
    expiringWithin: 'تنتهي خلال',
    productsWithoutExpiry: 'منتجات بلا تاريخ صلاحية',
    expiryStatus: 'حالة الصلاحية',
    expiryAlertEmpty: 'لا توجد تنبيهات انتهاء صلاحية',
    expiryDaysRemaining: 'أيام متبقية',
    expiryDaysOverdue: 'أيام منذ انتهاء الصلاحية',
    expiresToday: 'تنتهي اليوم',
    expiringSoon: 'تقترب صلاحيتها من الانتهاء',
    expiryUrgent: 'تتطلب اهتماماً عاجلاً',
    expiredStockQuantity: 'كمية المخزون منتهي الصلاحية',
    urgentExpiryProducts: 'منتجات تتطلب اهتماماً عاجلاً',
    expiringWithinPeriod: 'تنتهي خلال فترة التنبيه',
    expiryNotifications: 'تنبيهات انتهاء الصلاحية',
    days: 'أيام',
    damagedProducts: 'المنتجات التالفة',
    damagedProductsDescription: 'المنتجات المسجلة كتالف في حركات المخزون.',
    damagedItems: 'المنتجات التالفة',
    damagedQuantity: 'كمية المنتجات التالفة',
    increaseQuantity: 'زيادة الكمية',
    decreaseQuantity: 'تقليل الكمية',
    recentDamage: 'سجلات التلف الأخيرة',
    noDamagedProducts: 'لم يتم تسجيل منتجات تالفة',
    recordDamagedProduct: 'تسجيل منتج تالف',
    damageProductLookupHint: 'ابحث عن المنتج بالباركود أو الاسم؛ سيتم خصم الكمية التالفة من المخزون.',
    searchProductByNameOrBarcode: 'البحث بالاسم أو الباركود',
    scanOrEnterProduct: 'امسح الباركود أو أدخل اسم المنتج/الباركود',
    availableStock: 'الكمية المتاحة',
    damageReason: 'سبب التلف',
    damageBroken: 'مكسور أو مهشم',
    damageSpoiled: 'فاسد',
    damageExpired: 'منتهي الصلاحية',
    damageOpenedUsed: 'مفتوح أو مستخدم في المتجر',
    damageContaminated: 'ملوث',
    damageTransport: 'تلف أثناء النقل',
    damageStorage: 'تلف التخزين أو الحرارة',
    damageOther: 'سبب آخر',
    damageNotesPlaceholder: 'تفاصيل إضافية حول التلف...',
    recordDamage: 'تسجيل التلف',
    damageRecorded: 'تم تسجيل التلف وتحديث المخزون.',
    reason: 'السبب', entity: 'الكيان', system: 'النظام', previous: 'السابق', new: 'الجديد',
    sevenDays: '7 أيام', refreshDashboardStats: 'تحديث إحصائيات لوحة المعلومات',
    selectLanguage: 'اختر اللغة', mainNavigation: 'التنقل الرئيسي',
    openNavigation: 'فتح قائمة التنقل', closeNavigation: 'إغلاق قائمة التنقل',
    dismissNotification: 'إغلاق الإشعار', toggleTheme: 'تغيير المظهر',
    customerNamePlaceholder: 'اسم العميل', customerAddressPlaceholder: 'المدينة أو الحي',
    expenseNotePlaceholder: 'إيصال، إيجار، سبب...', categoryUnitPlaceholder: 'كيلوغرام، عبوة...',
    close: 'إغلاق', more: 'المزيد',
    generateBarcode: 'إنشاء باركود', scanBarcode: 'مسح الباركود',
    cameraScanner: 'وجّه الكاميرا نحو الباركود',
    barcodeScanUnsupported: 'مسح الباركود غير مدعوم في هذا المتصفح',
    barcodeScanFailed: 'تعذر مسح الباركود',
    barcodeAlreadyUsed: 'تم استخدام هذا الباركود من قبل.',
    printBarcode: 'طباعة الباركود',
    printPopupBlocked: 'تم حظر نافذة الطباعة بواسطة المتصفح.',
    barcodePrintFailed: 'تعذر إنشاء باركود قابل للطباعة.',
    cameraPermissionError: 'لم يُسمح بالوصول إلى الكاميرا',
    productImage: 'صورة المنتج',
    receiptImageHint: 'التقط صورة أو اختر صورة JPG أو PNG أو WebP؛ حتى 5 ميغابايت',
    imageFileHint: 'JPG أو PNG أو WebP؛ حتى 5 ميغابايت',
    enlargeImage: 'تكبير الصورة',
    removeImage: 'حذف الصورة',
    selectImage: 'اختيار صورة',
    replaceImage: 'استبدال الصورة',
    showing: 'عرض', of: 'من', page: 'الصفحة',
    previousPage: 'السابق', nextPage: 'التالي',
    saveShortcut: 'حفظ', clearShortcut: 'مسح النموذج',
    storeName: 'اسم المتجر', storeNameEn: 'اسم المتجر بالإنجليزية',
    storeNameAr: 'اسم المتجر بالعربية', currency: 'العملة',
    invoicePrefix: 'بادئة رقم الفاتورة',
    receiptFooter: 'تذييل الإيصال', lowStockThreshold: 'حد تنبيه انخفاض المخزون',
    partial: 'مدفوع جزئياً', due: 'مستحق',
    create: 'إنشاء', update: 'تحديث', payment: 'دفعة',
    logout: 'تسجيل الخروج', return: 'إرجاع', stock_adjustment: 'تعديل المخزون',
    user: 'مستخدم', sale: 'مبيعات', purchase: 'مشتريات', product: 'منتج',
    customer: 'عميل', supplier: 'مورد', category: 'فئة', expense: 'مصروف',
    setting: 'إعداد', unit: 'وحدة', demo_data: 'بيانات تجريبية',
    adminRole: 'مدير النظام', managerRole: 'مدير', cashierRole: 'كاشير',
    permissions: 'الصلاحيات', permissionsDescription: 'حدد ما يمكن لهذا المستخدم عرضه وإدارته. تمنح الإدارة صلاحية العرض أيضاً.',
    permissionView: 'عرض', permissionManage: 'إدارة', permissionUse: 'استخدام',
    selectAllPermissions: 'تحديد الكل', clearAllPermissions: 'مسح التحديد',
    adminPermissionsLocked: 'مدير النظام لديه جميع الصلاحيات دائماً ولا يمكن تقييده.',
    allModules: 'كل الأقسام', users: 'المستخدمون', stockAdjustment: 'تعديل المخزون',
  },
};

const AppContext = createContext<AppContextValue | null>(null);
const USER_STORAGE_KEY = 'supermarket.user';
const LANGUAGE_STORAGE_KEY = 'supermarket.language';
const THEME_STORAGE_KEY = 'supermarket.theme';
const TOKEN_STORAGE_KEY = 'supermarket.token';
// Shop names from Settings, kept so the login screen (before any API access) shows the current name.
const BRANDING_STORAGE_KEY = 'supermarket.branding';
const BRANDING_KEYS = ['store_name', 'store_name_en', 'store_name_ar'] as const;

const readStoredSettings = (): AppSettings => {
  try {
    const stored = JSON.parse(localStorage.getItem(BRANDING_STORAGE_KEY) ?? '{}') as Partial<AppSettings>;
    const branding = Object.fromEntries(BRANDING_KEYS.filter(key => typeof stored[key] === 'string' && stored[key]).map(key => [key, stored[key]]));
    return { ...SETTINGS_DEFAULTS, ...branding };
  } catch {
    return SETTINGS_DEFAULTS;
  }
};
const ACTIVE_TAB_STORAGE_KEY = 'supermarket.activeTab';
const NAV_TABS: NavTab[] = [
  'dashboard', 'pos', 'cashier', 'products', 'categories', 'inventory',
  'damaged-products', 'purchases', 'returns', 'customers', 'suppliers',
  'expenses', 'cash-register', 'reports', 'users', 'settings', 'activity-logs',
];

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

function readLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'en' || stored === 'ar' ? stored : 'ku';
}

function readStoredTab(): NavTab {
  const stored = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  return NAV_TABS.includes(stored as NavTab) ? stored as NavTab : 'dashboard';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [language, setLanguageState] = useState<Language>(readLanguage);
  const [theme, setThemeState] = useState<AppTheme>(() => localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light');
  const [settings, setSettings] = useState<AppSettings>(readStoredSettings);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(Object.fromEntries(BRANDING_KEYS.map(key => [key, settings[key]]))));
    } catch {
      // Storage unavailable (private mode): the defaults are used instead.
    }
  }, [settings.store_name, settings.store_name_en, settings.store_name_ar]);
  const [activeTab, setActiveTab] = useState<NavTab>(readStoredTab);
  const [inventoryExpiryFilter, setInventoryExpiryFilter] = useState('all');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const isRtl = language !== 'en';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [language, isRtl, theme]);

  useEffect(() => {
    if (user) localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch('/api/settings')
      .then(response => response.json())
      .then(json => {
        if (json.success && json.data && !cancelled) {
          setSettings(current => ({ ...current, ...json.data }));
          const defaultLanguage = json.data.default_language;
          if (!localStorage.getItem(LANGUAGE_STORAGE_KEY) && ['ku', 'en', 'ar'].includes(defaultLanguage)) {
            setLanguageState(defaultLanguage as Language);
          }
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      return;
    }

    let cancelled = false;
    apiFetch('/api/auth/me')
      .then(async response => {
        if (!response.ok) throw new Error(`Authentication check failed (${response.status})`);
        const payload = await response.json();
        if (!payload.success || !payload.user || cancelled) throw new Error('Authentication check failed');

        const authenticatedUser: User = {
          ...payload.user,
          role: (payload.user.role || 'CASHIER') as UserRole,
          status: payload.user.status || 'ACTIVE',
          language_pref: payload.user.language_pref || 'ku',
          permissions: payload.user.permissions || [],
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
        setUser(null);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user || !userCanAccessTab(user, 'dashboard')) {
      setExpiryAlerts([]);
      return;
    }

    let cancelled = false;
    const loadExpiryAlerts = async () => {
      try {
        const response = await fetch('/api/notifications/expiry', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) || ''}`,
          },
        });
        if (!response.ok) throw new Error(`Expiry alerts request failed (${response.status})`);
        const payload = await response.json();
        if (!cancelled && payload.success) setExpiryAlerts(payload.data.alerts);
      } catch (error) {
        if (!cancelled) console.error(error);
      }
    };

    void loadExpiryAlerts();
    const timer = window.setInterval(() => void loadExpiryAlerts(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, settings.expiry_alerts_enabled, settings.expiry_warning_days, settings.expiry_urgent_days, settings.expiry_alerts_expired]);

  // A language picked on this device stays until it is picked again; login and store defaults never override it.
  const setLanguage = (nextLanguage: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  };
  const setTheme = (nextTheme: AppTheme) => setThemeState(nextTheme);
  const updateSettings = (nextSettings: Partial<AppSettings>) => setSettings(current => ({ ...current, ...nextSettings }));
  const triggerRefresh = () => setRefreshTrigger(value => value + 1);
  const dismissToast = (id: string) => setToasts(items => items.filter(item => item.id !== id));
  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(items => [...items, { id, message, type }]);
    window.setTimeout(() => dismissToast(id), 4500);
  };

  const t = (key: string) => CONTEXTUAL_TRANSLATIONS[language][key]
    ?? UI_TRANSLATIONS[language][key]
    ?? TRANSLATIONS[language][key]
    ?? key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, first => first.toUpperCase());

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numericAmount = Number(amount ?? 0);
    return new Intl.NumberFormat(language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0) + ` ${settings.currency || 'IQD'}`;
  };

  const getLocalizedName = (item: LocalizedName) => {
    const localized = language === 'en' ? item.name_en : language === 'ar' ? item.name_ar : item.name_ku;
    return localized || item.name_ku || item.name_en || item.name_ar || '';
  };

  const login = async ({ username, password }: LoginCredentials) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await response.json();
    if (!response.ok || !json.success || !json.user) {
      throw new Error(json.message || t('invalidCredentials'));
    }

    const loggedInUser: User = {
      ...json.user,
      role: (json.user.role || 'CASHIER') as UserRole,
      status: json.user.status || 'ACTIVE',
      language_pref: json.user.language_pref || 'ku',
      permissions: json.user.permissions || [],
    };
    if (json.token) localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) setLanguageState(loggedInUser.language_pref);
    setActiveTab(loggedInUser.role === 'CASHIER' ? 'pos' : 'dashboard');
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      try {
        await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      } catch {
        // Clear local credentials even when the server cannot be reached.
      }
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider value={{
      user, language, setLanguage, theme, setTheme, isRtl, settings, updateSettings, expiryAlerts,
      activeTab, setActiveTab, inventoryExpiryFilter, setInventoryExpiryFilter,
      isFullScreen, setIsFullScreen, refreshTrigger, triggerRefresh, toasts, showToast,
      dismissToast, t, formatCurrency, getLocalizedName, login, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}