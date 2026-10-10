import { useDialog } from './useDialog';
import React, { useEffect, useState } from 'react';
import { X, Lock } from 'lucide-react';
import { CartItem, CurrencyCode, User } from '../types';
import { STORE_RUNTIME_CONFIG } from '../config/storeMode';
import { CheckoutOrder, commerceRequest, formatSettlement, openPayment } from '../services/commerce';
interface CheckoutModalProps {
  isOpen: boolean; onClose(): void; items: CartItem[]; currency: CurrencyCode;
  discountAmount: number; couponCode?: string;
  onPurchaseCompleted?(): void; currentUser?: User | null; onOpenLogin?(): void;
}
export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, items, currentUser, onPurchaseCompleted }) => {
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const dialogRef = useDialog(isOpen, onClose);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setOrder(null); setError(''); setBusy(false);
  }, [isOpen, currentUser?.id, items]);
  if (!isOpen) return null;
  async function prepare() {
    if (!currentUser || busy || !STORE_RUNTIME_CONFIG.checkoutEnabled) return;
    setBusy(true); setError('');
    try {
      setOrder(await commerceRequest<CheckoutOrder>('/orders', { items: items.map(item => ({ productId: item.product.id, quantity: 1 })) }));
    } catch (error) { setError(error instanceof Error ? error.message : 'Checkout could not be prepared.'); }
    finally { setBusy(false); }
  }
  async function pay() {
    if (!order || busy) return;
    setBusy(true); setError('');
    try {
      await openPayment(order, async response => {
        try {
          await commerceRequest('/payments/verify', { orderId: order.id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature });
          onPurchaseCompleted?.();
        } catch (error) { setError(`${error instanceof Error ? error.message : 'Verification pending.'} Check My Purchases before paying again.`); }
        finally { setBusy(false); }
      }, () => setBusy(false), () => { setBusy(false); setError('Payment failed. No downloads have been unlocked. Check My Purchases before trying again.'); });
    } catch (error) { setBusy(false); setError(error instanceof Error ? error.message : 'Payment gateway unavailable.'); }
  }
  return <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4">
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="checkout-heading" className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
      <button type="button" onClick={onClose} aria-label="Close checkout" className="absolute right-4 top-4 p-2"><X className="h-4 w-4" /></button>
      <h2 id="checkout-heading" className="mb-4 text-xl font-bold">Secure checkout</h2>
      {STORE_RUNTIME_CONFIG.mode === 'test' && <p className="mb-4 text-sm text-amber-200">Test checkout — no real payment. Use only the provider’s test payment details.</p>}
      {!STORE_RUNTIME_CONFIG.checkoutEnabled && <p className="text-sm text-amber-200">Purchases are not enabled yet.</p>}
      {busy && !order && <p role="status">Confirming product availability and prices…</p>}
      {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
      {order && <><ul className="space-y-3 text-sm">{order.items.map(item => <li key={item.productId} className="flex justify-between gap-4"><span>{item.name}</span><span>{formatSettlement(item.amount)}</span></li>)}</ul>
        <div className="mt-5 flex justify-between border-t border-white/10 pt-4 font-semibold"><span>Total charged in INR</span><span>{formatSettlement(order.amount)}</span></div></>}
      <p className="mt-4 text-xs text-zinc-400">One personal copy per product. The displayed INR total is the final charge. Payment details are entered in Razorpay’s checkout. Downloads unlock after server confirmation.</p>
      <button type="button" onClick={order ? pay : prepare} disabled={busy || !currentUser || !STORE_RUNTIME_CONFIG.checkoutEnabled} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 p-3 text-sm font-semibold text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-400"><Lock className="h-4 w-4" />{busy ? 'Please wait…' : order ? `Pay ${formatSettlement(order.amount)}` : STORE_RUNTIME_CONFIG.checkoutEnabled ? 'Confirm prices & continue' : 'Payments unavailable'}</button>
    </section>
  </div>;
};
