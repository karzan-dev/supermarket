import React, { useState, useEffect } from 'react';
import { apiFetch, apiRequest, apiErrorMessage } from '../api';
import { useApp } from '../context/AppContext';
import type { Product, StockMovement } from '../types';
import { NumericInput } from './NumericInput';
import { BarcodeScannerButton } from './BarcodeScannerButton';
import {
  Boxes, AlertTriangle, XCircle, Search,
  SlidersHorizontal, History, X, ArrowDown, ArrowUp,
} from 'lucide-react';

type AdjustmentReason = 'ADJUSTMENT' | 'DAMAGE' | 'EXPIRED' | 'OTHER';
type InventoryDraft = {
  productId: number;
  newQty: number;
  reason: AdjustmentReason;
  notes: string;
};

const INVENTORY_DRAFT_KEY = 'inventory-adjustment-draft';
const ADJUSTMENT_REASONS: AdjustmentReason[] = ['ADJUSTMENT', 'DAMAGE', 'EXPIRED', 'OTHER'];

export const InventoryView: React.FC = () => {
  const {
    t, formatCurrency, getLocalizedName, user, triggerRefresh, refreshTrigger,
    inventoryExpiryFilter, setInventoryExpiryFilter, showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'movements'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [movementPage, setMovementPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [movementTotals, setMovementTotals] = useState({ sold: 0, purchased: 0 });

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [resolvingProduct, setResolvingProduct] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [newQty, setNewQty] = useState<number>(0);
  const [reason, setReason] = useState<AdjustmentReason>('ADJUSTMENT');
  const [notes, setNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, movRes] = await Promise.all([
        apiFetch(`/api/products?expiry_status=${encodeURIComponent(inventoryExpiryFilter)}`).then(r => r.json()),
        apiFetch('/api/inventory/movements').then(r => r.json())
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
        setProductsLoaded(true);
      }
      if (movRes.success) {
        setMovements(movRes.data);
        setMovementTotals({
          sold: Number(movRes.totals?.sold_quantity ?? 0),
          purchased: Number(movRes.totals?.purchased_quantity ?? 0),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger, inventoryExpiryFilter]);

  useEffect(() => {
    if (draftLoaded) return;
    try {
      const rawDraft = window.localStorage.getItem(INVENTORY_DRAFT_KEY);
      if (rawDraft) {
        const draft: unknown = JSON.parse(rawDraft);
        const candidate = draft as InventoryDraft;
        if (
          typeof draft === 'object' && draft !== null &&
          Number.isSafeInteger(candidate.productId) && candidate.productId > 0 &&
          typeof candidate.newQty === 'number' && Number.isFinite(candidate.newQty) &&
          ADJUSTMENT_REASONS.includes(candidate.reason) &&
          typeof candidate.notes === 'string'
        ) {
          setSelectedProductId(candidate.productId);
          setNewQty(candidate.newQty);
          setReason(candidate.reason);
          setNotes(candidate.notes);
          setShowAdjustModal(true);
        } else {
          window.localStorage.removeItem(INVENTORY_DRAFT_KEY);
          showToast(t('error'), 'error');
        }
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setDraftLoaded(true);
    }
  }, [draftLoaded, showToast, t]);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      if (showAdjustModal && selectedProductId !== null) {
        const draft: InventoryDraft = { productId: selectedProductId, newQty, reason, notes };
        window.localStorage.setItem(INVENTORY_DRAFT_KEY, JSON.stringify(draft));
      } else {
        window.localStorage.removeItem(INVENTORY_DRAFT_KEY);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  }, [draftLoaded, showAdjustModal, selectedProductId, newQty, reason, notes, showToast, t]);

  useEffect(() => {
    if (!showAdjustModal || selectedProductId === null) return;
    const refreshedProduct = products.find(product => product.id === selectedProductId);
    if (refreshedProduct) {
      setSelectedProduct(refreshedProduct);
      setResolvingProduct(false);
      return;
    }
    if (!productsLoaded) return;

    let cancelled = false;
    setSelectedProduct(null);
    setResolvingProduct(true);
    apiRequest<Product>(`/api/products/${selectedProductId}`)
      .then(result => {
        if (!cancelled && result.data?.id === selectedProductId) {
          setSelectedProduct(result.data);
        } else if (!cancelled) {
          showToast(t('error'), 'error');
        }
      })
      .catch(error => {
        if (!cancelled) showToast(error instanceof Error ? error.message : t('error'), 'error');
      })
      .finally(() => {
        if (!cancelled) setResolvingProduct(false);
      });

    return () => { cancelled = true; };
  }, [showAdjustModal, selectedProductId, products, productsLoaded, showToast, t]);

  const handleOpenAdjust = (p: Product) => {
    setSelectedProduct(p);
    setSelectedProductId(p.id);
    setNewQty(p.quantity);
    setReason('ADJUSTMENT');
    setNotes('');
    setShowAdjustModal(true);
  };

  const cancelAdjust = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    setSelectedProductId(null);
    setNewQty(0);
    setReason('ADJUSTMENT');
    setNotes('');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productForSubmit = products.find(product => product.id === selectedProductId) ?? selectedProduct;
    if (!productForSubmit || productForSubmit.id !== selectedProductId) return;

    setAdjusting(true);
    try {
      const res = await apiFetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productForSubmit.id,
          new_quantity: newQty,
          reason,
          notes,
          user_id: user?.id || 1
        })
      });

      const json = await res.json();
      if (json.success) {
        cancelAdjust();
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.barcode.toLowerCase().includes(q) ||
      p.name_ku.toLowerCase().includes(q)
    );
  });
  const filteredMovements = movements.filter(movement => {
    const query = search.trim().toLocaleLowerCase();
    return !query || [movement.barcode, movement.name_ku]
      .some(value => value?.toLocaleLowerCase().includes(query));
  });

  const stockPageSize = 10;
  const stockTotalPages = Math.max(1, Math.ceil(filteredProducts.length / stockPageSize));
  const displayedStockPage = Math.min(stockPage, stockTotalPages);
  const paginatedProducts = filteredProducts.slice(
    (displayedStockPage - 1) * stockPageSize,
    displayedStockPage * stockPageSize,
  );
  const firstStockProduct = filteredProducts.length === 0 ? 0 : (displayedStockPage - 1) * stockPageSize + 1;
  const lastStockProduct = Math.min(displayedStockPage * stockPageSize, filteredProducts.length);
  const totalFilteredPurchaseValue = filteredProducts.reduce((sum, product) => sum + product.quantity * product.purchase_price, 0);
  const totalFilteredSellingValue = filteredProducts.reduce((sum, product) => sum + product.quantity * product.selling_price, 0);
  const lowStockCount = products.filter(p => p.quantity <= p.min_stock && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity <= 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.quantity * p.purchase_price, 0);
  const movementPageSize = 10;
  const movementTotalPages = Math.max(1, Math.ceil(filteredMovements.length / movementPageSize));
  const displayedMovementPage = Math.min(movementPage, movementTotalPages);
  const paginatedMovements = filteredMovements.slice(
    (displayedMovementPage - 1) * movementPageSize,
    displayedMovementPage * movementPageSize,
  );
  const firstMovement = filteredMovements.length === 0 ? 0 : (displayedMovementPage - 1) * movementPageSize + 1;
  const lastMovement = Math.min(displayedMovementPage * movementPageSize, filteredMovements.length);
  return (
    <div className="space-y-5">
      
      {/* Header with KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('totalInventoryValue')}</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {formatCurrency(totalStockValue)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('lowStockItems')}</span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {lowStockCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('outOfStock')}</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
              {outOfStockCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Sub tabs: Stock List vs Movements History */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'stock'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{t('inventoryOverview')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'movements'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('stockMovements')}</span>
          </button>
        </div>

        <div className="flex w-full min-w-0 flex-wrap justify-end gap-2 sm:w-auto sm:flex-1 sm:flex-nowrap">
          {activeSubTab === 'stock' && (
            <select
              value={inventoryExpiryFilter}
              onChange={event => { setInventoryExpiryFilter(event.target.value); setStockPage(1); }}
              aria-label={t('expiryStatus')}
              className="min-w-0 basis-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:basis-auto sm:py-1.5"
            >
              <option value="all">{t('allProducts')}</option>
              <option value="expired">{t('expiredProducts')}</option>
              <option value="today">{t('expiringToday')}</option>
              <option value="urgent">{t('urgentExpiryProducts')}</option>
              {[3, 7, 15, 30].map(days => (
                <option key={days} value={`within_${days}`}>{t('expiringWithin')} {days} {t('days')}</option>
              ))}
              <option value="no_expiry">{t('productsWithoutExpiry')}</option>
            </select>
          )}
          <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute inset-y-0 my-auto h-4 w-4 text-teal-600 start-3 dark:text-teal-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={e => { setSearch(e.target.value); setStockPage(1); setMovementPage(1); }}
              placeholder={`${t('search')} / ${t('barcode')}`}
              aria-label={`${t('search')} / ${t('barcode')}`}
              className="w-full rounded-xl border border-teal-200 bg-teal-50/60 py-2 pe-3 ps-9 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-teal-900 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
            />
          </label>
          <BarcodeScannerButton
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700"
            onDetected={barcode => { setSearch(barcode); setStockPage(1); setMovementPage(1); }}
          />
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'stock' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-3 px-4 text-start font-semibold">{t('products')}</th>
                  <th className="py-3 px-4 text-center font-semibold">{t('quantity')}</th>
                  <th className="py-3 px-4 text-center font-semibold">{t('minStock')}</th>
                  <th className="py-3 px-4 text-end font-semibold">{t('purchasePrice')}</th>
                  <th className="py-3 px-4 text-end font-semibold">{t('sellingPrice')}</th>
                  <th className="py-3 px-4 text-end font-semibold">{t('totalPurchaseValue')}</th>
                  <th className="py-3 px-4 text-end font-semibold">{t('totalSellingValue')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('expiryDate')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('status')}</th>
                  <th className="py-3 px-4 text-end font-semibold">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.map(p => {
                  const isOut = p.quantity <= 0;
                  const isLow = p.quantity <= p.min_stock && p.quantity > 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{getLocalizedName(p)}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {p.quantity} {getLocalizedName({
                          name_ku: p.unit_ku ?? '',
                          name_en: p.unit_en ?? '',
                          name_ar: p.unit_ar ?? '',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{p.min_stock}</td>
                      <td className="py-3 px-4 text-end font-mono text-slate-600 dark:text-slate-300">{formatCurrency(p.purchase_price)}</td>
                      <td className="py-3 px-4 text-end font-mono text-teal-800 dark:text-teal-300">{formatCurrency(p.selling_price)}</td>
                      <td className="py-3 px-4 text-end font-mono font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(p.quantity * p.purchase_price)}</td>
                      <td className="py-3 px-4 text-end font-mono font-semibold text-teal-800 dark:text-teal-300">{formatCurrency(p.quantity * p.selling_price)}</td>
                      <td className="py-3 px-4 text-slate-500">{p.expiry_date || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40' :
                          isLow ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40' :
                          'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40'
                        }`}>
                          {isOut ? t('outOfStock') : isLow ? t('lowStock') : t('inStock')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 ms-auto transition"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>{t('stockAdjustment')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-800">
            <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40">
              <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">{t('totalPurchasedQuantity')}</div>
              <div className="mt-1 font-mono text-lg font-bold text-indigo-900 dark:text-indigo-200">{movementTotals.purchased}</div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('totalPurchaseValue')}</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalFilteredPurchaseValue)}</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t('totalSellingValue')}</div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-900 dark:text-emerald-200">{formatCurrency(totalFilteredSellingValue)}</div>
            </div>
          </div>
          {filteredProducts.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800">
            <span className="text-slate-500">{t('showing')} {firstStockProduct}-{lastStockProduct} {t('of')} {filteredProducts.length}</span>
            {stockTotalPages > 1 && <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStockPage(page => Math.max(1, page - 1))} disabled={displayedStockPage === 1} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('previousPage')}</button>
              <span className="text-slate-500">{t('page')} {displayedStockPage} {t('of')} {stockTotalPages}</span>
              <button type="button" onClick={() => setStockPage(page => Math.min(stockTotalPages, page + 1))} disabled={displayedStockPage === stockTotalPages} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('nextPage')}</button>
            </div>}
          </div>}
        </div>
      ) : (
        /* Movements History Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-3 px-4 text-start font-semibold">{t('date')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('products')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('status')}</th>
                  <th className="py-3 px-4 text-center font-semibold">{t('quantity')}</th>
                  <th className="py-3 px-4 text-center font-semibold">{t('previous')} &rarr; {t('new')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('notes')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('users')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedMovements.map(m => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {getLocalizedName(m)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.movement_type === 'PURCHASE' ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40' :
                          m.movement_type === 'SALE' ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40' :
                          m.movement_type === 'RETURN' ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40' :
                          'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                        }`}>
                          {t(`reportStatus_${m.movement_type}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={`flex items-center justify-center gap-0.5 ${isPositive ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          <span>{Math.abs(m.quantity)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {m.previous_quantity} &rarr; {m.new_quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {m.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {m.user_name || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMovements.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800">
            <span className="text-slate-500">{t('showing')} {firstMovement}-{lastMovement} {t('of')} {filteredMovements.length}</span>
            {movementTotalPages > 1 && <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMovementPage(page => Math.max(1, page - 1))} disabled={displayedMovementPage === 1} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('previousPage')}</button>
              <span className="text-slate-500">{t('page')} {displayedMovementPage} {t('of')} {movementTotalPages}</span>
              <button type="button" onClick={() => setMovementPage(page => Math.min(movementTotalPages, page + 1))} disabled={displayedMovementPage === movementTotalPages} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('nextPage')}</button>
            </div>}
          </div>}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('stockAdjustment')}{selectedProduct ? ` - ${getLocalizedName(selectedProduct)}` : ''}
              </h3>
              <button type="button" onClick={cancelAdjust} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between font-bold">
                <span>{t('currentStock')}:</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">{selectedProduct?.quantity ?? (resolvingProduct ? t('loading') : '—')}</span>
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('newQuantity')} *</label>
                <NumericInput
                  min="0"
                  required
                  value={newQty}
                  onValueChange={value => setNewQty(Number(value) || 0)}
                  placeholder={t('newQuantity')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('reason')} *</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="ADJUSTMENT">{t('adjustmentManual')}</option>
                  <option value="DAMAGE">{t('damage')}</option>
                  <option value="EXPIRED">{t('expired')}</option>
                  <option value="OTHER">{t('other')}</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('reason')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={cancelAdjust}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adjusting || resolvingProduct || !selectedProduct}
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold transition"
                >
                  {adjusting ? t('loading') : t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
