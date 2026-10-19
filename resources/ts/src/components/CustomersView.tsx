import React, { useRef, useState, useEffect } from 'react';
import { apiFetch, apiErrorMessage } from '../api';
import { useApp } from '../context/AppContext';
import type { Customer } from '../types';
import { 
  Users, Plus, Search, Phone, MapPin, DollarSign, 
  Edit2, Trash2, X, CheckCircle, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { DebtAlertsPanel, DebtHistoryModal, NotebookDebtModal, useDebtText } from './CustomerDebts';
import { BookOpen, History } from 'lucide-react';
import { NumericInput } from './NumericInput';

const CUSTOMER_FORM_DRAFT_KEY = 'supermarket.customer-form-draft';
const CUSTOMER_PAYMENT_DRAFT_KEY = 'supermarket.customer-payment-draft';

type CustomerFormData = { name: string; phone: string; address: string; notes: string };

type CustomerFormDraft = {
  version: 1;
  editingCustomerId: number | null;
  formData: CustomerFormData;
};

type CustomerPaymentDraft = { version: 1; customerId: number; amount: number; notes: string };

function isCustomerPaymentDraft(value: unknown): value is CustomerPaymentDraft {
  return typeof value === 'object' && value !== null
    && 'version' in value && value.version === 1
    && 'customerId' in value && typeof value.customerId === 'number' && Number.isFinite(value.customerId)
    && 'amount' in value && typeof value.amount === 'number' && Number.isFinite(value.amount)
    && 'notes' in value && typeof value.notes === 'string';
}

function isCustomerFormDraft(value: unknown): value is CustomerFormDraft {
  if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1
    || !('editingCustomerId' in value)
    || (value.editingCustomerId !== null && (typeof value.editingCustomerId !== 'number' || !Number.isFinite(value.editingCustomerId)))
    || !('formData' in value) || typeof value.formData !== 'object' || value.formData === null) return false;

  return 'name' in value.formData && typeof value.formData.name === 'string'
    && 'phone' in value.formData && typeof value.formData.phone === 'string'
    && 'address' in value.formData && typeof value.formData.address === 'string'
    && 'notes' in value.formData && typeof value.formData.notes === 'string';
}

export const CustomersView: React.FC = () => {
  const { t, formatCurrency, triggerRefresh, refreshTrigger, showToast, user } = useApp();
  const debtText = useDebtText();
  const canManageCustomers = user?.role === 'ADMIN' || Boolean(user?.permissions?.includes('customers.manage'));

  // Notebook debts & debt history
  const [showNotebookDebt, setShowNotebookDebt] = useState(false);
  const [notebookCustomerId, setNotebookCustomerId] = useState<number | null>(null);
  const [historyCustomerId, setHistoryCustomerId] = useState<number | null>(null);
  const [debtRefresh, setDebtRefresh] = useState(0);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debtOnly, setDebtOnly] = useState(false);
  const [notebookOnly, setNotebookOnly] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [restoredEditingCustomerId, setRestoredEditingCustomerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({ name: '', phone: '', address: '', notes: '' });
  const [customerDraftLoaded, setCustomerDraftLoaded] = useState(false);
  const customerDraftErrorShown = useRef(false);

  // Debt Payment Modal
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [restoredPaymentCustomerId, setRestoredPaymentCustomerId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNotes, setPayNotes] = useState('');
  const [paymentDraftLoaded, setPaymentDraftLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const paymentIdempotencyKey = useRef<string | null>(null);
  const paymentDraftErrorShown = useRef(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/customers?debt_only=${debtOnly}&notebook_only=${notebookOnly}`);
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [debtOnly, notebookOnly, refreshTrigger]);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(CUSTOMER_FORM_DRAFT_KEY);
      if (savedDraft) {
        const parsed: unknown = JSON.parse(savedDraft);
        if (!isCustomerFormDraft(parsed)) throw new Error('Saved customer form data is invalid.');
        setFormData(parsed.formData);
        setRestoredEditingCustomerId(parsed.editingCustomerId);
        setShowModal(true);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      try {
        localStorage.removeItem(CUSTOMER_FORM_DRAFT_KEY);
      } catch (storageError) {
        showToast(storageError instanceof Error ? storageError.message : t('error'), 'error');
      }
    } finally {
      setCustomerDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(CUSTOMER_PAYMENT_DRAFT_KEY);
      if (savedDraft) {
        const parsed: unknown = JSON.parse(savedDraft);
        if (!isCustomerPaymentDraft(parsed)) throw new Error('Saved customer payment data is invalid.');
        setRestoredPaymentCustomerId(parsed.customerId);
        setPayAmount(parsed.amount);
        setPayNotes(parsed.notes);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      try {
        localStorage.removeItem(CUSTOMER_PAYMENT_DRAFT_KEY);
      } catch (storageError) {
        showToast(storageError instanceof Error ? storageError.message : t('error'), 'error');
      }
    } finally {
      setPaymentDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (restoredPaymentCustomerId === null || loading) return;
    const customer = customers.find(item => item.id === restoredPaymentCustomerId);
    if (!customer) {
      showToast('Saved customer payment refers to a customer that no longer exists.', 'error');
      setRestoredPaymentCustomerId(null);
      setPayAmount(0);
      setPayNotes('');
      return;
    }
    setPaymentCustomer(customer);
    setRestoredPaymentCustomerId(null);
  }, [customers, loading, restoredPaymentCustomerId, showToast]);

  useEffect(() => {
    if (!paymentDraftLoaded) return;
    try {
      const customerId = paymentCustomer?.id ?? restoredPaymentCustomerId;
      if (customerId === null || customerId === undefined) {
        localStorage.removeItem(CUSTOMER_PAYMENT_DRAFT_KEY);
        paymentDraftErrorShown.current = false;
        return;
      }

      const draft: CustomerPaymentDraft = { version: 1, customerId, amount: payAmount, notes: payNotes };
      localStorage.setItem(CUSTOMER_PAYMENT_DRAFT_KEY, JSON.stringify(draft));
      paymentDraftErrorShown.current = false;
    } catch (error) {
      if (!paymentDraftErrorShown.current) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        paymentDraftErrorShown.current = true;
      }
    }
  }, [paymentCustomer, paymentDraftLoaded, payAmount, payNotes, restoredPaymentCustomerId, showToast, t]);

  useEffect(() => {
    if (restoredEditingCustomerId === null || loading) return;
    const customer = customers.find(item => item.id === restoredEditingCustomerId);
    if (!customer) {
      showToast('Saved customer form refers to a customer that no longer exists.', 'error');
      setShowModal(false);
      setRestoredEditingCustomerId(null);
      return;
    }

    setEditingCustomer(customer);
    setRestoredEditingCustomerId(null);
  }, [customers, restoredEditingCustomerId, showToast]);

  useEffect(() => {
    if (!customerDraftLoaded) return;
    try {
      if (!showModal) {
        localStorage.removeItem(CUSTOMER_FORM_DRAFT_KEY);
        customerDraftErrorShown.current = false;
        return;
      }

      const draft: CustomerFormDraft = {
        version: 1,
        editingCustomerId: editingCustomer?.id ?? restoredEditingCustomerId,
        formData,
      };
      localStorage.setItem(CUSTOMER_FORM_DRAFT_KEY, JSON.stringify(draft));
      customerDraftErrorShown.current = false;
    } catch (error) {
      if (!customerDraftErrorShown.current) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        customerDraftErrorShown.current = true;
      }
    }
  }, [customerDraftLoaded, editingCustomer, formData, restoredEditingCustomerId, showModal, showToast, t]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setRestoredEditingCustomerId(null);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setRestoredEditingCustomerId(null);
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restoredEditingCustomerId !== null && !editingCustomer) return;
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setEditingCustomer(null);
        setRestoredEditingCustomerId(null);
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    }
  };

  const handleDelete = (c: Customer) => {
    setCustomerToDelete(c);
  };

  const executeDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      const res = await apiFetch(`/api/customers/${customerToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(t('itemDeleted') || 'Customer deleted successfully', 'success');
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error') || 'Error deleting customer', 'error');
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleOpenPayDebt = (c: Customer) => {
    paymentIdempotencyKey.current = null;
    setRestoredPaymentCustomerId(null);
    setPaymentCustomer(c);
    setPayAmount(c.debt);
    setPayNotes(t('payDebt'));
  };

  const handlePayDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || payAmount <= 0) return;

    setPaying(true);
    try {
      paymentIdempotencyKey.current ??= crypto.randomUUID();
      const res = await apiFetch(`/api/customers/${paymentCustomer.id}/pay-debt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payAmount, notes: payNotes, idempotency_key: paymentIdempotencyKey.current })
      });
      const json = await res.json();
      if (json.success) {
        paymentIdempotencyKey.current = null;
        setPaymentCustomer(null);
        setPayAmount(0);
        setPayNotes('');
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    } finally {
      setPaying(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <span>{t('customers')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold font-mono">
              {customers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('customerDebts')}: <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">{formatCurrency(totalDebt)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageCustomers && (
            <button
              type="button"
              onClick={() => { setNotebookCustomerId(null); setShowNotebookDebt(true); }}
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 text-xs font-bold transition sm:flex-none"
            >
              <BookOpen className="w-4 h-4" />
              <span>{debtText('addNotebookDebt')}</span>
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-750/20 transition sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCustomer')}</span>
          </button>
        </div>
      </div>

      <DebtAlertsPanel refreshKey={debtRefresh + refreshTrigger} onOpenHistory={setHistoryCustomerId} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={debtOnly}
            onChange={e => setDebtOnly(e.target.checked)}
            className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4"
          />
          <span>{t('onlyWithDebt')}</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={notebookOnly}
            onChange={e => setNotebookOnly(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>{debtText('notebookFilter')}</span>
        </label>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 text-start font-semibold">#</th>
                <th className="py-3 px-4 text-start font-semibold">{t('name')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('phone')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('address')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('totalPurchases')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('debt')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">{t('loading')}</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">{t('noData')}</td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {c.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-end font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(c.total_purchases)}
                    </td>
                    <td className="py-3 px-4 text-end font-mono font-bold">
                      <span className={c.debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(c.debt)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHistoryCustomerId(c.id)}
                          title={debtText('history')}
                          aria-label={debtText('history')}
                          className="p-1.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded-md transition"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {canManageCustomers && (
                          <button
                            type="button"
                            onClick={() => { setNotebookCustomerId(c.id); setShowNotebookDebt(true); }}
                            title={debtText('addNotebookDebt')}
                            aria-label={debtText('addNotebookDebt')}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.debt > 0 && (
                          <button
                            onClick={() => handleOpenPayDebt(c)}
                            className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-[11px] font-bold transition flex items-center gap-1 border border-teal-200 dark:border-teal-900/40"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{t('payDebt')}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded-md transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingCustomer ? t('edit') : t('addCustomer')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{t('name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('customerNamePlaceholder')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('phone')}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0750 000 0000"
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('customerAddressPlaceholder')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('notes')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold transition shadow-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('payDebt')} - {paymentCustomer.name}
              </h3>
              <button onClick={() => setPaymentCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePayDebtSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex justify-between font-bold">
                <span>{t('debt')}:</span>
                <span className="font-mono">{formatCurrency(paymentCustomer.debt)}</span>
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('paid')} *</label>
                <NumericInput
                  min="100"
                  max={paymentCustomer.debt}
                  required
                  value={payAmount}
                  onValueChange={value => { setPayAmount(Number(value) || 0); paymentIdempotencyKey.current = null; }}
                  placeholder={t('paid')}
                  className="w-full p-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => { setPayNotes(e.target.value); paymentIdempotencyKey.current = null; }}
                  placeholder={t('notes')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold transition shadow-xs disabled:opacity-50"
                >
                  {paying ? t('loading') : t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Customer Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title={t('deleteCustomer') || 'Delete Customer'}
        message={`${t('deleteConfirm') || 'Are you sure you want to delete customer'} "${customerToDelete?.name || ''}"?`}
        onConfirm={executeDeleteCustomer}
        onCancel={() => setCustomerToDelete(null)}
      />

      {showNotebookDebt && (
        <NotebookDebtModal
          customers={customers}
          initialCustomerId={notebookCustomerId}
          onClose={() => setShowNotebookDebt(false)}
          onSaved={() => { void loadCustomers(); setDebtRefresh(value => value + 1); }}
        />
      )}

      {historyCustomerId !== null && (
        <DebtHistoryModal
          customerId={historyCustomerId}
          canManage={canManageCustomers}
          onClose={() => setHistoryCustomerId(null)}
          onChanged={() => { void loadCustomers(); setDebtRefresh(value => value + 1); }}
        />
      )}

    </div>
  );
};
