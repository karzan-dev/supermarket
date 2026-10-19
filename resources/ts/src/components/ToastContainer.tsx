import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TOAST_STYLE = {
  success: { icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-300' },
  error: { icon: XCircle, color: 'text-rose-700 dark:text-rose-300' },
  warning: { icon: TriangleAlert, color: 'text-amber-700 dark:text-amber-300' },
  info: { icon: Info, color: 'text-sky-700 dark:text-sky-300' },
} as const;

export function ToastContainer() {
  const { toasts, dismissToast, t } = useApp();

  return (
    <div className="pointer-events-none fixed end-4 top-20 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map(toast => {
        const { icon: Icon, color } = TOAST_STYLE[toast.type];
        return (
          <div key={toast.id} className="pointer-events-auto flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900" role="status">
            <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-slate-800 dark:text-slate-100">{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label={t('dismissNotification')} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}