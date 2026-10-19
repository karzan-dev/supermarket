import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BellRing, BookOpen, CalendarClock, History, Trash2, Users, Wallet, X } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Customer } from '../types';
import { NumericInput } from './NumericInput';

// Strings for the notebook-debt feature, kept here so the feature stays in one file.
const TEXT = {
  ku: {
    notebookDebt: 'قەرزی دەفتەر', addNotebookDebt: 'تۆمارکردنی قەرزی دەفتەر', notebookFilter: 'تەنها قەرزی دەفتەر',
    notebookHint: 'ئەو قەرزانەی پێشتر لەسەر دەفتەر نووسراون لێرە تۆمار بکە. قاسە ناگۆڕێت.',
    customer: 'کڕیار', existingCustomer: 'کڕیاری هەبوو', newCustomer: 'کڕیاری نوێ', chooseCustomer: 'کڕیارێک هەڵبژێرە...',
    name: 'ناو', phone: 'ژمارەی تەلەفۆن', amount: 'بڕی قەرز', debtDate: 'بەرواری قەرز (لە دەفتەر)',
    dueDate: 'بەرواری دانەوە (ئارەزوومەندانە)', notes: 'تێبینی', notesPlaceholder: 'بۆ نموونە: لاپەڕە ١٢ی دەفتەر',
    save: 'پاشەکەوتکردن', cancel: 'پاشگەزبوونەوە', saving: 'پاشەکەوت دەکرێت...', saved: 'قەرزی دەفتەر تۆمارکرا',
    debtAlerts: 'ئاگادارکردنەوەی قەرزەکان', totalDebt: 'کۆی قەرزەکان', debtors: 'قەرزداران',
    overdue: 'دواکەوتوو', dueSoon: 'نزیکە', dueToday: 'ئەمڕۆ', noAlerts: 'هیچ قەرزێکی دواکەوتوو یان نزیک نییە',
    daysLate: 'ڕۆژ دواکەوتووە', daysLeft: 'ڕۆژی ماوە', topDebtors: 'گەورەترین قەرزداران',
    history: 'مێژووی قەرز', date: 'بەروار', type: 'جۆر', details: 'وردەکاری', currentDebt: 'قەرزی ئێستا',
    NOTEBOOK: 'قەرزی دەفتەر', CREDIT_SALE: 'فرۆشتنی قەرز', PAYMENT: 'دانەوە', noHistory: 'هیچ مێژوویەک نییە',
    deleteEntry: 'سڕینەوەی ئەم قەرزە', confirmDelete: 'ئەم قەرزەی دەفتەر بسڕدرێتەوە؟', deleted: 'قەرزەکە سڕایەوە',
    due: 'دانەوە', invalid: 'تکایە کڕیار و بڕی قەرز دیاری بکە', loading: 'بار دەبێت...', by: 'لەلایەن',
  },
  en: {
    notebookDebt: 'Notebook debt', addNotebookDebt: 'Add notebook debt', notebookFilter: 'Only notebook debts',
    notebookHint: 'Record debts that were previously written in the paper notebook. The cash register is not changed.',
    customer: 'Customer', existingCustomer: 'Existing customer', newCustomer: 'New customer', chooseCustomer: 'Choose a customer...',
    name: 'Name', phone: 'Phone', amount: 'Debt amount', debtDate: 'Debt date (from notebook)',
    dueDate: 'Due date (optional)', notes: 'Notes', notesPlaceholder: 'e.g. notebook page 12',
    save: 'Save', cancel: 'Cancel', saving: 'Saving...', saved: 'Notebook debt recorded',
    debtAlerts: 'Debt alerts', totalDebt: 'Total debt', debtors: 'Debtors',
    overdue: 'Overdue', dueSoon: 'Due soon', dueToday: 'Today', noAlerts: 'No overdue or upcoming debts',
    daysLate: 'days late', daysLeft: 'days left', topDebtors: 'Top debtors',
    history: 'Debt history', date: 'Date', type: 'Type', details: 'Details', currentDebt: 'Current debt',
    NOTEBOOK: 'Notebook debt', CREDIT_SALE: 'Credit sale', PAYMENT: 'Payment', noHistory: 'No history yet',
    deleteEntry: 'Delete this debt', confirmDelete: 'Delete this notebook debt?', deleted: 'Debt deleted',
    due: 'Due', invalid: 'Choose a customer and enter an amount', loading: 'Loading...', by: 'by',
  },
  ar: {
    notebookDebt: 'دين الدفتر', addNotebookDebt: 'تسجيل دين من الدفتر', notebookFilter: 'ديون الدفتر فقط',
    notebookHint: 'سجّل الديون المكتوبة سابقاً في الدفتر الورقي. لا يتغير الصندوق.',
    customer: 'العميل', existingCustomer: 'عميل موجود', newCustomer: 'عميل جديد', chooseCustomer: 'اختر عميلاً...',
    name: 'الاسم', phone: 'الهاتف', amount: 'مبلغ الدين', debtDate: 'تاريخ الدين (من الدفتر)',
    dueDate: 'تاريخ السداد (اختياري)', notes: 'ملاحظات', notesPlaceholder: 'مثال: صفحة ١٢ من الدفتر',
    save: 'حفظ', cancel: 'إلغاء', saving: 'جارٍ الحفظ...', saved: 'تم تسجيل دين الدفتر',
    debtAlerts: 'تنبيهات الديون', totalDebt: 'إجمالي الديون', debtors: 'المدينون',
    overdue: 'متأخر', dueSoon: 'قريب', dueToday: 'اليوم', noAlerts: 'لا توجد ديون متأخرة أو قريبة',
    daysLate: 'يوم تأخير', daysLeft: 'يوم متبقٍ', topDebtors: 'أكبر المدينين',
    history: 'سجل الدين', date: 'التاريخ', type: 'النوع', details: 'التفاصيل', currentDebt: 'الدين الحالي',
    NOTEBOOK: 'دين الدفتر', CREDIT_SALE: 'بيع آجل', PAYMENT: 'سداد', noHistory: 'لا يوجد سجل',
    deleteEntry: 'حذف هذا الدين', confirmDelete: 'حذف دين الدفتر هذا؟', deleted: 'تم حذف الدين',
    due: 'السداد', invalid: 'اختر عميلاً وأدخل المبلغ', loading: 'جارٍ التحميل...', by: 'بواسطة',
  },
} as const;

type TextKey = keyof typeof TEXT.en;

function useDebtText() {
  const { language } = useApp();
  return (key: TextKey) => TEXT[language]?.[key] ?? TEXT.en[key];
}

const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

interface DebtAlert {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_debt: number;
  amount: number;
  debt_date: string;
  due_date: string;
  notes: string | null;
  status: 'overdue' | 'today' | 'soon';
  days: number;
}

interface DebtAlertsData {
  total_debt: number;
  debtors_count: number;
  notebook_total: number;
  overdue_count: number;
  due_soon_count: number;
  alerts: DebtAlert[];
  top_debtors: { id: number; name: string; phone: string | null; debt: number }[];
}

interface DebtHistoryRow {
  type: 'NOTEBOOK' | 'CREDIT_SALE' | 'PAYMENT';
  id: number;
  date: string;
  due_date: string | null;
  amount: number;
  reference: string | null;
  notes: string | null;
  user_name: string | null;
}

const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const labelClass = 'block text-xs font-semibold text-slate-600 dark:text-slate-300';

/** Totals plus the list of overdue / soon-due notebook debts, shown at the top of the Customers page. */
export function DebtAlertsPanel({ refreshKey, onOpenHistory }: { refreshKey: number; onOpenHistory: (customerId: number) => void }) {
  const { formatCurrency } = useApp();
  const tt = useDebtText();
  const [data, setData] = useState<DebtAlertsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiRequest<DebtAlertsData>('/api/customers/debt-alerts')
      .then(response => { if (!cancelled) { setData(response.data); setError(''); } })
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Error'); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (error) return null;

  const stats = [
    { label: tt('totalDebt'), value: data ? formatCurrency(data.total_debt) : '…', icon: Wallet, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' },
    { label: tt('debtors'), value: data ? String(data.debtors_count) : '…', icon: Users, tone: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200' },
    { label: tt('overdue'), value: data ? String(data.overdue_count) : '…', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' },
    { label: tt('dueSoon'), value: data ? String(data.due_soon_count) : '…', icon: CalendarClock, tone: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
  ];

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800/90 dark:bg-slate-900" aria-label={tt('debtAlerts')}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
        <BellRing className="size-4 text-rose-600" />
        {tt('debtAlerts')}
      </h3>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <p className="truncate font-mono text-sm font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {data && (data.alerts.length === 0 ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{tt('noAlerts')}</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {data.alerts.map(alert => {
            const tone = alert.status === 'overdue'
              ? 'border-s-rose-500 bg-rose-50/60 dark:bg-rose-950/20'
              : alert.status === 'today' ? 'border-s-amber-500 bg-amber-50/60 dark:bg-amber-950/20' : 'border-s-sky-500 bg-sky-50/60 dark:bg-sky-950/20';
            const when = alert.status === 'overdue'
              ? `${Math.abs(alert.days)} ${tt('daysLate')}`
              : alert.status === 'today' ? tt('dueToday') : `${alert.days} ${tt('daysLeft')}`;
            return (
              <li key={alert.id}>
                <button type="button" onClick={() => onOpenHistory(alert.customer_id)} className={`flex w-full flex-wrap items-center justify-between gap-2 border-s-4 px-3 py-2.5 text-start hover:brightness-95 ${tone}`}>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{alert.customer_name}{alert.customer_phone ? ` · ${alert.customer_phone}` : ''}</span>
                    <span className="block text-[11px] text-slate-600 dark:text-slate-300">{tt('due')}: {alert.due_date} · {when}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-300">{formatCurrency(alert.amount)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ))}
    </section>
  );
}

/** Form for entering a debt copied from the paper notebook (existing or new customer). */
export function NotebookDebtModal({ customers, initialCustomerId, onClose, onSaved }: {
  customers: Customer[];
  initialCustomerId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast, formatCurrency } = useApp();
  const tt = useDebtText();
  const [mode, setMode] = useState<'existing' | 'new'>(customers.length === 0 ? 'new' : 'existing');
  const [customerId, setCustomerId] = useState(initialCustomerId ? String(initialCustomerId) : '');
  const [customerQuery, setCustomerQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [debtDate, setDebtDate] = useState(todayIso);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const idempotencyKey = useRef<string | null>(null);
  const createdCustomerId = useRef<number | null>(null);

  const matches = useMemo(() => {
    const query = customerQuery.trim().toLocaleLowerCase();
    return customers.filter(customer => !query || customer.name.toLocaleLowerCase().includes(query) || customer.phone?.includes(query)).slice(0, 50);
  }, [customers, customerQuery]);
  const selected = customers.find(customer => String(customer.id) === customerId);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!(value > 0) || (mode === 'existing' && !customerId) || (mode === 'new' && !newName.trim())) {
      showToast(tt('invalid'), 'error');
      return;
    }
    setSaving(true);
    try {
      let targetId = mode === 'existing' ? Number(customerId) : createdCustomerId.current;
      if (mode === 'new' && targetId === null) {
        const created = await apiRequest<Customer>('/api/customers', { method: 'POST', body: jsonBody({ name: newName.trim(), phone: newPhone.trim() || null }) });
        targetId = created.data.id;
        createdCustomerId.current = targetId;
      }
      idempotencyKey.current ??= crypto.randomUUID();
      await apiRequest(`/api/customers/${targetId}/notebook-debts`, {
        method: 'POST',
        body: jsonBody({ amount: value, debt_date: debtDate, due_date: dueDate || null, notes: notes.trim() || null, idempotency_key: idempotencyKey.current }),
      });
      showToast(tt('saved'), 'success');
      onSaved();
      onClose();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Any edit after a failed attempt is a new request.
  const edit = <T,>(setter: (value: T) => void) => (value: T) => { idempotencyKey.current = null; setter(value); };

  return (
    <div className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="notebook-debt-title">
      <form onSubmit={event => void submit(event)} className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="notebook-debt-title" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><BookOpen className="size-5 text-teal-700 dark:text-teal-400" />{tt('addNotebookDebt')}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tt('notebookHint')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={tt('cancel')} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="size-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800">
          {(['existing', 'new'] as const).map(option => (
            <button key={option} type="button" onClick={() => { setMode(option); idempotencyKey.current = null; }} aria-pressed={mode === option}
              className={`rounded-lg py-2 ${mode === option ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {tt(option === 'existing' ? 'existingCustomer' : 'newCustomer')}
            </button>
          ))}
        </div>

        {mode === 'existing' ? (
          <div className="space-y-2">
            <label className={labelClass}>{tt('customer')}
              <input value={customerQuery} onChange={event => setCustomerQuery(event.target.value)} placeholder={`${tt('name')} / ${tt('phone')}`} className={inputClass} />
            </label>
            <select required value={customerId} onChange={event => edit(setCustomerId)(event.target.value)} className={inputClass} size={Math.min(6, Math.max(3, matches.length + 1))} aria-label={tt('customer')}>
              <option value="" disabled>{tt('chooseCustomer')}</option>
              {matches.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ''}{customer.debt > 0 ? ` · ${formatCurrency(customer.debt)}` : ''}</option>
              ))}
            </select>
            {selected && <p className="text-[11px] text-slate-500">{tt('currentDebt')}: <span className="font-mono font-bold text-rose-600">{formatCurrency(selected.debt)}</span></p>}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>{tt('name')} *<input required maxLength={100} value={newName} onChange={event => edit(setNewName)(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>{tt('phone')}<input maxLength={30} inputMode="tel" value={newPhone} onChange={event => edit(setNewPhone)(event.target.value)} className={inputClass} /></label>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>{tt('amount')} *
            <NumericInput required min="1" step="0.01" value={amount} onValueChange={edit(setAmount)} placeholder="0" className={`${inputClass} font-mono text-base font-bold`} />
          </label>
          <label className={labelClass}>{tt('debtDate')} *
            <input type="date" required max={todayIso()} value={debtDate} onChange={event => edit(setDebtDate)(event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>{tt('dueDate')}
            <input type="date" min={debtDate} value={dueDate} onChange={event => edit(setDueDate)(event.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>{tt('notes')}
            <input maxLength={1000} value={notes} onChange={event => edit(setNotes)(event.target.value)} placeholder={tt('notesPlaceholder')} className={inputClass} />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{tt('cancel')}</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50">{saving ? tt('saving') : tt('save')}</button>
        </div>
      </form>
    </div>
  );
}

/** Timeline of one customer's debt: notebook entries, credit sales and payments. */
export function DebtHistoryModal({ customerId, canManage, onClose, onChanged }: {
  customerId: number;
  canManage: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { formatCurrency, showToast } = useApp();
  const tt = useDebtText();
  const [data, setData] = useState<{ customer: Customer; rows: DebtHistoryRow[] } | null>(null);
  const [reload, setReload] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ customer: Customer; rows: DebtHistoryRow[] }>(`/api/customers/${customerId}/debt-history`)
      .then(response => { if (!cancelled) setData(response.data); })
      .catch(cause => { if (!cancelled) showToast(cause instanceof Error ? cause.message : 'Error', 'error'); });
    return () => { cancelled = true; };
  }, [customerId, reload, showToast]);

  const removeEntry = async (entryId: number) => {
    if (!window.confirm(tt('confirmDelete'))) return;
    setDeletingId(entryId);
    try {
      await apiRequest(`/api/customers/${customerId}/notebook-debts/${entryId}`, { method: 'DELETE' });
      showToast(tt('deleted'), 'success');
      setReload(value => value + 1);
      onChanged();
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Error', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const typeTone: Record<DebtHistoryRow['type'], string> = {
    NOTEBOOK: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    CREDIT_SALE: 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    PAYMENT: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="debt-history-title">
      <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="min-w-0">
            <h3 id="debt-history-title" className="flex items-center gap-2 truncate text-base font-bold text-slate-900 dark:text-white"><History className="size-5 shrink-0 text-teal-700 dark:text-teal-400" />{tt('history')}{data ? ` · ${data.customer.name}` : ''}</h3>
            {data && <p className="mt-1 text-xs text-slate-500">{tt('currentDebt')}: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatCurrency(Number(data.customer.debt))}</span></p>}
          </div>
          <button type="button" onClick={onClose} aria-label={tt('cancel')} className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><X className="size-5" /></button>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto">
          {!data ? <p className="p-8 text-center text-sm text-slate-500">{tt('loading')}</p>
            : data.rows.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">{tt('noHistory')}</p>
              : (
                <table className="w-full text-start text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    <tr>
                      <th className="px-4 py-2.5 text-start font-semibold">{tt('date')}</th>
                      <th className="px-4 py-2.5 text-start font-semibold">{tt('type')}</th>
                      <th className="px-4 py-2.5 text-start font-semibold">{tt('details')}</th>
                      <th className="px-4 py-2.5 text-end font-semibold">{tt('amount')}</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.rows.map(row => (
                      <tr key={`${row.type}-${row.id}`}>
                        <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">{row.date}</td>
                        <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${typeTone[row.type]}`}>{tt(row.type)}</span></td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                          {[row.reference, row.notes, row.due_date ? `${tt('due')}: ${row.due_date}` : null, row.user_name ? `${tt('by')} ${row.user_name}` : null].filter(Boolean).join(' · ') || '-'}
                        </td>
                        <td className={`px-4 py-2.5 text-end font-mono font-bold ${row.amount < 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {row.amount < 0 ? '−' : '+'}{formatCurrency(Math.abs(row.amount))}
                        </td>
                        <td className="px-4 py-2.5 text-end">
                          {row.type === 'NOTEBOOK' && canManage && (
                            <button type="button" disabled={deletingId === row.id} onClick={() => void removeEntry(row.id)} title={tt('deleteEntry')} aria-label={tt('deleteEntry')} className="rounded-md p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-40">
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>
      </div>
    </div>
  );
}

export { useDebtText };
