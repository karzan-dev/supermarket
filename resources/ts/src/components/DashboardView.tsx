import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../api';
import type { NavTab } from '../context/AppContext';
import { 
  TrendingUp, DollarSign, ShoppingBag, Receipt, Package, 
  AlertTriangle, Users, Building2, ArrowUpRight, Plus, RefreshCw, 
  ShoppingCart, Boxes, Clock, Truck, RotateCcw, Layers, 
  BarChart3, FileText, UserCheck, Settings as SettingsIcon, 
  ShieldCheck, BadgeDollarSign, PlusCircle, Search, 
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Filter,
  Activity, ArrowDownRight, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ModuleCategory = 'all' | 'pos' | 'inventory' | 'finance' | 'admin';

interface ModuleCardItem {
  id: string;
  tab: NavTab;
  category: ModuleCategory;
  titleKu: string;
  titleEn: string;
  titleAr: string;
  descKu: string;
  descEn: string;
  descAr: string;
  icon: any;
  colorScheme: 'teal' | 'sky' | 'indigo' | 'amber' | 'emerald' | 'violet' | 'blue' | 'rose' | 'purple' | 'slate' | 'cyan';
  badgeValue?: string | number | undefined;
  badgeType?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'teal';
  actionLabelKu?: string;
  actionLabelEn?: string;
  actionLabelAr?: string;
}

export const DashboardView: React.FC = () => {
  const { 
    t, formatCurrency, getLocalizedName, setActiveTab, 
    refreshTrigger, theme, user, language, isRtl, settings, expiryAlerts,
    setInventoryExpiryFilter,
  } = useApp();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'modules' | 'analytics'>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock for system status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = () => {
    setLoading(true);
    apiFetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const today = data?.today || { sales: 0, profit: 0, invoices: 0, purchases: 0, expenses: 0, net_today: 0 };
  const inventory = data?.inventory || { total_products: 0, low_stock: 0, out_of_stock: 0, expiring_soon: 0 };
  const expiryStats = {
    expired_products: inventory.expired_products || 0,
    expiring_within_period: inventory.expiring_within_period || 0,
    expired_stock_quantity: inventory.expired_stock_quantity || 0,
    urgent_expiry_products: inventory.urgent_expiry_products || 0,
  };
  const customers = data?.customers || { total_customers: 0, total_customer_debt: 0 };
  const suppliers = data?.suppliers || { total_suppliers: 0, total_supplier_debt: 0 };
  const salesTrend = data?.salesTrend || [];
  const categorySales = data?.categorySales || [];
  const topProducts = data?.topProducts || [];
  const recentSales = data?.recentSales || [];

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Format localized date/time
  const formattedDate = new Intl.DateTimeFormat(
    language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
  ).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString(
    language === 'en' ? 'en-US' : 'ar-IQ',
    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  );

  // All modern enterprise module cards
  const moduleCards: ModuleCardItem[] = [
    {
      id: 'pos',
      tab: 'pos',
      category: 'pos',
      titleKu: 'خاڵی فرۆشتن (POS)',
      titleEn: 'POS / Sales Terminal',
      titleAr: 'نقطة البيع (POS)',
      descKu: 'تۆمارکردنی فرۆشتن بە بارکۆد، وەسڵی کاش و کارت، داشکاندن و چاپی پسوڵە',
      descEn: 'Rapid checkout terminal, barcode scanning, cash and card receipts',
      descAr: 'شاشة بيع سريعة، مسح باركود، فواتير نقدية وإلكترونية وطباعة',
      icon: ShoppingCart,
      colorScheme: 'teal',
      badgeValue: today.invoices > 0 ? `${today.invoices} ${t('invoiceCount') || 'وەسڵ'}` : (language === 'ku' ? 'ئۆنلاین' : language === 'ar' ? 'متصل' : 'Online'),
      badgeType: 'teal',
      actionLabelKu: 'کردنەوەی خاڵی فرۆشتن',
      actionLabelEn: 'Open POS',
      actionLabelAr: 'فتح نقطة البيع'
    },
    {
      id: 'products',
      tab: 'products',
      category: 'inventory',
      titleKu: 'کاڵاکان و نرخ',
      titleEn: 'Products & Pricing',
      titleAr: 'المنتجات والأسعار',
      descKu: 'بەڕێوەبردنی تەواوی کاڵاکان، بارکۆد، نرخی کڕین و فرۆشتن و وێنەی کاڵا',
      descEn: 'Complete product catalog, price tiering, barcodes and inventory links',
      descAr: 'إدارة كاملة للمنتجات، الباركود، أسعار البيع والشراء والمخزون',
      icon: Package,
      colorScheme: 'sky',
      badgeValue: `${inventory.total_products} ${t('products') || 'کاڵا'}`,
      badgeType: 'info'
    },
    {
      id: 'add-product',
      tab: 'products',
      category: 'inventory',
      titleKu: 'زیادکردنی کاڵای نوێ',
      titleEn: 'Add New Product',
      titleAr: 'إضافة منتج جديد',
      descKu: 'تۆمارکردنی خێرای کاڵای نوێ، دیاریکردنی بارکۆد، پۆل و نرخی کۆ و فرۆشتن',
      descEn: 'Fast creation modal for newly arrived products and custom barcodes',
      descAr: 'إضافة سريعة لمنتج جديد مع تحديد الباركود والفئة والأسعار',
      icon: PlusCircle,
      colorScheme: 'emerald',
      badgeValue: 'خێرا',
      badgeType: 'success'
    },
    {
      id: 'inventory',
      tab: 'inventory',
      category: 'inventory',
      titleKu: 'کۆگا و ئینڤێنتۆری',
      titleEn: 'Inventory Control',
      titleAr: 'المخزون والمستودعات',
      descKu: 'چاودێری کۆگا، جووڵەی کاڵاکان، گۆڕانکاریی دەستی و کۆنتڕۆڵی مادەکان',
      descEn: 'Warehouse monitoring, stock movements, manual audit and adjustments',
      descAr: 'متابعة المستودعات، حركة الأصناف، الجرد اليدوي والتسويات المخزنية',
      icon: Boxes,
      colorScheme: 'indigo',
      badgeValue: inventory.low_stock > 0 ? `${inventory.low_stock} ${t('lowStock') || 'کەمە'}` : 'تەواوە',
      badgeType: inventory.low_stock > 0 ? 'warning' : 'default'
    },
    {
      id: 'low-stock',
      tab: 'inventory',
      category: 'inventory',
      titleKu: 'کاڵا کەمبووەکان',
      titleEn: 'Low Stock Alerts',
      titleAr: 'منتجات قاربت على النفاد',
      descKu: 'ئاگادارکردنەوەی خێرای ئەو کاڵایانەی کەمترن لە کەمترین بڕی پێویستی کۆگا',
      descEn: 'Urgent notification for products that reached minimum stock threshold',
      descAr: 'تنبيه فوري بالأصناف التي وصلت للحد الأدنى من المخزون',
      icon: AlertTriangle,
      colorScheme: 'amber',
      badgeValue: inventory.low_stock,
      badgeType: inventory.low_stock > 0 ? 'danger' : 'default'
    },
    {
      id: 'expiring',
      tab: 'inventory',
      category: 'inventory',
      titleKu: 'کاڵای بەسەرچوو',
      titleEn: 'Expiring Soon',
      titleAr: 'الصلاحية والانتهاء',
      descKu: 'چاودێری بەرواری بەسەرچوونی کاڵاکان بۆ پاراستنی کوالیتی و سەلامەتی',
      descEn: 'Track near-expiry and expired batches for safety and quality control',
      descAr: 'متابعة تواريخ انتهاء الصلاحية للأصناف لحماية الجودة والسلامة',
      icon: Clock,
      colorScheme: 'rose',
      badgeValue: inventory.expiring_soon > 0 ? `${inventory.expiring_soon} بەسەرچوو` : 'سەلامەت',
      badgeType: inventory.expiring_soon > 0 ? 'danger' : 'default'
    },
    {
      id: 'purchases',
      tab: 'purchases',
      category: 'finance',
      titleKu: 'کڕین و دابینکردن',
      titleEn: 'Purchases & Restock',
      titleAr: 'المشتريات والتوريد',
      descKu: 'تۆمارکردنی وەسڵی کڕین لە دابینکەران، زیادکردنی کاڵا و چاودێری قەرز',
      descEn: 'Record supplier purchasing invoices, restock items and manage payables',
      descAr: 'تسجيل فواتير الشراء من الموردين وتغذية المخزون ومتابعة المستحقات',
      icon: Truck,
      colorScheme: 'emerald',
      badgeValue: today.purchases > 0 ? formatCurrency(today.purchases) : undefined,
      badgeType: 'info'
    },
    {
      id: 'customers',
      tab: 'customers',
      category: 'finance',
      titleKu: 'کڕیارەکان و قەرز',
      titleEn: 'Customers & Receivables',
      titleAr: 'العملاء والديون',
      descKu: 'لیستی کڕیاران، چاودێری قەرزی کڕیاران و تۆمارکردنی وەرگرتنی پارەی قەرز',
      descEn: 'Customer directory, credit balances, payment histories and settlements',
      descAr: 'سجل العملاء، إدارة الديون الآجلة وسداد الأقساط والمتحصلات',
      icon: Users,
      colorScheme: 'violet',
      badgeValue: customers.total_customer_debt > 0 ? formatCurrency(customers.total_customer_debt) : `${customers.total_customers} کڕیار`,
      badgeType: customers.total_customer_debt > 0 ? 'warning' : 'default'
    },
    {
      id: 'suppliers',
      tab: 'suppliers',
      category: 'finance',
      titleKu: 'دابینکەرەکان و کۆمپانیا',
      titleEn: 'Suppliers & Vendors',
      titleAr: 'الموردون والشركات',
      descKu: 'زانیاری کۆمپانیاکانی دابینکردن، مێژووی کڕین و بەڕێوەبردنی قەرزی دابینکەر',
      descEn: 'Vendor directory, order records, balances due and payment schedules',
      descAr: 'دليل الموردين والشركات، سجل المشتريات ومستحقات الدفع',
      icon: Building2,
      colorScheme: 'blue',
      badgeValue: suppliers.total_supplier_debt > 0 ? formatCurrency(suppliers.total_supplier_debt) : `${suppliers.total_suppliers} دابینکەر`,
      badgeType: suppliers.total_supplier_debt > 0 ? 'danger' : 'default'
    },
    {
      id: 'returns',
      tab: 'returns',
      category: 'pos',
      titleKu: 'گەڕاندنەوەی کاڵا',
      titleEn: 'Sales Returns',
      titleAr: 'مرتجع المبيعات',
      descKu: 'گەڕاندنەوەی کاڵا لە وەسڵە پێشووەکان بەپێی بارکۆد و نوێکردنەوەی کۆگا',
      descEn: 'Customer merchandise returns, invoice lookups, refunds and restock',
      descAr: 'استرجاع الأصناف المباعة، استرداد المبالغ وإرجاع البضاعة للمخزن',
      icon: RotateCcw,
      colorScheme: 'amber',
      badgeValue: 'گەڕاندنەوە'
    },
    {
      id: 'expenses',
      tab: 'expenses',
      category: 'finance',
      titleKu: 'خەرجییەکانی فرۆشگا',
      titleEn: 'Store Expenses',
      titleAr: 'مصروفات المتجر',
      descKu: 'تۆمارکردنی خەرجییە ڕۆژانەکان، کارەبا، کرێ، پێداویستی و چاککردنەوە',
      descEn: 'Daily operational expenses, rent, utilities, maintenance and supplies',
      descAr: 'تسجيل المصروفات التشغيلية اليومية، الإيجار، الكهرباء والخدمات',
      icon: Receipt,
      colorScheme: 'rose',
      badgeValue: today.expenses > 0 ? formatCurrency(today.expenses) : undefined,
      badgeType: 'warning'
    },
    {
      id: 'categories',
      tab: 'categories',
      category: 'inventory',
      titleKu: 'بەشەکان و یەکەکان',
      titleEn: 'Categories & Units',
      titleAr: 'الفئات والوحدات',
      descKu: 'دابەشکردنی پۆلەکانی کاڵا، دیاریکردنی یەکەی کێش، دانە، کارتۆن و پاکەت',
      descEn: 'Product classification, aisles, packaging units, kilograms and pieces',
      descAr: 'تصنيف الأقسام، وحدات القياس، الأوزان، الكراتين والقطع',
      icon: Layers,
      colorScheme: 'teal',
      badgeValue: 'ڕێکخستن'
    },
    {
      id: 'reports',
      tab: 'reports',
      category: 'finance',
      titleKu: 'ڕاپۆرت و ئامارەکان',
      titleEn: 'Reports & Analytics',
      titleAr: 'التقارير والإحصائيات',
      descKu: 'ڕاپۆرتی پوختەی قازانج، فرۆشتنی مانگانە، پڕفرۆشترین کاڵاکان و هەناردە',
      descEn: 'Profit & loss overview, monthly sales, bestsellers and CSV export',
      descAr: 'كشوفات الأرباح والخسائر، تحليلات المبيعات وتصدير الملفات',
      icon: BarChart3,
      colorScheme: 'emerald',
      badgeValue: 'پوختەی دارایی',
      badgeType: 'success'
    },
    {
      id: 'invoices',
      tab: 'reports',
      category: 'pos',
      titleKu: 'وەسڵەکان و پسوڵە',
      titleEn: 'Invoices & Receipts',
      titleAr: 'سجل الفواتير والإيصالات',
      descKu: 'بینینی تەواوی وەسڵە تۆمارکراوەکان، دووبارە چاپکردنەوە و گەڕان بە وەسڵ',
      descEn: 'Complete transaction history, receipt reprinting and cashier audit',
      descAr: 'كشف الفواتير الصادرة، إعادة الطباعة والبحث برقم الفاتورة',
      icon: FileText,
      colorScheme: 'sky',
      badgeValue: `${today.invoices} ئەمڕۆ`
    },
    {
      id: 'users',
      tab: 'users',
      category: 'admin',
      titleKu: 'بەکارهێنەران و کارمەند',
      titleEn: 'Users & Staff Access',
      titleAr: 'المستخدمون والصلاحيات',
      descKu: 'بەڕێوەبردنی هەژماری کاشێر، بەڕێوەبەر، گۆڕینی دەسەڵاتەکان و وشەی نهێنی',
      descEn: 'Staff accounts, cashier credentials, role permissions and security',
      descAr: 'إدارة حسابات الكاشير والمدراء وتحديد الصلاحيات وكلمات المرور',
      icon: UserCheck,
      colorScheme: 'purple',
      badgeValue: user?.role || 'دەسەڵاتەکان',
      badgeType: 'info'
    },
    {
      id: 'settings',
      tab: 'settings',
      category: 'admin',
      titleKu: 'ڕێکخستنەکانی سیستەم',
      titleEn: 'System Settings',
      titleAr: 'إعدادات النظام',
      descKu: 'ناوی فرۆشگا، دراو، دیزاینی چاپکەری وەسڵ (Thermal 80mm/58mm)',
      descEn: 'Store profile, currency, thermal receipt formats and backup',
      descAr: 'بيانات المتجر، العملة، خيارات الطابعات الحرارية',
      icon: SettingsIcon,
      colorScheme: 'slate',
      badgeValue: 'سیستەم'
    },
    {
      id: 'activity-logs',
      tab: 'activity-logs',
      category: 'admin',
      titleKu: 'تۆماری چالاکییەکان',
      titleEn: 'Security & Audit Logs',
      titleAr: 'سجل النشاطات والرقابة',
      descKu: 'تۆماری چاودێری تەواوی جووڵەکانی سیستەم بۆ پاراستنی ئەمنییەت و شەفافیەت',
      descEn: 'Comprehensive audit trail of logins, product edits and sensitive events',
      descAr: 'سجل تدقيق كامل لكافة العمليات والتعديلات لضمان الأمان والشفافية',
      icon: ShieldCheck,
      colorScheme: 'cyan',
      badgeValue: 'پارێزراو',
      badgeType: 'success'
    },
    {
      id: 'shift-summary',
      tab: 'pos',
      category: 'pos',
      titleKu: 'سندوق و حسابی کاش',
      titleEn: 'Cash Drawer & Shift',
      titleAr: 'حساب الصندوق والوردية',
      descKu: 'کۆی پارەی نەقد لە سندوق، سەرجەمی شێوازەکانی پارەدان و کۆتایی شیفت',
      descEn: 'Live register cash balance, payment method breakdown and shift totals',
      descAr: 'رصيد النقدية في الدرج، تفصيل طرق الدفع وإغلاق الوردية',
      icon: BadgeDollarSign,
      colorScheme: 'teal',
      badgeValue: 'کاشێر',
      badgeType: 'info'
    }
  ];

  // Helper for title & description
  const getCardTitle = (item: ModuleCardItem) => {
    if (language === 'ku') return item.titleKu;
    if (language === 'ar') return item.titleAr;
    return item.titleEn;
  };

  const getCardDesc = (item: ModuleCardItem) => {
    if (language === 'ku') return item.descKu;
    if (language === 'ar') return item.descAr;
    return item.descEn;
  };

  // Filter modules based on search and category
  const filteredModules = moduleCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = getCardTitle(card).toLowerCase();
    const desc = getCardDesc(card).toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  // Color mappings for icon container
  const getColorStyles = (color: ModuleCardItem['colorScheme']) => {
    switch (color) {
      case 'teal':
        return {
          container: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-100/90 dark:border-teal-800/40 group-hover:bg-teal-700 group-hover:text-white dark:group-hover:bg-teal-600',
          accent: 'text-teal-700 dark:text-teal-400'
        };
      case 'sky':
        return {
          container: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-100/90 dark:border-sky-800/40 group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-500',
          accent: 'text-sky-700 dark:text-sky-400'
        };
      case 'indigo':
        return {
          container: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/90 dark:border-indigo-800/40 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500',
          accent: 'text-indigo-700 dark:text-indigo-400'
        };
      case 'amber':
        return {
          container: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-100/90 dark:border-amber-800/40 group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-500',
          accent: 'text-amber-700 dark:text-amber-400'
        };
      case 'emerald':
        return {
          container: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100/90 dark:border-emerald-800/40 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500',
          accent: 'text-emerald-700 dark:text-emerald-400'
        };
      case 'violet':
        return {
          container: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-100/90 dark:border-violet-800/40 group-hover:bg-violet-600 group-hover:text-white dark:group-hover:bg-violet-500',
          accent: 'text-violet-700 dark:text-violet-400'
        };
      case 'blue':
        return {
          container: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100/90 dark:border-blue-800/40 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500',
          accent: 'text-blue-700 dark:text-blue-400'
        };
      case 'rose':
        return {
          container: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-100/90 dark:border-rose-800/40 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-500',
          accent: 'text-rose-700 dark:text-rose-400'
        };
      case 'purple':
        return {
          container: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-100/90 dark:border-purple-800/40 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-500',
          accent: 'text-purple-700 dark:text-purple-400'
        };
      case 'cyan':
        return {
          container: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-100/90 dark:border-cyan-800/40 group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:bg-cyan-500',
          accent: 'text-cyan-700 dark:text-cyan-400'
        };
      case 'slate':
      default:
        return {
          container: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:bg-slate-700 group-hover:text-white dark:group-hover:bg-slate-600',
          accent: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const getBadgeStyle = (type?: ModuleCardItem['badgeType']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'warning':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'danger':
        return 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
      case 'info':
        return 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/40';
      case 'teal':
        return 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800/40';
      case 'default':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Prepare line chart for analytics view
  const lineChartData = {
    labels: salesTrend.map((st: any) => st.sale_date),
    datasets: [
      {
        label: t('sales') || 'Sales',
        data: salesTrend.map((st: any) => st.daily_total),
        borderColor: isDark ? '#2dd4bf' : '#0f766e',
        backgroundColor: isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(15, 118, 110, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: isDark ? '#2dd4bf' : '#0f766e',
      },
      {
        label: t('todayProfit') || 'Net Profit',
        data: salesTrend.map((st: any) => st.daily_profit),
        borderColor: isDark ? '#38bdf8' : '#0284c7',
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: isDark ? '#38bdf8' : '#0284c7',
      }
    ]
  };

  // Prepare category doughnut chart
  const doughnutData = {
    labels: categorySales.map((c: any) => getLocalizedName(c)),
    datasets: [
      {
        data: categorySales.map((c: any) => c.category_total),
        backgroundColor: [
          '#0f766e', '#0284c7', '#d97706', '#8b5cf6', '#059669', '#e11d48', '#64748b'
        ],
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* 1. PROFESSIONAL TOP HEADER AREA & SYSTEM STATUS BRANDING */}
      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 md:p-6 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Welcome greeting & system branding */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shadow-2xs"
              >
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                </span>
                <span>{t('systemStatusOperational')}</span>
              </span>

              <span 
                className="text-slate-300 dark:text-slate-700 hidden sm:inline"
              >•</span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">({formattedTime})</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
              <span>{t('welcomeBack')}, {user?.name || 'Admin'}</span>
              <span 
                className="text-xs px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-mono font-bold"
              >
                {user?.role || 'ADMIN'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {settings.store_name ? `${settings.store_name} — ` : ''}{t('appTagline')}
            </p>
          </div>

          {/* Quick Action Buttons & View Mode Toggle */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* View Switcher: Modules Grid vs Analytics */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => setActiveView('modules')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'modules'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>{t('homeModules')}</span>
              </button>

              <button
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'analytics'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('analyticsView')}</span>
              </button>
            </div>

            {/* Direct launch POS Terminal button */}
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-750/20 active:scale-95 transition-all"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.8)]" />
              </span>
              <ShoppingCart className="w-4 h-4" />
              <span>{t('openTerminal')}</span>
            </button>

            {/* Refresh live state */}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              title={t('refresh')}
              aria-label={t('refreshDashboardStats')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* 2. COMPACT SYSTEM METRIC CHIPS STRIP (HD High-Precision) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Today's Sales */}
        <div 
          onClick={() => setActiveTab('pos')}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold truncate">{t('todaySales')}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {formatCurrency(today.sales)}
          </div>
          <div className="mt-0.5 text-[11px] text-teal-700 dark:text-teal-400 font-mono font-medium flex items-center gap-1">
            <span>{today.invoices} {t('invoiceCount') || 'وەسڵ'}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold truncate">{t('todayProfit')}</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-sky-700 dark:text-sky-400 font-mono tracking-tight">
            {formatCurrency(today.profit)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
            {t('netProfit')}: {formatCurrency(today.net_today)}
          </div>
        </div>

        {/* Total Products in Catalog */}
        <div 
          onClick={() => setActiveTab('products')}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold truncate">{t('totalProducts')}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {inventory.total_products}
          </div>
          <div className="mt-0.5 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
            {inventory.out_of_stock > 0 ? `${inventory.out_of_stock} ${t('outOfStock') || 'تەواوبوو'}` : t('inStock')}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold truncate">{t('lowStockItems')}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`mt-2 text-base sm:text-lg font-black font-mono tracking-tight ${inventory.low_stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
            {inventory.low_stock}
          </div>
          <div className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {inventory.low_stock > 0 ? t('lowStock') : t('allCaughtUp')}
          </div>
        </div>

        {/* Customer Receivables */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="col-span-2 sm:col-span-2 md:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-rose-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold truncate">{t('customerDebts')}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight truncate">
            {formatCurrency(customers.total_customer_debt)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {customers.total_customers} {t('customers')}
          </div>
        </div>

      </div>

      {settings.expiry_alerts_enabled !== '0' && settings.expiry_alerts_dashboard !== '0' && (
        <section className="space-y-3" aria-labelledby="expiry-dashboard-title">
          <h2 id="expiry-dashboard-title" className="text-sm font-bold text-slate-900 dark:text-white">{t('expiryAlerts')}</h2>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {([
              { label: 'expiredProducts', value: expiryStats.expired_products, filter: 'expired', color: 'rose' },
              { label: 'expiringWithinPeriod', value: expiryStats.expiring_within_period, filter: `within_${settings.expiry_warning_days || 7}`, color: 'amber' },
              { label: 'expiredStockQuantity', value: expiryStats.expired_stock_quantity, filter: 'expired', color: 'rose' },
              { label: 'urgentExpiryProducts', value: expiryStats.urgent_expiry_products, filter: 'urgent', color: 'orange' },
            ] as const).map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setInventoryExpiryFilter(item.filter);
                  setActiveTab('inventory');
                }}
                className="rounded-xl border border-slate-200 bg-white p-3 text-start shadow-xs transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900 sm:p-4"
              >
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t(item.label)}</span>
                <span className={`mt-1 block text-lg font-black font-mono ${item.color === 'rose' ? 'text-rose-600 dark:text-rose-400' : item.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {item.value}
                </span>
              </button>
            ))}
          </div>
          {settings.expiry_alerts_bell !== '0' && expiryAlerts.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {expiryAlerts.slice(0, 5).map(alert => (
                <button
                  type="button"
                  key={alert.id}
                  onClick={() => {
                    setInventoryExpiryFilter(alert.filter_status);
                    setActiveTab('inventory');
                  }}
                  className={`flex w-full flex-wrap items-center justify-between gap-2 border-s-4 px-4 py-3 text-start hover:bg-slate-50 dark:hover:bg-slate-800/60 ${alert.alert_type === 'expired' ? 'border-rose-500' : alert.alert_type === 'today' ? 'border-amber-500' : alert.urgent ? 'border-orange-500' : 'border-sky-500'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{alert.name_ku} · {alert.barcode}</span>
                    <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{t('expiryDate')}: {alert.expiry_date} · {t('quantity')}: {alert.quantity}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {alert.alert_type === 'expired'
                      ? `${Math.abs(alert.days_remaining)} ${t('expiryDaysOverdue')}`
                      : alert.alert_type === 'today'
                        ? t('expiresToday')
                        : `${alert.days_remaining} ${t('expiryDaysRemaining')}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. PRIMARY CONTENT VIEW: MODULE GRID OR FINANCIAL ANALYTICS */}
      {activeView === 'modules' ? (
        <div className="space-y-4 sm:space-y-5">
          
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
            
            {/* Real-time search filter */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('searchModules')}
                className="w-full ps-9 pe-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t('allModules')} ({moduleCards.length})
              </button>

              <button
                onClick={() => setSelectedCategory('pos')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'pos'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t('pos')}
              </button>

              <button
                onClick={() => setSelectedCategory('inventory')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'inventory'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t('inventory')}
              </button>

              <button
                onClick={() => setSelectedCategory('finance')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'finance'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t('expenses')} & {t('customers')}
              </button>

              <button
                onClick={() => setSelectedCategory('admin')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'admin'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t('settings')} & {t('users')}
              </button>
            </div>

          </div>

          {/* Responsive Grid of Feature / Module Cards (Ultra-HD Reference Design Standard) */}
          {filteredModules.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800/90">
              <Boxes className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('noData')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {t('search')} "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-4.5">
              {filteredModules.map(module => {
                const IconComponent = module.icon;
                const colorStyle = getColorStyles(module.colorScheme);
                const title = getCardTitle(module);
                const description = getCardDesc(module);

                return (
                  <div
                    key={module.id}
                    onClick={() => setActiveTab(module.tab)}
                    className="group bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800/90 p-4.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-teal-500/50 dark:hover:border-teal-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    
                    {/* Top Row: Circular Icon Container + Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3.5">
                        
                        {/* Circular/Rounded Vector Icon Container */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xs flex-shrink-0 ${colorStyle.container}`}>
                          <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                        </div>

                        {/* Status / Count Badge */}
                        {module.badgeValue !== undefined && (
                          <span 
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border max-w-[120px] truncate ${getBadgeStyle(module.badgeType)}`}
                          >
                            {module.id === 'pos' && (
                              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 dark:bg-emerald-400" />
                              </span>
                            )}
                            <span className="truncate">{module.badgeValue}</span>
                          </span>
                        )}
                      </div>

                      {/* Middle: Title & Subtitle */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {description}
                      </p>
                    </div>

                    {/* Bottom Action Footer with RTL Directional Arrow */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      <span className="font-semibold text-[11px] opacity-80 group-hover:opacity-100">
                        {t('openModule')}
                      </span>
                      {isRtl ? (
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* 4. FINANCIAL ANALYTICS & RECENT ACTIVITY VIEW */
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          
          {/* Charts Row: 7-Day Trend + Categories Doughnut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            
            {/* 7-Day Sales & Profit Chart */}
            <div className="lg:col-span-2 p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>{t('salesTrend')}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{t('sevenDays')}</span>
              </div>
              <div className="h-64 sm:h-72">
                <Line 
                  data={lineChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top' as const,
                        labels: { color: textColor }
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                      },
                      y: { 
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Category Sales Distribution */}
            <div className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('salesByCategory')}
                </h3>
              </div>
              <div className="h-64 sm:h-72 flex items-center justify-center">
                {categorySales.length > 0 ? (
                  <Doughnut 
                    data={doughnutData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom' as const,
                          labels: { color: textColor }
                        }
                      }
                    }} 
                  />
                ) : (
                  <p className="text-xs text-slate-400">{t('noData')}</p>
                )}
              </div>
            </div>

          </div>

          {/* Tables Row: Top Selling Products & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Top Selling Products */}
            <div className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('topSellingProducts')}
                </h3>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>{t('view')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 text-start font-medium">#</th>
                      <th className="pb-2 text-start font-medium">{t('products')}</th>
                      <th className="pb-2 text-start font-medium">{t('quantity')}</th>
                      <th className="pb-2 text-end font-medium">{t('subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                          {t('noData')}
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((p: any, idx: number) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                            {getLocalizedName(p)}
                          </td>
                          <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono">
                            {p.total_qty}
                          </td>
                          <td className="py-2.5 text-end font-bold text-teal-700 dark:text-teal-400 font-mono">
                            {formatCurrency(p.total_revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('recentTransactions')}
                </h3>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>{t('view')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 text-start font-medium">{t('invoiceNumber')}</th>
                      <th className="pb-2 text-start font-medium">{t('customer')}</th>
                      <th className="pb-2 text-start font-medium">{t('paymentMethod')}</th>
                      <th className="pb-2 text-end font-medium">{t('grandTotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentSales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                          {t('noData')}
                        </td>
                      </tr>
                    ) : (
                      recentSales.map((sale: any) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {sale.invoice_number}
                          </td>
                          <td className="py-2.5 text-slate-600 dark:text-slate-400">
                            {sale.customer_name || t('walkInCustomer')}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              sale.payment_method === 'CASH'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : sale.payment_method === 'CARD'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                              {sale.payment_method === 'CASH' ? t('cash') : sale.payment_method === 'CARD' ? t('card') : t('credit')}
                            </span>
                          </td>
                          <td className="py-2.5 text-end font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(sale.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
