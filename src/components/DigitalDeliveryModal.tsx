import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  ExternalLink, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  X, 
  Layers, 
  Check,
  Printer
} from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/currency';
import { printOrderReceipt } from '../utils/receiptGenerator';

interface DigitalDeliveryModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenVault: () => void;
  onOpenValidatorWithKey: (key: string) => void;
}

export const DigitalDeliveryModal: React.FC<DigitalDeliveryModalProps> = ({
  order,
  onClose,
  onOpenVault,
  onOpenValidatorWithKey,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);

  if (!order) return null;

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSimulateDownload = (fileName: string, productName: string) => {
    setDownloadStarted(fileName);
    
    // Create an actual downloadable text file with real activation instructions
    const manifestText = `================================================================================
8CLOUD.STORE — DIGITAL ASSET DELIVERY MANIFEST
Order ID: ${order.id}
Date: ${new Date(order.date).toUTCString()}
Product: ${productName}
Customer: ${order.customerName} (${order.customerEmail})
Transaction Ref: ${order.transactionRef}
================================================================================

YOUR ACTIVATION CREDENTIALS & INSTRUCTIONS:

1. LICENSE & DOWNLOAD KEY:
   ${order.licenses.map(l => `Product: ${l.productName}\nKey: ${l.key}\nMax Allowed Seats: ${l.maxDevices}`).join('\n\n') || 'Standard Direct Asset Archive'}

2. VERIFICATION PROTOCOL:
   Verify this cryptographic key anytime at: https://8cloud.store (Click "Verify License Key")

3. REPOSITORY & ASSETS ACCESS:
   Direct Cloud CDN: https://cdn.8cloud.store/downloads/${order.id}/${fileName}

Thank you for choosing 8cloud.store.
================================================================================`;

    const blob = new Blob([manifestText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-manifest.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadStarted(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-500/20 overflow-hidden my-8">
        
        {/* Top Celebration Banner */}
        <div className="p-6 bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-purple-950/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <CheckCircle2 className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/30 text-cyan-400 font-semibold">
                  ORDER FULFILLED (0s)
                </span>
                <span className="text-xs font-mono text-zinc-500">#{order.id}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Your Digital Assets Are Ready!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close delivery modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Notification bar */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Encrypted backup dispatched to <span className="text-white font-mono">{order.customerEmail}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              SENT ✓
            </span>
          </div>

          {/* Section A: Generated Cryptographic Keys */}
          {order.licenses.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Generated Cryptographic License Keys ({order.licenses.length})</span>
              </div>

              <div className="space-y-3">
                {order.licenses.map((lic) => (
                  <div
                    key={lic.key}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{lic.productName}</h4>
                        <div className="text-[11px] text-zinc-400">
                          Allocated: {lic.maxDevices} Workstations · Status: <span className="text-emerald-400">Active</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenValidatorWithKey(lic.key)}
                        className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Test In Key Validator</span>
                      </button>
                    </div>

                    {/* Key box */}
                    <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-white/10 font-mono text-sm">
                      <span className="text-cyan-300 font-bold tracking-wider select-all">
                        {lic.key}
                      </span>
                      <button
                        onClick={() => handleCopyKey(lic.key)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedKey === lic.key ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Key</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section B: Direct High-Speed Download Packages */}
          {order.downloadPayloads.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Download className="w-4 h-4 text-purple-400" />
                <span>Direct High-Speed Asset Packages</span>
              </div>

              <div className="space-y-2">
                {order.downloadPayloads.map((payload) => (
                  <div
                    key={payload.productId}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {payload.productName}
                      </h4>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {payload.fileName} · {payload.fileSize} · CDN Edge Link Active
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateDownload(payload.fileName, payload.productName)}
                      className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadStarted === payload.fileName ? 'Manifest Saved!' : 'Download Package'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>All assets permanently stored in your 8cloud Vault.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => printOrderReceipt(order)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title="Print official receipt or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Receipt / PDF</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenVault();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Go to My Vault</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
