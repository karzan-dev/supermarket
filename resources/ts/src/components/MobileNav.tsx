import { useEffect, useState } from 'react';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useApp, userCanAccessTab, type NavTab } from '../context/AppContext';
import { NAV_ITEMS } from './Sidebar';

// Tabs used most at the till; whichever of these the user may open fill the bar first.
const PRIMARY_TABS: NavTab[] = ['pos', 'products', 'inventory', 'dashboard', 'customers'];
const MAX_BAR_TABS = 4;

const LANGUAGES = [
  { code: 'ku' as const, label: 'کوردی' },
  { code: 'ar' as const, label: 'العربية' },
  { code: 'en' as const, label: 'English' },
];

export function MobileNav() {
  const { activeTab, setActiveTab, t, user, theme, setTheme, language, setLanguage, logout } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const allowed = NAV_ITEMS.filter(({ id }) => userCanAccessTab(user, id));
  const barTabs = [
    ...PRIMARY_TABS.map(id => allowed.find(item => item.id === id)).filter(item => item !== undefined),
    ...allowed.filter(item => !PRIMARY_TABS.includes(item.id)),
  ].slice(0, MAX_BAR_TABS);
  const moreTabs = allowed.filter(item => !barTabs.includes(item));
  const moreActive = moreTabs.some(item => item.id === activeTab);

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [moreOpen]);

  const go = (id: NavTab) => {
    setActiveTab(id);
    setMoreOpen(false);
  };

  const tabClass = (active: boolean) => `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-[10px] font-semibold transition-colors ${
    active ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
  }`;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t('more')}>
          <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={() => setMoreOpen(false)} aria-label={t('close')} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t('more')}</p>
              <button type="button" onClick={() => setMoreOpen(false)} className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('close')}>
                <X className="size-5" />
              </button>
            </div>

            <nav aria-label={t('mainNavigation')} className="grid grid-cols-3 gap-2 p-4">
              {moreTabs.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center text-[11px] font-semibold leading-tight ${
                    activeTab === id
                      ? 'border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-200'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span>{t(id)}</span>
                </button>
              ))}
            </nav>

            <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label={t('selectLanguage')}>
                {LANGUAGES.map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    aria-pressed={language === item.code}
                    className={`rounded-md py-2 text-xs font-semibold ${
                      language === item.code ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {t('toggleTheme')}
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex items-center justify-center gap-2 rounded-lg border border-rose-200 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:text-rose-300"
                >
                  <LogOut className="size-4" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label={t('mainNavigation')}
        className="z-40 flex shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:hidden print:hidden"
      >
        {barTabs.map(({ id, icon: Icon }) => (
          <button key={id} type="button" onClick={() => go(id)} aria-current={activeTab === id ? 'page' : undefined} className={tabClass(activeTab === id)}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate">{t(id)}</span>
          </button>
        ))}
        {moreTabs.length > 0 && (
          <button type="button" onClick={() => setMoreOpen(open => !open)} aria-expanded={moreOpen} className={tabClass(moreOpen || moreActive)}>
            <Menu className="size-5" aria-hidden="true" />
            <span>{t('more')}</span>
          </button>
        )}
      </nav>
    </>
  );
}
