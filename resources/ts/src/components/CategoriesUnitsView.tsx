import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, apiErrorMessage } from '../api';
import { useApp } from '../context/AppContext';
import type { Category, Unit } from '../types';
import { Plus, Edit2, Trash2, Layers, Scale, X, Check } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

type CategoryForm = { name_ku: string; name_en: string; name_ar: string; icon: string };
type UnitForm = { name_ku: string; name_en: string; name_ar: string; short_code: string };
type CategoryUnitsDraft =
  | { activeType: 'category'; editingId: number | null; form: CategoryForm }
  | { activeType: 'unit'; editingId: number | null; form: UnitForm };
const DRAFT_KEY = 'categories-units-form-draft';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));

const isCategoryUnitsDraft = (value: unknown): value is CategoryUnitsDraft => {
  if (!isRecord(value) || !hasExactKeys(value, ['activeType', 'editingId', 'form']) ||
    (value.activeType !== 'category' && value.activeType !== 'unit') ||
    !(value.editingId === null || (Number.isInteger(value.editingId) && Number(value.editingId) > 0)) ||
    !isRecord(value.form)) return false;
  const form = value.form;
  const keys = value.activeType === 'category'
    ? ['name_ku', 'name_en', 'name_ar', 'icon']
    : ['name_ku', 'name_en', 'name_ar', 'short_code'];
  return hasExactKeys(form, keys) && keys.every(key => typeof form[key] === 'string');
};

export const CategoriesUnitsView: React.FC = () => {
  const { t, getLocalizedName, triggerRefresh, refreshTrigger, showToast } = useApp();
  const storageErrorNotified = useRef(false);
  const [draftResult] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw === null) return { draft: null, error: null };
      const parsed: unknown = JSON.parse(raw);
      if (!isCategoryUnitsDraft(parsed)) throw new Error('Invalid category or unit form draft');
      return { draft: parsed, error: null };
    } catch (error) {
      return { draft: null, error };
    }
  });
  const initialDraft = draftResult.draft;

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'unit'; id: number; name: string } | null>(null);

  // Category Modal
  const [showCatModal, setShowCatModal] = useState(initialDraft?.activeType === 'category');
  const [editingCatId, setEditingCatId] = useState<number | null>(initialDraft?.activeType === 'category' ? initialDraft.editingId : null);
  const [catForm, setCatForm] = useState<CategoryForm>(initialDraft?.activeType === 'category' ? initialDraft.form : { name_ku: '', name_en: '', name_ar: '', icon: 'tag' });

  // Unit Modal
  const [showUnitModal, setShowUnitModal] = useState(initialDraft?.activeType === 'unit');
  const [editingUnitId, setEditingUnitId] = useState<number | null>(initialDraft?.activeType === 'unit' ? initialDraft.editingId : null);
  const [unitForm, setUnitForm] = useState<UnitForm>(initialDraft?.activeType === 'unit' ? initialDraft.form : { name_ku: '', name_en: '', name_ar: '', short_code: '' });

  const reportStorageError = (error: unknown) => {
    if (!storageErrorNotified.current) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      storageErrorNotified.current = true;
    }
  };
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  };
  const closeCategoryModal = () => {
    setShowCatModal(false);
    setEditingCatId(null);
    clearDraft();
  };
  const closeUnitModal = () => {
    setShowUnitModal(false);
    setEditingUnitId(null);
    clearDraft();
  };

  useEffect(() => {
    if (draftResult.error) reportStorageError(draftResult.error);
  }, []);

  useEffect(() => {
    if (!showCatModal) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ activeType: 'category', editingId: editingCatId, form: catForm } satisfies CategoryUnitsDraft));
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  }, [showCatModal, editingCatId, catForm]);

  useEffect(() => {
    if (!showUnitModal) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ activeType: 'unit', editingId: editingUnitId, form: unitForm } satisfies CategoryUnitsDraft));
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  }, [showUnitModal, editingUnitId, unitForm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, unitRes] = await Promise.all([
        apiFetch('/api/categories').then(r => r.json()),
        apiFetch('/api/units').then(r => r.json())
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (unitRes.success) setUnits(unitRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Category Handlers
  const handleOpenAddCat = () => {
    setEditingCatId(null);
    setCatForm({ name_ku: '', name_en: '', name_ar: '', icon: 'tag' });
    setShowUnitModal(false);
    setShowCatModal(true);
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setShowUnitModal(false);
    setCatForm({
      name_ku: cat.name_ku,
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      icon: cat.icon || 'tag'
    });
    setShowCatModal(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCatId !== null ? `/api/categories/${editingCatId}` : '/api/categories';
      const method = editingCatId !== null ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowCatModal(false);
        setEditingCatId(null);
        clearDraft();
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    }
  };

  const handleDeleteCat = (cat: Category) => {
    setDeleteTarget({ type: 'category', id: cat.id, name: getLocalizedName(cat) });
  };

  const handleDeleteUnit = (u: Unit) => {
    setDeleteTarget({ type: 'unit', id: u.id, name: getLocalizedName(u) });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const endpoint = deleteTarget.type === 'category' 
        ? `/api/categories/${deleteTarget.id}` 
        : `/api/units/${deleteTarget.id}`;
      const res = await apiFetch(endpoint, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(t('itemDeleted') || 'Deleted successfully', 'success');
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error') || 'Error deleting item', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Unit Handlers
  const handleOpenAddUnit = () => {
    setEditingUnitId(null);
    setUnitForm({ name_ku: '', name_en: '', name_ar: '', short_code: '' });
    setShowCatModal(false);
    setShowUnitModal(true);
  };

  const handleOpenEditUnit = (u: Unit) => {
    setEditingUnitId(u.id);
    setShowCatModal(false);
    setUnitForm({
      name_ku: u.name_ku,
      name_en: u.name_en,
      name_ar: u.name_ar,
      short_code: u.short_code
    });
    setShowUnitModal(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUnitId !== null ? `/api/units/${editingUnitId}` : '/api/units';
      const method = editingUnitId !== null ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowUnitModal(false);
        setEditingUnitId(null);
        clearDraft();
        triggerRefresh();
      } else {
        showToast(apiErrorMessage(json, t('error')), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Categories Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-900/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('categories')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {categories.length} {t('categories')}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddCat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-750/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addCategory')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 text-start font-semibold">#</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameKu')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameEn')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameAr')}</th>
                <th className="py-3 px-4 text-center font-semibold">{t('totalProducts')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cat.name_ku}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{cat.name_en}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{cat.name_ar}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold font-mono text-slate-700 dark:text-slate-300">
                      {cat.product_count || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditCat(cat)}
                        className="p-1 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded-md transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCat(cat)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Units Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-900/40">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('units')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {units.length} {t('units')}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddUnit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-750/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addUnit')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 text-start font-semibold">#</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameKu')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameEn')}</th>
                <th className="py-3 px-4 text-start font-semibold">{t('nameAr')}</th>
                <th className="py-3 px-4 text-center font-semibold">{t('shortCode')}</th>
                <th className="py-3 px-4 text-end font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {units.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.name_ku}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{u.name_en}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{u.name_ar}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-teal-700 dark:text-teal-400">
                    {u.short_code}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditUnit(u)}
                        className="p-1 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded-md transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(u)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingCatId !== null ? t('edit') : t('addCategory')}
              </h3>
              <button onClick={closeCategoryModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCat} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameKu')} *</label>
                <input
                  type="text"
                  required
                  value={catForm.name_ku}
                  onChange={e => setCatForm({ ...catForm, name_ku: e.target.value })}
                  placeholder={t('nameKu')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameEn')}</label>
                <input
                  type="text"
                  value={catForm.name_en}
                  onChange={e => setCatForm({ ...catForm, name_en: e.target.value })}
                  placeholder={t('nameEn')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameAr')}</label>
                <input
                  type="text"
                  value={catForm.name_ar}
                  onChange={e => setCatForm({ ...catForm, name_ar: e.target.value })}
                  placeholder={t('nameAr')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeCategoryModal}
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

      {/* Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingUnitId !== null ? t('edit') : t('addUnit')}
              </h3>
              <button onClick={closeUnitModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveUnit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameKu')} *</label>
                <input
                  type="text"
                  required
                  value={unitForm.name_ku}
                  onChange={e => setUnitForm({ ...unitForm, name_ku: e.target.value })}
                  placeholder={t('nameKu')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameEn')}</label>
                  <input
                    type="text"
                    value={unitForm.name_en}
                    onChange={e => setUnitForm({ ...unitForm, name_en: e.target.value })}
                    placeholder={t('nameEn')}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('shortCode')} *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.short_code}
                    onChange={e => setUnitForm({ ...unitForm, short_code: e.target.value })}
                      placeholder={t('shortCode')}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">{t('nameAr')}</label>
                <input
                  type="text"
                  value={unitForm.name_ar}
                  onChange={e => setUnitForm({ ...unitForm, name_ar: e.target.value })}
                  placeholder={t('nameAr')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeUnitModal}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'category' ? t('deleteCategory') || 'Delete Category' : t('deleteUnit') || 'Delete Unit'}
        message={`${t('deleteConfirm') || 'Are you sure you want to delete'} "${deleteTarget?.name || ''}"?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
