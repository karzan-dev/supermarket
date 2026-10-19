import { useState } from 'react';
import { Database, Download, LoaderCircle, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../api';
import { useApp } from '../context/AppContext';

export function BackupView() {
  const { t, showToast } = useApp();
  const [downloading, setDownloading] = useState(false);

  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const response = await apiFetch('/api/backup');
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message || `Request failed (${response.status})`);
      }

      const backup = await response.blob();
      const url = URL.createObjectURL(backup);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supermarket-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(t('backupReady'), 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
          <Database className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('backup')}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('backupDescription')}</p>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('backupSecurityNote')}</p>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('backupImportInstruction')}</p>
        <button
          type="button"
          onClick={() => void downloadBackup()}
          disabled={downloading}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
        >
          {downloading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
          {downloading ? t('loading') : t('createBackup')}
        </button>
      </div>
    </section>
  );
}
