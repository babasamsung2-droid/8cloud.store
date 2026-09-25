import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Laptop, 
  Check, 
  Plus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { validateLicenseKey, getStoredLicenses, saveLicense, SAMPLE_INITIAL_LICENSES } from '../utils/licenseGenerator';
import { IssuedLicense } from '../types';

interface LicenseKeyValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

export const LicenseKeyValidatorModal: React.FC<LicenseKeyValidatorModalProps> = ({
  isOpen,
  onClose,
  initialKey = '',
}) => {
  const [keyInput, setKeyInput] = useState(initialKey);
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    license?: IssuedLicense;
    message: string;
  } | null>(null);

  // Sync if initialKey changes
  React.useEffect(() => {
    if (initialKey) {
      setKeyInput(initialKey);
      const res = validateLicenseKey(initialKey);
      setValidationResult({ tested: true, ...res });
    }
  }, [initialKey]);

  if (!isOpen) return null;

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    const res = validateLicenseKey(keyInput);
    setValidationResult({ tested: true, ...res });
  };

  const handleActivateCurrentDevice = () => {
    if (!validationResult?.license) return;
    const current = validationResult.license;
    if (current.activeDevices >= current.maxDevices) {
      alert('Maximum activation seats reached for this license key.');
      return;
    }
    const updated: IssuedLicense = {
      ...current,
      activeDevices: current.activeDevices + 1,
      activatedMachines: [
        ...(current.activatedMachines || []),
        `Device #${current.activeDevices + 1} (${navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows'} Node)`,
      ],
    };
    saveLicense(updated);
    setValidationResult({
      tested: true,
      isValid: true,
      license: updated,
      message: 'Workstation registered successfully: Token bound to hardware signature.',
    });
  };

  const handleResetSeats = () => {
    if (!validationResult?.license) return;
    const updated: IssuedLicense = {
      ...validationResult.license,
      activeDevices: 0,
      activatedMachines: [],
    };
    saveLicense(updated);
    setValidationResult({
      tested: true,
      isValid: true,
      license: updated,
      message: 'All device activations revoked. Seats are now available.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">License Key Verification Engine</h2>
              <div className="text-[11px] text-zinc-400">
                Inspect activation state, validity & device allocations
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close validator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Input Form */}
          <form onSubmit={handleValidate} className="space-y-3">
            <label className="block text-xs font-mono text-zinc-300">
              ENTER 25-DIGIT CRYPTOGRAPHIC KEY:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="8CLD-XXXX-XXXX-XXXX-XXXX"
                className="flex-1 bg-zinc-900 border border-white/10 text-xs sm:text-sm font-mono text-cyan-300 px-3.5 py-2.5 rounded-xl uppercase tracking-wider focus:outline-none focus:border-cyan-400 placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
              >
                Verify Key
              </button>
            </div>

            {/* Quick sample keys */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-500 pt-1">
              <span>Quick test keys:</span>
              {SAMPLE_INITIAL_LICENSES.map((lic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setKeyInput(lic.key);
                    const res = validateLicenseKey(lic.key);
                    setValidationResult({ tested: true, ...res });
                  }}
                  className="font-mono text-cyan-400 hover:text-cyan-300 bg-zinc-900 px-2 py-0.5 rounded border border-white/5 transition-colors cursor-pointer"
                >
                  {lic.key.substring(0, 14)}...
                </button>
              ))}
            </div>
          </form>

          {/* Validation Status Card */}
          {validationResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {validationResult.isValid && validationResult.license ? (
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-cyan-500/40 space-y-4">
                  
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Genuine Cryptographic Signature
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                      ACTIVE & VALID
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Licensed Product:</span>
                      <span className="font-semibold text-white">
                        {validationResult.license.productName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Assigned Token Key:</span>
                      <span className="font-mono text-cyan-300">
                        {validationResult.license.key}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Validity Horizon:</span>
                      <span className="font-mono text-zinc-300">
                        {validationResult.license.expiresAt}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-zinc-400">Hardware Seat Allocation:</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-950 border border-white/10 text-cyan-400 font-bold">
                        {validationResult.license.activeDevices} / {validationResult.license.maxDevices} Seats Used
                      </span>
                    </div>
                  </div>

                  {/* Registered Devices List */}
                  {validationResult.license.activatedMachines && validationResult.license.activatedMachines.length > 0 && (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 space-y-1.5">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">
                        ACTIVE HARDWARE NODES:
                      </div>
                      <div className="space-y-1">
                        {validationResult.license.activatedMachines.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Seat Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleActivateCurrentDevice}
                      disabled={validationResult.license.activeDevices >= validationResult.license.maxDevices}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Bind Current Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSeats}
                      className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revoke All Seats</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Key Verification Failed</span>
                  </div>
                  <p className="text-zinc-400">
                    {validationResult.message}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
