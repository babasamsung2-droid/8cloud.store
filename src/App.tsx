/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalDeliveryModal } from './components/DigitalDeliveryModal';
import { LicenseKeyValidatorModal } from './components/LicenseKeyValidatorModal';
import { MyVaultModal } from './components/MyVaultModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { SEOHead } from './components/SEOHead';
import { Footer } from './components/Footer';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, CategoryId, CurrencyCode, User, StoreSettings } from './types';
import { getStoredLicenses, saveLicense } from './utils/licenseGenerator';
import { getInitialCurrency, fetchGeoCurrency, CURRENCY_STORAGE_KEY } from './utils/currency';
import { Check, ShoppingBag } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = '8cloud_admin_products_v1';
const CART_STORAGE_KEY = '8cloud_cart_v1';
const ORDERS_STORAGE_KEY = '8cloud_orders_v1';
const WISHLIST_STORAGE_KEY = '8cloud_wishlist_v1';
const USER_STORAGE_KEY = '8cloud_current_user_v1';
const SETTINGS_STORAGE_KEY = '8cloud_store_settings_v1';

const DEFAULT_SETTINGS: StoreSettings = {
  adminEmail: 'babasamsung2@gmail.com',
  adminPin: '8821',
  privateAdminMode: true, // Default to true: Admin button hidden from public storefront
  subdomainEnabled: true,
  razorpayKeyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_8cloudStoreDemo',
  razorpayKeySecret: '',
  razorpayTestMode: true,
  storeName: '8cloud.store',
  storeCurrency: 'INR',
};

// Seed initial sample order for first-time visitors
const INITIAL_DEMO_ORDER: Order = {
  id: '8CLD-940219',
  date: '2026-03-01T10:00:00Z',
  customerName: 'Alex Vance',
  customerEmail: 'alex.vance@example.com',
  items: [
    {
      product: PRODUCTS[0], // CloudShield VPN Enterprise
      quantity: 1,
    },
  ],
  subtotal: 49,
  discount: 0,
  total: 49,
  currency: 'USD',
  paymentMethod: 'upi',
  transactionRef: 'TXN_NPCI_89218A',
  licenses: [
    {
      productId: PRODUCTS[0].id,
      productName: PRODUCTS[0].name,
      key: '8CLD-VPN9-A8F2-77Q1-X99M',
      issuedAt: '2026-03-01T10:00:00Z',
      expiresAt: '2027-03-01T10:00:00Z',
      maxDevices: 5,
      activeDevices: 2,
      status: 'active',
      activatedMachines: ['MacBook Pro 16" (M3 Max)', 'Arch Linux Workstation'],
    },
  ],
  downloadPayloads: [
    {
      productId: PRODUCTS[0].id,
      productName: PRODUCTS[0].name,
      fileName: 'cloudshield-vpn-v4.8.zip',
      fileSize: '84 MB',
      downloadUrl: 'https://cdn.8cloud.store/downloads/8CLD-940219/cloudshield.zip',
      expiresHours: 72,
    },
  ],
};

export default function App() {
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
  
  // Dynamic Products Catalog state (persisted so admin updates stay live across refreshes)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state (persisted)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Authentication state (persisted, zero demo accounts)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email === 'alex.vance@example.com' || parsed?.name === 'Alex Vance') {
          localStorage.removeItem(USER_STORAGE_KEY);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Store Configuration & Gateway Settings (persisted)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string | undefined>(undefined);
  const [latestDeliveredOrder, setLatestDeliveredOrder] = useState<Order | null>(null);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [validatorInitialKey, setValidatorInitialKey] = useState<string>('');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultInitialTab, setVaultInitialTab] = useState<'orders' | 'wishlist'>('orders');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist store settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(storeSettings));
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

  // Auto-open admin panel if visiting admin subdomain or secret path
  useEffect(() => {
    if (isSubdomainOrSecretRoute) {
      setIsAdminOpen(true);
    }
  }, [isSubdomainOrSecretRoute]);

  // Secret keyboard shortcut to open Admin Panel (Ctrl + Shift + A or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, []);

  const handleSaveSettings = (updatedSettings: StoreSettings) => {
    setStoreSettings(updatedSettings);
    showToast('Store & Gateway settings updated successfully!');
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

  // Persist orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  // Persist current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }, [currentUser]);

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
  };

  const handleOpenAdminLogin = () => {
    if (currentUser?.email?.toLowerCase().trim() === 'babasamsung2@gmail.com') {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginMode(true);
      setIsAuthOpen(true);
    }
  };

  // 1-Click Fast Google Login
  const handleFastGoogleLogin = (customEmail?: string, customName?: string) => {
    const browserEmail = (customEmail || 'customer@gmail.com').trim().toLowerCase();
    const isAdmin = browserEmail === 'babasamsung2@gmail.com';
    const derivedName = customName || (isAdmin ? 'Baba Samsung' : (browserEmail.split('@')[0]));
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const user: User = {
      id: isAdmin ? 'USR-ADMIN-BABA' : `USR-GGL-${Math.floor(100000 + Math.random() * 900000)}`,
      name: formattedName,
      email: browserEmail,
      memberSince: 'March 2026',
      tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Customer',
      role: isAdmin ? 'admin' : 'customer',
      authProvider: 'google',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=${isAdmin ? 'd97706' : '0284c7'}`,
    };

    handleLoginSuccess(user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    showToast('Signed out of 8cloud.store');
  };

  // Admin Product Management Handlers
  const handleSaveProduct = (updatedProduct: Product) => {
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
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    showToast(`Product "${prod?.name || productId}" deleted from store`);
  };

  const handleResetCatalog = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    showToast('Store catalog restored to default inventory');
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
    setCheckoutItems([{ product, quantity: 1 }]);
    setCheckoutDiscount(0);
    setCheckoutCoupon(undefined);
  };

  // Proceed to checkout from cart drawer
  const handleProceedToCheckoutFromCart = (discountAmount: number, couponCode?: string) => {
    setIsCartOpen(false);
    setCheckoutItems(cart);
    setCheckoutDiscount(discountAmount);
    setCheckoutCoupon(couponCode);
  };

  // On order completed
  const handleOrderCompleted = (completedOrder: Order) => {
    // Add to orders list
    setOrders((prev) => [completedOrder, ...prev]);

    // Save generated licenses to license store
    completedOrder.licenses.forEach((lic) => {
      saveLicense(lic);
    });

    // If checkout was from entire cart, clear the cart
    if (checkoutItems === cart) {
      setCart([]);
    }

    // Close checkout and trigger digital delivery screen
    setCheckoutItems(null);
    setLatestDeliveredOrder(completedOrder);
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
      
      {/* Dynamic SEO Meta Tag & Social Graph Generator */}
      <SEOHead
        selectedCategory={selectedCategory}
        selectedProduct={selectedProduct}
        currency={currency}
      />

      {/* Top sticky glassmorphic navigation */}
      <Header
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
          setVaultInitialTab('orders');
          setIsVaultOpen(true);
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
        onFastGoogleLogin={() => handleFastGoogleLogin()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminVisible={currentUser?.email?.trim().toLowerCase() === 'babasamsung2@gmail.com'}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onShopNow={scrollToCatalog}
          onOpenValidator={() => {
            setValidatorInitialKey('');
            setIsValidatorOpen(true);
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToCatalog();
          }}
        />

        {/* Niche Categories Interactive Grid */}
        <CategoryGrid
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
        onOrderCompleted={handleOrderCompleted}
        currentUser={currentUser}
      />

      {/* Digital Delivery Screen (Immediate License Keys, Downloads, Manifest) */}
      <DigitalDeliveryModal
        order={latestDeliveredOrder}
        onClose={() => setLatestDeliveredOrder(null)}
        onOpenVault={() => {
          setVaultInitialTab('orders');
          setIsVaultOpen(true);
        }}
        onOpenValidatorWithKey={handleOpenValidatorWithKey}
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
        initialEmail={currentUser?.email || (isAdminLoginMode ? 'babasamsung2@gmail.com' : '')}
        isAdminLoginMode={isAdminLoginMode}
        storeSettings={storeSettings}
      />

      {/* Store Administrator Dashboard & Product Management (Shopify Style) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetCatalog={handleResetCatalog}
        currentUser={currentUser}
        currency={currency}
        storeSettings={storeSettings}
        onSaveSettings={handleSaveSettings}
        onOpenLogin={() => setIsAuthOpen(true)}
      />

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
