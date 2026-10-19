import { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, DollarSign, Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Customer, Product, Sale, SaleItem } from '../types';
import { ReceiptModal } from './ReceiptModal';
import { NumericInput } from './NumericInput';
import { BarcodeScannerButton } from './BarcodeScannerButton';

type CartLine = { product: Product; quantity: number };
type CreditCustomerDetails = { name: string; phone: string; address: string };
type SaleResult = { sale: Sale; items: Array<Partial<SaleItem> & Pick<SaleItem, 'product_id' | 'quantity' | 'unit_price' | 'total'>> };

const POS_CART_STORAGE_KEY = 'supermarket.pos-cart';
const POS_CREDIT_DRAFT_STORAGE_KEY = 'supermarket.pos-credit-draft';

type CreditSaleDraft = {
  version: 1;
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT';
  customerId: string;
  customer: CreditCustomerDetails;
  amountPaid: string;
  cashReceived?: string;
  discount: string;
  notes: string;
  formOpen: boolean;
};

function isCreditSaleDraft(value: unknown): value is CreditSaleDraft {
  if (typeof value !== 'object' || value === null) return false;
  if (!('version' in value) || value.version !== 1) return false;
  if (!('paymentMethod' in value) || !['CASH', 'CARD', 'CREDIT'].includes(String(value.paymentMethod))) return false;
  if (!('customerId' in value) || typeof value.customerId !== 'string') return false;
  if (!('amountPaid' in value) || typeof value.amountPaid !== 'string') return false;
  if ('cashReceived' in value && typeof value.cashReceived !== 'string') return false;
  if (!('discount' in value) || typeof value.discount !== 'string') return false;
  if (!('notes' in value) || typeof value.notes !== 'string') return false;
  if (!('formOpen' in value) || typeof value.formOpen !== 'boolean') return false;
  if (!('customer' in value) || typeof value.customer !== 'object' || value.customer === null) return false;

  return 'name' in value.customer && typeof value.customer.name === 'string'
    && 'phone' in value.customer && typeof value.customer.phone === 'string'
    && 'address' in value.customer && typeof value.customer.address === 'string';
}

function isStoredCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null || !('product' in value) || !('quantity' in value)) return false;

  const { product, quantity } = value;
  return typeof quantity === 'number'
    && Number.isFinite(quantity)
    && quantity > 0
    && typeof product === 'object'
    && product !== null
    && 'id' in product && typeof product.id === 'number'
    && 'barcode' in product && typeof product.barcode === 'string'
    && 'sku' in product && typeof product.sku === 'string'
    && 'name_ku' in product && typeof product.name_ku === 'string'
    && 'selling_price' in product && typeof product.selling_price === 'number'
    && 'quantity' in product && typeof product.quantity === 'number';
}

const isKilogramProduct = (product: Product) => {
  const unitCode = product.unit_code?.trim().toLocaleLowerCase();
  return unitCode === 'kg'
    || product.unit_ku?.includes('کیلۆ') === true
    || product.unit_en?.toLocaleLowerCase().includes('kilogram') === true
    || product.unit_ar?.includes('كيلو') === true;
};

export function PosView() {
  const { t, language, getLocalizedName, formatCurrency, showToast, triggerRefresh, refreshTrigger } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [todayNetSales, setTodayNetSales] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [weightInputs, setWeightInputs] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT'>('CASH');
  const [showCreditSaleForm, setShowCreditSaleForm] = useState(false);
  const [creditCustomerId, setCreditCustomerId] = useState('');
  const [creditCustomer, setCreditCustomer] = useState<CreditCustomerDetails>({ name: '', phone: '', address: '' });
  const [creditAmountPaid, setCreditAmountPaid] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<SaleResult | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const saleIdempotencyKey = useRef<string | null>(null);
  const creditStorageErrorShown = useRef(false);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(POS_CART_STORAGE_KEY);
      if (storedCart) {
        const parsed: unknown = JSON.parse(storedCart);
        if (!Array.isArray(parsed) || !parsed.every(isStoredCartLine)) {
          throw new Error('Saved POS cart data is invalid.');
        }
        setCart(parsed);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      try {
        localStorage.removeItem(POS_CART_STORAGE_KEY);
      } catch (storageError) {
        showToast(storageError instanceof Error ? storageError.message : t('error'), 'error');
      }
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(POS_CREDIT_DRAFT_STORAGE_KEY);
      if (!storedDraft) return;

      const parsed: unknown = JSON.parse(storedDraft);
      if (!isCreditSaleDraft(parsed)) {
        throw new Error('Saved credit sale data is invalid.');
      }

      setPaymentMethod(parsed.paymentMethod === 'CARD' ? 'CASH' : parsed.paymentMethod);
      setCreditCustomerId(parsed.customerId);
      setCreditCustomer(parsed.customer);
      setCreditAmountPaid(parsed.amountPaid);
      setCashReceived(parsed.cashReceived ?? '');
      setDiscount(parsed.discount);
      setNotes(parsed.notes);
      setShowCreditSaleForm(parsed.formOpen && parsed.paymentMethod === 'CREDIT');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      try {
        localStorage.removeItem(POS_CREDIT_DRAFT_STORAGE_KEY);
      } catch (storageError) {
        showToast(storageError instanceof Error ? storageError.message : t('error'), 'error');
      }
    }
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    try {
      if (cart.length === 0) {
        localStorage.removeItem(POS_CART_STORAGE_KEY);
      } else {
        localStorage.setItem(POS_CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  }, [cart, cartLoaded, showToast, t]);

  useEffect(() => {
    if (!cartLoaded) return;
    try {
      if (cart.length === 0 && !showCreditSaleForm) {
        localStorage.removeItem(POS_CREDIT_DRAFT_STORAGE_KEY);
        creditStorageErrorShown.current = false;
        return;
      }

      const draft: CreditSaleDraft = {
        version: 1,
        paymentMethod,
        customerId: creditCustomerId,
        customer: creditCustomer,
        amountPaid: creditAmountPaid,
        cashReceived,
        discount,
        notes,
        formOpen: showCreditSaleForm,
      };
      localStorage.setItem(POS_CREDIT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      creditStorageErrorShown.current = false;
    } catch (error) {
      if (!creditStorageErrorShown.current) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        creditStorageErrorShown.current = true;
      }
    }
  }, [
    cart.length,
    cartLoaded,
    cashReceived,
    creditAmountPaid,
    creditCustomer,
    creditCustomerId,
    discount,
    notes,
    paymentMethod,
    showCreditSaleForm,
    showToast,
    t,
  ]);

  useEffect(() => {
    Promise.all([apiRequest<Product[]>('/api/products'), apiRequest<Customer[]>('/api/customers')])
      .then(([productResult, customerResult]) => {
        setProducts(productResult.data);
        setCustomers(customerResult.data);
        setCart(current => current.map(line => {
          const currentProduct = productResult.data.find(product => product.id === line.product.id);
          return currentProduct ? { ...line, product: currentProduct } : line;
        }));
      })
      .catch(error => showToast(error instanceof Error ? error.message : t('error'), 'error'));
  }, []);

  useEffect(() => {
    let active = true;
    void apiRequest<{ today_net_sales: number }>('/api/pos/summary')
      .then(result => {
        if (active) setTodayNetSales(result.data.today_net_sales);
      })
      .catch(error => {
        if (active) showToast(error instanceof Error ? error.message : t('error'), 'error');
      });

    return () => { active = false; };
  }, [refreshTrigger, showToast, t]);

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.product.selling_price * line.quantity, 0), [cart]);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const total = Math.max(0, subtotal - discountAmount);
  const cashReceivedAmount = Number(cashReceived);
  const changeAmount = Math.max(0, (Number.isFinite(cashReceivedAmount) ? cashReceivedAmount : 0) - total);

  const addToCart = (product: Product, quantity = 1) => {
    const quantityToAdd = Math.min(quantity, product.quantity);
    if (quantityToAdd <= 0) return;

    saleIdempotencyKey.current = null;
    setCart(current => {
      const existing = current.find(line => line.product.id === product.id);
      if (existing) {
        const nextQuantity = Math.min(product.quantity, existing.quantity + quantityToAdd);
        if (nextQuantity === existing.quantity) return current;
        return current.map(line => line.product.id === product.id ? { ...line, quantity: nextQuantity } : line);
      }
      return [...current, { product, quantity: quantityToAdd }];
    });
  };

  const findBarcode = async (barcodeInput = search) => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    try {
      const result = await apiRequest<Product>(`/api/products/barcode/${encodeURIComponent(barcode)}`);
      addToCart(result.data);
      setSearch('');
    } catch {
      showToast(t('productNotFound'), 'warning');
    }
  };

  const updateQuantity = (productId: number, nextQuantity: number) => {
    saleIdempotencyKey.current = null;
    setCart(current => current.flatMap(line => {
      if (line.product.id !== productId) return [line];
      if (nextQuantity <= 0) return [];
      return [{ ...line, quantity: Math.min(nextQuantity, line.product.quantity) }];
    }));
  };

  const completeSale = async (customer?: CreditCustomerDetails) => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      saleIdempotencyKey.current ??= crypto.randomUUID();
      const result = await apiRequest<SaleResult>('/api/pos/complete-sale', {
        method: 'POST',
        body: jsonBody({
          items: cart.map(line => ({ product_id: line.product.id, quantity: line.quantity, unit_price: line.product.selling_price })),
          customer_id: paymentMethod === 'CREDIT' && creditCustomerId ? Number(creditCustomerId) : null,
          customer: paymentMethod === 'CREDIT' && !creditCustomerId ? customer : null,
          payment_method: paymentMethod,
          discount: discountAmount,
          cash_received: paymentMethod === 'CREDIT' ? Number(creditAmountPaid) : paymentMethod === 'CASH' ? Number(cashReceived || total) : 0,
          idempotency_key: saleIdempotencyKey.current,
          notes,
        }),
      });
      setReceipt(result.data);
      saleIdempotencyKey.current = null;
      setCart([]);
      setCashReceived('');
      setDiscount('');
      setNotes('');
      setCreditCustomer({ name: '', phone: '', address: '' });
      setCreditCustomerId('');
      setCreditAmountPaid('');
      setShowCreditSaleForm(false);
      triggerRefresh();
      void apiRequest<Product[]>('/api/products').then(response => setProducts(response.data));
      void apiRequest<Customer[]>('/api/customers').then(response => setCustomers(response.data));
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const visibleProducts = products.filter(product => {
    const query = search.toLocaleLowerCase();
    return !query || product.barcode.toLocaleLowerCase().includes(query)
      || product.name_ku.toLocaleLowerCase().includes(query);
  });
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const displayedPage = Math.min(currentPage, totalPages);
  const firstVisibleProduct = visibleProducts.length === 0 ? 0 : (displayedPage - 1) * pageSize + 1;
  const lastVisibleProduct = Math.min(displayedPage * pageSize, visibleProducts.length);
  const paginatedProducts = visibleProducts.slice((displayedPage - 1) * pageSize, displayedPage * pageSize);
  const matchingCreditCustomers = customers.filter(customer => {
    const query = creditCustomer.name.trim().toLocaleLowerCase();
    return query.length > 0 && (
      customer.name.toLocaleLowerCase().includes(query) ||
      customer.phone?.toLocaleLowerCase().includes(query)
    );
  }).slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('pos')}</h1><p className="text-xs text-slate-500">{t('appTagline')}</p></div>
        <div className="flex items-center gap-3 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 dark:border-teal-900 dark:bg-teal-950/40">
          <DollarSign className="size-5 text-teal-700 dark:text-teal-300" />
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('reportMetric_total_sales')} · {t('today')}</p>
            <p className="text-sm font-bold text-teal-800 dark:text-teal-200">{todayNetSales === null ? t('loading') : formatCurrency(todayNetSales)}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          <div className="flex gap-2"><label className="relative min-w-0 flex-1"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input ref={searchInputRef} value={search} onChange={event => { setSearch(event.target.value); setCurrentPage(1); }} onKeyDown={event => { if (event.key === 'Enter') void findBarcode(); }} placeholder={`${t('search')} / ${t('barcode')}`} className="w-full rounded-md border border-slate-300 bg-white py-2.5 ps-9 pe-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label><BarcodeScannerButton onDetected={barcode => { setSearch(barcode); setCurrentPage(1); void findBarcode(barcode); }} /><button onClick={() => void findBarcode()} className="grid size-10 shrink-0 place-items-center rounded-md bg-teal-700 text-white" title={t('barcode')}><Barcode className="size-5" /></button></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{paginatedProducts.map(product => {
            const cartQuantity = cart.find(line => line.product.id === product.id)?.quantity ?? 0;
            const remainingQuantity = Math.max(0, product.quantity - cartQuantity);
            const unitName = getLocalizedName({
              name_ku: product.unit_ku ?? '',
              name_en: product.unit_en ?? '',
              name_ar: product.unit_ar ?? '',
            });

            return <button key={product.id} type="button" onClick={() => addToCart(product)} disabled={remainingQuantity <= 0} aria-label={`${t('addItem')}: ${getLocalizedName(product)}`} className="flex min-h-32 flex-col overflow-hidden rounded-md border sm:min-h-44 border-slate-200 bg-white text-start hover:border-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900">
              {product.image && <img src={product.image} alt="" loading="lazy" className="h-24 w-full bg-slate-100 object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} />}
              <span className="line-clamp-2 px-3 pt-3 text-xs font-semibold text-slate-900 dark:text-white">{getLocalizedName(product)}</span>
              <span className="mt-2 px-3 text-center text-xs font-bold text-teal-800 dark:text-teal-300">{formatCurrency(product.selling_price)}</span>
              <span className="mt-auto w-full px-3 pb-3 pt-2 text-end text-[10px] text-slate-500">{remainingQuantity} {unitName}</span>
            </button>;
          })}</div>
          {visibleProducts.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
            <span className="text-slate-500">{t('showing')} {firstVisibleProduct}-{lastVisibleProduct} {t('of')} {visibleProducts.length}</span>
            {totalPages > 1 && <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={displayedPage === 1} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('previousPage')}</button>
              <span className="text-slate-500">{t('page')} {displayedPage} {t('of')} {totalPages}</span>
              <button type="button" onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={displayedPage === totalPages} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50 dark:border-slate-700">{t('nextPage')}</button>
            </div>}
          </div>}
          {cart.length > 0 && <button type="button" onClick={() => document.getElementById('pos-cart')?.scrollIntoView({ behavior: 'smooth' })} className="sticky bottom-2 z-20 flex w-full items-center justify-between gap-3 rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg xl:hidden"><span className="flex items-center gap-2"><ShoppingCart className="size-4" />{t('cart')} ({cart.length})</span><span>{formatCurrency(total)}</span></button>}
        </div>

        <aside id="pos-cart" className="flex min-h-[28rem] scroll-mt-4 flex-col rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><ShoppingCart className="size-4" />{t('cart')}</h2><span className="text-xs text-slate-500">{cart.length} {t('items')}</span></div>
          <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 text-[11px] dark:bg-slate-800">{(['CASH', 'CREDIT'] as const).map(method => <button key={method} onClick={() => { saleIdempotencyKey.current = null; setPaymentMethod(method); }} className={`rounded px-2 py-1.5 font-semibold ${paymentMethod === method ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'}`}>{t(method.toLowerCase())}</button>)}</div>
            {paymentMethod === 'CASH' && <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{t('cashReceived')}<NumericInput min={total} step="0.01" value={cashReceived} onValueChange={value => { saleIdempotencyKey.current = null; setCashReceived(value); }} placeholder="0" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><div className="mt-1.5 flex items-center justify-between text-xs"><span className="text-slate-500">{t('changeAmount')}</span><span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(changeAmount)}</span></div></div>}
            <div className="space-y-2 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
              <div className="flex justify-between"><span className="text-slate-500">{t('subtotal')}</span><span>{formatCurrency(subtotal)}</span></div>
              <label className="flex items-center justify-between gap-3 text-rose-600"><span>{t('discount')}</span><NumericInput min="0" max={subtotal} step="0.01" value={discount === '0' ? '' : discount} placeholder="0" onValueChange={value => { saleIdempotencyKey.current = null; setDiscount(value); }} className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-center text-slate-900 sm:w-40 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white"><span>{t('total')}</span><span>{formatCurrency(total)}</span></div>
            </div>
            <button type="button" disabled={saving || cart.length === 0} onClick={() => {
              if (paymentMethod === 'CREDIT') {
                setShowCreditSaleForm(true);
                return;
              }
              if (paymentMethod === 'CASH') {
                const receivedAmount = Number(cashReceived || total);
                if (!Number.isFinite(receivedAmount) || receivedAmount < total) {
                  showToast(`${t('cashAmountBelowTotal')} (${formatCurrency(total)})`, 'error');
                  return;
                }
              }
              void completeSale();
            }} className="w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? t('loading') : t('completeSale')}</button>
          </div>
          <div className="min-h-32 flex-1 divide-y divide-slate-100 overflow-y-auto border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">{cart.length === 0 ? <p className="p-8 text-center text-xs text-slate-500">{t('noData')}</p> : cart.map(line => <div key={line.product.id} className="flex items-center gap-2 p-3">{line.product.image && <img src={line.product.image} alt="" loading="lazy" className="size-10 shrink-0 rounded object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} />}<div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{getLocalizedName(line.product)}</p><p className="text-[11px] text-slate-500">{formatCurrency(line.product.selling_price)} × {line.quantity}</p></div>{isKilogramProduct(line.product) ? <label className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">{t('weightKg')}<NumericInput inputMode="decimal" placeholder="0.000" value={weightInputs[line.product.id] ?? line.quantity} onValueChange={value => { setWeightInputs(current => ({ ...current, [line.product.id]: value })); const enteredQuantity = Number(value); if (Number.isFinite(enteredQuantity) && enteredQuantity >= 0.01) updateQuantity(line.product.id, Math.min(enteredQuantity, line.product.quantity)); }} onBlur={event => { const enteredQuantity = Number(event.currentTarget.value.replace(/,/g, '')); if (Number.isFinite(enteredQuantity) && enteredQuantity >= 0.01) { const quantity = Math.min(enteredQuantity, line.product.quantity); updateQuantity(line.product.id, quantity); setWeightInputs(current => ({ ...current, [line.product.id]: String(quantity) })); } else { setWeightInputs(current => { const next = { ...current }; delete next[line.product.id]; return next; }); } }} className="w-20 rounded border border-slate-300 bg-white px-1.5 py-1 text-center text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label> : <div className="flex items-center gap-1"><button onClick={() => updateQuantity(line.product.id, line.quantity - 1)} aria-label={t('decrease')} className="rounded border border-slate-200 p-1 dark:border-slate-700"><Minus className="size-3" /></button><span className="w-7 text-center text-xs tabular-nums">{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, line.quantity + 1)} aria-label={t('increase')} className="rounded border border-slate-200 p-1 dark:border-slate-700"><Plus className="size-3" /></button></div>}<button onClick={() => updateQuantity(line.product.id, 0)} aria-label={t('delete')} className="ms-1 rounded p-1 text-rose-600"><Trash2 className="size-4" /></button></div>)}</div>
        </aside>
      </div>
      {showCreditSaleForm && <div className="fixed inset-0 z-50 overflow-y-auto flex items-center-safe justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="credit-sale-title"><form onSubmit={event => { event.preventDefault(); void completeSale(creditCustomer); }} className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 id="credit-sale-title" className="text-base font-bold text-slate-900 dark:text-white">{t('customer')}</h2><button type="button" onClick={() => setShowCreditSaleForm(false)} aria-label={t('close')} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">×</button></div><div className="grid gap-3 sm:grid-cols-2"><div className="relative text-xs font-semibold text-slate-600 dark:text-slate-300"><label>{t('name')}<input autoFocus required maxLength={100} autoComplete="off" value={creditCustomer.name} onChange={event => { saleIdempotencyKey.current = null; setCreditCustomerId(''); setCreditCustomer(current => ({ ...current, name: event.target.value })); }} placeholder={t('name')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>{!creditCustomerId && matchingCreditCustomers.length > 0 && <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">{matchingCreditCustomers.map(customer => <button key={customer.id} type="button" onClick={() => { saleIdempotencyKey.current = null; setCreditCustomerId(String(customer.id)); setCreditCustomer({ name: customer.name, phone: customer.phone || '', address: customer.address || '' }); }} className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-3 py-2 text-start last:border-0 hover:bg-teal-50 dark:border-slate-800 dark:hover:bg-slate-800"><span className="font-semibold">{customer.name}{customer.phone ? ` · ${customer.phone}` : ''}</span><span className="text-[10px] text-rose-600 dark:text-rose-300">{t('debt')}: {formatCurrency(customer.debt)}</span></button>)}</div>}</div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('phone')}<input required={!creditCustomerId} maxLength={30} value={creditCustomer.phone} onChange={event => { saleIdempotencyKey.current = null; setCreditCustomerId(''); setCreditCustomer(current => ({ ...current, phone: event.target.value })); }} placeholder={t('phone')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">{t('address')}<input required={!creditCustomerId} value={creditCustomer.address} onChange={event => { saleIdempotencyKey.current = null; setCreditCustomerId(''); setCreditCustomer(current => ({ ...current, address: event.target.value })); }} placeholder={t('address')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label></div><div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800"><div className="flex justify-between font-semibold"><span>{t('total')}</span><span>{formatCurrency(total)}</span></div><label className="flex flex-col items-center gap-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">{t('cashReceived')}<NumericInput min="0" max={total} step="0.01" value={creditAmountPaid} onValueChange={value => { saleIdempotencyKey.current = null; setCreditAmountPaid(value); }} placeholder="0" className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-center text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><div className="flex justify-between text-xs text-rose-700 dark:text-rose-300"><span>{t('debt')}</span><span>{formatCurrency(Math.max(0, total - (Number(creditAmountPaid) || 0)))}</span></div></div><div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"><button type="button" onClick={() => setShowCreditSaleForm(false)} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{t('cancel')}</button><button type="submit" disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? t('loading') : t('completeSale')}</button></div></form></div>}
      {receipt && <ReceiptModal sale={receipt.sale} items={receipt.items.map(item => ({
        id: item.id || 0, sale_id: receipt.sale.id, product_id: item.product_id, quantity: item.quantity,
        unit_price: item.unit_price, purchase_cost: item.purchase_cost || 0, discount: item.discount || 0,
        total: item.total, profit: item.profit || 0,
        ...(item.barcode !== undefined ? { barcode: item.barcode } : {}),
        ...(item.name_ku !== undefined ? { name_ku: item.name_ku } : {}),
      }))} onClose={() => setReceipt(null)} />}
    </section>
  );
}