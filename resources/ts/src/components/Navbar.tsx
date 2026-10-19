import { useState } from 'react';
import { Bell, LogOut, Maximize2, Minimize2, Moon, Sun, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const {
    user, settings, theme, setTheme, logout, t, isFullScreen, setIsFullScreen,
    expiryAlerts, setActiveTab, setInventoryExpiryFilter,
  } = useApp();
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const FullScreenIcon = isFullScreen ? Minimize2 : Maximize2;
  const showExpiryBell = settings.expiry_alerts_enabled !== '0' && settings.expiry_alerts_bell !== '0';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-2 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <img src="/images/supermarket-logo.png" alt={settings.store_name} className="size-9 shrink-0 rounded-lg object-contain sm:size-11" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{settings.store_name}</p>
          <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">{t('appTagline')}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button type="button" onClick={() => setIsFullScreen(!isFullScreen)} className={`${isFullScreen ? 'grid' : 'hidden sm:grid'} size-9 place-items-center rounded-md border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200`} title={t(isFullScreen ? 'exitFullScreen' : 'fullScreen')} aria-label={t(isFullScreen ? 'exitFullScreen' : 'fullScreen')}><FullScreenIcon className="size-4" /></button>
        <div className="hidden md:block"><LanguageSelector /></div>
        {showExpiryBell && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(open => !open)}
              className="relative grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={t('expiryNotifications')}
              aria-expanded={notificationsOpen}
              aria-controls="expiry-notifications"
            >
              <Bell className="size-4" />
              {expiryAlerts.length > 0 && (
                <span className="absolute -end-1 -top-1 min-w-4 rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-4 text-white">
                  {expiryAlerts.length > 99 ? '99+' : expiryAlerts.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div id="expiry-notifications" className="absolute end-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                  {t('expiryNotifications')}
                </div>
                <div className="max-h-[min(65vh,28rem)] overflow-y-auto">
                  {expiryAlerts.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">{t('expiryAlertEmpty')}</p>
                  ) : expiryAlerts.slice(0, 20).map(alert => {
                    const status = alert.alert_type === 'expired' ? t('expiredProducts')
                      : alert.alert_type === 'today' ? t('expiresToday')
                        : alert.urgent ? t('expiryUrgent') : t('expiringSoon');
                    const dayCount = alert.alert_type === 'expired'
                      ? `${Math.abs(alert.days_remaining)} ${t('expiryDaysOverdue')}`
                      : alert.alert_type === 'today' ? t('expiresToday')
                        : `${alert.days_remaining} ${t('expiryDaysRemaining')}`;
                    const severityClass = alert.alert_type === 'expired'
                      ? 'border-s-rose-500 bg-rose-50/70 dark:bg-rose-950/20'
                      : alert.alert_type === 'today'
                        ? 'border-s-amber-500 bg-amber-50/70 dark:bg-amber-950/20'
                        : alert.urgent
                          ? 'border-s-orange-500 bg-orange-50/70 dark:bg-orange-950/20'
                          : 'border-s-sky-500 bg-sky-50/70 dark:bg-sky-950/20';

                    return (
                      <button
                        key={`${alert.id}-${alert.alert_type}`}
                        type="button"
                        onClick={() => {
                          setInventoryExpiryFilter(alert.filter_status);
                          setActiveTab('inventory');
                          setNotificationsOpen(false);
                        }}
                        className={`block w-full border-s-4 px-4 py-3 text-start transition hover:bg-slate-100 dark:hover:bg-slate-800 ${severityClass}`}
                      >
                        <span className="flex items-center justify-between gap-3 text-xs font-bold text-slate-900 dark:text-white">
                          <span className="truncate">{alert.name_ku}</span>
                          <span className="shrink-0">{status}</span>
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-600 dark:text-slate-300">
                          {t('barcode')}: {alert.barcode} · {t('quantity')}: {alert.quantity}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-600 dark:text-slate-300">
                          {t('expiryDate')}: {alert.expiry_date} · {dayCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hidden size-9 md:grid place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
          title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setAccountOpen(open => !open)}
            className="flex h-9 max-w-44 items-center gap-2 rounded-md border border-slate-200 px-2 text-xs sm:px-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-expanded={accountOpen}
          >
            <UserRound className="size-4 shrink-0" />
            <span className="hidden truncate sm:inline">{user?.name}</span>
          </button>
          {accountOpen && (
            <div className="absolute end-0 top-full mt-2 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <p className="truncate px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{user?.username}</p>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-start text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <LogOut className="size-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}