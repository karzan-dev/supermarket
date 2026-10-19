import React, { useRef, useState, useEffect } from 'react';
import { apiFetch, apiErrorMessage, apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Expense, ExpenseCategory } from '../types';
import { 
  Receipt, Plus, Calendar, Trash2, X, AlertCircle, DollarSign, Wallet 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { NumericInput } from './NumericInput';

const EXPENSE_FORM_DRAFT_KEY = 'supermarket.expense-form-draft';

const CATEGORY_TEXT = {
  ku: { add: 'زیادکردنی جۆری خەرجی نوێ', remove: 'سڕینەوەی ئەم جۆرە', placeholder: 'ناوی خەرجی، بۆ نموونە: ئاو', save: 'زیادکردن', required: 'ناوی خەرجی بنووسە', added: 'جۆری خەرجی زیادکرا', confirmRemove: 'ئەم جۆرە خەرجییە بسڕدرێتەوە' },
  en: { add: 'Add a new expense type', remove: 'Delete this type', placeholder: 'Expense name, e.g. Water', save: 'Add', required: 'Enter an expense name', added: 'Expense type added', confirmRemove: 'Delete the expense type' },
  ar: { add: 'إضافة نوع مصروف جديد', remove: 'حذف هذا النوع', placeholder: 'اسم المصروف، مثال: الماء', save: 'إضافة', required: 'أدخل اسم المصروف', added: 'تمت إضافة نوع المصروف', confirmRemove: 'حذف نوع المصروف' },
} as const;

type ExpenseFormDraft = {
  version: 1;
  categoryId: number;
  amount: number;
  date: string;
  description: string;
};

function isExpenseFormDraft(value: unknown): value is ExpenseFormDraft {
  if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1) return false;
  return 'categoryId' in value && typeof value.categoryId === 'number' && Number.isFinite(value.categoryId)
    && 'amount' in value && typeof value.amount === 'number' && Number.isFinite(value.amount)
    && 'date' in value && typeof value.date === 'string'
    && 'description' in value && typeof value.description === 'string';
}

export const ExpensesView: React.FC = () => {
  const { t, formatCurrency, getLocalizedName, user, triggerRefresh, refreshTrigger, showToast, language } = useApp();
  const catText = CATEGORY_TEXT[language] ?? CATEGORY_TEXT.en;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  // null = the "new category" row is closed
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const addCategory = async () => {
    const name = newCategoryName?.trim();
    if (!name) {
      showToast(catText.required, 'error');
      return;
    }
    setSavingCategory(true);
    try {
      const created = await apiRequest<ExpenseCategory>('/api/expense-categories', { method: 'POST', body: jsonBody({ name_ku: name }) });
      setCategories(current => [...current, created.data]);
      setCategoryId(created.data.id);
      idempotencyKey.current = null;
      setNewCategoryName(null);
      showToast(catText.added, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async () => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !window.confirm(`${catText.confirmRemove} «${getLocalizedName(category)}»?`)) return;
    try {
      await apiRequest(`/api/expense-categories/${category.id}`, { method: 'DELETE' });
      const remaining = categories.filter(c => c.id !== category.id);
      setCategories(remaining);
      setCategoryId(remaining[0]?.id ?? 0);
      idempotencyKey.current = null;
      showToast(t('itemDeleted'), 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };
  const [loading, setLoading] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Add Modal
  const [showModal, setShowModal] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [expenseDraftLoaded, setExpenseDraftLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const idempotencyKey = useRef<string | null>(null);
  const expenseDraftErrorShown = useRef(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        apiFetch('/api/expenses').then(r => r.json()),
        apiFetch('/api/expense-categories').then(r => r.json())
      ]);

      if (expRes.success) setExpenses(expRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(EXPENSE_FORM_DRAFT_KEY);
      if (savedDraft) {
        const parsed: unknown = JSON.parse(savedDraft);
        if (!isExpenseFormDraft(parsed)) throw new Error('Saved expense form data is invalid.');
        setCategoryId(parsed.categoryId);
        setAmount(parsed.amount);
        setDate(parsed.date);
        setDescription(parsed.description);
        setShowModal(true);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      try {
        localStorage.removeItem(EXPENSE_FORM_DRAFT_KEY);
      } catch (storageError) {
        showToast(storageError instanceof Error ? storageError.message : t('error'), 'error');
      }
    } finally {
      setExpenseDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!expenseDraftLoaded) return;
    try {
      if (!showModal) {
        localStorage.removeItem(EXPENSE_FORM_DRAFT_KEY);
        expenseDraftErrorShown.current = false;
        return;
      }

      const draft: ExpenseFormDraft = { version: 1, categoryId, amount, date, description };
      localStorage.setItem(EXPENSE_FORM_DRAFT_KEY, JSON.stringify(draft));
      expenseDraftErrorShown.current = false;
    } catch (error) {
      if (!expenseDraftErrorShown.current) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        expenseDraftErrorShown.current = true;
      }
    }
  }, [amount, categoryId, date, description, expenseDraftLoaded, showModal, showToast, t]);

  const handleOpenAdd = () => {
    setCategoryId(categories[0]?.id || 1);
    setAmount(0);
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    idempotencyKey.current = null;
    setShowModal(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setSaving(true);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const res = await apiFetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          amount,
          date,
          description,
          user_id: user?.id || 1,
          idempotency_key: idempotencyKey.current,
        })
      });

      const json = await res.json();
      if (json.success) {
        idempotencyKey.current = null;
        setShowModal(false);
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exp: Expense) => {
    setExpenseToDelete(exp);
  };

  const executeDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      const res = await apiFetch(`/api/expenses/${expenseToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(t('itemDeleted') || 'Expense deleted successfully', 'success');
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error') || 'Error deleting expense', 'error');
    } finally {
      setExpenseToDelete(null);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <span>{t('expenses')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold font-mono">
              {expenses.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('totalExpenses')}: <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">{formatCurrency(totalExpenseAmount)}</span>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-750/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addExpense')}</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 text-start font-semibold">#</th>
                <th className="py-3 px-4 text-start font-semibold">{t('date')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('category')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('notes')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('users')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('totalAmount')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">{t('loading')}</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">{t('noData')}</td>
                </tr>
              ) : (
                expenses.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {getLocalizedName({ name_ku: e.category_ku, name_en: e.category_en, name_ar: e.category_ar })}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {e.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {e.user_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-end font-mono font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => handleDelete(e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('addExpense')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('category')} *</label>
                <div className="flex gap-2">
                  <select
                    value={categoryId}
                    onChange={e => { setCategoryId(Number(e.target.value)); idempotencyKey.current = null; }}
                    className="min-w-0 flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{getLocalizedName(c)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setNewCategoryName(name => name ?? '')}
                    title={catText.add}
                    aria-label={catText.add}
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {categories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void deleteCategory()}
                      title={catText.remove}
                      aria-label={catText.remove}
                      className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 dark:border-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {newCategoryName !== null && (
                  <div className="mt-2 flex gap-2 rounded-xl border border-teal-200 bg-teal-50/60 p-2 dark:border-teal-900 dark:bg-teal-950/30">
                    <input
                      autoFocus
                      value={newCategoryName}
                      maxLength={100}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addCategory(); } if (e.key === 'Escape') setNewCategoryName(null); }}
                      placeholder={catText.placeholder}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button type="button" disabled={savingCategory} onClick={() => void addCategory()} className="rounded-lg bg-teal-700 px-3 font-bold text-white disabled:opacity-50">
                      {savingCategory ? t('loading') : catText.save}
                    </button>
                    <button type="button" onClick={() => setNewCategoryName(null)} aria-label={t('cancel')} className="px-1 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('totalAmount')} *</label>
                <NumericInput
                  min="100"
                  required
                  value={amount || ''}
                  onValueChange={value => { setAmount(Number(value) || 0); idempotencyKey.current = null; }}
                  placeholder="0"
                  className="w-full p-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('date')} *</label>
                <input
                  type="date"
                  required
                  value={date || ''}
                  onChange={e => { setDate(e.target.value); idempotencyKey.current = null; }}
                  placeholder={t('date')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('notes')}</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => { setDescription(e.target.value); idempotencyKey.current = null; }}
                  placeholder={t('expenseNotePlaceholder')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
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
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold transition shadow-xs disabled:opacity-50"
                >
                  {saving ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Expense Modal */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title={t('deleteExpense') || 'Delete Expense'}
        message={`${t('deleteConfirm') || 'Are you sure you want to delete this expense'} (${expenseToDelete ? formatCurrency(expenseToDelete.amount) : ''})?`}
        onConfirm={executeDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />

    </div>
  );
};
