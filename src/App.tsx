/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SecurePurchasesModal } from './components/SecurePurchasesModal';
import { commerceRequest } from './services/commerce';
import { Header } from './components/Header';
import { CommerceHero } from './components/CommerceHero';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LicenseKeyValidatorModal } from './components/LicenseKeyValidatorModal';
import { MyVaultModal } from './components/MyVaultModal';
import { AuthModal } from './components/AuthModal';
import { StoreAdminPanel } from './components/StoreAdminPanel';
import { SEOHead } from './components/SEOHead';
import { Footer } from './components/Footer';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, CategoryId, CurrencyCode, User, StoreSettings } from './types';
import { getInitialCurrency, fetchGeoCurrency, CURRENCY_STORAGE_KEY } from './utils/currency';
import { Check, ShoppingBag, TriangleAlert } from 'lucide-react';
import { STORE_RUNTIME_CONFIG } from './config/storeMode';
import { sanitizeStoreSettings } from './config/storeSettings';
import { auth, fbSignOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { secureAdminMiddleware, verifyAdminIdentity, registerAdminUid } from './utils/adminSecurity';

const PRODUCTS_STORAGE_KEY = '8cloud_admin_products_v1';
const CART_STORAGE_KEY = '8cloud_cart_v1';
const WISHLIST_STORAGE_KEY = '8cloud_wishlist_v1';
const SETTINGS_STORAGE_KEY = '8cloud_store_settings_v1';

const DEFAULT_SETTINGS: StoreSettings = {
  adminEmail: 'babasamsung2@gmail.com',
  privateAdminMode: true, // Default to true: Admin button hidden from public storefront
  subdomainEnabled: true,
  razorpayKeyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || '',
  razorpayTestMode: true,
  storeName: '8cloud.store',
  storeCurrency: 'INR',
};

export default function App() {
  const [isSecurePurchasesOpen, setIsSecurePurchasesOpen] = useState(false);
  const [catalogReady, setCatalogReady] = useState(!STORE_RUNTIME_CONFIG.checkoutEnabled);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  
  // Location-based Currency state: Defaults to INR in India / fallback, or USD ($) for other countries
  const [currency, setCurrency] = useState<CurrencyCode>(getInitialCurrency);

  // Background Geolocation Detection: Automatically detects country on first visit if no manual preference is saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (!saved) {
        fetchGeoCurrency().then((detectedCurrency) => {
          if (detectedCurrency) {
            setCurrency(detectedCurrency);
          }
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChangeCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (e) {
      console.error('Failed to save currency preference', e);
    }
  };
  
  // Real storefront products come exclusively from the trusted server catalog.
  const [products, setProducts] = useState<Product[]>(() => {
    if (STORE_RUNTIME_CONFIG.checkoutEnabled) return [];
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch { return PRODUCTS; }
  });
  useEffect(() => {
    if (!STORE_RUNTIME_CONFIG.checkoutEnabled) return;
    commerceRequest<{ products: Product[] }>('/catalog', undefined, false)
      .then(value => { setProducts(value.products); setCatalogReady(true); })
      .catch(() => { setCatalogReady(false); setProducts([]); });
  }, []);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (!STORE_RUNTIME_CONFIG.checkoutEnabled || !catalogReady) return;
    setCart(previous => previous.flatMap(item => {
      const product = products.find(product => product.id === item.product?.id);
      return product ? [{ product, quantity: 1 }] : [];
    }));
  }, [products, catalogReady]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders state
  // Orders must eventually be loaded from the authenticated server, never global browser storage.
  const [orders, setOrders] = useState<Order[]>([]);

  // Wishlist state (persisted)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User authentication state
  // Firebase is the only authority for sign-in; never restore identity from browser storage.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Store Configuration & Gateway Settings (persisted)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? sanitizeStoreSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) }) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string | undefined>(undefined);
  const [pendingCheckout, setPendingCheckout] = useState<{
    items: CartItem[];
    discount: number;
    coupon?: string;
  } | null>(null);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [validatorInitialKey, setValidatorInitialKey] = useState<string>('');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultInitialTab, setVaultInitialTab] = useState<'orders' | 'wishlist'>('orders');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist store settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitizeStoreSettings(storeSettings)));
    } catch (e) {
      console.error('Failed to save store settings to localStorage', e);
    }
  }, [storeSettings]);

  // Subdomain & Secret Access Route Detection
  const isSubdomainOrSecretRoute = typeof window !== 'undefined' && (
    window.location.hostname.toLowerCase().startsWith('admin.') ||
    window.location.pathname.toLowerCase().startsWith('/admin') ||
    window.location.search.toLowerCase().includes('admin=true') ||
    window.location.search.toLowerCase().includes('admin=portal') ||
    window.location.hash.toLowerCase() === '#admin'
  );

  // Auto-open admin panel if visiting admin subdomain or secret path (UID-guarded)
  useEffect(() => {
    if (isSubdomainOrSecretRoute) {
      const check = verifyAdminIdentity(currentUser);
      if (check.authorized && check.uid) {
        setIsAdminOpen(true);
      }
    }
  }, [isSubdomainOrSecretRoute, currentUser]);

  // Secret keyboard shortcut to open Admin Panel (Ctrl + Shift + A or Cmd + Shift + A, UID-guarded)
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        const check = verifyAdminIdentity(currentUser);
        if (check.authorized && check.uid) {
          setIsAdminOpen((prev) => !prev);
        } else {
          showToast('Administrator UID required: Please sign in as babasamsung2@gmail.com');
          setIsAuthOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, [currentUser]);

  // Securely modify store settings with explicit UID verification
  const handleSaveSettings = (updatedSettings: StoreSettings) => {
    const guard = secureAdminMiddleware(
      currentUser,
      'Modify Store Settings',
      () => {
        setStoreSettings(updatedSettings);
        showToast('Store & Gateway settings updated successfully!');
      },
      (reason) => {
        showToast(`Settings change blocked: ${reason}`);
      }
    );
    guard();
  };

  // Persist products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  // Sync Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser || !fbUser.email) {
        setCurrentUser(null);
        setOrders([]);
        setIsAdminOpen(false);
        setIsSecurePurchasesOpen(false);
        return;
      }
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase().trim();
        const isAdmin = fbUser.emailVerified && cleanEmail === 'babasamsung2@gmail.com';
        const displayName = fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Member');
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        const verifiedUser: User = {
          id: fbUser.uid,
          name: formattedName,
          email: cleanEmail,
          avatarUrl: fbUser.photoURL || undefined,
          memberSince: 'March 2026',
          tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Customer',
          role: isAdmin ? 'admin' : 'customer',
          authProvider: 'google',
        };
        setCurrentUser(verifiedUser);
        if (isAdmin) {
          registerAdminUid(fbUser.uid, cleanEmail).catch(() => console.warn('Admin registry sync failed.'));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLoginSuccess = (user: User) => {
    const isAdmin = user.email.toLowerCase().trim() === 'babasamsung2@gmail.com';
    const updatedUser: User = {
      ...user,
      role: isAdmin ? 'admin' : 'customer',
      tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Member',
    };
    setCurrentUser(updatedUser);
    if (isAdmin) {
      showToast(`👑 Welcome Baba Samsung! Store Admin Enabled`);
      setIsAdminLoginMode(false);
      // Auto-open admin panel if user requested admin access
      if (isAdminLoginMode) {
        setIsAdminOpen(true);
      }
    } else {
      showToast(`Welcome back, ${updatedUser.name}!`);
      setIsAdminLoginMode(false);
    }

    // If customer was in the process of purchasing, resume checkout immediately
    if (pendingCheckout) {
      setCheckoutItems(pendingCheckout.items);
      setCheckoutDiscount(pendingCheckout.discount);
      setCheckoutCoupon(pendingCheckout.coupon);
      setPendingCheckout(null);
    }
  };

  const handleOpenAdminLogin = () => {
    const guard = secureAdminMiddleware(
      currentUser,
      'Open Admin Panel',
      () => setIsAdminOpen(true),
      (reason) => {
        showToast(`Administrator UID Required: ${reason}`);
        setIsAuthOpen(true);
      }
    );
    guard();
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign out notice:', err);
    }
    setCurrentUser(null);
    showToast('Signed out of 8cloud.store');
  };

  // Admin Product Management Handlers (UID-guarded via secureAdminMiddleware)
  const handleSaveProduct = (updatedProduct: Product) => {
    if (STORE_RUNTIME_CONFIG.checkoutEnabled) { showToast('Publish real products using the server catalog import tool.'); return; }
    const guard = secureAdminMiddleware(
      currentUser,
      'Save Product',
      () => {
        setProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === updatedProduct.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedProduct;
            return next;
          } else {
            return [updatedProduct, ...prev];
          }
        });
        showToast(`Product "${updatedProduct.name}" saved to store!`);
      },
      (reason) => showToast(`Action Blocked: ${reason}`)
    );
    guard();
  };

  const handleDeleteProduct = (productId: string) => {
    if (STORE_RUNTIME_CONFIG.checkoutEnabled) { showToast('Manage real products in the server catalog.'); return; }
    const guard = secureAdminMiddleware(
      currentUser,
      'Delete Product',
      () => {
        const prod = products.find((p) => p.id === productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        showToast(`Product "${prod?.name || productId}" deleted from store`);
      },
      (reason) => showToast(`Action Blocked: ${reason}`)
    );
    guard();
  };

  const handleResetCatalog = () => {
    if (STORE_RUNTIME_CONFIG.checkoutEnabled) return;
    const guard = secureAdminMiddleware(
      currentUser,
      'Reset Catalog',
      () => {
        setProducts(PRODUCTS);
        localStorage.removeItem(PRODUCTS_STORAGE_KEY);
        showToast('Store catalog restored to default inventory');
      },
      (reason) => showToast(`Action Blocked: ${reason}`)
    );
    guard();
  };

  // Toggle wishlist handler
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to Wishlist ♡`);
        return [...prev, product.id];
      }
    });
  };

  // Remove from wishlist directly
  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      showToast(`Removed "${prod.name}" from Wishlist`);
    }
  };

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      if (STORE_RUNTIME_CONFIG.checkoutEnabled && prev.some(item => item.product.id === product.id)) return prev;
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to Bag`);
  };

  // Update quantity in cart
  const handleUpdateQuantity = (productId: string, delta: number) => {
    if (STORE_RUNTIME_CONFIG.checkoutEnabled && delta > 0) return;
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove from cart
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Quick Buy handler (direct checkout for 1 item)
  const handleQuickBuy = (product: Product) => {
    if (!STORE_RUNTIME_CONFIG.checkoutEnabled) {
      showToast('Purchases are not available yet. No payment will be collected.');
      return;
    }
    if (!currentUser) {
      setPendingCheckout({ items: [{ product, quantity: 1 }], discount: 0 });
      setIsAuthOpen(true);
      showToast('Please sign in or create an account to purchase');
      return;
    }
    setCheckoutItems([{ product, quantity: 1 }]);
    setCheckoutDiscount(0);
    setCheckoutCoupon(undefined);
  };

  // Proceed to checkout from cart drawer
  const handleProceedToCheckoutFromCart = (discountAmount: number, couponCode?: string) => {
    if (!STORE_RUNTIME_CONFIG.checkoutEnabled) {
      showToast('Purchases are not available yet. No payment will be collected.');
      return;
    }
    if (!currentUser) {
      setPendingCheckout({ items: cart, discount: discountAmount, coupon: couponCode });
      setIsCartOpen(false);
      setIsAuthOpen(true);
      showToast('Please sign in with Google or 8cloud to complete your order');
      return;
    }
    setIsCartOpen(false);
    setCheckoutItems(cart);
    setCheckoutDiscount(discountAmount);
    setCheckoutCoupon(couponCode);
  };

  // Open key validator with pre-filled key
  const handleOpenValidatorWithKey = (key: string) => {
    setValidatorInitialKey(key);
    setIsValidatorOpen(true);
  };

  // Scroll to catalog smoothly
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#030305] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {!STORE_RUNTIME_CONFIG.checkoutEnabled && (
        <div className="sticky top-0 z-[70] flex items-center justify-center gap-2 border-b border-amber-400/25 bg-amber-400/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-200 backdrop-blur-xl">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>Demo storefront — checkout and payment collection are disabled until the secure server-side payment system is connected.</span>
        </div>
      )}

      {/* Dynamic SEO Meta Tag & Social Graph Generator */}
      <SEOHead
        selectedCategory={selectedCategory}
        selectedProduct={selectedProduct}
        currency={currency}
      />

      <SecurePurchasesModal isOpen={isSecurePurchasesOpen} onClose={() => setIsSecurePurchasesOpen(false)} userId={currentUser?.id} onSignIn={() => { setIsSecurePurchasesOpen(false); setIsAuthOpen(true); }} />
      {STORE_RUNTIME_CONFIG.mode === 'test' && <div className="bg-amber-950 p-2 text-center text-sm text-amber-200">Test store — no real payments</div>}
      {!catalogReady && <div role="alert" className="p-3 text-center text-rose-300">The product catalog is unavailable. Please try again later.</div>}

      {/* Top sticky glassmorphic navigation */}
      <Header
        products={products.filter((p) => p.status !== 'draft')}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat !== 'all') {
            scrollToCatalog();
          }
        }}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenValidator={() => {
          setValidatorInitialKey('');
          setIsValidatorOpen(true);
        }}
        onOpenVault={() => {
          if (STORE_RUNTIME_CONFIG.checkoutEnabled) setIsSecurePurchasesOpen(true);
          else { setVaultInitialTab('orders'); setIsVaultOpen(true); }
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
        activeOrdersCount={orders.length}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => {
          setVaultInitialTab('wishlist');
          setIsVaultOpen(true);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminVisible={verifyAdminIdentity(currentUser).authorized}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        {STORE_RUNTIME_CONFIG.checkoutEnabled ? <CommerceHero onShopNow={scrollToCatalog} /> : <Hero
          onShopNow={scrollToCatalog}
          onOpenValidator={() => {
            setValidatorInitialKey('');
            setIsValidatorOpen(true);
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToCatalog();
          }}
        />}

        {/* Niche Categories Interactive Grid */}
        <CategoryGrid
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToCatalog();
          }}
        />

        {/* 4-Column Product Catalog with Filters */}
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currency={currency}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
          onQuickBuy={handleQuickBuy}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          selectedProductId={selectedProduct?.id}
        />
      </main>

      {/* Footer with FAQ, Newsletter, Trust & Payment badges */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onOpenValidator={() => {
          setValidatorInitialKey('');
          setIsValidatorOpen(true);
        }}
        currentUser={currentUser}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAdminLogin={handleOpenAdminLogin}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckoutFromCart}
        currentUser={currentUser}
        onOpenLogin={() => {
          setPendingCheckout({ items: cart, discount: 0 });
          setIsCartOpen(false);
          setIsAuthOpen(true);
          showToast('Please sign in with Google or 8cloud to complete your order');
        }}
      />

      {/* Product Detail / Quick View Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currency={currency}
        onAddToCart={handleAddToCart}
        onQuickBuy={handleQuickBuy}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Checkout Modal (UPI, Cards, Net-banking, Crypto) */}
      <CheckoutModal
        isOpen={!!checkoutItems}
        onClose={() => setCheckoutItems(null)}
        items={checkoutItems || []}
        currency={currency}
        discountAmount={checkoutDiscount}
        couponCode={checkoutCoupon}
        onPurchaseCompleted={() => {
          const purchasedIds = new Set((checkoutItems || []).map(item => item.product.id));
          setCart(prev => prev.filter(item => !purchasedIds.has(item.product.id)));
          setCheckoutItems(null);
          setIsSecurePurchasesOpen(true);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthOpen(true)}
      />

      {/* License Key Verification Engine Modal */}
      <LicenseKeyValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
        initialKey={validatorInitialKey}
      />

      {/* User Account / My Vault Modal */}
      <MyVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        orders={orders}
        onOpenValidatorWithKey={handleOpenValidatorWithKey}
        onExploreStore={scrollToCatalog}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onQuickBuy={handleQuickBuy}
        currency={currency}
        initialTab={vaultInitialTab}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenLogin={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        storeSettings={storeSettings}
      />

      {/* User Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setIsAdminLoginMode(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialEmail={currentUser?.email || ''}
        isAdminLoginMode={isAdminLoginMode}
        storeSettings={storeSettings}
      />

      {/* Store Administrator Dashboard & Product Management (Strictly babasamsung2@gmail.com) */}
      {isAdminOpen && verifyAdminIdentity(currentUser).authorized && (
        <StoreAdminPanel
          onClose={() => setIsAdminOpen(false)}
          onCatalogChanged={() => {
            if (STORE_RUNTIME_CONFIG.checkoutEnabled) {
              commerceRequest<{ products: Product[] }>('/catalog', undefined, false)
                .then(result => setProducts(result.products)).catch(() => showToast('Reload the storefront to refresh products.'));
            }
          }}
        />
      )}

      {/* Transient Micro-Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-zinc-900 border border-cyan-400/40 text-white text-xs font-medium rounded-xl shadow-xl shadow-cyan-500/20 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-cyan-400" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-cyan-400 font-semibold hover:underline cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}

    </div>
  );
}
