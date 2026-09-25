import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Check, 
  Copy, 
  KeyRound,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatPrice } from '../utils/currency';
import { printOrderReceipt, downloadHtmlInvoice, downloadTextInvoice } from '../utils/receiptGenerator';

interface InvoiceReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  storeSettings?: StoreSettings;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  storeSettings,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const storeName = storeSettings?.storeName || '8cloud.store';
  const currencySymbol = order.currency === 'INR' ? '₹' : order.currency === 'EUR' ? '€' : order.currency === 'GBP' ? '£' : '$';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header Actions Bar */}
        <div className="p-4 sm:px-6 bg-zinc-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Invoice INV-{order.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  PAID
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Official proof of payment & digital key allocation</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => printOrderReceipt(order, storeSettings)}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Print document or Save as PDF in print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => downloadHtmlInvoice(order, storeSettings)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone HTML invoice"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            <button
              onClick={() => downloadTextInvoice(order)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download plain text receipt"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
              aria-label="Close invoice modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body (Paper Style Preview) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-zinc-900/30 flex-1">
          <div className="max-w-2xl mx-auto bg-white text-zinc-900 p-6 sm:p-8 rounded-2xl shadow-xl font-sans text-xs">
            
            {/* Store & Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-zinc-900 gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-sky-600">
                  {storeName}
                </h1>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Ultra-Modern Cryptographic & Digital Assets Fulfillment
                </p>
                <p className="text-zinc-500 text-[11px]">
                  support@8cloud.store · https://8cloud.store
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  OFFICIAL TAX INVOICE
                </span>
                <div className="text-lg font-mono font-bold text-zinc-900">
                  INV-{order.id}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    PAID ({order.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To & Payment Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-zinc-200">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Billed To (Customer)
                </div>
                <div className="font-bold text-zinc-900 text-sm">{order.customerName}</div>
                <div className="font-mono text-zinc-600 text-[11px] mt-0.5">{order.customerEmail}</div>
                <div className="text-zinc-500 text-[11px] mt-2">
                  <strong>Date:</strong> {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })} ({new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Payment Details
                </div>
                <div className="text-zinc-700">
                  <strong>Gateway:</strong>{' '}
                  {order.paymentMethod === 'razorpay'
                    ? 'Razorpay Secure'
                    : order.paymentMethod === 'upi'
                    ? 'UPI / QR Realtime'
                    : order.paymentMethod === 'crypto'
                    ? 'Web3 Escrow'
                    : 'Direct Card Rail'}
                </div>
                <div className="text-zinc-700 mt-1">
                  <strong>Transaction Ref:</strong>
                  <span className="font-mono text-sky-700 font-semibold block text-[11px]">
                    {order.transactionRef}
                  </span>
                </div>
                <div className="text-zinc-500 text-[11px] mt-1">
                  <strong>Fulfillment:</strong> Zero-Latency Cloud Vault
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-900 text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Format</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="text-zinc-800">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-zinc-900">{item.product.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          SKU: {item.product.sku || `8CLD-${item.product.id.substring(0, 8).toUpperCase()}`}
                        </div>
                      </td>
                      <td className="py-3 text-center text-zinc-500 text-[11px]">
                        {item.product.deliveryFormat}
                      </td>
                      <td className="py-3 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {formatPrice(item.product.priceUSD, order.currency)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-zinc-900">
                        {formatPrice(item.product.priceUSD * item.quantity, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">
                      {formatPrice(order.subtotal, order.currency)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount Applied:</span>
                      <span className="font-mono font-semibold">
                        -{formatPrice(order.discount, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>GST / Digital Export Tax:</span>
                    <span className="font-mono">{currencySymbol}0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t-2 border-zinc-900">
                    <span>Total Paid:</span>
                    <span className="font-mono text-sky-600">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic License Keys Allocated */}
            {order.licenses && order.licenses.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Allocated Cryptographic Licenses ({order.licenses.length})</span>
                </div>
                <div className="space-y-2">
                  {order.licenses.map((lic) => (
                    <div
                      key={lic.key}
                      className="p-2.5 bg-white rounded-lg border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-zinc-900">{lic.productName}</div>
                        <div className="font-mono font-bold text-emerald-700 tracking-wider text-xs">
                          {lic.key}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {lic.maxDevices} Seats
                        </span>
                        <button
                          onClick={() => handleCopy(lic.key)}
                          className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-mono flex items-center gap-1 cursor-pointer border border-zinc-300"
                        >
                          {copiedKey === lic.key ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5 text-zinc-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Guarantee & Legal Footer */}
            <div className="mt-6 pt-4 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Escrow Fulfillment · 8cloud Zero-Trust Engine</span>
              </div>
              <div className="font-mono text-[9px] text-zinc-400">
                AUTH-SHA256: {order.transactionRef.substring(0, 16)}...
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Click "Print / Save PDF" to save directly as PDF from browser
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
