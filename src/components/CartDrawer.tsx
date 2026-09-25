import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { CartItem, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { ProductArtwork } from './ProductArtwork';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyPromo = () => {
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === '8CLOUD10' || clean === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoSuccess('10% VIP Discount Applied!');
      setPromoError('');
    } else if (clean === 'CYBER20') {
      setDiscountPercent(20);
      setPromoSuccess('20% Cyber Week Discount Applied!');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try: 8CLOUD10 or CYBER20');
      setPromoSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Your Digital Bag</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                {items.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <ProductArtwork product={item.product} size="sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-cyan-400">
                        {item.product.categoryName}
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[10px] text-zinc-400">
                        {item.product.deliveryFormat}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-white">
                        {formatPrice(item.product.priceUSD * item.quantity, currency)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {formatPrice(item.product.priceUSD, currency)} ea
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-white/5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-medium text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-300">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Browse software keys, AI prompts, or developer kits to begin instant download checkout.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Explore Store
                </button>
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-zinc-950 space-y-4">
              
              {/* Promo code input */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Coupon code (e.g. 8CLOUD10)"
                      className="w-full bg-zinc-900 border border-white/10 text-xs text-white pl-8 pr-3 py-2 rounded-lg uppercase font-mono placeholder:normal-case placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] text-emerald-400">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-400">{promoError}</p>
                )}
              </div>

              {/* Order breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 border-t border-white/5 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">
                    {formatPrice(rawSubtotal, currency)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyan-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono">
                      -{formatPrice(discountAmount, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Digital Goods Delivery Fee</span>
                  <span className="font-mono text-emerald-400">FREE ($0.00)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="font-mono text-cyan-400 glow-text-cyan">
                    {formatPrice(finalTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Instant Checkout Button */}
              <button
                onClick={() => onProceedToCheckout(discountAmount, promoSuccess ? promoCode : undefined)}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>Instant Checkout ({formatPrice(finalTotal, currency)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>End-to-End Encrypted · UPI, Cards & Crypto</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
