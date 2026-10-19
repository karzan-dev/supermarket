import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';

export function LoginView() {
  const { t, login, settings, theme, setTheme } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div aria-hidden="true" className="login-background pointer-events-none absolute inset-0" />
      <div className="absolute end-4 top-4 flex items-center gap-2">
        <LanguageSelector />
        <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-label={t('toggleTheme')}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      <section className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <img src="/images/supermarket-logo.png" alt={settings.store_name} className="size-16 shrink-0 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-950 dark:text-white">{settings.store_name}</h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('appTagline')}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{t('login')}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('username')}
            <span className="relative mt-1.5 block">
              <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input required autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder={t('username')} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 ps-10 pe-3 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </span>
          </label>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('password')}
            </label>
            <span className="relative mt-1.5 block">
              <LockKeyhole className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input id="login-password" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder={t('password')} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 ps-10 pe-10 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <button
                type="button"
                onClick={() => setShowPassword(show => !show)}
                className="absolute inset-y-0 end-2 grid place-items-center px-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                aria-label={t(showPassword ? 'hidePassword' : 'showPassword')}
                title={t(showPassword ? 'hidePassword' : 'showPassword')}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </div>
          {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
          <button disabled={submitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
            <span>{submitting ? t('loading') : t('login')}</span>
            <ArrowRight className="size-4 rtl:rotate-180" />
          </button>
        </form>
      </section>
    </main>
  );
}