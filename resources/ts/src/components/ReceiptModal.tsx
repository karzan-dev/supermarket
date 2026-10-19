import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import type { Sale, SaleItem } from '../types';

interface ReceiptModalProps {
  sale: Sale | null;
  items: SaleItem[];
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, items, onClose }) => {
  const { t, formatCurrency, getLocalizedName, settings, isRtl, language } = useApp();
  const [receiptFormat, setReceiptFormat] = useState<'80mm' | '58mm' | 'a4'>('80mm');

  if (!sale) return null;

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Print error or iframe restricted:", e);
    }
  };

  const storeName = language === 'en' 
    ? (settings.store_name_en || settings.store_name)
    : language === 'ar'
    ? (settings.store_name_ar || settings.store_name)
    : settings.store_name;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center-safe justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar (Hidden in print) */}
        {/* Phones: title + close on the first row, format/print controls wrap below so close never leaves the screen */}
        <div className="no-print p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {t('printReceipt')} - {sale.invoice_number}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            title={t('close')}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:order-last sm:size-8 sm:border-0 sm:bg-transparent sm:text-slate-400"
          >
            <X className="size-5 sm:size-4" />
          </button>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {/* Format selection */}
            <div className="grid w-full grid-cols-3 gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg text-xs font-semibold sm:flex sm:w-auto sm:gap-0">
              <button
                onClick={() => setReceiptFormat('80mm')}
                className={`px-1.5 py-1.5 leading-tight rounded-md transition sm:whitespace-nowrap sm:px-2.5 sm:py-1 ${receiptFormat === '80mm' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t('receiptThermal80')}
              </button>
              <button
                onClick={() => setReceiptFormat('58mm')}
                className={`px-1.5 py-1.5 leading-tight rounded-md transition sm:whitespace-nowrap sm:px-2.5 sm:py-1 ${receiptFormat === '58mm' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t('receiptThermal58')}
              </button>
              <button
                onClick={() => setReceiptFormat('a4')}
                className={`px-1.5 py-1.5 leading-tight rounded-md transition sm:whitespace-nowrap sm:px-2.5 sm:py-1 ${receiptFormat === 'a4' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t('printInvoice')}
              </button>
            </div>

            <button
              id="receipt-print-btn"
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm transition sm:w-auto sm:py-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>
          </div>
        </div>

        {/* Receipt / Invoice Preview Area */}
        <div className="p-3 sm:p-6 bg-slate-100 dark:bg-slate-950/70 flex justify-center max-h-[75dvh] overflow-y-auto">
          
          {/* Printable Container */}
          <div
            id="printable-receipt"
            className={`bg-white text-black p-6 shadow-md transition-all font-mono text-xs ${
              receiptFormat === '58mm'
                ? 'w-[58mm] min-h-[140mm] text-[10px] p-3'
                : receiptFormat === '80mm'
                ? 'w-[80mm] min-h-[160mm] text-[11px] p-4'
                : 'w-full max-w-xl text-xs p-8 rounded-lg'
            }`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <img
                src="/images/supermarket-logo.png"
                alt={storeName}
                className={`mx-auto object-contain ${receiptFormat === '58mm' ? 'size-10' : receiptFormat === '80mm' ? 'size-14' : 'size-20'}`}
              />
              <h2 className="text-base font-extrabold uppercase tracking-wide">
                {storeName}
              </h2>
              <p className="text-[10px] text-slate-600">{settings.store_address}</p>
              <p className="text-[10px] text-slate-600">{t('phone')}: {settings.store_phone}</p>
              <div className="inline-block border border-black px-2 py-0.5 mt-1 font-bold text-[10px]">
                {receiptFormat === 'a4' ? t('printInvoice') : t('receiptTitle')}
              </div>
            </div>

            {/* Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>{t('invoiceNumber')}:</span>
                <span className="font-bold">{sale.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('invoiceDate')}:</span>
                <span>{new Date(sale.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cashierName')}:</span>
                <span>{sale.cashier_name || 'Admin'}</span>
              </div>
              {sale.customer_name && (
                <div className="flex justify-between">
                  <span>{t('customer')}:</span>
                  <span className="font-semibold">{sale.customer_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('paymentMethod')}:</span>
                <span className="font-bold">
                  {sale.payment_method === 'CASH' ? t('cash') : sale.payment_method === 'CARD' ? t('card') : t('credit')}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold">
                    <th className="text-start pb-1">{t('products')}</th>
                    <th className="text-center pb-1">{t('quantity')}</th>
                    <th className="text-end pb-1">{t('subtotal')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1">
                        <div className="font-bold leading-tight">{getLocalizedName(item as any)}</div>
                        <div className="text-[9px] text-slate-500">
                          {item.quantity} x {formatCurrency(item.unit_price)}
                        </div>
                      </td>
                      <td className="text-center py-1 align-top font-bold">{item.quantity}</td>
                      <td className="text-end py-1 align-top font-bold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="py-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>{t('discount')}:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-black">
                <span>{t('grandTotal')}:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>

              {sale.payment_method === 'CREDIT' ? (
                <div className="pt-2 text-center">
                  <div className="text-[10px]">
                    <span>{t('cashReceived')}:</span>
                    <div className="text-sm font-bold">{formatCurrency(sale.cash_received)}</div>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-dashed border-slate-300 pt-1 text-[10px] font-bold">
                    <span>{t('debt')}:</span>
                    <span>{formatCurrency(Math.max(0, sale.total - sale.cash_received))}</span>
                  </div>
                </div>
              ) : sale.payment_method === 'CASH' ? (
                <>
                  <div className="flex justify-between text-[10px] pt-1">
                    <span>{t('cashReceived')}:</span>
                    <span>{formatCurrency(sale.cash_received)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{t('changeAmount')}:</span>
                    <span>{formatCurrency(sale.change_amount)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Barcode / QR Simulation & Footer */}
            <div className="pt-4 text-center space-y-2 border-t border-dashed border-slate-300">
              <div className="font-mono tracking-widest text-xs font-bold">
                * {sale.invoice_number} *
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                {settings.receipt_footer || t('receiptThankYou')}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
