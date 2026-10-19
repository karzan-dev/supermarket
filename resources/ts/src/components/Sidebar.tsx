import {
  Activity, BarChart3, Boxes, CircleDollarSign, ClipboardList, LayoutDashboard,
  Package, PackageX, RotateCcw, Settings, ShoppingBag, ShoppingCart, Tags, Truck, Users, Wallet,
} from 'lucide-react';
import { useApp, userCanAccessTab, type NavTab } from '../context/AppContext';

export const NAV_ITEMS: { id: NavTab; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'pos', icon: ShoppingCart },
  { id: 'products', icon: Package },
  { id: 'categories', icon: Tags },
  { id: 'inventory', icon: Boxes },
  { id: 'damaged-products', icon: PackageX },
  { id: 'purchases', icon: ShoppingBag },
  { id: 'returns', icon: RotateCcw },
  { id: 'customers', icon: Users },
  { id: 'suppliers', icon: Truck },
  { id: 'expenses', icon: CircleDollarSign },
  { id: 'cash-register', icon: Wallet },
  { id: 'reports', icon: BarChart3 },
  { id: 'users', icon: ClipboardList },
  { id: 'settings', icon: Settings },
  { id: 'backup', icon: Boxes },
  { id: 'activity-logs', icon: Activity },
];

export function Sidebar() {
  const { activeTab, setActiveTab, t, user } = useApp();
  const navigation = NAV_ITEMS.filter(({ id }) => userCanAccessTab(user, id)).map(({ id, icon: Icon }) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setActiveTab(id);
      }}
      aria-current={activeTab === id ? 'page' : undefined}
      className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-start text-xs font-semibold transition-colors md:w-full ${
        activeTab === id
          ? 'bg-teal-700 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{t(id)}</span>
    </button>
  ));

  return (
    <>
      <aside
        className="hidden w-56 shrink-0 overflow-y-auto border-e border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block print:hidden"
      >
      <nav aria-label={t('mainNavigation')} className="flex flex-col gap-1 overflow-y-auto p-3">
        {navigation}
      </nav>
      </aside>
    </>
  );
}