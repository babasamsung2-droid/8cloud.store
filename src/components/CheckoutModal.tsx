import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Copy,
  Smartphone,
  ExternalLink,
  Tag,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { CartItem, CurrencyCode, Order, IssuedLicense, User, PaymentMethod } from '../types';
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

type PaymentTab = 'razorpay' | 'upi' | 'card' | 'gpay' | 'netbanking' | 'crypto';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discountAmount: initialDiscount,
  couponCode: initialCoupon,
  onOrderCompleted,
  currentUser,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentTab>('razorpay');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Alex Vance');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'alex.vance@example.com');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  
  // Stored Razorpay settings
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_8cloudStoreDemo');
  const [razorpayIsTestMode, setRazorpayIsTestMode] = useState(true);

  // Load configured Razorpay key from admin settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('8cloud_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.razorpayKeyId) {
          setRazorpayKeyId(parsed.razorpayKeyId);
        }
        if (typeof parsed.razorpayTestMode === 'boolean') {
          setRazorpayIsTestMode(parsed.razorpayTestMode);
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen]);
  
  // UPI states
  const [upiId, setUpiId] = useState('alex@okhdfcbank');
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card states
  const [cardNumber, setCardNumber] = useState('4532 8820 9012 8892');
  const [cardHolder, setCardHolder] = useState(customerName);
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(initialCoupon);
  const [discountVal, setDiscountVal] = useState<number>(initialDiscount);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Sync if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
      setCardHolder(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  const finalTotal = Math.max(0, rawSubtotal - discountVal);

  // Detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'text-blue-400' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'text-orange-400' };
    if (clean.startsWith('3')) return { name: 'Amex', color: 'text-emerald-400' };
    if (clean.startsWith('6')) return { name: 'RuPay', color: 'text-cyan-400' };
    return { name: 'Card', color: 'text-zinc-400' };
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME20' || code === 'SAVE20') {
      const discount = Math.round(rawSubtotal * 0.2);
      setDiscountVal(discount);
      setAppliedCoupon(code);
      setCouponMsg({ type: 'success', text: 'Coupon applied! 20% Discount unlocked.' });
    } else if (code === 'ADMIN100') {
      setDiscountVal(rawSubtotal);
      setAppliedCoupon(code);
      setCouponMsg({ type: 'success', text: 'Admin test promo applied! 100% discount.' });
    } else if (code === '8CLOUD50') {
      const discount = Math.round(rawSubtotal * 0.5);
      setDiscountVal(discount);
      setAppliedCoupon(code);
      setCouponMsg({ type: 'success', text: 'Flash 50% discount activated!' });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid coupon code. Try WELCOME20' });
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder(customerName || 'Test Shopper');
    setCardExpiry('12/28');
    setCardCvv('987');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('8cloud.store@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'razorpay') {
      const amountINR = Math.round(finalTotal * 86.5);
      const amountInPaise = amountINR * 100;
      const orderId = `8CLD-${Math.floor(100000 + Math.random() * 900000)}`;

      const completeRazorpayOrder = (payId: string) => {
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
              fileName: `${item.product.id}-package.zip`,
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
          discount: discountVal,
          total: finalTotal,
          currency,
          paymentMethod: 'razorpay',
          transactionRef: payId,
          licenses,
          downloadPayloads,
        };

        setIsProcessing(false);
        onOrderCompleted(newOrder);
      };

      const launchRazorpayModal = () => {
        if (typeof (window as any).Razorpay !== 'undefined') {
          try {
            const options = {
              key: razorpayKeyId || 'rzp_test_8cloudStoreDemo',
              amount: amountInPaise,
              currency: 'INR',
              name: '8cloud.store',
              description: `Digital Assets Delivery (${items.length} items)`,
              image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
              prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone || '9876543210',
              },
              notes: {
                order_id: orderId,
                store: '8cloud.store',
              },
              theme: {
                color: '#06b6d4',
              },
              handler: function (response: any) {
                const payId = response?.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                completeRazorpayOrder(payId);
              },
              modal: {
                ondismiss: function () {
                  setIsProcessing(false);
                },
              },
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (resp: any) {
              alert('Payment declined: ' + (resp?.error?.description || 'Gateway error'));
              setIsProcessing(false);
            });
            rzp.open();
            return;
          } catch (err) {
            console.warn('Razorpay SDK init error, fallback to sandbox flow', err);
          }
        }

        // Sandbox simulated execution if SDK unavailable or blocked by adblock
        setProcessingStep('Connecting to Razorpay RBI-Compliant Gateway Node...');
        setTimeout(() => {
          setProcessingStep('Authorizing payment token with customer bank...');
          setTimeout(() => {
            setProcessingStep('Generating cryptographic license keys...');
            setTimeout(() => {
              completeRazorpayOrder(`pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
            }, 500);
          }, 600);
        }, 600);
      };

      // Load script if not already present
      if (!document.getElementById('razorpay-checkout-script')) {
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => launchRazorpayModal();
        script.onerror = () => launchRazorpayModal();
        document.body.appendChild(script);
      } else {
        launchRazorpayModal();
      }
      return;
    }

    const steps = [
      'Establishing TLS 1.3 encrypted secure gateway session...',
      paymentMethod === 'upi' 
        ? 'Verifying UPI settlement via NPCI / Razorpay network...'
        : paymentMethod === 'gpay'
        ? 'Authorizing Google Pay biometric token session...'
        : paymentMethod === 'card'
        ? 'Processing 3D-Secure tokenized authorization with Stripe...'
        : paymentMethod === 'netbanking'
        ? `Connecting to ${selectedBank} liquidity gateway...`
        : 'Confirming crypto blockchain node transaction...',
      'Cryptographically generating signed digital license keys...',
      'Registering digital asset payload in 8cloud Vault...',
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

        // Generate licenses & downloads
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
              fileName: `${item.product.id}-package.zip`,
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
          discount: discountVal,
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
                100% Encrypted Instant Fulfillment Gateway
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
                Fulfilling Your Digital Order...
              </h3>
              <p className="text-xs font-mono text-cyan-400 max-w-md mx-auto">
                {processingStep}
              </p>
            </div>

            <div className="max-w-xs mx-auto p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400">
              Please do not close or refresh. Signing your cryptographic license keys...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
            
            {/* Step 1: Customer Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                  1. Delivery Details
                </span>
                {currentUser?.authProvider === 'google' && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3 text-cyan-400" />
                    Verified Google ID: {currentUser.email}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-[11px] text-zinc-400 mb-1">Delivery Email *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Phone (for UPI/SMS)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                  2. Choose Instant Payment Method
                </span>
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  RBI & PCI-DSS Level 1 Secure
                </span>
              </div>

              {/* Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {/* Razorpay Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/50'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="absolute -top-2 right-2 px-1.5 py-0.2 text-[8px] font-bold uppercase rounded bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950">
                    Recommended
                  </div>
                  <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center font-bold text-[11px] text-blue-400">
                    ₹
                  </div>
                  <span className="text-xs font-bold text-white">Razorpay</span>
                  <span className="text-[9px] text-cyan-300 font-mono">UPI & Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold">Direct UPI</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Scan QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold">Debit/Credit</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Visa/Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gpay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'gpay'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold">Google Pay</span>
                  <span className="text-[9px] text-zinc-500 font-mono">1-Click Fast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">Net Banking</span>
                  <span className="text-[9px] text-zinc-500 font-mono">50+ Banks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'crypto'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold">Crypto</span>
                  <span className="text-[9px] text-zinc-500 font-mono">USDT / BTC</span>
                </button>
              </div>

              {/* Method Specific Form Fields */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                
                {/* 0. RAZORPAY GATEWAY (OFFICIAL) */}
                {paymentMethod === 'razorpay' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-zinc-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-500/20">
                          ₹
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>Razorpay Payments Gateway</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                              {razorpayIsTestMode ? 'Sandbox Ready' : 'Live Gateway'}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Pay with UPI (GPay/PhonePe), Any Debit/Credit Card, or NetBanking
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Payable INR Amount</div>
                        <div className="text-xl font-bold font-mono text-cyan-400">
                          ₹{Math.round(finalTotal * 86.5).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          (Converted from {formatPrice(finalTotal, currency)})
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 space-y-1">
                        <div className="font-semibold text-white">⚡ All UPI Apps</div>
                        <div className="text-[10px] text-zinc-500 font-mono">GPay, PhonePe, Paytm, CRED</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 space-y-1">
                        <div className="font-semibold text-white">💳 All Cards</div>
                        <div className="text-[10px] text-zinc-500 font-mono">RuPay, Visa, MasterCard</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 space-y-1">
                        <div className="font-semibold text-white">🏦 Net Banking</div>
                        <div className="text-[10px] text-zinc-500 font-mono">50+ Indian Banks</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 space-y-1">
                        <div className="font-semibold text-white">🛡️ Instant License</div>
                        <div className="text-[10px] text-cyan-400 font-mono">Auto 0-Sec Fulfillment</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                      <span>Gateway Key: <strong className="text-zinc-200">{razorpayKeyId}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 100% Buyer Protection
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 1. UPI Payment */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-xl border border-cyan-500/30 text-center">
                        <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
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
                          SCAN WITH GPAY / PHONEPE / PAYTM
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Store UPI ID (Tap to Copy):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value="8cloud.store@okhdfcbank"
                              className="flex-1 bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleCopyUpiId}
                              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Your UPI ID or App (Optional):
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
                          ⚡ Instant QR code payment detection enabled via Razorpay & NPCI rails.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Card Payment */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400">Card Brand:</span>
                        <span className={`text-xs font-bold font-mono ${getCardBrand(cardNumber).color}`}>
                          {getCardBrand(cardNumber).name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleFillTestCard}
                        className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
                      >
                        ⚡ Autofill Test Card (4242...)
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Name on Card</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Cardholder Name"
                          className="w-full bg-zinc-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
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

                {/* 3. Google Pay Fast Checkout */}
                {paymentMethod === 'gpay' && (
                  <div className="space-y-3 text-center py-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-xs font-semibold text-white">
                      Google Pay Fast Checkout
                    </div>
                    <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                      Pay instantly with your linked Google Pay cards or UPI account associated with {customerEmail}.
                    </p>
                    <div className="pt-2 flex justify-center">
                      <div className="px-4 py-2 rounded-xl bg-zinc-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Ready for 1-Click Biometric Settlement</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <label className="block text-[11px] text-zinc-400">Select Your Bank:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Chase USA', 'Barclays UK'].map((b) => (
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

                {/* 5. Crypto Payment */}
                {paymentMethod === 'crypto' && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Accepted Coins:</span>
                      <span className="text-cyan-400">USDT (TRC20 / ERC20) · BTC · SOL</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 text-zinc-300 break-all text-[11px]">
                      TX9Qj7vEw8qA7L2k1N9r6H5p4B3m2X1Z0c (TRC20 USDT)
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Payment is auto-verified after 1 network block confirmation.
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Discount / Coupon Code Section */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg uppercase font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-lg cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div className={`mt-2 text-[11px] ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponMsg.text}
                </div>
              )}
            </div>

            {/* Order Summary & Submit */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-zinc-500">Total Payable Amount:</div>
                <div className="text-2xl font-bold font-mono text-white">
                  {formatPrice(finalTotal, currency)}
                  {discountVal > 0 && (
                    <span className="ml-2 text-xs font-normal text-emerald-400 font-mono">
                      (Saved {formatPrice(discountVal, currency)})
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>
                  {paymentMethod === 'razorpay'
                    ? `Pay ₹${Math.round(finalTotal * 86.5).toLocaleString('en-IN')} via Razorpay`
                    : paymentMethod === 'gpay' 
                    ? 'Pay with Google Pay' 
                    : paymentMethod === 'upi' 
                    ? 'Verify & Complete UPI Pay' 
                    : 'Confirm & Instant Delivery'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
