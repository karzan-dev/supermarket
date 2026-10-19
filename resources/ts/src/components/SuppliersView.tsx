import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, Plus, Pencil, Search, Trash2, Wallet, X } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Supplier } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { NumericInput } from './NumericInput';

type SupplierForm = { name: string; company: string; phone: string; address: string; notes: string };
const EMPTY_FORM: SupplierForm = { name: '', company: '', phone: '', address: '', notes: '' };
type SupplierDraft = { editingId: number | null; form: SupplierForm };
type SupplierPaymentMethod = 'CASH' | 'CARD' | 'BANK';
type PaymentDraft = { supplierId: number; amount: string; paymentMethod?: SupplierPaymentMethod };
const SUPPLIER_DRAFT_KEY = 'suppliers-form-draft';
const PAYMENT_DRAFT_KEY = 'supplier-debt-payment-draft';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));

const isSupplierDraft = (value: unknown): value is SupplierDraft => {
  if (!isRecord(value) ||
    !hasExactKeys(value, ['editingId', 'form']) ||
    !(value.editingId === null || (Number.isInteger(value.editingId) && Number(value.editingId) > 0)) ||
    !isRecord(value.form) ||
    !hasExactKeys(value.form, ['name', 'company', 'phone', 'address', 'notes'])) return false;
  const form = value.form;
  return ['name', 'company', 'phone', 'address', 'notes'].every(key => typeof form[key] === 'string');
};

const isPaymentDraft = (value: unknown): value is PaymentDraft =>
  isRecord(value) &&
  (hasExactKeys(value, ['supplierId', 'amount']) || hasExactKeys(value, ['supplierId', 'amount', 'paymentMethod'])) &&
  Number.isInteger(value.supplierId) &&
  Number(value.supplierId) > 0 &&
  typeof value.amount === 'string' &&
  (value.paymentMethod === undefined || value.paymentMethod === 'CASH' || value.paymentMethod === 'CARD' || value.paymentMethod === 'BANK');

export function SuppliersView() {
  const { t, formatCurrency, showToast } = useApp();
  const storageErrorNotified = useRef(false);
  const [initialDrafts] = useState(() => {
    let supplierDraft: SupplierDraft | null = null;
    let paymentDraft: PaymentDraft | null = null;
    const errors: unknown[] = [];
    try {
      const raw = localStorage.getItem(SUPPLIER_DRAFT_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (!isSupplierDraft(parsed)) throw new Error('Invalid supplier form draft');
        supplierDraft = parsed;
      }
    } catch (error) {
      errors.push(error);
    }
    try {
      const raw = localStorage.getItem(PAYMENT_DRAFT_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (!isPaymentDraft(parsed)) throw new Error('Invalid supplier debt payment draft');
        paymentDraft = parsed;
      }
    } catch (error) {
      errors.push(error);
    }
    return { supplierDraft, paymentDraft, errors };
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(initialDrafts.supplierDraft?.editingId ?? null);
  const [form, setForm] = useState<SupplierForm | null>(initialDrafts.supplierDraft?.form ?? null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [payingId, setPayingId] = useState<number | null>(initialDrafts.paymentDraft?.supplierId ?? null);
  const [payAmount, setPayAmount] = useState(initialDrafts.paymentDraft?.amount ?? '');
  const [paymentMethod, setPaymentMethod] = useState<SupplierPaymentMethod>(initialDrafts.paymentDraft?.paymentMethod ?? 'CASH');
  const paymentIdempotencyKey = useRef<string | null>(null);
  const reportStorageError = (error: unknown) => {
    if (!storageErrorNotified.current) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      storageErrorNotified.current = true;
    }
  };
  const clearSupplierDraft = () => {
    try {
      localStorage.removeItem(SUPPLIER_DRAFT_KEY);
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  };
  const clearPaymentDraft = () => {
    try {
      localStorage.removeItem(PAYMENT_DRAFT_KEY);
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  };

  useEffect(() => {
    initialDrafts.errors.forEach(reportStorageError);
  }, []);

  useEffect(() => {
    if (!form) return;
    try {
      localStorage.setItem(SUPPLIER_DRAFT_KEY, JSON.stringify({ editingId, form } satisfies SupplierDraft));
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  }, [editingId, form]);

  useEffect(() => {
    if (payingId === null) return;
    try {
      localStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify({ supplierId: payingId, amount: payAmount, paymentMethod } satisfies PaymentDraft));
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  }, [payingId, payAmount, paymentMethod]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const result = await apiRequest<Supplier[]>(`/api/suppliers?search=${encodeURIComponent(search)}`);
      setSuppliers(result.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSuppliers(); }, []);

  const saveSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    try {
      await apiRequest(editingId !== null ? `/api/suppliers/${editingId}` : '/api/suppliers', {
        method: editingId !== null ? 'PUT' : 'POST', body: jsonBody(form),
      });
      setForm(null);
      setEditingId(null);
      clearSupplierDraft();
      showToast(t('saved'), 'success');
      await loadSuppliers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const deleteSupplier = async () => {
    if (!deleting) return;
    try {
      await apiRequest(`/api/suppliers/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await loadSuppliers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const recordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (payingId === null) return;
    try {
      paymentIdempotencyKey.current ??= crypto.randomUUID();
      await apiRequest(`/api/suppliers/${payingId}/pay-debt`, { method: 'POST', body: jsonBody({ amount: Number(payAmount), payment_method: paymentMethod, idempotency_key: paymentIdempotencyKey.current }) });
      paymentIdempotencyKey.current = null;
      setPayingId(null);
      setPayAmount('');
      setPaymentMethod('CASH');
      clearPaymentDraft();
      await loadSuppliers();
      showToast(t('saved'), 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const paying = suppliers.find(supplier => supplier.id === payingId) ?? null;
  const filtered = suppliers.filter(item => `${item.name} ${item.company || ''} ${item.phone || ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><Building2 className="size-5 text-teal-700" /><h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('suppliers')}</h1><span className="text-xs text-slate-500">{suppliers.length}</span></div><div className="flex gap-2"><label className="relative min-w-0 flex-1 sm:w-64"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void loadSuppliers(); }} placeholder={t('search')} className="w-full rounded-md border border-slate-300 bg-white py-2 ps-9 pe-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label><button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="flex shrink-0 items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Plus className="size-4" />{t('addSupplier')}</button></div></div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-start text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950"><tr><th className="px-4 py-3">{t('name')}</th><th className="px-4 py-3">{t('company')}</th><th className="px-4 py-3">{t('phone')}</th><th className="px-4 py-3 text-end">{t('totalPurchases')}</th><th className="px-4 py-3 text-end">{t('debt')}</th><th className="px-4 py-3 text-end">{t('actions')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t('loading')}</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t('noData')}</td></tr> : filtered.map(item => <tr key={item.id} className="text-slate-700 dark:text-slate-200"><td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3">{item.company || '-'}</td><td className="px-4 py-3">{item.phone || '-'}</td><td className="px-4 py-3 text-end">{formatCurrency(item.total_purchases)}</td><td className="px-4 py-3 text-end font-semibold">{formatCurrency(item.debt)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1">{item.debt > 0 && <button title={t('payDebt')} onClick={() => { paymentIdempotencyKey.current = null; setPayingId(item.id); setPayAmount(String(item.debt)); setPaymentMethod('CASH'); }} className="rounded p-1.5 text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40"><Wallet className="size-4" /></button>}<button title={t('edit')} onClick={() => { setEditingId(item.id); setForm({ name: item.name, company: item.company || '', phone: item.phone || '', address: item.address || '', notes: item.notes || '' }); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="size-4" /></button><button title={t('delete')} onClick={() => setDeleting(item)} className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div></div>

      {form && <div className="fixed inset-0 z-50 overflow-y-auto flex items-center-safe justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={saveSupplier} className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><div className="mb-4 flex justify-between"><h2 className="font-bold text-slate-900 dark:text-white">{editingId !== null ? t('edit') : t('addSupplier')}</h2><button type="button" onClick={() => { setForm(null); setEditingId(null); clearSupplierDraft(); }} aria-label={t('cancel')}><X className="size-5" /></button></div><div className="grid gap-3 sm:grid-cols-2">{(['name', 'company', 'phone', 'address', 'notes'] as const).map(key => <label key={key} className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t(key)}{key === 'name' && ' *'}<input required={key === 'name'} value={form[key]} onChange={event => setForm(current => current && ({ ...current, [key]: event.target.value }))} placeholder={key === 'name' ? t('name') : key === 'company' ? t('company') : key === 'phone' ? '0750 000 0000' : key === 'address' ? t('address') : t('notes')} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setForm(null); setEditingId(null); clearSupplierDraft(); }} className="rounded-md border border-slate-300 px-4 py-2 text-xs dark:border-slate-700">{t('cancel')}</button><button className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white">{t('save')}</button></div></form></div>}
      {payingId !== null && <div className="fixed inset-0 z-50 overflow-y-auto flex items-center-safe justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={recordPayment} className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="mb-4 font-bold text-slate-900 dark:text-white">{t('payDebt')} · {paying?.name ?? ''}</h2><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('totalAmount')}<NumericInput required min="1" max={paying?.debt} step="0.01" value={payAmount} onValueChange={value => { setPayAmount(value); paymentIdempotencyKey.current = null; }} placeholder={t('totalAmount')} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><label className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-300">{t('paymentMethod')}<select value={paymentMethod} onChange={event => { setPaymentMethod(event.target.value as SupplierPaymentMethod); paymentIdempotencyKey.current = null; }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="CASH">{t('payment_CASH')}</option><option value="CARD">{t('payment_CARD')}</option><option value="BANK">{t('payment_BANK')}</option></select></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setPayingId(null); setPayAmount(''); setPaymentMethod('CASH'); paymentIdempotencyKey.current = null; clearPaymentDraft(); }} className="rounded-md border border-slate-300 px-4 py-2 text-xs dark:border-slate-700">{t('cancel')}</button><button className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white">{t('save')}</button></div></form></div>}
      <ConfirmModal isOpen={Boolean(deleting)} message={`${t('deleteConfirm')}: ${deleting?.name || ''}`} onCancel={() => setDeleting(null)} onConfirm={() => void deleteSupplier()} />
    </section>
  );
}