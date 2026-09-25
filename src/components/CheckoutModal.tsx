import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  Coins, 
  Lock, 
  ShieldCheck, 
  Check, 
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { CartItem, CurrencyCode, Order, IssuedLicense, User } from '../types';
import { formatPrice } from '../utils/currency';
import { generateCryptoLicenseKey } from '../utils/licenseGenerator';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  discountAmount: number;
  couponCode?: string;
  onOrderCompleted: (order: Order) => void;
  currentUser?: User | null;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'crypto';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discountAmount,
  couponCode,
  onOrderCompleted,
  currentUser,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentTab>('upi');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Alex Vance');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'alex.vance@example.com');
  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  // Sync if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);
  
  // Card state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const steps = [
      'Establishing TLS 1.3 encrypted gateway session...',
      paymentMethod === 'upi' 
        ? 'Awaiting UPI network confirmation (NPCI / Razorpay)...'
        : paymentMethod === 'card'
        ? 'Processing 3D-Secure tokenized authorization via Stripe...'
        : 'Connecting to banking liquidity rails...',
      'Cryptographically provisioning digital license keys...',
      'Registering assets in 8cloud Digital Vault...',
    ];

    let currentStepIndex = 0;
    setProcessingStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setProcessingStep(steps[currentStepIndex]);
      } else {
        clearInterval(interval);
        
        // Build completed order
        const orderId = `8CLD-${Math.floor(100000 + Math.random() * 900000)}`;
        const txRef = `TXN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        // Generate licenses for items that are license keys
        const licenses: IssuedLicense[] = [];
        const downloadPayloads: Order['downloadPayloads'] = [];

        items.forEach((item) => {
          for (let q = 0; q < item.quantity; q++) {
            if (item.product.deliveryType === 'license_key') {
              licenses.push({
                productId: item.product.id,
                productName: item.product.name,
                key: generateCryptoLicenseKey(item.product.id),
                issuedAt: new Date().toISOString(),
                expiresAt: '2027-09-25T00:00:00Z',
                maxDevices: 5,
                activeDevices: 0,
                status: 'active',
                activatedMachines: [],
              });
            }

            downloadPayloads.push({
              productId: item.product.id,
              productName: item.product.name,
              fileName: `${item.product.id}-asset-package.zip`,
              fileSize: item.product.downloadSize || '142 MB',
              downloadUrl: `https://cdn.8cloud.store/downloads/${orderId}/${item.product.id}.zip`,
              expiresHours: 72,
            });
          }
        });

        const newOrder: Order = {
          id: orderId,
          date: new Date().toISOString(),
          customerName: customerName || 'Valued Creator',
          customerEmail: customerEmail || 'creator@8cloud.store',
          items: [...items],
          subtotal: rawSubtotal,
          discount: discountAmount,
          total: finalTotal,
          currency,
          paymentMethod,
          transactionRef: txRef,
          licenses,
          downloadPayloads,
        };

        setIsProcessing(false);
        onOrderCompleted(newOrder);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">8cloud Secure Checkout</h2>
              <div className="text-[11px] text-zinc-400">
                Encrypted instant fulfillment gateway
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State Overlay */}
        {isProcessing ? (
          <div className="p-12 text-center space-y-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Fulfilling Digital Asset Order...
              </h3>
              <p className="text-xs font-mono text-cyan-400 max-w-md mx-auto">
                {processingStep}
              </p>
            </div>

            <div className="max-w-xs mx-auto p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400">
              Please keep this window open while 8cloud signs your cryptographic delivery payload.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
            
            {/* Step 1: Customer Contact Info */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                1. Delivery Destination & Receipt
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Email (Instant Delivery Link Sent Here)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Tabs */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                2. Select Instant Payment Protocol
              </div>

              {/* Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-semibold">UPI & QR</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Instant Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-semibold">Cards</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Visa / MC / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs font-semibold">Net Banking</span>
                  <span className="text-[9px] text-zinc-500 font-mono">50+ Banks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'crypto'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span className="text-xs font-semibold">Crypto</span>
                  <span className="text-[9px] text-zinc-500 font-mono">USDT / BTC</span>
                </button>
              </div>

              {/* Method Specific Form Fields */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                
                {paymentMethod === 'upi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-xl border border-cyan-500/30 text-center">
                      <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
                        {/* Dynamic SVG QR code */}
                        <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" />
                          <rect x="5" y="5" width="20" height="20" fill="white" />
                          <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                          
                          <rect x="70" y="0" width="30" height="30" />
                          <rect x="75" y="5" width="20" height="20" fill="white" />
                          <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                          
                          <rect x="0" y="70" width="30" height="30" />
                          <rect x="5" y="75" width="20" height="20" fill="white" />
                          <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                          {/* Data bits */}
                          <rect x="40" y="10" width="8" height="8" />
                          <rect x="52" y="15" width="8" height="8" />
                          <rect x="40" y="40" width="20" height="20" />
                          <rect x="70" y="45" width="10" height="10" />
                          <rect x="40" y="70" width="10" height="15" />
                          <rect x="60" y="75" width="15" height="10" />
                          <rect x="85" y="70" width="10" height="20" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 mt-2">
                        SCAN VIA GPAY / PHONEPE / PAYTM
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Or Enter UPI VPA ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank"
                          className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-400">
                        ⚡ Auto-verified by Razorpay/NPCI instant collect node.
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <label className="block text-[11px] text-zinc-400">Select Bank</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Chase & J.P. Morgan', 'Barclays UK'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                            selectedBank === b
                              ? 'bg-cyan-500/20 border-cyan-400 text-white font-medium'
                              : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Supported:</span>
                      <span className="text-cyan-400">USDT (TRC20 / ERC20) · BTC · ETH</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 text-zinc-300 break-all text-[11px]">
                      0x8c1048b299eF89B200f6b7e0cDa800045629F01B
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Payment is auto-detected within 1 network block confirmation.
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Order Summary & Submit */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-zinc-500">Total Payable Amount:</div>
                <div className="text-2xl font-bold font-mono text-white glow-text-cyan">
                  {formatPrice(finalTotal, currency)}
                </div>
              </div>

              <button
                type="submit"
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>Pay & Unlock Instant Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
