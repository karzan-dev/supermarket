import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Product, Sale, SaleItem } from '../types';
import { NumericInput } from './NumericInput';
import { BarcodeScannerButton } from './BarcodeScannerButton';

type SaleWithItems = Sale & { customer?: { name: string } | null; items: Array<SaleItem & { product?: Product; returned_quantity: number }> };
type ReturnRecord = { id: number; invoice_number: string; total_refund: number; created_at: string; reason?: string };
type ReturnDraft = { version: 1; saleId: number; saleInvoiceNumber: string; quantities: Record<string, string>; reason: string };
type TimePeriod = 'morning' | 'noon' | 'evening' | 'maghrib' | 'night' | 'midnight';

const RETURN_DRAFT_KEY = 'returns-view-draft-v1';
const TIME_PERIODS: TimePeriod[] = ['morning', 'noon', 'evening', 'maghrib', 'night', 'midnight'];

function isReturnDraft(value: unknown): value is ReturnDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<ReturnDraft>;
  return draft.version === 1
    && typeof draft.saleId === 'number'
    && Number.isInteger(draft.saleId)
    && draft.saleId > 0
    && typeof draft.saleInvoiceNumber === 'string'
    && draft.saleInvoiceNumber.length > 0
    && typeof draft.reason === 'string'
    && !!draft.quantities
    && typeof draft.quantities === 'object'
    && !Array.isArray(draft.quantities)
    && Object.entries(draft.quantities).every(([productId, quantity]) => /^\d+$/.test(productId) && typeof quantity === 'string');
}

export function ReturnsView() {
  const { t, formatCurrency, getLocalizedName, showToast, triggerRefresh } = useApp();
  const [invoice, setInvoice] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod | ''>('');
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [matchingSales, setMatchingSales] = useState<SaleWithItems[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const draftInitialized = useRef(false);
  const draftRestoreStarted = useRef(false);

  useEffect(() => {
    if (draftRestoreStarted.current) return;
    draftRestoreStarted.current = true;
    const restoreDraft = async () => {
      let stored: string | null;
      try {
        stored = window.localStorage.getItem(RETURN_DRAFT_KEY);
      } catch (error) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        draftInitialized.current = true;
        return;
      }

      if (!stored) {
        draftInitialized.current = true;
        return;
      }

      let draft: unknown;
      try {
        draft = JSON.parse(stored);
      } catch {
        draft = null;
      }
      if (!isReturnDraft(draft)) {
        try {
          window.localStorage.removeItem(RETURN_DRAFT_KEY);
        } catch (error) {
          showToast(error instanceof Error ? error.message : t('error'), 'error');
        }
        showToast(t('error'), 'error');
        draftInitialized.current = true;
        return;
      }

      try {
        const result = await apiRequest<SaleWithItems>(`/api/sales/by-invoice/${encodeURIComponent(draft.saleInvoiceNumber)}`);
        const restoredSale = result.data;
        if (restoredSale.id !== draft.saleId || !Array.isArray(restoredSale.items)) {
          throw new Error(t('error'));
        }
        const itemIds = new Set(restoredSale.items.map(item => String(item.product_id)));
        const validQuantities = Object.fromEntries(
          Object.entries(draft.quantities).filter(([productId, quantity]) => {
            const amount = Number(quantity);
            return itemIds.has(productId) && quantity !== '' && Number.isFinite(amount) && amount >= 0;
          }),
        );
        setSale(restoredSale);
        setQuantities(Object.fromEntries(restoredSale.items.map(item => [item.product_id, validQuantities[String(item.product_id)] ?? ''])));
        setReason(draft.reason);
      } catch (error) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
      } finally {
        draftInitialized.current = true;
      }
    };
    void restoreDraft();
  }, [showToast, t]);

  useEffect(() => {
    if (!draftInitialized.current || !sale) return;
    const draft: ReturnDraft = {
      version: 1,
      saleId: sale.id,
      saleInvoiceNumber: sale.invoice_number,
      quantities,
      reason,
    };
    try {
      window.localStorage.setItem(RETURN_DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  }, [quantities, reason, sale, showToast, t]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(RETURN_DRAFT_KEY);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  useEffect(() => {
    invoiceInputRef.current?.focus();
  }, []);

  const loadReturns = async () => {
    try { const result = await apiRequest<ReturnRecord[]>('/api/returns'); setReturns(result.data); }
    catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
  };
  useEffect(() => { void loadReturns(); }, []);

  const selectSale = (selectedSale: SaleWithItems) => {
    idempotencyKey.current = null;
    setSale(selectedSale);
    setMatchingSales([]);
    setQuantities(Object.fromEntries(selectedSale.items.map(item => [item.product_id, ''])));
  };

  useEffect(() => {
    const query = invoice.trim();
    const hasDateFilter = Boolean(fromDate || toDate);
    if (hasDateFilter && (!fromDate || !toDate)) {
      setLoading(false);
      setMatchingSales([]);
      return;
    }
    if (!query && !hasDateFilter) {
      setLoading(false);
      setMatchingSales([]);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (fromDate && toDate) {
        params.set('start_date', fromDate);
        params.set('end_date', toDate);
      }
      if (timePeriod && fromDate && toDate) params.set('time_period', timePeriod);
      void apiRequest<SaleWithItems[]>(`/api/sales/search?${params.toString()}`)
        .then(result => {
          if (!active) return;
          setMatchingSales(result.data);
          const [onlyMatch] = result.data;
          if (result.data.length === 1 && onlyMatch) selectSale(onlyMatch);
        })
        .catch(error => {
          if (active) showToast(error instanceof Error ? error.message : t('error'), 'error');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [fromDate, invoice, showToast, t, timePeriod, toDate]);

  const submitReturn = async () => {
    if (!sale) return;
    const items = sale.items.map(item => ({ product_id: item.product_id, quantity: Number(quantities[item.product_id] || 0), unit_price: item.unit_price }))
      .filter(item => item.quantity > 0);
    if (sale.items.some(item => {
      const quantity = Number(quantities[item.product_id] || 0);
      return !Number.isFinite(quantity) || quantity < 0;
    })) { showToast(t('returnQuantityTooHigh'), 'error'); return; }
    if (items.length === 0) { showToast(t('selectReturnQuantity'), 'warning'); return; }
    if (items.some(item => {
      const saleItem = sale.items.find(candidate => candidate.product_id === item.product_id);
      return item.quantity > Math.max(0, (saleItem?.quantity ?? 0) - (saleItem?.returned_quantity ?? 0));
    })) {
      showToast(t('returnQuantityTooHigh'), 'error'); return;
    }
    if (reason.length > 255) { showToast(t('error'), 'error'); return; }
    setSaving(true);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      await apiRequest('/api/returns/process', { method: 'POST', body: jsonBody({ sale_id: sale.id, items, reason, idempotency_key: idempotencyKey.current }) });
      idempotencyKey.current = null;
      clearDraft();
      setSale(null); setInvoice(''); setReason(''); setQuantities({}); setMatchingSales([]);
      showToast(t('returnProcessed'), 'success'); triggerRefresh(); await loadReturns();
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
    finally { setSaving(false); }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2"><RotateCcw className="size-5 text-teal-700" /><h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('returns')}</h1></div>
      <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('fromDate')}<input type="date" max={toDate || undefined} value={fromDate} onChange={event => { setFromDate(event.target.value); setSale(null); setQuantities({}); setMatchingSales([]); }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('toDate')}<input type="date" min={fromDate || undefined} value={toDate} onChange={event => { setToDate(event.target.value); setSale(null); setQuantities({}); setMatchingSales([]); }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('timeOfDay')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" disabled={!fromDate || !toDate} onClick={() => setTimePeriod('')} className={`rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${!timePeriod ? 'border-teal-700 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>{t('allDay')}</button>
            {TIME_PERIODS.map(period => <button key={period} type="button" disabled={!fromDate || !toDate} onClick={() => setTimePeriod(period)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${timePeriod === period ? 'border-teal-700 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>{t(`time_${period}`)}</button>)}
          </div>
        </div>
        <div className="relative flex gap-2">
          <Search className="size-4 shrink-0 self-center text-slate-400" />
          <label className="sr-only" htmlFor="return-invoice">{t('invoiceNumber')} / {t('barcode')} / {t('products')}</label>
          <input ref={invoiceInputRef} id="return-invoice" value={invoice} onChange={event => { setInvoice(event.target.value); setSale(null); setQuantities({}); setMatchingSales([]); }} placeholder={`${t('invoiceNumber')} / ${t('barcode')} / ${t('products')}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white" />
          {loading && <span className="self-center text-xs text-slate-500">{t('loading')}</span>}
          <BarcodeScannerButton className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" onDetected={barcode => { setInvoice(barcode); setSale(null); setQuantities({}); setMatchingSales([]); }} />
        </div>
      </div>

      {matchingSales.length > 0 && <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="divide-y divide-slate-100 dark:divide-slate-800">{matchingSales.map(match => <button key={match.id} type="button" onClick={() => selectSale(match)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-start hover:bg-slate-50 dark:hover:bg-slate-800"><span><span className="block text-xs font-bold text-slate-900 dark:text-white">{match.invoice_number} · {match.customer?.name || match.customer_name || t('walkInCustomer')}</span><span className="mt-1 block text-[11px] text-slate-500">{match.items.map(item => getLocalizedName(item.product || item)).join(', ')}</span></span><span className="text-xs font-semibold">{formatCurrency(match.total)}</span></button>)}</div></div>}

      {sale && <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-bold text-slate-900 dark:text-white">{sale.invoice_number}</h2><p className="text-xs text-slate-500">{sale.customer_name || t('walkInCustomer')} · {new Date(sale.created_at).toLocaleString()}</p></div><span className="text-sm font-bold">{formatCurrency(sale.total)}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-xs"><thead className="border-b border-slate-200 text-start text-slate-500 dark:border-slate-800"><tr><th className="py-2 text-start">{t('products')}</th><th className="py-2 text-end">{t('quantity')}</th><th className="py-2 text-end">{t('alreadyReturned')}</th><th className="py-2 text-end">{t('returnableQuantity')}</th><th className="py-2 text-end">{t('price')}</th><th className="py-2 text-end">{t('returnQuantity')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{sale.items.map(item => { const alreadyReturned = item.returned_quantity ?? 0; const returnableQuantity = Math.max(0, item.quantity - alreadyReturned); return <tr key={item.id}><td className="py-2 font-semibold text-slate-800 dark:text-slate-200">{getLocalizedName(item.product || item)}</td><td className="py-2 text-end">{item.quantity}</td><td className="py-2 text-end">{alreadyReturned}</td><td className="py-2 text-end">{returnableQuantity}</td><td className="py-2 text-end">{formatCurrency(item.unit_price)}</td><td className="py-2 text-end"><NumericInput aria-label={`${t('returnQuantity')} ${item.product_id}`} min="0" max={returnableQuantity} step="0.01" value={quantities[item.product_id] ?? ''} onValueChange={value => { idempotencyKey.current = null; setQuantities(current => ({ ...current, [item.product_id]: value })); }} placeholder={t('returnQuantity')} disabled={returnableQuantity <= 0} className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-center disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></td></tr>; })}</tbody></table></div><div className="flex flex-col gap-2 sm:flex-row"><input value={reason} maxLength={255} onChange={event => { idempotencyKey.current = null; setReason(event.target.value); }} placeholder={t('returnReason')} className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" /><button disabled={saving} onClick={() => void submitReturn()} className="rounded-md bg-rose-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? t('loading') : t('processReturn')}</button><button type="button" disabled={saving} onClick={() => { clearDraft(); idempotencyKey.current = null; setSale(null); setReason(''); setQuantities({}); setInvoice(''); setMatchingSales([]); }} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">{t('cancel')}</button></div></div>}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><h2 className="border-b border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-800">{t('returnHistory')}</h2><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-start text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-950"><tr><th className="px-4 py-3">{t('invoiceNumber')}</th><th className="px-4 py-3">{t('date')}</th><th className="px-4 py-3">{t('notes')}</th><th className="px-4 py-3 text-end">{t('refundTotal')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{returns.length === 0 ? <tr><td colSpan={4} className="p-7 text-center text-slate-500">{t('noData')}</td></tr> : returns.map(item => <tr key={item.id}><td className="px-4 py-3 font-mono">{item.invoice_number}</td><td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="px-4 py-3">{item.reason || '-'}</td><td className="px-4 py-3 text-end font-semibold">{formatCurrency(item.total_refund)}</td></tr>)}</tbody></table></div></div>
    </section>
  );
}