import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  KeyRound, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Heart, 
  Trash2, 
  Zap, 
  ArrowRight,
  Star,
  Crown,
  Printer,
  Receipt,
  Activity,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Order, Product, CurrencyCode, User, StoreSettings, FulfillmentStatus } from '../types';
import { formatPrice } from '../utils/currency';
import { ProductArtwork } from './ProductArtwork';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import { OrderStatusTracker } from './OrderStatusTracker';
import { printOrderReceipt, downloadHtmlInvoice } from '../utils/receiptGenerator';

interface MyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenValidatorWithKey: (key: string) => void;
  onExploreStore: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  currency: CurrencyCode;
  initialTab?: 'orders' | 'wishlist';
  currentUser?: User | null;
  onSignOut?: () => void;
  onOpenLogin?: () => void;
  onOpenAdmin?: () => void;
  storeSettings?: StoreSettings;
}

export const MyVaultModal: React.FC<MyVaultModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenValidatorWithKey,
  onExploreStore,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onQuickBuy,
  currency,
  initialTab = 'orders',
  currentUser,
  onSignOut,
  onOpenLogin,
  onOpenAdmin,
  storeSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Real-time fulfillment status tracking state (persisted in local state per session)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, FulfillmentStatus>>({});
  // Expanded tracking accordion map
  const [expandedTrackers, setExpandedTrackers] = useState<Record<string, boolean>>({});

  const getOrderStatus = (order: Order): FulfillmentStatus => {
    return orderStatuses[order.id] || order.fulfillmentStatus || 'delivered';
  };

  const handleStatusChange = (orderId: string, newStatus: FulfillmentStatus) => {
    setOrderStatuses((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const toggleTracker = (orderId: string) => {
    setExpandedTrackers((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Sync if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadInvoice = (order: Order) => {
    const text = `================================================================================
8CLOUD.STORE — TAX INVOICE & PROOF OF PURCHASE
Invoice Number: INV-${order.id}
Transaction Reference: ${order.transactionRef}
Date: ${new Date(order.date).toUTCString()}
Customer: ${order.customerName} (${order.customerEmail})
Payment Method: ${order.paymentMethod.toUpperCase()} (Confirmed)
================================================================================

PURCHASED DIGITAL ASSETS:
${order.items.map((item, i) => `${i + 1}. ${item.product.name} x${item.quantity} — $${(item.product.priceUSD * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: $${order.subtotal.toFixed(2)}
Discount: -$${order.discount.toFixed(2)}
Total Paid: $${order.total.toFixed(2)} (${order.currency})

CRYPTOGRAPHIC LICENSE ALLOCATIONS:
${order.licenses.map(l => `* ${l.productName}\n  License Key: ${l.key}\n  Hardware Seats: ${l.maxDevices}`).join('\n\n') || 'Direct Cloud Archive Delivery'}

This is a computer-generated tax invoice from 8cloud.store Key Delivery System.
================================================================================`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `8cloud-invoice-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">My Digital Vault</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/30 text-cyan-400">
                  SECURE STORAGE
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                Permanent access to purchased software keys, downloads, and saved wishlist items
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-400/30 text-cyan-300">
                    {currentUser.tier}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Browsing as Guest. Sign in to link your license keys & orders.</span>
            </div>
          )}

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenAdmin && (currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().includes('babasamsung2')) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}

            {currentUser ? (
              onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 text-[11px] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )
            ) : (
              onOpenLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-[11px] transition-colors cursor-pointer shadow-sm shadow-cyan-500/20"
                >
                  Sign In / Create Account
                </button>
              )
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-white/10 flex items-center gap-3 bg-zinc-950">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Purchased Assets & Licenses</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-900 border border-white/10 text-zinc-300">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-rose-400' : ''}`} />
            <span>My Wishlist</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
              wishlistProducts.length > 0 
                ? 'bg-rose-950/60 border-rose-500/30 text-rose-300' 
                : 'bg-zinc-900 border-white/10 text-zinc-400'
            }`}>
              {wishlistProducts.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: ORDERS & LICENSES */}
          {activeTab === 'orders' && (
            orders.length > 0 ? (
              orders.map((order) => {
                const currentStatus = getOrderStatus(order);
                const isTrackerOpen = !!expandedTrackers[order.id];

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          #{order.id}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs text-zinc-400 font-mono">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          PAID ({order.paymentMethod.toUpperCase()})
                        </span>
                        
                        {/* Real-time Order Fulfillment Status Badge */}
                        {currentStatus === 'pending' && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse text-amber-400" />
                            <span>PENDING QUEUE</span>
                          </span>
                        )}
                        {currentStatus === 'processing' && (
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                            <span>PROCESSING (LIVE)</span>
                          </span>
                        )}
                        {currentStatus === 'delivered' && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>DELIVERED</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-xs font-mono font-bold text-cyan-400 mr-1">
                          {formatPrice(order.total, order.currency)}
                        </div>

                        {/* Real-time Tracker Toggle Button */}
                        <button
                          onClick={() => toggleTracker(order.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isTrackerOpen
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10'
                          }`}
                          title="View and simulate real-time fulfillment progress"
                        >
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold">Track Fulfillment</span>
                          {isTrackerOpen ? (
                            <ChevronUp className="w-3 h-3 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-zinc-400" />
                          )}
                        </button>

                        {/* Printable Receipt / Tax Invoice Modal Trigger */}
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="text-xs px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
                          title="View printable tax receipt & invoice preview"
                        >
                          <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold">Receipt / PDF</span>
                        </button>

                        {/* Quick Print Utility */}
                        <button
                          onClick={() => printOrderReceipt(order, storeSettings)}
                          className="text-xs p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 flex items-center transition-colors cursor-pointer"
                          title="Quick Print or Save as PDF in print dialog"
                        >
                          <Printer className="w-3.5 h-3.5 text-zinc-300 hover:text-white" />
                        </button>

                        {/* Quick Download HTML Invoice */}
                        <button
                          onClick={() => downloadHtmlInvoice(order, storeSettings)}
                          className="text-xs p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 flex items-center transition-colors cursor-pointer"
                          title="Download standalone HTML invoice"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                      </div>
                    </div>

                    {/* Real-time Order Status Tracking Component */}
                    {isTrackerOpen && (
                      <div className="pt-1 animate-in fade-in duration-200">
                        <OrderStatusTracker
                          order={{ ...order, fulfillmentStatus: currentStatus }}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    )}

                    {/* Items in this order */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-mono text-zinc-500 uppercase">
                        ORDERED DIGITAL ASSETS ({order.items.length}):
                      </div>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {item.product.name} (x{item.quantity})
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {item.product.deliveryFormat}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-300">
                              {formatPrice(item.product.priceUSD * item.quantity, order.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Licenses in this order (Protected when Pending/Processing) */}
                    {currentStatus === 'pending' ? (
                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-200 font-mono">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                          <span>Fulfillment queued: Digital keys & download links unlock immediately upon delivery.</span>
                        </div>
                        <button
                          onClick={() => {
                            if (!isTrackerOpen) toggleTracker(order.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] cursor-pointer shrink-0"
                        >
                          Open Live Tracker →
                        </button>
                      </div>
                    ) : currentStatus === 'processing' ? (
                      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-cyan-200 font-mono">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
                          <span>Minting ECDSA keys & preparing download package (Live progress above)...</span>
                        </div>
                        <button
                          onClick={() => {
                            if (!isTrackerOpen) toggleTracker(order.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] cursor-pointer shrink-0"
                        >
                          View Tracker Pipeline →
                        </button>
                      </div>
                    ) : (
                      order.licenses && order.licenses.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] font-mono text-cyan-400 uppercase flex items-center gap-1">
                            <KeyRound className="w-3 h-3" />
                            <span>Allocated Cryptographic Keys:</span>
                          </div>

                          <div className="space-y-2">
                            {order.licenses.map((lic) => (
                              <div
                                key={lic.key}
                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-cyan-500/20 gap-2 font-mono text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-300 font-bold tracking-wider select-all">
                                    {lic.key}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    ({lic.productName})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopy(lic.key)}
                                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedKey === lic.key ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-zinc-400" />
                                    )}
                                    <span>{copiedKey === lic.key ? 'Copied' : 'Copy'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenValidatorWithKey(lic.key);
                                    }}
                                    className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-400/30 text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <KeyRound className="w-3 h-3 text-cyan-400" />
                                    <span>Inspect Key</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto" />
                <h3 className="text-base font-bold text-white">No purchases found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Any software keys, courses, and digital packages purchased on 8cloud.store are stored here indefinitely.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onExploreStore();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Browse Digital Store
                </button>
              </div>
            )
          )}

          {/* TAB 2: MY WISHLIST */}
          {activeTab === 'wishlist' && (
            wishlistProducts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{wishlistProducts.length} saved digital assets</span>
                  <span className="text-[11px] font-mono text-cyan-400">PERSISTENT STORAGE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0">
                          <ProductArtwork product={product} size="sm" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-cyan-400">
                              {product.categoryName}
                            </span>
                            <button
                              onClick={() => onRemoveFromWishlist(product.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                            {product.name}
                          </h4>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{product.rating}</span>
                            <span>·</span>
                            <span>{product.deliveryFormat}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Actions */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold font-mono text-white glow-text-cyan">
                            {formatPrice(product.priceUSD, currency)}
                          </div>
                          <div className="text-[10px] text-zinc-500 line-through font-mono">
                            {formatPrice(product.originalPriceUSD, currency)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAddToCart(product)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Add</span>
                          </button>

                          <button
                            onClick={() => {
                              onClose();
                              onQuickBuy(product);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                            <span>Quick Buy</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Your Wishlist is Empty</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Save your favorite software keys, prompt engineering blueprints, and dev toolkits by clicking the heart icon on any product card.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onExploreStore();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            )
          )}

        </div>

      </div>

      {/* Printable PDF-Style Tax Receipt & Invoice Modal */}
      <InvoiceReceiptModal
        isOpen={!!selectedInvoiceOrder}
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        storeSettings={storeSettings}
      />
    </div>
  );
};
