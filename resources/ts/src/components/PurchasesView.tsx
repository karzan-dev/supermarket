import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { apiRequest } from '../api';
import { useApp } from '../context/AppContext';
import type { Product, Purchase, Supplier } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { NumericInput } from './NumericInput';

type PurchaseLine = { product_id: string; product_name?: string; quantity: string; purchase_price: string };
type PurchaseDraft = {
  version: 1;
  supplierId: string;
  invoiceNumber: string;
  paidAmount: string;
  notes: string;
  lines: PurchaseLine[];
  editingPurchaseId: number | null;
};

const PURCHASE_DRAFT_KEY = 'purchases-view-draft-v1';

function isPurchaseDraft(value: unknown): value is PurchaseDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<PurchaseDraft>;
  return draft.version === 1
    && typeof draft.supplierId === 'string'
    && typeof draft.invoiceNumber === 'string'
    && typeof draft.paidAmount === 'string'
    && typeof draft.notes === 'string'
    && (draft.editingPurchaseId === null || (typeof draft.editingPurchaseId === 'number' && Number.isInteger(draft.editingPurchaseId) && draft.editingPurchaseId > 0))
    && Array.isArray(draft.lines)
    && draft.lines.length > 0
    && draft.lines.every(line => !!line && typeof line.product_id === 'string' && (line.product_name === undefined || typeof line.product_name === 'string') && typeof line.quantity === 'string' && typeof line.purchase_price === 'string');
}

export function PurchasesView() {
  const { t, formatCurrency, showToast } = useApp();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState('');
  const [enlargedReceiptImage, setEnlargedReceiptImage] = useState<string | null>(null);
  const receiptImageInputRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<PurchaseLine[]>([{ product_id: '', quantity: '1', purchase_price: '' }]);
  const draftInitialized = useRef(false);
  const draftRestoreStarted = useRef(false);

  useEffect(() => {
    if (draftRestoreStarted.current) return;
    draftRestoreStarted.current = true;
    const restoreDraft = async () => {
      let stored: string | null;
      try {
        stored = window.localStorage.getItem(PURCHASE_DRAFT_KEY);
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
      if (!isPurchaseDraft(draft)) {
        try {
          window.localStorage.removeItem(PURCHASE_DRAFT_KEY);
        } catch (error) {
          showToast(error instanceof Error ? error.message : t('error'), 'error');
        }
        showToast(t('error'), 'error');
        draftInitialized.current = true;
        return;
      }

      setSupplierId(draft.supplierId);
      setInvoiceNumber(draft.invoiceNumber);
      setPaidAmount(draft.paidAmount);
      setNotes(draft.notes);
      setLines(draft.lines);
      setEditingPurchaseId(draft.editingPurchaseId);
      setReceiptImage(null);
      if (draft.editingPurchaseId !== null) {
        try {
          const result = await apiRequest<Purchase>(`/api/purchases/${draft.editingPurchaseId}`);
          setEditingPurchase(result.data);
        } catch (error) {
          showToast(error instanceof Error ? error.message : t('error'), 'error');
        }
      }
      setOpen(true);
      draftInitialized.current = true;
    };
    void restoreDraft();
  }, [showToast, t]);

  useEffect(() => {
    if (!draftInitialized.current || !open) return;
    const draft: PurchaseDraft = {
      version: 1,
      supplierId,
      invoiceNumber,
      paidAmount,
      notes,
      lines,
      editingPurchaseId,
    };
    try {
      window.localStorage.setItem(PURCHASE_DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  }, [editingPurchaseId, invoiceNumber, lines, notes, open, paidAmount, showToast, supplierId, t]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(PURCHASE_DRAFT_KEY);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  useEffect(() => {
    if (!receiptImage) {
      setReceiptImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(receiptImage);
    setReceiptImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [receiptImage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [purchaseResult, supplierResult, productResult] = await Promise.all([
        apiRequest<Purchase[]>('/api/purchases'), apiRequest<Supplier[]>('/api/suppliers'), apiRequest<Product[]>('/api/products'),
      ]);
      setPurchases(purchaseResult.data); setSuppliers(supplierResult.data); setProducts(productResult.data);
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadData(); }, []);

  const openForm = () => {
    setEditingPurchase(null);
    setEditingPurchaseId(null);
    setSupplierId(String(suppliers[0]?.id ?? ''));
    setInvoiceNumber(`PUR-${Date.now()}`);
    setPaidAmount('0'); setNotes(''); setReceiptImage(null);
    setLines([{ product_id: String(products[0]?.id ?? ''), product_name: products[0]?.name_ku ?? '', quantity: '1', purchase_price: String(products[0]?.purchase_price ?? '') }]);
    setOpen(true);
  };

  const openEditForm = async (purchase: Purchase) => {
    setSaving(true);
    try {
      const result = await apiRequest<Purchase & { items: Array<{ product_id: number; quantity: number; purchase_price: number }> }>(`/api/purchases/${purchase.id}`);
      const details = result.data;
      setEditingPurchase(details);
      setEditingPurchaseId(details.id);
      setSupplierId(String(details.supplier_id));
      setInvoiceNumber(details.invoice_number);
      setPaidAmount(String(details.paid_amount));
      setNotes(details.notes ?? '');
      setReceiptImage(null);
      setLines(details.items.map(item => ({
        product_id: String(item.product_id),
        product_name: products.find(product => product.id === item.product_id)?.name_ku ?? '',
        quantity: String(item.quantity),
        purchase_price: String(item.purchase_price),
      })));
      setOpen(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateLine = (index: number, update: Partial<PurchaseLine>) => setLines(current => current.map((line, lineIndex) => lineIndex === index ? { ...line, ...update } : line));
  const total = lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.purchase_price || 0), 0);

  const savePurchase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lines.some(line => !products.some(product => product.id === Number(line.product_id)))) {
      showToast(t('error'), 'error');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('supplier_id', supplierId);
      body.append('invoice_number', invoiceNumber);
      body.append('paid_amount', paidAmount);
      body.append('notes', notes);
      if (editingPurchaseId !== null) body.append('_method', 'PUT');
      lines.forEach((line, index) => {
        body.append(`items[${index}][product_id]`, line.product_id);
        body.append(`items[${index}][quantity]`, line.quantity);
        body.append(`items[${index}][purchase_price]`, line.purchase_price);
      });
      if (receiptImage) body.append('receipt_image', receiptImage);

      await apiRequest(editingPurchaseId !== null ? `/api/purchases/${editingPurchaseId}` : '/api/purchases', { method: 'POST', body });
      clearDraft();
      setOpen(false); setEditingPurchase(null); setEditingPurchaseId(null); showToast(t('saved'), 'success'); await loadData();
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
    finally { setSaving(false); }
  };

  const deletePurchase = async () => {
    if (!deletingPurchase) return;
    setSaving(true);
    try {
      await apiRequest(`/api/purchases/${deletingPurchase.id}`, { method: 'DELETE' });
      setDeletingPurchase(null);
      showToast(t('itemDeleted'), 'success');
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><ShoppingBag className="size-5 text-teal-700" /><h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('purchases')}</h1><span className="text-xs text-slate-500">{purchases.length}</span></div><button onClick={openForm} className="flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Plus className="size-4" />{t('addPurchase')}</button></div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-start text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">{t('invoiceNumber')}</th><th className="px-4 py-3">{t('purchaseReceiptImage')}</th>
                <th className="px-4 py-3">{t('supplier')}</th><th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3 text-end">{t('total')}</th><th className="px-4 py-3 text-end">{t('paid')}</th>
                <th className="px-4 py-3">{t('status')}</th><th className="px-4 py-3 text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={8} className="p-8 text-center text-slate-500">{t('loading')}</td></tr>
                : purchases.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-slate-500">{t('noData')}</td></tr>
                  : purchases.map(purchase => (
                    <tr key={purchase.id} className="text-slate-700 dark:text-slate-200">
                      <td className="px-4 py-3 font-mono">{purchase.invoice_number}</td>
                      <td className="px-4 py-3">{purchase.receipt_image_url ? <button type="button" onClick={() => setEnlargedReceiptImage(purchase.receipt_image_url ?? null)} aria-label={t('enlargeImage')} className="cursor-zoom-in"><img src={purchase.receipt_image_url} alt={t('purchaseReceiptImage')} className="size-12 rounded object-cover" /></button> : '-'}</td>
                      <td className="px-4 py-3 font-semibold">{purchase.supplier?.name || purchase.supplier_name || purchase.supplier?.company || purchase.supplier_company || '-'}</td>
                      <td className="px-4 py-3">{new Date(purchase.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-end font-semibold">{formatCurrency(purchase.total)}</td>
                      <td className="px-4 py-3 text-end">{formatCurrency(purchase.paid_amount)}</td>
                      <td className="px-4 py-3">{t(purchase.payment_status.toLowerCase())}</td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1">
                        <button type="button" title={t('edit')} onClick={() => void openEditForm(purchase)} disabled={saving} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"><Pencil className="size-4" /></button>
                        <button type="button" title={t('delete')} onClick={() => setDeletingPurchase(purchase)} disabled={saving} className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/40"><Trash2 className="size-4" /></button>
                      </div></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {enlargedReceiptImage && <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center-safe justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label={t('purchaseReceiptImage')} onClick={() => setEnlargedReceiptImage(null)}><button type="button" onClick={() => setEnlargedReceiptImage(null)} aria-label={t('close')} className="absolute end-4 top-4 rounded-full bg-white p-2 text-slate-900"><X className="size-5" /></button><img src={enlargedReceiptImage} alt={t('purchaseReceiptImage')} className="max-h-[90vh] max-w-full rounded-md object-contain" onClick={event => event.stopPropagation()} /></div>}

      {open && <div className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={savePurchase} className="my-auto w-full max-w-3xl rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900 dark:text-white">{editingPurchaseId !== null ? t('editPurchase') : t('addPurchase')}</h2><button type="button" onClick={() => { clearDraft(); setOpen(false); setEditingPurchase(null); setEditingPurchaseId(null); }} aria-label={t('cancel')}><X className="size-5" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">{t('supplier')}<select required value={supplierId} onChange={event => setSupplierId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><label className="text-xs font-semibold">{t('invoiceNumber')}<input required value={invoiceNumber} onChange={event => setInvoiceNumber(event.target.value)} placeholder={t('invoiceNumber')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label></div>
        <label className="mt-4 block text-xs font-semibold">{t('purchaseReceiptImage')}<input ref={receiptImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={event => { setReceiptImage(event.target.files?.[0] ?? null); event.target.value = ''; }} className="mt-1 block w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950 dark:text-white" /><span className="mt-1 block font-normal text-slate-500">{t('receiptImageHint')}</span></label>
        {(receiptImagePreview || editingPurchase?.receipt_image_url) && <div className="mt-3 flex items-start gap-3"><img src={receiptImagePreview || editingPurchase?.receipt_image_url || ''} alt={t('purchaseReceiptImage')} className="max-h-40 max-w-full rounded-md object-contain" />{receiptImagePreview && <button type="button" onClick={() => { setReceiptImage(null); if (receiptImageInputRef.current) receiptImageInputRef.current.value = ''; }} className="text-xs font-semibold text-rose-600">{t('removeImage')}</button>}</div>}
        <div className="mt-4 space-y-2">{lines.map((line, index) => {
          const query = (line.product_name || products.find(product => product.id === Number(line.product_id))?.name_ku || '').trim().toLocaleLowerCase();
          const matches = line.product_id || !query
            ? []
            : products.filter(product => product.name_ku.toLocaleLowerCase().startsWith(query)).slice(0, 8);
          return <div key={index} className="grid grid-cols-[minmax(0,1fr)_5rem_7rem_2rem] items-end gap-2">
            <label className="min-w-0 text-xs font-semibold">{t('products')}
              <div className="relative">
                <input required autoComplete="off" value={line.product_name || products.find(product => product.id === Number(line.product_id))?.name_ku || ''} onChange={event => {
                  const value = event.target.value;
                  const product = products.find(item => item.name_ku.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase());
                  updateLine(index, product
                    ? { product_id: String(product.id), product_name: product.name_ku, purchase_price: String(product.purchase_price) }
                    : { product_id: '', product_name: value, purchase_price: '' });
                }} placeholder={t('products')} className="mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                {matches.length > 0 && <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  {matches.map(product => <li key={product.id}>
                    <button type="button" onClick={() => updateLine(index, { product_id: String(product.id), product_name: product.name_ku, purchase_price: String(product.purchase_price) })} className="flex w-full items-center justify-between gap-2 px-2 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="truncate">{product.name_ku}</span><span className="shrink-0 font-mono text-slate-500">{product.barcode}</span>
                    </button>
                  </li>)}
                </ul>}
              </div>
            </label>
            <label className="text-xs font-semibold">{t('quantity')}<NumericInput required min="0.01" step="0.01" value={line.quantity} onValueChange={value => updateLine(index, { quantity: value })} placeholder={t('quantity')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
            <label className="text-xs font-semibold">{t('purchasePrice')}<NumericInput required min="0" step="0.01" value={line.purchase_price} onValueChange={value => updateLine(index, { purchase_price: value })} placeholder={t('purchasePrice')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
            <button type="button" onClick={() => setLines(current => current.filter((_, lineIndex) => lineIndex !== index))} aria-label={t('delete')} className="mb-1 rounded p-1 text-rose-600"><Trash2 className="size-4" /></button>
          </div>;
        })}<button type="button" onClick={() => setLines(current => [...current, { product_id: String(products[0]?.id ?? ''), product_name: products[0]?.name_ku ?? '', quantity: '1', purchase_price: String(products[0]?.purchase_price ?? '') }])} className="flex items-center gap-1 text-xs font-semibold text-teal-700"><Plus className="size-4" />{t('addItem')}</button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">{t('paid')}<NumericInput min="0" max={total} step="0.01" value={paidAmount} onValueChange={setPaidAmount} placeholder={t('paid')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><label className="text-xs font-semibold">{t('notes')}<input value={notes} onChange={event => setNotes(event.target.value)} placeholder={t('notes')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label></div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800"><span className="text-sm font-bold">{t('total')}: {formatCurrency(total)}</span><div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md border border-slate-300 px-4 py-2 text-xs dark:border-slate-700">{t('cancel')}</button><button disabled={saving || lines.length === 0} className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? t('loading') : t('save')}</button></div></div>
      </form></div>}
      <ConfirmModal
        isOpen={Boolean(deletingPurchase)}
        message={`${t('deleteConfirm')}: ${deletingPurchase?.invoice_number ?? ''}`}
        onCancel={() => setDeletingPurchase(null)}
        onConfirm={() => void deletePurchase()}
      />
    </section>
  );
}