import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AlertTriangle, Camera, Check, Minus, PackageX, Plus, RefreshCw, Search, X } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';
import { NumericInput } from './NumericInput';

interface DamageMovement {
  id: number;
  product_id: number;
  name_ku: string | null;
  barcode: string | null;
  quantity: number;
  damage_reason: string | null;
  previous_quantity: number;
  new_quantity: number;
  notes: string | null;
  user_name: string | null;
  created_at: string | null;
}

interface DamageSummary {
  affected_products: number;
  damaged_quantity: number;
  movements: DamageMovement[];
}

type DamageReason = 'BROKEN' | 'SPOILED' | 'EXPIRED' | 'OPENED_USED' | 'CONTAMINATED' | 'TRANSPORT' | 'STORAGE' | 'OTHER';
type DamageDraft = {
  productId: number | null;
  quantity: string;
  reason: DamageReason;
  notes: string;
};
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorInstance;

const DAMAGE_DRAFT_KEY = 'damaged-product-entry-draft';

const DAMAGE_REASONS: DamageReason[] = [
  'BROKEN', 'SPOILED', 'EXPIRED', 'OPENED_USED', 'CONTAMINATED', 'TRANSPORT', 'STORAGE', 'OTHER',
];

const REASON_LABELS: Record<DamageReason, string> = {
  BROKEN: 'damageBroken',
  SPOILED: 'damageSpoiled',
  EXPIRED: 'damageExpired',
  OPENED_USED: 'damageOpenedUsed',
  CONTAMINATED: 'damageContaminated',
  TRANSPORT: 'damageTransport',
  STORAGE: 'damageStorage',
  OTHER: 'damageOther',
};

export function DamagedProductsView() {
  const { t, user, showToast, triggerRefresh, refreshTrigger } = useApp();
  const [data, setData] = useState<DamageSummary>({
    affected_products: 0,
    damaged_quantity: 0,
    movements: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [draftProductId, setDraftProductId] = useState<number | null>(null);
  const [productToResolveId, setProductToResolveId] = useState<number | null>(null);
  const [resolvingProduct, setResolvingProduct] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<DamageReason>('BROKEN');
  const [notes, setNotes] = useState('');
  const [scannerStream, setScannerStream] = useState<MediaStream | null>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);
  const canRecordDamage = user?.role === 'ADMIN' || Boolean(user?.permissions?.includes('inventory.manage'));
  const maxDamageQuantity = selectedProduct ? Math.floor(selectedProduct.quantity) : 0;

  useEffect(() => {
    if (draftLoaded) return;
    try {
      const rawDraft = window.localStorage.getItem(DAMAGE_DRAFT_KEY);
      if (rawDraft) {
        const draft: unknown = JSON.parse(rawDraft);
        const candidate = draft as DamageDraft;
        if (
          typeof draft === 'object' && draft !== null &&
          (candidate.productId === null || (Number.isSafeInteger(candidate.productId) && candidate.productId > 0)) &&
          typeof candidate.quantity === 'string' &&
          DAMAGE_REASONS.includes(candidate.reason) &&
          typeof candidate.notes === 'string'
        ) {
          setDraftProductId(candidate.productId);
          setQuantity(candidate.quantity);
          setReason(candidate.reason);
          setNotes(candidate.notes);
          setHasDraft(true);
          setProductToResolveId(candidate.productId);
        } else {
          window.localStorage.removeItem(DAMAGE_DRAFT_KEY);
          const message = t('error');
          setError(message);
          showToast(message, 'error');
        }
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('error');
      setError(message);
      showToast(message, 'error');
    } finally {
      setDraftLoaded(true);
    }
  }, [draftLoaded, showToast, t]);

  useEffect(() => {
    if (productToResolveId === null || productToResolveId !== draftProductId) return;
    let cancelled = false;
    setResolvingProduct(true);
    apiRequest<Product>(`/api/products/${productToResolveId}`)
      .then(response => {
        if (cancelled) return;
        if (response.data?.id === productToResolveId) {
          setSelectedProduct(response.data);
          setError('');
        } else {
          throw new Error(t('error'));
        }
      })
      .catch(cause => {
        if (cancelled) return;
        const message = cause instanceof Error ? cause.message : t('error');
        setError(message);
        showToast(message, 'error');
      })
      .finally(() => {
        if (!cancelled) setResolvingProduct(false);
      });
    return () => { cancelled = true; };
  }, [productToResolveId, draftProductId, showToast, t]);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      if (hasDraft) {
        const draft: DamageDraft = { productId: draftProductId, quantity, reason, notes };
        window.localStorage.setItem(DAMAGE_DRAFT_KEY, JSON.stringify(draft));
      } else {
        window.localStorage.removeItem(DAMAGE_DRAFT_KEY);
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('error');
      setError(message);
      showToast(message, 'error');
    }
  }, [draftLoaded, hasDraft, draftProductId, quantity, reason, notes, showToast, t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiRequest<DamageSummary>('/api/inventory/damage')
      .then(response => {
        if (!cancelled) {
          setData(response.data);
          setError('');
        }
      })
      .catch(cause => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshTrigger]);

  useEffect(() => {
    const term = search.trim();
    if (selectedProduct || term.length < 2) {
      setMatches([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearching(true);
      apiRequest<Product[]>(`/api/products?search=${encodeURIComponent(term)}`)
        .then(response => {
          if (cancelled) return;
          setMatches(response.data.slice(0, 8));
          const exactBarcodeMatch = response.data.find(product => product.barcode.toLowerCase() === term.toLowerCase());
          if (exactBarcodeMatch) {
            setDraftProductId(exactBarcodeMatch.id);
            setProductToResolveId(null);
            setHasDraft(true);
            setSelectedProduct(exactBarcodeMatch);
            setMatches([]);
          }
        })
        .catch(cause => {
          if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, selectedProduct]);

  const startBarcodeScanner = async () => {
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      showToast(t('barcodeScanUnsupported'), 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      setScannerStream(stream);
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : t('cameraPermissionError'), 'error');
    }
  };

  useEffect(() => {
    if (!scannerStream) return;

    let active = true;
    let timeoutId: number | undefined;
    const video = barcodeVideoRef.current;
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

    const stopScanner = () => {
      scannerStream.getTracks().forEach(track => track.stop());
      setScannerStream(null);
    };

    if (!video || !BarcodeDetector) {
      showToast(t('barcodeScanUnsupported'), 'error');
      stopScanner();
      return;
    }

    let detector: BarcodeDetectorInstance;
    try {
      detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'codabar'],
      });
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : t('barcodeScanUnsupported'), 'error');
      stopScanner();
      return;
    }

    video.srcObject = scannerStream;
    const scan = async () => {
      if (!active) return;
      try {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const [result] = await detector.detect(video);
          if (result?.rawValue) {
            setSearch(result.rawValue);
            if (draftProductId !== null) {
              setDraftProductId(null);
              setProductToResolveId(null);
              setHasDraft(true);
            }
            setSelectedProduct(null);
            setMatches([]);
            setError('');
            setScannerStream(null);
            return;
          }
        }
        timeoutId = window.setTimeout(() => void scan(), 150);
      } catch (cause) {
        showToast(cause instanceof Error ? cause.message : t('barcodeScanFailed'), 'error');
        setScannerStream(null);
      }
    };

    void video.play().then(() => void scan()).catch(cause => {
      showToast(cause instanceof Error ? cause.message : t('cameraPermissionError'), 'error');
      setScannerStream(null);
    });

    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      scannerStream.getTracks().forEach(track => track.stop());
      if (video.srcObject === scannerStream) video.srcObject = null;
    };
  }, [scannerStream, showToast, t, draftProductId]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDraftProductId(product.id);
    setProductToResolveId(null);
    setHasDraft(true);
    setSearch(`${product.name_ku} · ${product.barcode}`);
    setMatches([]);
    setError('');
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const firstMatch = matches[0];
    if (event.key === 'Enter' && firstMatch) {
      event.preventDefault();
      selectProduct(firstMatch);
    }
  };

  const recordDamage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct || saving) return;
    if (draftProductId === null || selectedProduct.id !== draftProductId || resolvingProduct) return;

    setSaving(true);
    setError('');
    try {
      await apiRequest('/api/inventory/damage', {
        method: 'POST',
        body: jsonBody({
          product_id: selectedProduct.id,
          quantity: Number(quantity),
          damage_reason: reason,
          notes: notes.trim() || null,
        }),
      });
      showToast(t('damageRecorded'), 'success');
      setSearch('');
      setMatches([]);
      setSelectedProduct(null);
      setDraftProductId(null);
      setQuantity('');
      setReason('BROKEN');
      setNotes('');
      setHasDraft(false);
      triggerRefresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <PackageX className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('damaged-products')}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('damagedProductsDescription')}</p>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {canRecordDamage && (
        <form onSubmit={recordDamage} className="space-y-4 rounded-xl border border-rose-200 bg-white p-4 shadow-xs dark:border-rose-900/50 dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('recordDamagedProduct')}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('damageProductLookupHint')}</p>
          </div>

          <div className="relative">
            <label htmlFor="damage-product-search" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('searchProductByNameOrBarcode')}
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="damage-product-search"
                  autoFocus
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                    if (selectedProduct || draftProductId !== null) {
                      setSelectedProduct(null);
                      setDraftProductId(null);
                      setProductToResolveId(null);
                      setHasDraft(true);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  autoComplete="off"
                  placeholder={t('scanOrEnterProduct')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 ps-9 pe-10 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                {searching && <RefreshCw className="absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />}
              </div>
              <button
                type="button"
                onClick={() => void startBarcodeScanner()}
                title={t('scanBarcode')}
                aria-label={t('scanBarcode')}
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Camera className="size-5" aria-hidden="true" />
              </button>
            </div>
            {!selectedProduct && matches.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {matches.map(product => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name_ku}</span>
                        <span className="mt-0.5 block font-mono text-xs text-slate-500">{product.barcode} · {product.sku}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">{t('availableStock')}: {product.quantity}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedProduct && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs dark:bg-rose-950/30">
              <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Check className="size-4 shrink-0 text-emerald-600" />
                <span className="truncate">{selectedProduct.name_ku} · <span className="font-mono">{selectedProduct.barcode}</span></span>
              </span>
              <span className="shrink-0 text-slate-600 dark:text-slate-300">{t('availableStock')}: <strong className="font-mono">{selectedProduct.quantity}</strong></span>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('damagedQuantity')} *
              <div className="mt-1.5 flex overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  aria-label={t('decreaseQuantity')}
                  onClick={() => { setQuantity(value => String(Math.max(1, (Number(value) || 1) - 1))); setHasDraft(true); }}
                  disabled={!selectedProduct || !quantity || Number(quantity) <= 1}
                  className="grid size-11 shrink-0 place-items-center border-e border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Minus className="size-4" />
                </button>
                <NumericInput
                  required
                  inputMode="numeric"
                  min="1"
                  max={maxDamageQuantity}
                  step="1"
                  value={quantity}
                  onValueChange={value => { setQuantity(value); setHasDraft(true); }}
                  disabled={!selectedProduct || maxDamageQuantity < 1}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-center text-lg font-bold font-mono text-slate-900 outline-none dark:text-white disabled:opacity-50"
                />
                <button
                  type="button"
                  aria-label={t('increaseQuantity')}
                  onClick={() => { setQuantity(value => String(Math.min(maxDamageQuantity, (Number(value) || 0) + 1))); setHasDraft(true); }}
                  disabled={!selectedProduct || maxDamageQuantity < 1 || Number(quantity) >= maxDamageQuantity}
                  className="grid size-11 shrink-0 place-items-center border-s border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('damageReason')} *
              <select
                required
                value={reason}
                onChange={event => { setReason(event.target.value as DamageReason); setHasDraft(true); }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {DAMAGE_REASONS.map(item => <option key={item} value={item}>{t(REASON_LABELS[item])}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('notes')}
            <textarea
              rows={2}
              value={notes}
              onChange={event => { setNotes(event.target.value); setHasDraft(true); }}
              placeholder={t('damageNotesPlaceholder')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || resolvingProduct || !selectedProduct || draftProductId !== selectedProduct.id || !quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0 || Number(quantity) > maxDamageQuantity}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? t('loading') : t('recordDamage')}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs dark:border-rose-900/50 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('damagedItems')}</p>
          <p className="mt-2 text-2xl font-black font-mono text-rose-600 dark:text-rose-400">{data.affected_products}</p>
        </article>
        <article className="rounded-xl border border-orange-200 bg-white p-4 shadow-xs dark:border-orange-900/50 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('damagedQuantity')}</p>
          <p className="mt-2 text-2xl font-black font-mono text-orange-600 dark:text-orange-400">{data.damaged_quantity}</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('recentDamage')}</h2>
          {loading && <RefreshCw className="size-4 animate-spin text-slate-400" aria-label={t('loading')} />}
        </div>
        {data.movements.length === 0 && !loading ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('noDamagedProducts')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[66rem] text-start text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  <th className="px-4 py-3 text-start font-semibold">{t('products')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('barcode')}</th>
                  <th className="px-4 py-3 text-end font-semibold">{t('quantity')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('damageReason')}</th>
                  <th className="px-4 py-3 text-end font-semibold">{t('previous')} / {t('new')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('notes')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('date')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('users')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.movements.map(movement => (
                  <tr key={movement.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{movement.name_ku || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{movement.barcode || '-'}</td>
                    <td className="px-4 py-3 text-end font-mono font-bold text-rose-700 dark:text-rose-300">{movement.quantity}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {movement.damage_reason && movement.damage_reason in REASON_LABELS
                        ? t(REASON_LABELS[movement.damage_reason as DamageReason])
                        : movement.damage_reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-slate-600 dark:text-slate-300">{movement.previous_quantity} / {movement.new_quantity}</td>
                    <td className="max-w-56 truncate px-4 py-3 text-slate-600 dark:text-slate-300">{movement.notes || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{movement.created_at || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{movement.user_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {scannerStream && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto flex items-center-safe justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('scanBarcode')}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-4 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Camera className="size-5 text-rose-600" aria-hidden="true" />
                {t('scanBarcode')}
              </h2>
              <button
                type="button"
                onClick={() => setScannerStream(null)}
                aria-label={t('cancel')}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <video
              ref={barcodeVideoRef}
              autoPlay
              muted
              playsInline
              className="max-h-[65vh] w-full rounded-lg bg-black object-contain"
            />
            <p className="mt-3 text-center text-sm text-slate-500">{t('cameraScanner')}</p>
          </div>
        </div>
      )}
    </section>
  );
}
