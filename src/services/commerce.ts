import { auth } from '../firebase';
import { STORE_RUNTIME_CONFIG } from '../config/storeMode';
export interface Purchase {
  id: string; status: 'pending' | 'paid' | 'refunded' | 'revoked';
  amount: number; currency: string; createdAt: string;
  items: { productId: string; name: string; amount: number; files: { id: string; name: string }[] }[];
}
export interface CheckoutOrder extends Purchase { keyId: string; gatewayOrderId: string }
export async function commerceRequest<T>(path: string, body?: unknown, authenticated = true): Promise<T> {
  const base = STORE_RUNTIME_CONFIG.checkoutApiUrl;
  if (!base) throw new Error('The store API is not connected yet.');
  const headers: Record<string, string> = {};
  if (authenticated) {
    if (!auth.currentUser) throw new Error('Please sign in with Google.');
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method: body === undefined ? 'GET' : 'POST', headers, cache: 'no-store', credentials: 'omit',
    signal: AbortSignal.timeout(20000), ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'The request could not be completed.');
  return value;
}
export const formatSettlement = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
type PaymentResult = { razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open(): void; on(event: string, listener: () => void): void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance } }
let sdkPromise: Promise<void> | undefined;
export function loadPaymentSdk(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => { script.remove(); reject(new Error('Payment gateway timed out. Please retry.')); }, 15000);
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true;
    script.onload = () => { clearTimeout(timer); if (window.Razorpay) resolve(); else { script.remove(); reject(new Error('Payment gateway unavailable.')); } };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Payment gateway could not load. No payment was initiated.')); };
    document.head.appendChild(script);
  }).catch(error => { sdkPromise = undefined; throw error; });
  return sdkPromise;
}
export async function openPayment(order: CheckoutOrder, onResult: (result: PaymentResult) => void, onDismiss: () => void, onFailure: () => void) {
  const prefix = STORE_RUNTIME_CONFIG.mode === 'test' ? 'rzp_test_' : 'rzp_live_';
  if (!STORE_RUNTIME_CONFIG.checkoutEnabled || !order.keyId.startsWith(prefix) || order.currency !== 'INR' || !Number.isSafeInteger(order.amount) || order.amount < 100) {
    throw new Error('Payment configuration mismatch. Checkout is blocked.');
  }
  await loadPaymentSdk();
  const Checkout = window.Razorpay;
  if (!Checkout) throw new Error('Payment gateway unavailable.');
  const checkout = new Checkout({ key: order.keyId, order_id: order.gatewayOrderId,
    amount: order.amount, currency: order.currency, name: '8cloud.store', description: 'Ebooks & digital products',
    prefill: { email: auth.currentUser?.email || '', name: auth.currentUser?.displayName || '' },
    handler: onResult, modal: { ondismiss: onDismiss }, theme: { color: '#06b6d4' },
  });
  checkout.on('payment.failed', onFailure); checkout.open();
}
