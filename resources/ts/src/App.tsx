import React, { lazy, Suspense, useEffect } from 'react';
import { AppProvider, useApp, userCanAccessTab } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ToastContainer } from './components/ToastContainer';
import { LoginView } from './components/LoginView';

const DashboardView = lazy(() => import('./components/DashboardView').then(module => ({ default: module.DashboardView })));
const PosView = lazy(() => import('./components/PosView').then(module => ({ default: module.PosView })));
const ProductsView = lazy(() => import('./components/ProductsView').then(module => ({ default: module.ProductsView })));
const CategoriesUnitsView = lazy(() => import('./components/CategoriesUnitsView').then(module => ({ default: module.CategoriesUnitsView })));
const InventoryView = lazy(() => import('./components/InventoryView').then(module => ({ default: module.InventoryView })));
const DamagedProductsView = lazy(() => import('./components/DamagedProductsView').then(module => ({ default: module.DamagedProductsView })));
const PurchasesView = lazy(() => import('./components/PurchasesView').then(module => ({ default: module.PurchasesView })));
const CustomersView = lazy(() => import('./components/CustomersView').then(module => ({ default: module.CustomersView })));
const SuppliersView = lazy(() => import('./components/SuppliersView').then(module => ({ default: module.SuppliersView })));
const ExpensesView = lazy(() => import('./components/ExpensesView').then(module => ({ default: module.ExpensesView })));
const CashRegisterView = lazy(() => import('./components/CashRegisterView').then(module => ({ default: module.CashRegisterView })));
const ReturnsView = lazy(() => import('./components/ReturnsView').then(module => ({ default: module.ReturnsView })));
const ReportsView = lazy(() => import('./components/ReportsView').then(module => ({ default: module.ReportsView })));
const UsersView = lazy(() => import('./components/UsersView').then(module => ({ default: module.UsersView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));
const BackupView = lazy(() => import('./components/BackupView').then(module => ({ default: module.BackupView })));
const ActivityLogsView = lazy(() => import('./components/ActivityLogsView').then(module => ({ default: module.ActivityLogsView })));

const ViewLoading: React.FC = () => <div className="p-8 text-center text-sm text-slate-500">Loading...</div>;

const MainLayout: React.FC = () => {
  const { user, activeTab, setActiveTab, isFullScreen } = useApp();
  const visibleTab = user && !userCanAccessTab(user, activeTab)
    ? user.role === 'CASHIER' ? 'pos' : 'dashboard'
    : activeTab;

  useEffect(() => {
    if (!user || userCanAccessTab(user, activeTab)) return;
    setActiveTab(user.role === 'CASHIER' ? 'pos' : 'dashboard');
  }, [user, activeTab, setActiveTab]);

  if (!user) {
    return <LoginView />;
  }

  if (isFullScreen) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-4">
          <Suspense fallback={<ViewLoading />}>
            {visibleTab === 'dashboard' && <DashboardView />}
            {(visibleTab === 'pos' || visibleTab === 'cashier') && <PosView />}
            {visibleTab === 'products' && <ProductsView />}
            {visibleTab === 'categories' && <CategoriesUnitsView />}
            {visibleTab === 'inventory' && <InventoryView />}
            {visibleTab === 'damaged-products' && <DamagedProductsView />}
            {visibleTab === 'purchases' && <PurchasesView />}
            {visibleTab === 'returns' && <ReturnsView />}
            {visibleTab === 'customers' && <CustomersView />}
            {visibleTab === 'suppliers' && <SuppliersView />}
            {visibleTab === 'expenses' && <ExpensesView />}
            {visibleTab === 'cash-register' && <CashRegisterView />}
            {visibleTab === 'reports' && <ReportsView />}
            {visibleTab === 'users' && <UsersView />}
            {visibleTab === 'settings' && <SettingsView />}
            {visibleTab === 'backup' && <BackupView />}
            {visibleTab === 'activity-logs' && <ActivityLogsView />}
          </Suspense>
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Full-width Top Navbar spanning the entire viewport header */}
      <Navbar />

      {/* Layout body containing Sidebar and Main Content without any top gaps */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-row">
        {/* Responsive Sidebar & Mobile Drawer */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<ViewLoading />}>
              {visibleTab === 'dashboard' && <DashboardView />}
              {(visibleTab === 'pos' || visibleTab === 'cashier') && <PosView />}
              {visibleTab === 'products' && <ProductsView />}
              {visibleTab === 'categories' && <CategoriesUnitsView />}
              {visibleTab === 'inventory' && <InventoryView />}
              {visibleTab === 'damaged-products' && <DamagedProductsView />}
              {visibleTab === 'purchases' && <PurchasesView />}
              {visibleTab === 'returns' && <ReturnsView />}
              {visibleTab === 'customers' && <CustomersView />}
              {visibleTab === 'suppliers' && <SuppliersView />}
              {visibleTab === 'expenses' && <ExpensesView />}
              {visibleTab === 'cash-register' && <CashRegisterView />}
              {visibleTab === 'reports' && <ReportsView />}
              {visibleTab === 'users' && <UsersView />}
              {visibleTab === 'settings' && <SettingsView />}
              {visibleTab === 'backup' && <BackupView />}
              {visibleTab === 'activity-logs' && <ActivityLogsView />}
            </Suspense>
          </div>
        </main>
      </div>

      <MobileNav />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
