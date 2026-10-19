import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import JsBarcode from 'jsbarcode';
import { Package, Plus, Minus, Search, Pencil, Trash2, X, Download, Upload, Barcode, Camera, RefreshCw, Printer } from 'lucide-react';
import { apiRequest, jsonBody } from '../api';
import { useApp } from '../context/AppContext';
import type { Category, Product, Unit } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { NumericInput } from './NumericInput';

type ProductForm = {
  barcode: string;
  name_ku: string;
  category_id: string;
  unit_id: string;
  purchase_price: string;
  selling_price: string;
  wholesale_price: string;
  quantity: string;
  min_stock: string;
  expiry_date: string;
  description: string;
};

type ProductDraft = {
  form: ProductForm;
  editingId: number | null;
  removeExistingImage: boolean;
};

const EMPTY_FORM: ProductForm = {
  barcode: '',
  name_ku: '',
  category_id: '',
  unit_id: '',
  purchase_price: '',
  selling_price: '',
  wholesale_price: '',
  quantity: '0',
  min_stock: '0',
  expiry_date: '',
  description: '',
};

const PRODUCT_DRAFT_STORAGE_KEY = 'supermarket.product-draft';
const PRODUCTS_PAGE_SIZE = 10;

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorInstance;

function createEan13Barcode(existingBarcodes: string[]): string {
  const existing = new Set(existingBarcodes);

  for (let attempt = 0; attempt < 100; attempt++) {
    const randomDigits = crypto.getRandomValues(new Uint8Array(12));
    const digits = Array.from(randomDigits, digit => digit % 10);
    const checksum = (10 - digits.reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 1 : 3), 0) % 10) % 10;
    const barcode = `${digits.join('')}${checksum}`;
    if (!existing.has(barcode)) return barcode;
  }

  throw new Error('Could not generate a unique barcode');
}

function isProductForm(value: unknown): value is ProductForm {
  if (typeof value !== 'object' || value === null) return false;
  return Object.keys(EMPTY_FORM).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string',
  );
}

function readProductDraft(): ProductDraft | null {
  const stored = localStorage.getItem(PRODUCT_DRAFT_STORAGE_KEY);
  if (!stored) return null;

  let storedDraft: unknown;
  try {
    storedDraft = JSON.parse(stored);
  } catch {
    localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
    return null;
  }

  if (isProductForm(storedDraft)) {
    return { form: storedDraft, editingId: null, removeExistingImage: false };
  }

  if (
    typeof storedDraft === 'object' &&
    storedDraft !== null &&
    'form' in storedDraft &&
    'editingId' in storedDraft &&
    'removeExistingImage' in storedDraft &&
    isProductForm(storedDraft.form) &&
    (typeof storedDraft.editingId === 'number' || storedDraft.editingId === null) &&
    typeof storedDraft.removeExistingImage === 'boolean'
  ) {
    return {
      form: storedDraft.form,
      editingId: storedDraft.editingId,
      removeExistingImage: storedDraft.removeExistingImage,
    };
  }

  localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
  return null;
}

/* ----------------------------- CSV helpers ----------------------------- */

const CSV_HEADERS = [
  'barcode',
  'name_ku',
  'category_id',
  'unit_id',
  'purchase_price',
  'selling_price',
  'wholesale_price',
  'quantity',
  'min_stock',
  'expiry_date',
  'description',
] as const;

function escapeCsvValue(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function toCsvRow(values: Array<string | number | null | undefined>): string {
  return values.map(escapeCsvValue).join(',');
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  return rows;
}

function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------- Component ------------------------------ */

export function ProductsView() {
  const { t, formatCurrency, getLocalizedName, showToast, triggerRefresh } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const [scannerStream, setScannerStream] = useState<MediaStream | null>(null);
  const [scannerTarget, setScannerTarget] = useState<'form' | 'search'>('form');
  const imagePreview = selectedImagePreview || (!removeExistingImage ? editing?.image : null) || null;

  const storageErrorShown = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const productFormRef = useRef<HTMLFormElement>(null);

  const barcodeAlreadyUsed = Boolean(
    form?.barcode.trim() &&
    products.some(
      product =>
        product.id !== editing?.id &&
        product.barcode.trim().toLocaleLowerCase() === form.barcode.trim().toLocaleLowerCase(),
    ),
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productResult, categoryResult, unitResult] = await Promise.all([
        apiRequest<Product[]>('/api/products'),
        apiRequest<Category[]>('/api/categories'),
        apiRequest<Unit[]>('/api/units'),
      ]);
      setProducts(productResult.data);
      setCategories(categoryResult.data);
      setUnits(unitResult.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!form) return;
    const frame = window.requestAnimationFrame(() => barcodeInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [Boolean(form)]);

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(selectedImage);
    setSelectedImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (!form) return;

    const handleFormShortcuts = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        productFormRef.current?.requestSubmit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        if (enlargedImage) {
          setEnlargedImage(null);
          return;
        }
        setForm(current =>
          current
            ? {
                ...EMPTY_FORM,
                category_id: current.category_id,
                unit_id: current.unit_id,
              }
            : current,
        );
        setSelectedImage(null);
        setRemoveExistingImage(false);
        setEnlargedImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setScannerStream(null);
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleFormShortcuts);
    return () => window.removeEventListener('keydown', handleFormShortcuts);
  }, [Boolean(form), enlargedImage]);

  /* ----------------------------- Modal open ----------------------------- */

  const openCreate = () => {
    setEditing(null);
    setSelectedImage(null);
    setRemoveExistingImage(false);
    setEnlargedImage(null);
    try {
      const draft = readProductDraft();
      setForm({
        ...EMPTY_FORM,
        category_id: String(categories[0]?.id ?? ''),
        unit_id: String(units[0]?.id ?? ''),
        ...(draft?.editingId === null ? draft.form : {}),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
      setForm({
        ...EMPTY_FORM,
        category_id: String(categories[0]?.id ?? ''),
        unit_id: String(units[0]?.id ?? ''),
      });
    }
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setSelectedImage(null);
    setEnlargedImage(null);
    let draft: ProductDraft | null = null;
    try {
      draft = readProductDraft();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
    setRemoveExistingImage(draft?.editingId === product.id && draft.removeExistingImage);
    setForm(draft?.editingId === product.id ? draft.form : {
      barcode: product.barcode,
      name_ku: product.name_ku,
      category_id: String(product.category_id),
      unit_id: String(product.unit_id),
      purchase_price: String(product.purchase_price),
      selling_price: String(product.selling_price),
      wholesale_price: String(product.wholesale_price),
      quantity: String(product.quantity),
      min_stock: String(product.min_stock),
      expiry_date: product.expiry_date || '',
      description: product.description || '',
    });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(null);
    setSelectedImage(null);
    setRemoveExistingImage(false);
    setEnlargedImage(null);
    setScannerStream(null);
  };

  const generateBarcode = () => {
    try {
      const barcode = createEan13Barcode(products.map(product => product.barcode));
      setForm(current => current ? { ...current, barcode } : current);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  const startBarcodeScanner = async (target: 'form' | 'search' = 'form') => {
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      showToast(t('barcodeScanUnsupported'), 'error');
      return;
    }

    try {
      setScannerTarget(target);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      setScannerStream(stream);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('cameraPermissionError'), 'error');
    }
  };

  useEffect(() => {
    if (!scannerStream) return;

    let active = true;
    let timeoutId: number | undefined;
    const stopScanner = () => {
      scannerStream.getTracks().forEach(track => track.stop());
      if (scannerTarget === 'form') {
        setSelectedImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
      setScannerStream(null);
    };
    const video = barcodeVideoRef.current;
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

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
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('barcodeScanUnsupported'), 'error');
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
            if (scannerTarget === 'search') {
              setSearch(result.rawValue);
              setCurrentPage(1);
            } else {
              setForm(current => current ? { ...current, barcode: result.rawValue } : current);
            }
            stopScanner();
            return;
          }
        }
        timeoutId = window.setTimeout(() => void scan(), 150);
      } catch (error) {
        showToast(error instanceof Error ? error.message : t('barcodeScanFailed'), 'error');
        stopScanner();
      }
    };

    void video.play().then(() => void scan()).catch(error => {
      showToast(error instanceof Error ? error.message : t('cameraPermissionError'), 'error');
      stopScanner();
    });

    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      scannerStream.getTracks().forEach(track => track.stop());
      if (video.srcObject === scannerStream) video.srcObject = null;
    };
  }, [scannerStream, scannerTarget, showToast, t]);

  /* ----------------------------- Draft save ----------------------------- */

  useEffect(() => {
    if (!form) return;
    try {
      const draft: ProductDraft = {
        form,
        editingId: editing?.id ?? null,
        removeExistingImage,
      };
      localStorage.setItem(PRODUCT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      storageErrorShown.current = false;
    } catch (error) {
      if (!storageErrorShown.current) {
        showToast(error instanceof Error ? error.message : t('error'), 'error');
        storageErrorShown.current = true;
      }
    }
  }, [form, editing, removeExistingImage, showToast, t]);

  /* -------------------------------- Save -------------------------------- */

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    if (barcodeAlreadyUsed) {
      showToast(t('barcodeAlreadyUsed'), 'error');
      barcodeInputRef.current?.focus();
      return;
    }
    const productForm = form;
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        category_id: Number(productForm.category_id),
        unit_id: Number(productForm.unit_id),
        purchase_price: Number(productForm.purchase_price),
        selling_price: Number(productForm.selling_price),
        wholesale_price: Number(productForm.wholesale_price || 0),
        quantity: Number(productForm.quantity || 0),
        min_stock: Number(productForm.min_stock || 0),
        expiry_date: productForm.expiry_date || null,
      };

      const body = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null) body.append(key, String(value));
      }
      if (selectedImage) body.append('image', selectedImage);
      if (editing && removeExistingImage && !selectedImage) body.append('remove_image', '1');
      if (editing) body.append('_method', 'PUT');

      await apiRequest<Product>(
        editing ? `/api/products/${editing.id}` : '/api/products',
        { method: 'POST', body },
      );
      if (!editing) {
        try {
          localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
        } catch (error) {
          showToast(error instanceof Error ? error.message : t('error'), 'error');
        }
        setForm({
          ...EMPTY_FORM,
          category_id: productForm.category_id,
          unit_id: productForm.unit_id,
        });
        setSelectedImage(null);
        setRemoveExistingImage(false);
        setEnlargedImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        window.requestAnimationFrame(() => barcodeInputRef.current?.focus());
      } else {
        try {
          localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
        } catch (error) {
          showToast(error instanceof Error ? error.message : t('error'), 'error');
        }
        closeForm();
      }
      showToast(t('saved'), 'success');
      triggerRefresh();
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const printBarcode = (product: Product) => {
    const printWindow = window.open('', '_blank', 'popup,width=420,height=320');
    if (!printWindow) {
      showToast(t('printPopupBlocked'), 'error');
      return;
    }

    try {
      const printDocument = printWindow.document;
      printDocument.open();
      printDocument.write(`<!doctype html><html><head><title>${t('printBarcode')}</title><style>
        @page { size: 60mm 42mm; margin: 2mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #000; font-family: Arial, sans-serif; }
        .label { width: 56mm; min-height: 38mm; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .name { max-width: 54mm; overflow: hidden; font-size: 10pt; font-weight: 700; white-space: nowrap; text-overflow: ellipsis; }
        svg { width: 54mm; height: 22mm; }
        .price { font-size: 12pt; font-weight: 700; }
      </style></head><body><main class="label"><div class="name"></div><svg></svg><div class="price"></div></main></body></html>`);
      printDocument.close();

      const name = printDocument.querySelector<HTMLElement>('.name');
      const barcodeSvg = printDocument.querySelector<SVGSVGElement>('svg');
      const price = printDocument.querySelector<HTMLElement>('.price');
      if (!name || !barcodeSvg || !price) {
        throw new Error(t('barcodePrintFailed'));
      }

      name.textContent = getLocalizedName(product);
      price.textContent = formatCurrency(product.selling_price);
      JsBarcode(barcodeSvg, product.barcode, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 12,
        height: 48,
        margin: 2,
      });

      printWindow.focus();
      window.setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      printWindow.close();
      showToast(error instanceof Error ? error.message : t('barcodePrintFailed'), 'error');
    }
  };

  /* ------------------------------- Delete ------------------------------- */

  const deleteProduct = async () => {
    if (!deleting) return;
    try {
      await apiRequest(`/api/products/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      showToast(t('itemDeleted'), 'success');
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    }
  };

  /* ------------------------------ Filtering ----------------------------- */

  const visibleProducts = products.filter((product) => {
    const query = search.toLocaleLowerCase();
    return (
      !query ||
      [product.barcode, product.sku, product.name_ku].some((value) =>
        value?.toLocaleLowerCase().includes(query),
      )
    );
  });
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PAGE_SIZE));
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedProducts = visibleProducts.slice(
    (displayedPage - 1) * PRODUCTS_PAGE_SIZE,
    displayedPage * PRODUCTS_PAGE_SIZE,
  );
  const firstVisibleProduct = visibleProducts.length === 0
    ? 0
    : (displayedPage - 1) * PRODUCTS_PAGE_SIZE + 1;
  const lastVisibleProduct = Math.min(displayedPage * PRODUCTS_PAGE_SIZE, visibleProducts.length);

  /* ---------------------------- Export CSV ------------------------------ */

  const exportCsv = () => {
    if (visibleProducts.length === 0) {
      showToast(t('noData'), 'error');
      return;
    }

    const lines: string[] = [toCsvRow([...CSV_HEADERS])];

    for (const product of visibleProducts) {
      lines.push(
        toCsvRow([
          product.barcode,
          product.name_ku,
          product.category_id,
          product.unit_id,
          product.purchase_price,
          product.selling_price,
          product.wholesale_price,
          product.quantity,
          product.min_stock,
          product.expiry_date ?? '',
          product.description ?? '',
        ]),
      );
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`products-${stamp}.csv`, lines.join('\n'));
    showToast(t('saved'), 'success');
  };

  /* ---------------------------- Import CSV ------------------------------ */

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        showToast(t('noData'), 'error');
        return;
      }

      const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
      const indexOf = (key: string) => header.indexOf(key);

      const idx = {
        barcode: indexOf('barcode'),
        name_ku: indexOf('name_ku'),
        category_id: indexOf('category_id'),
        unit_id: indexOf('unit_id'),
        purchase_price: indexOf('purchase_price'),
        selling_price: indexOf('selling_price'),
        wholesale_price: indexOf('wholesale_price'),
        quantity: indexOf('quantity'),
        min_stock: indexOf('min_stock'),
        expiry_date: indexOf('expiry_date'),
        description: indexOf('description'),
      };

      if (idx.barcode === -1 || idx.name_ku === -1) {
        showToast(t('error'), 'error');
        return;
      }

      const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? '').trim() : '');

      let created = 0;
      let failed = 0;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const barcode = cell(row, idx.barcode);
        const nameKu = cell(row, idx.name_ku);
        if (!barcode && !nameKu) continue;

        const payload = {
          barcode,
          name_ku: nameKu,
          category_id: Number(cell(row, idx.category_id)) || (categories[0]?.id ?? 0),
          unit_id: Number(cell(row, idx.unit_id)) || (units[0]?.id ?? 0),
          purchase_price: Number(cell(row, idx.purchase_price)) || 0,
          selling_price: Number(cell(row, idx.selling_price)) || 0,
          wholesale_price: Number(cell(row, idx.wholesale_price)) || 0,
          quantity: Number(cell(row, idx.quantity)) || 0,
          min_stock: Number(cell(row, idx.min_stock)) || 0,
          expiry_date: cell(row, idx.expiry_date) || null,
          description: cell(row, idx.description) || '',
        };

        try {
          await apiRequest<Product>('/api/products', {
            method: 'POST',
            body: jsonBody(payload),
          });
          created++;
        } catch {
          failed++;
        }
      }

      if (created > 0) {
        showToast(`${t('saved')} (${created})`, 'success');
        triggerRefresh();
        await loadData();
      }
      if (failed > 0) {
        showToast(`${t('error')} (${failed})`, 'error');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setImporting(false);
    }
  };

  /* -------------------------------- Field ------------------------------- */

  const field = (
    key: keyof ProductForm,
    label: string,
    type = 'text',
    required = false,
    placeholder = '',
  ) => (
    <label
      key={key}
      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
    >
      {label}
      {type === 'number' ? (
        <NumericInput
          required={required}
          min="0"
          step="0.01"
          value={form?.[key] ?? ''}
          onValueChange={value =>
            setForm(current => current ? { ...current, [key]: value } : current)
          }
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      ) : (
        <input
          required={required}
          type={type}
          value={form?.[key] ?? ''}
          onChange={(event) =>
            setForm((current) =>
              current ? { ...current, [key]: event.target.value } : current,
            )
          }
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      )}
    </label>
  );

  /* -------------------------------- Render ------------------------------ */

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Package className="size-5 text-teal-700" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('products')}
          </h1>
          <span className="text-xs text-slate-500">{products.length}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex min-w-0 flex-1 gap-2 sm:w-64 sm:flex-none">
            <label className="relative min-w-0 flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('search')}
                className="w-full rounded-md border border-slate-300 bg-white py-2 ps-9 pe-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
            <button
              type="button"
              onClick={() => void startBarcodeScanner('search')}
              title={t('scanBarcode')}
              aria-label={t('scanBarcode')}
              className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Camera className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="hidden shrink-0 md:flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Export CSV"
          >
            <Download className="size-4" />
            <span>CSV</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="hidden shrink-0 md:flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Import CSV"
          >
            <Upload className="size-4" />
            <span>{importing ? t('loading') : 'CSV'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void handleImportFile(event)}
            className="hidden"
          />

          {/* Add product */}
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            <Plus className="size-4" />
            <span>{t('addProduct')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-start text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t('barcode')}</th>
                <th className="px-4 py-3">{t('productName')}</th>
                <th className="px-4 py-3">{t('categories')}</th>
                <th className="px-4 py-3 text-end">{t('purchasePrice')}</th>
                <th className="px-4 py-3 text-end">{t('sellingPrice')}</th>
                <th className="px-4 py-3 text-end">{t('wholesalePrice')}</th>
                <th className="px-4 py-3 text-end">{t('quantity')}</th>
                <th className="px-4 py-3 text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    {t('loading')}
                  </td>
                </tr>
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono">
                      {product.barcode}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {getLocalizedName(product)}
                    </td>
                    <td className="px-4 py-3">
                      {getLocalizedName({
                        name_ku: product.category_ku,
                        name_en: product.category_en,
                        name_ar: product.category_ar,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      {formatCurrency(product.purchase_price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                      {formatCurrency(product.selling_price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      {formatCurrency(product.wholesale_price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      {product.quantity} {getLocalizedName({
                        name_ku: product.unit_ku ?? '',
                        name_en: product.unit_en ?? '',
                        name_ar: product.unit_ar ?? '',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => printBarcode(product)}
                          title={t('printBarcode')}
                          aria-label={t('printBarcode')}
                          className="rounded p-1.5 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-slate-700"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          title={t('edit')}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(product)}
                          title={t('delete')}
                          className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-xs text-slate-500" aria-live="polite">
            {t('showing')} {firstVisibleProduct}-{lastVisibleProduct} {t('of')} {visibleProducts.length}
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={displayedPage <= 1 || loading}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              {t('previousPage')}
            </button>
            <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
              {t('page')} {displayedPage} {t('of')} {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={displayedPage >= totalPages || loading}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              {t('nextPage')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            ref={productFormRef}
            onSubmit={saveProduct}
            className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">
                {editing ? t('edit') : t('addProduct')}
              </h2>
              <button type="button" onClick={closeForm} aria-label={t('cancel')}>
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
                {t('barcode')}
                <div className="mt-1.5 flex gap-1.5">
                  <input
                    ref={barcodeInputRef}
                    required
                    type="text"
                    inputMode="numeric"
                    value={form.barcode}
                    onChange={(event) =>
                      setForm((current) =>
                        current ? { ...current, barcode: event.target.value } : current,
                      )
                    }
                    placeholder={t('barcode')}
                    aria-invalid={barcodeAlreadyUsed}
                    aria-describedby={barcodeAlreadyUsed ? 'barcode-duplicate-error' : undefined}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    title={t('generateBarcode')}
                    aria-label={t('generateBarcode')}
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-300 text-teal-700 hover:bg-teal-50 dark:border-slate-700 dark:text-teal-300 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void startBarcodeScanner()}
                    title={t('scanBarcode')}
                    aria-label={t('scanBarcode')}
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-300 text-teal-700 hover:bg-teal-50 dark:border-slate-700 dark:text-teal-300 dark:hover:bg-slate-800"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>
                {barcodeAlreadyUsed && (
                  <span id="barcode-duplicate-error" role="alert" className="mt-1 block font-normal text-rose-600">
                    {t('barcodeAlreadyUsed')}
                  </span>
                )}
              </label>
              {field('name_ku', t('productName'), 'text', true, t('productName'))}

              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('categories')}
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? { ...current, category_id: event.target.value }
                        : current,
                    )
                  }
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getLocalizedName(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('unit')}
                <select
                  required
                  value={form.unit_id}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? { ...current, unit_id: event.target.value }
                        : current,
                    )
                  }
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getLocalizedName(item)}
                    </option>
                  ))}
                </select>
              </label>

              {field('purchase_price', t('purchasePrice'), 'number', true, t('purchasePrice'))}
              {field('selling_price', t('sellingPrice'), 'number', true, t('sellingPrice'))}
              {field('wholesale_price', t('wholesalePrice'), 'number', false, t('wholesalePrice'))}
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('quantity')}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setForm(current => current ? {
                      ...current,
                      quantity: String(Math.max(0, (Number(current.quantity) || 0) - 1)),
                    } : current)}
                    disabled={(Number(form.quantity) || 0) <= 0}
                    title={t('decrease')}
                    aria-label={t('decrease')}
                    className="rounded border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Minus className="size-4" />
                  </button>
                  <NumericInput
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onValueChange={value => setForm(current => current ? { ...current, quantity: value } : current)}
                    placeholder={t('quantity')}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-normal text-slate-900 outline-none focus:border-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(current => current ? {
                      ...current,
                      quantity: String((Number(current.quantity) || 0) + 1),
                    } : current)}
                    title={t('increase')}
                    aria-label={t('increase')}
                    className="rounded border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </label>
              {field('min_stock', t('minStock'), 'number', false, t('minStock'))}
              {field('expiry_date', t('expiryDate'), 'date', false, t('expiryDate'))}
              {field('description', t('description'), 'text', false, t('description'))}
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('productImage')}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file) {
                      setSelectedImage(file);
                      setRemoveExistingImage(false);
                    }
                    event.target.value = '';
                  }}
                  className="hidden"
                />
                <span className="mt-1 block font-normal text-slate-500">{t('imageFileHint')}</span>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {imagePreview ? t('replaceImage') : t('selectImage')}
                </button>
                {imagePreview && (
                  <div className="mt-2 flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setEnlargedImage(imagePreview)}
                      aria-label={t('enlargeImage')}
                      title={t('enlargeImage')}
                    >
                      <img
                        src={imagePreview}
                        alt={t('productImage')}
                        className="h-24 w-24 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setRemoveExistingImage(Boolean(editing?.image));
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      aria-label={t('removeImage')}
                      title={t('removeImage')}
                      className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                      {t('removeImage')}
                    </button>
                  </div>
                )}
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <p className="me-auto self-center text-xs text-slate-500">
                {t('saveShortcut')}: F1 · {t('clearShortcut')}: Esc
              </p>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                disabled={saving}
                type="submit"
                className="rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {saving ? t('loading') : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {scannerStream && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto flex items-center-safe justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('scanBarcode')}
        >
          <div className="w-full max-w-lg rounded-md bg-white p-4 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Barcode className="size-5 text-teal-700" />
                {t('scanBarcode')}
              </h2>
              <button
                type="button"
                onClick={() => setScannerStream(null)}
                aria-label={t('cancel')}
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <video
              ref={barcodeVideoRef}
              autoPlay
              muted
              playsInline
              className="max-h-[65vh] w-full rounded-md bg-black object-contain"
            />
            <p className="mt-3 text-center text-sm text-slate-500">
              {t('cameraScanner')}
            </p>
          </div>
        </div>
      )}

      {enlargedImage && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto flex items-center-safe justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('enlargeImage')}
          onClick={() => setEnlargedImage(null)}
        >
          <button
            type="button"
            onClick={() => setEnlargedImage(null)}
            aria-label={t('close')}
            className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-6" />
          </button>
          <img
            src={enlargedImage}
            alt={t('productImage')}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
          />
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleting)}
        message={`${t('deleteConfirm')}: ${
          deleting ? getLocalizedName(deleting) : ''
        }`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void deleteProduct()}
      />
    </section>
  );
}