import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { User } from '../types';
import { ConfirmModal } from './ConfirmModal';

// Rules the server enforces for new users; shown under the fields so a 422 never comes as a surprise.
const USER_FIELD_HINTS = {
  ku: {
    username: 'پیتی ئینگلیزی، ژمارە یان ئیمەیڵ، بێ بۆشایی',
    password: 'لانیکەم ١٢ پیت، دەبێت پیت و ژمارەی تێدابێت',
    passwordInvalid: 'وشەی نهێنی دەبێت لانیکەم ١٢ پیت بێت و پیت و ژمارەی تێدابێت.',
  },
  en: {
    username: 'English letters, numbers or an email, no spaces',
    password: 'At least 12 characters, with letters and numbers',
    passwordInvalid: 'The password must be at least 12 characters and contain letters and numbers.',
  },
  ar: {
    username: 'أحرف إنجليزية أو أرقام أو بريد إلكتروني، بدون مسافات',
    password: '١٢ حرفاً على الأقل، يحتوي على أحرف وأرقام',
    passwordInvalid: 'يجب أن تكون كلمة المرور ١٢ حرفاً على الأقل وتحتوي على أحرف وأرقام.',
  },
} as const;

const isValidPassword = (value: string) => value.length >= 12 && /\p{L}/u.test(value) && /\p{N}/u.test(value);

type Role = { id: number; name: string; display_name_ku?: string; display_name_en?: string; display_name_ar?: string };
type Permission = { name: string; module: string };
type UserForm = { name: string; username: string; password: string; role_id: string; permissions: string[]; status: User['status']; language_pref: User['language_pref']; phone: string; email: string };
type UserDraft = {
  editingId: number | null;
  form: Omit<UserForm, 'username' | 'password'>;
};
const EMPTY_FORM: UserForm = { name: '', username: '', password: '', role_id: '', permissions: [], status: 'ACTIVE', language_pref: 'ku', phone: '', email: '' };
const DRAFT_KEY = 'users-form-draft';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));

const isUserDraft = (value: unknown): value is UserDraft => {
  if (!isRecord(value) ||
    !hasExactKeys(value, ['editingId', 'form']) ||
    !(value.editingId === null || (Number.isInteger(value.editingId) && Number(value.editingId) > 0)) ||
    !isRecord(value.form) ||
    !hasExactKeys(value.form, ['name', 'role_id', 'permissions', 'status', 'language_pref', 'phone', 'email'])) return false;
  const form = value.form;
  const permissions = form.permissions;
  return !Object.prototype.hasOwnProperty.call(form, 'username') &&
    !Object.prototype.hasOwnProperty.call(form, 'password') &&
    ['name', 'role_id', 'phone', 'email'].every(key => typeof form[key] === 'string') &&
    Array.isArray(permissions) &&
    permissions.every(permission => typeof permission === 'string') &&
    ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(String(form.status)) &&
    ['ku', 'en', 'ar'].includes(String(form.language_pref));
};

export function UsersView() {
  const { t, showToast, language } = useApp();
  const hints = USER_FIELD_HINTS[language] ?? USER_FIELD_HINTS.en;
  const storageErrorNotified = useRef(false);
  const [draftResult] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw === null) return { draft: null, error: null };
      const parsed: unknown = JSON.parse(raw);
      if (!isUserDraft(parsed)) throw new Error('Invalid user form draft');
      return { draft: parsed, error: null };
    } catch (error) {
      return { draft: null, error };
    }
  });
  const initialDraft = draftResult.draft;
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(initialDraft?.editingId ?? null);
  const [form, setForm] = useState<UserForm | null>(initialDraft ? {
    ...EMPTY_FORM,
    ...initialDraft.form,
    username: '',
    password: '',
  } : null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
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

  useEffect(() => {
    if (draftResult.error) reportStorageError(draftResult.error);
  }, []);

  useEffect(() => {
    if (!form) return;
    const nonCredentialFields: UserDraft['form'] = {
      name: form.name,
      role_id: form.role_id,
      permissions: form.permissions,
      status: form.status,
      language_pref: form.language_pref,
      phone: form.phone,
      email: form.email,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ editingId, form: nonCredentialFields } satisfies UserDraft));
      storageErrorNotified.current = false;
    } catch (error) { reportStorageError(error); }
  }, [editingId, form]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await apiRequest<User[]>('/api/users');
      setUsers(result.data);
      setRoles((result.roles || []) as Role[]);
      setPermissions((result.permissions || []) as Permission[]);
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadUsers(); }, []);

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    if ((form.password || editingId === null) && !isValidPassword(form.password)) {
      showToast(hints.passwordInvalid, 'error');
      return;
    }
    const payload = { ...form, role_id: Number(form.role_id), password: form.password || undefined };
    try {
      await apiRequest(editingId !== null ? `/api/users/${editingId}` : '/api/users', {
        method: editingId !== null ? 'PUT' : 'POST', body: jsonBody(payload),
      });
      setForm(null); setEditingId(null); clearDraft(); showToast(t('saved'), 'success'); await loadUsers();
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
  };

  const deleteUser = async () => {
    if (!deleting) return;
    try {
      await apiRequest(`/api/users/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null); await loadUsers();
    } catch (error) { showToast(error instanceof Error ? error.message : t('error'), 'error'); }
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setShowPassword(false);
    setForm({ name: user.name, username: user.username, password: '', role_id: String(user.role_id || roles.find(role => role.name === user.role)?.id || ''), permissions: user.role === 'ADMIN' ? [] : user.permissions || [], status: user.status, language_pref: user.language_pref, phone: user.phone || '', email: user.email || '' });
  };

  const permissionGroups = permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    (groups[permission.module] ??= []).push(permission);
    return groups;
  }, {});
  const isAdminRole = roles.find(role => String(role.id) === form?.role_id)?.name === 'ADMIN';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-teal-700" /><h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('users')}</h1><span className="text-xs text-slate-500">{users.length}</span></div><button onClick={() => { setEditingId(null); setShowPassword(false); setForm({ ...EMPTY_FORM, role_id: String(roles.find(role => role.name !== 'ADMIN')?.id ?? roles[0]?.id ?? '') }); }} className="flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Plus className="size-4" />{t('addUser')}</button></div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-start text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950"><tr><th className="px-4 py-3">{t('name')}</th><th className="px-4 py-3">{t('username')}</th><th className="px-4 py-3">{t('role')}</th><th className="px-4 py-3">{t('phone')}</th><th className="px-4 py-3">{t('status')}</th><th className="px-4 py-3 text-end">{t('actions')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t('loading')}</td></tr> : users.map(user => <tr key={user.id} className="text-slate-700 dark:text-slate-200"><td className="px-4 py-3 font-semibold">{user.name}</td><td className="px-4 py-3 font-mono">{user.username}</td><td className="px-4 py-3">{t(`${user.role.toLowerCase()}Role`)}</td><td className="px-4 py-3">{user.phone || '-'}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{t(user.status.toLowerCase())}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(user)} title={t('edit')} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="size-4" /></button><button onClick={() => setDeleting(user)} title={t('delete')} className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div></div>

      {form && <div className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={event => void saveUser(event)} className="my-auto w-full max-w-xl rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><div className="mb-4 flex justify-between"><h2 className="font-bold text-slate-900 dark:text-white">{editingId !== null ? t('edit') : t('addUser')}</h2><button type="button" onClick={() => { setForm(null); setEditingId(null); clearDraft(); }} aria-label={t('cancel')}><X className="size-5" /></button></div><div className="grid gap-3 sm:grid-cols-2">
        {(['name', 'username', 'password', 'phone', 'email'] as const).map(key => <div key={key} className="text-xs font-semibold text-slate-700 dark:text-slate-300"><label htmlFor={`user-${key}`} className="block">{t(key)}{(key === 'name' || key === 'username' || (key === 'password' && editingId === null)) && ' *'}</label><span className="relative mt-1.5 block"><input id={`user-${key}`} required={key === 'name' || key === 'username' || (key === 'password' && editingId === null)} type={key === 'password' ? (showPassword ? 'text' : 'password') : key === 'email' ? 'email' : 'text'} minLength={key === 'password' ? 12 : undefined} autoComplete={key === 'password' ? 'new-password' : undefined} value={form[key]} onChange={event => setForm(current => current ? ({ ...current, [key]: event.target.value }) : current)} placeholder={key === 'name' ? t('name') : key === 'username' ? t('username') : key === 'password' ? t('password') : key === 'phone' ? t('phone') : 'name@example.com'} className={`w-full rounded-md border border-slate-300 bg-white py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white ${key === 'password' ? 'pe-10 ps-3' : 'px-3'}`} />{key === 'password' && <button type="button" onClick={() => setShowPassword(show => !show)} className="absolute inset-y-0 end-2 grid place-items-center px-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" aria-label={t(showPassword ? 'hidePassword' : 'showPassword')} title={t(showPassword ? 'hidePassword' : 'showPassword')}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}</span>{(key === 'username' || key === 'password') && <span className="mt-1 block text-[11px] font-normal text-slate-500 dark:text-slate-400">{hints[key]}</span>}</div>)}
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('role')}<select required value={form.role_id} onChange={event => setForm(current => current ? ({ ...current, role_id: event.target.value }) : current)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">{roles.map(role => <option key={role.id} value={role.id}>{t(`${role.name.toLowerCase()}Role`)}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('status')}<select value={form.status} onChange={event => setForm(current => current ? ({ ...current, status: event.target.value as User['status'] }) : current)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="ACTIVE">{t('active')}</option><option value="INACTIVE">{t('inactive')}</option><option value="SUSPENDED">{t('suspended')}</option></select></label>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('language')}<select value={form.language_pref} onChange={event => setForm(current => current ? ({ ...current, language_pref: event.target.value as User['language_pref'] }) : current)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="ku">کوردی</option><option value="en">English</option><option value="ar">العربية</option></select></label>
      </div>
      <fieldset className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div><legend className="text-xs font-bold text-slate-800 dark:text-white">{t('permissions')}</legend><p className="mt-1 text-[11px] text-slate-500">{t('permissionsDescription')}</p></div>
          {!isAdminRole && <div className="flex gap-2 text-[11px]"><button type="button" onClick={() => setForm(current => current ? ({ ...current, permissions: permissions.map(permission => permission.name) }) : current)} className="text-teal-700 hover:underline dark:text-teal-300">{t('selectAllPermissions')}</button><button type="button" onClick={() => setForm(current => current ? ({ ...current, permissions: [] }) : current)} className="text-slate-500 hover:underline">{t('clearAllPermissions')}</button></div>}
        </div>
        {isAdminRole ? <p className="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{t('adminPermissionsLocked')}</p> : <div className="max-h-64 space-y-3 overflow-y-auto">
          {Object.entries(permissionGroups).map(([module, modulePermissions]) => <div key={module}>
            <h3 className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{t(module)}</h3>
            <div className="grid gap-1 sm:grid-cols-2">
              {modulePermissions.map(permission => {
                const action = permission.name.split('.')[1];
                const actionLabel = action === 'view' ? t('permissionView') : action === 'manage' ? t('permissionManage') : t('permissionUse');
                return <label key={permission.name} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                  <input type="checkbox" checked={form.permissions.includes(permission.name)} onChange={event => setForm(current => {
                    if (!current) return current;
                    const selected = new Set(current.permissions);
                    if (event.target.checked) selected.add(permission.name);
                    else selected.delete(permission.name);
                    return { ...current, permissions: [...selected] };
                  })} className="accent-teal-700" />
                  <span>{actionLabel}</span>
                </label>;
              })}
            </div>
          </div>)}
        </div>}
      </fieldset>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setForm(null); setEditingId(null); clearDraft(); }} className="rounded-md border border-slate-300 px-4 py-2 text-xs dark:border-slate-700">{t('cancel')}</button><button className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white">{t('save')}</button></div></form></div>}
      <ConfirmModal isOpen={Boolean(deleting)} message={`${t('deleteConfirm')}: ${deleting?.name || ''}`} onCancel={() => setDeleting(null)} onConfirm={() => void deleteUser()} />
    </section>
  );
}