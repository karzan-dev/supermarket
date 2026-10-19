import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Banknote, Download, Printer, Search, Wallet } from 'lucide-react';
import { apiRequest, apiFetch, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';
import { NumericInput } from './NumericInput';

type CashTransaction = {
  id: number;
  transaction_number: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number | string;
  balance_before: number | string;
  balance_after: number | string;
  reason: string;
  notes?: string | null;
  created_at: string;
  user?: { id: number; name: string } | null;
};

type CashShift = {
  id: number;
  opening_balance: number | string;
  expected_balance?: number | string | null;
  counted_balance?: number | string | null;
  variance?: number | string | null;
  opened_at: string;
  opener?: { id: number; name: string } | null;
};

type Dashboard = {
  balance: number | string;
  cash_in: number | string;
  cash_out: number | string;
  cash_sales: number | string;
  cash_returns: number | string;
  adjustments: number | string;
  active_shift: CashShift | null;
};

type UserOption = { id: number; name: string };
type TransactionPage = { data: CashTransaction[]; current_page: number; last_page: number; total: number };
type ModalKind = 'CASH_IN' | 'CASH_OUT' | 'OPEN' | 'CLOSE' | null;
type CashDraft = {
  modal: Exclude<ModalKind, null>;
  amount: string;
  reason: string;
  source: string;
  receiver: string;
  notes: string;
};

const CASH_DRAFT_KEY = 'cash-register-form-draft';

const TYPE_LABELS: Record<string, string> = {
  CASH_IN: 'cashInType',
  CASH_OUT: 'cashOutType',
  SALE: 'cashSaleType',
  RETURN: 'returnType',
  CUSTOMER_PAYMENT: 'customerPaymentType',
  SUPPLIER_PAYMENT: 'supplierPaymentType',
  EXPENSE: 'expenseType',
  ADJUSTMENT: 'adjustmentType',
  SHIFT_ADJUSTMENT: 'adjustmentType',
};

const SOURCE_LABELS: Record<string, string> = {
  capital: 'capitalSource',
  refund: 'returnType',
  expense: 'expenseType',
  transfer: 'transferReason',
  other: 'otherSource',
};

const TONE_CLASSES: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
};

export function CashRegisterView() {
  const { t, user, formatCurrency, showToast } = useApp();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [page, setPage] = useState<TransactionPage | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [confirmAction, setConfirmAction] = useState<'CASH_OUT' | 'CLOSE' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [source, setSource] = useState('capital');
  const [receiver, setReceiver] = useState('');
  const [notes, setNotes] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');
  const [userId, setUserId] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const idempotencyKey = useRef<string | null>(null);

  const canManage = user?.role === 'ADMIN' || Boolean(user?.permissions?.includes('cash.manage'));
  const activeShift = dashboard?.active_shift ?? null;

  useEffect(() => {
    if (draftLoaded) return;
    try {
      const rawDraft = window.localStorage.getItem(CASH_DRAFT_KEY);
      if (rawDraft) {
        const draft: unknown = JSON.parse(rawDraft);
        if (
          typeof draft === 'object' && draft !== null &&
          ['CASH_IN', 'CASH_OUT', 'OPEN', 'CLOSE'].includes((draft as CashDraft).modal) &&
          typeof (draft as CashDraft).amount === 'string' &&
          typeof (draft as CashDraft).reason === 'string' &&
          typeof (draft as CashDraft).source === 'string' &&
          typeof (draft as CashDraft).receiver === 'string' &&
          typeof (draft as CashDraft).notes === 'string'
        ) {
          const validDraft = draft as CashDraft;
          setModal(validDraft.modal);
          setAmount(validDraft.amount);
          setReason(validDraft.reason);
          setSource(validDraft.source);
          setReceiver(validDraft.receiver);
          setNotes(validDraft.notes);
        } else {
          window.localStorage.removeItem(CASH_DRAFT_KEY);
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
      if (modal) {
        const draft: CashDraft = { modal, amount, reason, source, receiver, notes };
        window.localStorage.setItem(CASH_DRAFT_KEY, JSON.stringify(draft));
      } else {
        window.localStorage.removeItem(CASH_DRAFT_KEY);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  }, [draftLoaded, modal, amount, reason, source, receiver, notes, showToast, t]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (type) params.set('type', type);
    if (userId) params.set('user_id', userId);
    if (search.trim()) params.set('search', search.trim());
    params.set('page', String(currentPage));
    params.set('per_page', '25');
    return params.toString();
  }, [from, to, type, userId, search, currentPage]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResult, transactionResult, userResult] = await Promise.all([
        apiRequest<Dashboard>('/api/cash-register'),
        apiRequest<TransactionPage>(`/api/cash-register/transactions?${queryString}`),
        apiRequest<UserOption[]>('/api/cash-register/users'),
      ]);
      setDashboard(dashboardResult.data);
      setPage(transactionResult.data);
      setUsers(userResult.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [queryString, showToast, t]);

  useEffect(() => { void loadData(); }, [loadData]);

  const resetForm = () => {
    setModal(null);
    setConfirmAction(null);
    setAmount('');
    setReason('');
    setSource('capital');
    setReceiver('');
    setNotes('');
    idempotencyKey.current = null;
    try {
      window.localStorage.removeItem(CASH_DRAFT_KEY);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const openForm = (kind: ModalKind) => {
    setAmount(kind === 'CLOSE' ? String(dashboard?.balance ?? '0.00') : '');
    setReason('');
    setSource(kind === 'CASH_IN' ? 'capital' : 'expense');
    setReceiver('');
    setNotes('');
    setModal(kind);
  };

  const saveManual = async () => {
    if (!modal || (modal !== 'CASH_IN' && modal !== 'CASH_OUT')) return;
    setSaving(true);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const sourceLabel = t(SOURCE_LABELS[source] || 'otherSource');
      const fullReason = `${sourceLabel}: ${reason.trim()}`;
      await apiRequest('/api/cash-register/transactions', {
        method: 'POST',
        body: jsonBody({
          type: modal,
          amount: Number(amount),
          reason: fullReason,
          notes: [receiver.trim() ? `${t('recipient')}: ${receiver.trim()}` : '', notes.trim()].filter(Boolean).join(' · '),
          idempotency_key: idempotencyKey.current,
        }),
      });
      showToast(t('saved'), 'success');
      resetForm();
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveShift = async () => {
    if (modal !== 'OPEN' && modal !== 'CLOSE') return;
    setSaving(true);
    try {
      await apiRequest(`/api/cash-register/shifts/${modal === 'OPEN' ? 'open' : 'close'}`, {
        method: 'POST',
        body: jsonBody({
          [modal === 'OPEN' ? 'opening_balance' : 'counted_balance']: Number(amount),
          notes,
        }),
      });
      showToast(t('saved'), 'success');
      resetForm();
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modal === 'CASH_OUT' || modal === 'CLOSE') {
      setConfirmAction(modal);
      return;
    }
    if (modal === 'OPEN') void saveShift();
    else void saveManual();
  };

  const confirmAndSave = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'CASH_OUT') void saveManual();
    if (action === 'CLOSE') void saveShift();
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams(queryString);
      params.delete('page');
      params.delete('per_page');
      const response = await apiFetch(`/api/cash-register/export?${params}`);
      if (!response.ok) throw new Error(`${t('error')} (${response.status})`);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cash-register-transactions.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const cards = [
    { key: 'cashBalance', value: dashboard?.balance ?? 0, icon: Wallet, tone: 'teal' },
    { key: 'cashIn', value: dashboard?.cash_in ?? 0, icon: ArrowDownToLine, tone: 'emerald' },
    { key: 'cashOut', value: dashboard?.cash_out ?? 0, icon: ArrowUpFromLine, tone: 'rose' },
    { key: 'cashSales', value: dashboard?.cash_sales ?? 0, icon: Banknote, tone: 'sky' },
    { key: 'cashReturns', value: dashboard?.cash_returns ?? 0, icon: ArrowUpFromLine, tone: 'amber' },
    { key: 'cashAdjustments', value: dashboard?.adjustments ?? 0, icon: Wallet, tone: 'violet' },
  ];
  const sources: Array<[string, string]> = modal === 'CASH_IN'
    ? [['capital', 'capitalSource'], ['refund', 'returnType'], ['other', 'otherSource']]
    : [['expense', 'expenseType'], ['refund', 'returnType'], ['transfer', 'transferReason'], ['other', 'otherSource']];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Wallet className="size-5 text-teal-700 dark:text-teal-400" />{t('cash-register')}
          </h1>
          <p className="mt-1 text-xs text-slate-500">{activeShift ? `${t('shiftOpen')} · ${activeShift.opener?.name ?? '-'}` : t('noOpenShift')}</p>
        </div>
        {canManage && <div className="flex flex-wrap gap-2">
          {activeShift ? <>
            <button type="button" onClick={() => openForm('CASH_IN')} className="flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"><ArrowDownToLine className="size-4" />{t('cashIn')}</button>
            <button type="button" onClick={() => openForm('CASH_OUT')} className="flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white hover:bg-rose-800"><ArrowUpFromLine className="size-4" />{t('cashOut')}</button>
            <button type="button" onClick={() => openForm('CLOSE')} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">{t('closeShift')}</button>
          </> : <button type="button" onClick={() => openForm('OPEN')} className="rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800">{t('openShift')}</button>}
        </div>}
      </div>

      <div id="cash-register-print">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ key, value, icon: Icon, tone }) => <article key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t(key)}</span><span className={`grid size-9 place-items-center rounded-lg ${TONE_CLASSES[tone]}`}><Icon className="size-4" /></span></div>
            <p className="mt-3 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{formatCurrency(Number(value))}</p>
          </article>)}
        </div>

        {activeShift && <div className="mt-4 grid gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs dark:border-teal-900 dark:bg-teal-950/30 sm:grid-cols-3">
          <p><span className="text-slate-500">{t('openingBalance')}: </span><strong>{formatCurrency(Number(activeShift.opening_balance))}</strong></p>
          <p><span className="text-slate-500">{t('expectedBalance')}: </span><strong>{formatCurrency(Number(dashboard?.balance ?? 0))}</strong></p>
          <p><span className="text-slate-500">{t('shiftOpenedBy')}: </span><strong>{activeShift.opener?.name ?? '-'}</strong></p>
        </div>}

        <div className="no-print mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <label className="min-w-36 flex-1 text-[11px] font-semibold text-slate-500">{t('searchTransaction')}<span className="relative mt-1 block"><Search className="absolute start-2.5 top-2.5 size-3.5" /><input autoFocus value={search} onChange={event => { setSearch(event.target.value); setCurrentPage(1); }} className="w-full rounded-md border border-slate-300 bg-transparent py-2 ps-8 pe-2 text-xs dark:border-slate-700 dark:text-white" /></span></label>
          <label className="text-[11px] font-semibold text-slate-500">{t('fromDate')}<input type="date" value={from} onChange={event => { setFrom(event.target.value); setCurrentPage(1); }} className="mt-1 block rounded-md border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700 dark:text-white" /></label>
          <label className="text-[11px] font-semibold text-slate-500">{t('toDate')}<input type="date" value={to} onChange={event => { setTo(event.target.value); setCurrentPage(1); }} className="mt-1 block rounded-md border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700 dark:text-white" /></label>
          <label className="text-[11px] font-semibold text-slate-500">{t('transactionType')}<select value={type} onChange={event => { setType(event.target.value); setCurrentPage(1); }} className="mt-1 block rounded-md border border-slate-300 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">{t('allTypes')}</option>{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
          <label className="text-[11px] font-semibold text-slate-500">{t('performedBy')}<select value={userId} onChange={event => { setUserId(event.target.value); setCurrentPage(1); }} className="mt-1 block max-w-40 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">{t('allUsers')}</option>{users.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <div className="ms-auto hidden gap-2 md:flex">
            <button type="button" onClick={() => void exportCsv()} className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"><Download className="size-3.5" />{t('exportCsv')}</button>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"><Printer className="size-3.5" />{t('printReport')}</button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('cashTransactions')}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-start text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950"><tr>
                <th className="px-3 py-3">{t('transactionNumber')}</th><th className="px-3 py-3">{t('transactionType')}</th>
                <th className="px-3 py-3 text-end">{t('amount')}</th><th className="px-3 py-3 text-end">{t('balanceBefore')}</th>
                <th className="px-3 py-3 text-end">{t('balanceAfter')}</th><th className="px-3 py-3">{t('reason')}</th>
                <th className="px-3 py-3">{t('performedBy')}</th><th className="px-3 py-3">{t('date')}</th><th className="px-3 py-3">{t('status')}</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? <tr><td colSpan={9} className="p-8 text-center text-slate-500">{t('loading')}</td></tr>
                  : !page?.data.length ? <tr><td colSpan={9} className="p-8 text-center text-slate-500">{t('noData')}</td></tr>
                    : page.data.map(transaction => <tr key={transaction.id} className="text-slate-700 dark:text-slate-200">
                      <td className="whitespace-nowrap px-3 py-3 font-mono font-semibold">{transaction.transaction_number}</td>
                      <td className="whitespace-nowrap px-3 py-3">{t(TYPE_LABELS[transaction.type] || 'adjustmentType')}</td>
                      <td className={`whitespace-nowrap px-3 py-3 text-end font-mono font-bold ${transaction.direction === 'IN' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{transaction.direction === 'IN' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-end font-mono">{formatCurrency(Number(transaction.balance_before))}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-end font-mono">{formatCurrency(Number(transaction.balance_after))}</td>
                      <td className="max-w-56 truncate px-3 py-3" title={transaction.reason}>{transaction.reason}</td>
                      <td className="whitespace-nowrap px-3 py-3">{transaction.user?.name ?? '-'}</td>
                      <td className="whitespace-nowrap px-3 py-3">{new Date(transaction.created_at).toLocaleString()}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{t('completed')}</span></td>
                    </tr>)}
              </tbody>
            </table>
          </div>
          {page && <div className="no-print flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
            <span>{page.total} · {page.current_page}/{page.last_page}</span>
            <div className="flex gap-2"><button type="button" disabled={page.current_page <= 1} onClick={() => setCurrentPage(value => Math.max(1, value - 1))} className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('previousPage')}</button><button type="button" disabled={page.current_page >= page.last_page} onClick={() => setCurrentPage(value => Math.min(page.last_page, value + 1))} className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">{t('nextPage')}</button></div>
          </div>}
        </div>
      </div>

      {modal && <div className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true">
        <form onSubmit={submitForm} className="my-auto w-full max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900 dark:text-white">{t(modal === 'OPEN' ? 'openShift' : modal === 'CLOSE' ? 'closeShift' : modal === 'CASH_IN' ? 'cashIn' : 'cashOut')}</h2><button type="button" onClick={resetForm} aria-label={t('cancel')} className="text-slate-500">×</button></div>
          {modal === 'CASH_IN' || modal === 'CASH_OUT' ? <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('amount')} *
            <NumericInput required min="0.01" max={modal === 'CASH_OUT' ? Number(dashboard?.balance ?? 0) : undefined} step="0.01" value={amount} onValueChange={value => { setAmount(value); idempotencyKey.current = null; }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label> : <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{modal === 'OPEN' ? t('openingBalance') : t('countedBalance')} *
            <NumericInput required min="0" step="0.01" value={amount} onValueChange={setAmount} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>}
          {modal === 'CASH_IN' || modal === 'CASH_OUT' ? <>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t(modal === 'CASH_IN' ? 'cashInSource' : 'cashOutReason')}
              <select value={source} onChange={event => { setSource(event.target.value); idempotencyKey.current = null; }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {sources.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('reason')} *
              <input required value={reason} onChange={event => { setReason(event.target.value); idempotencyKey.current = null; }} placeholder={t('enterReason')} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            {modal === 'CASH_OUT' && <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('recipient')}<input value={receiver} onChange={event => { setReceiver(event.target.value); idempotencyKey.current = null; }} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>}
          </> : modal === 'CLOSE' && <div className="rounded-md bg-slate-50 p-3 text-xs dark:bg-slate-800"><p>{t('expectedBalance')}: <strong>{formatCurrency(Number(dashboard?.balance ?? 0))}</strong></p><p className="mt-1">{t('shiftVariance')}: <strong>{formatCurrency(Number(amount || 0) - Number(dashboard?.balance ?? 0))}</strong></p></div>}
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('notes')}<textarea value={notes} onChange={event => { setNotes(event.target.value); idempotencyKey.current = null; }} rows={2} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <div className="text-[11px] text-slate-500">{t('performedBy')}: {user?.name} · {new Date().toLocaleString()}</div>
          <div className="flex justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">{t('cancel')}</button><button disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? t('loading') : t('confirm')}</button></div>
        </form>
      </div>}

      <ConfirmModal
        isOpen={confirmAction !== null}
        title={t(confirmAction === 'CLOSE' ? 'closeShift' : 'cashOut')}
        message={confirmAction === 'CLOSE'
          ? `${t('confirmCloseCashRegister')} ${t('countedBalance')}: ${formatCurrency(Number(amount || 0))}.`
          : `${t('confirmCashOut')} ${formatCurrency(Number(amount || 0))}`}
        confirmLabel={t(confirmAction === 'CLOSE' ? 'closeShift' : 'cashOut')}
        isDestructive
        onConfirm={confirmAndSave}
        onCancel={() => setConfirmAction(null)}
      />
    </section>
  );
}
