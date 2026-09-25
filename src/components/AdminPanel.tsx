import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Eye, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Layers, 
  Settings, 
  ArrowLeft,
  Key,
  BookOpen,
  Sparkles,
  Code,
  ShieldCheck,
  Cpu,
  FileText,
  Clock,
  ExternalLink,
  Crown,
  RotateCcw,
  Globe,
  Lock,
  ShieldAlert,
  Check,
  Smartphone,
  CreditCard,
  HelpCircle,
  Info
} from 'lucide-react';
import { Product, CategoryId, DeliveryType, Order, User, CurrencyCode, StoreSettings } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { formatPrice } from '../utils/currency';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
  currentUser?: User | null;
  currency: CurrencyCode;
  storeSettings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onOpenLogin?: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onResetCatalog,
  currentUser,
  currency,
  storeSettings,
  onSaveSettings,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  
  // Security Barrier states
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Settings form states
  const [settingsAdminPin, setSettingsAdminPin] = useState(storeSettings.adminPin || '8821');
  const [settingsPrivateMode, setSettingsPrivateMode] = useState(storeSettings.privateAdminMode);
  const [settingsRazorpayKey, setSettingsRazorpayKey] = useState(storeSettings.razorpayKeyId || 'rzp_test_8cloudStoreDemo');
  const [settingsRazorpaySecret, setSettingsRazorpaySecret] = useState(storeSettings.razorpayKeySecret || '');
  const [settingsRazorpayTestMode, setSettingsRazorpayTestMode] = useState(storeSettings.razorpayTestMode);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Sync settings when props change
  useEffect(() => {
    setSettingsAdminPin(storeSettings.adminPin || '8821');
    setSettingsPrivateMode(storeSettings.privateAdminMode);
    setSettingsRazorpayKey(storeSettings.razorpayKeyId || 'rzp_test_8cloudStoreDemo');
    setSettingsRazorpaySecret(storeSettings.razorpayKeySecret || '');
    setSettingsRazorpayTestMode(storeSettings.razorpayTestMode);
  }, [storeSettings]);

  // Product Form Modal state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLongDescription, setFormLongDescription] = useState('');
  const [formPriceUSD, setFormPriceUSD] = useState<number>(29);
  const [formOriginalPriceUSD, setFormOriginalPriceUSD] = useState<number>(59);
  const [formCostPerItem, setFormCostPerItem] = useState<number>(0);
  const [formCategoryId, setFormCategoryId] = useState<CategoryId>('software-keys');
  const [formDeliveryType, setFormDeliveryType] = useState<DeliveryType>('license_key');
  const [formDeliveryFormat, setFormDeliveryFormat] = useState('Cryptographic 25-Digit License Key');
  const [formDownloadSize, setFormDownloadSize] = useState('120 MB');
  const [formVersion, setFormVersion] = useState('v1.0.0');
  const [formLicenseType, setFormLicenseType] = useState('Commercial Single-User');
  const [formBadge, setFormBadge] = useState('New Release');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');
  const [formStock, setFormStock] = useState<number>(999);
  const [formSku, setFormSku] = useState('');
  const [formIconType, setFormIconType] = useState('Key');
  const [formGradientTheme, setFormGradientTheme] = useState('from-cyan-950/40 via-zinc-900 to-black');
  
  // Feature tags & requirements lists
  const [formFeatures, setFormFeatures] = useState<string[]>([
    'Instant digital delivery immediately upon checkout',
    'Commercial usage rights included for personal & client projects',
    'Free lifetime updates and customer support',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const [formTags, setFormTags] = useState<string[]>(['Digital Asset', 'Instant Download']);
  const [newTagInput, setNewTagInput] = useState('');

  // E-book specific details
  const [formEbookFormat, setFormEbookFormat] = useState('PDF + EPUB + Kindle');
  const [formEbookPages, setFormEbookPages] = useState<number>(240);
  const [formEbookAuthor, setFormEbookAuthor] = useState('Lead Architect');

  if (!isOpen) return null;

  const isAuthorizedAdmin = 
    currentUser?.role === 'admin' || 
    currentUser?.email?.toLowerCase().includes('babasamsung2') ||
    isPinUnlocked;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = storeSettings.adminPin || '8821';
    if (pinInput.trim() === correctPin) {
      setIsPinUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect Master Admin PIN. (Default: 8821)');
    }
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...storeSettings,
      adminPin: settingsAdminPin.trim() || '8821',
      privateAdminMode: settingsPrivateMode,
      razorpayKeyId: settingsRazorpayKey.trim() || 'rzp_test_8cloudStoreDemo',
      razorpayKeySecret: settingsRazorpaySecret.trim(),
      razorpayTestMode: settingsRazorpayTestMode,
    };
    onSaveSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-center space-y-6 animate-in zoom-in-95 duration-200">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
              Restricted Store Administrator Portal
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">8cloud Store Administrator Access</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              This backend is strictly private. Sign in with the administrator Google account or enter your Master PIN.
            </p>
          </div>

          {/* Option 1: Google Login as Admin */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with babasamsung2@gmail.com</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <div className="flex-1 h-px bg-white/10" />
              <span>OR ENTER MASTER PIN</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Option 2: PIN Verification */}
            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Master Admin PIN (Default: 8821)"
                  maxLength={10}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-amber-400 text-center font-mono text-base tracking-widest text-white px-4 py-2.5 rounded-xl outline-none"
                />
              </div>

              {pinError && (
                <div className="text-[11px] text-rose-400 font-mono flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Unlock Administrator Panel
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <span>Default PIN: <code className="text-zinc-300">8821</code></span>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Exit to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high-level Shopify-like dashboard metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalOrdersCount = orders.length;
  const averageOrderVal = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const activeProductsCount = products.filter((p) => p.status !== 'draft').length;

  // Open Form to Add New Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormTagline('');
    setFormDescription('');
    setFormLongDescription('');
    setFormPriceUSD(29);
    setFormOriginalPriceUSD(59);
    setFormCostPerItem(0);
    setFormCategoryId('software-keys');
    setFormDeliveryType('license_key');
    setFormDeliveryFormat('Cryptographic 25-Digit License Key');
    setFormDownloadSize('120 MB');
    setFormVersion('v1.0.0');
    setFormLicenseType('Commercial Single-User License');
    setFormBadge('New Release');
    setFormStatus('active');
    setFormStock(500);
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormIconType('Key');
    setFormGradientTheme('from-cyan-950/40 via-zinc-900 to-black');
    setFormFeatures([
      'Instant digital fulfillment within 0 seconds',
      'Commercial usage license for production workflows',
      'Continuous updates and access to downloads',
    ]);
    setFormTags(['Software', 'Instant Key']);
    setFormEbookFormat('PDF + EPUB + Kindle');
    setFormEbookPages(200);
    setFormEbookAuthor('Lead Engineer');
    setIsEditingProduct(true);
  };

  // Open Form to Edit Existing Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormTagline(prod.tagline || '');
    setFormDescription(prod.description || '');
    setFormLongDescription(prod.longDescription || prod.description || '');
    setFormPriceUSD(prod.priceUSD);
    setFormOriginalPriceUSD(prod.originalPriceUSD);
    setFormCostPerItem(prod.costPerItem || 0);
    setFormCategoryId(prod.categoryId);
    setFormDeliveryType(prod.deliveryType);
    setFormDeliveryFormat(prod.deliveryFormat || '');
    setFormDownloadSize(prod.downloadSize || '120 MB');
    setFormVersion(prod.version || 'v1.0.0');
    setFormLicenseType(prod.licenseType || 'Commercial');
    setFormBadge(prod.badge || '');
    setFormStatus(prod.status || 'active');
    setFormStock(prod.stock || 999);
    setFormSku(prod.sku || `SKU-${prod.id.slice(0, 6).toUpperCase()}`);
    setFormIconType(prod.iconType || 'Key');
    setFormGradientTheme(prod.gradientTheme || 'from-cyan-950/40 via-zinc-900 to-black');
    setFormFeatures(prod.features || []);
    setFormTags(prod.tags || []);
    setFormEbookFormat(prod.ebookDetails?.format || 'PDF + EPUB');
    setFormEbookPages(prod.ebookDetails?.pages || 180);
    setFormEbookAuthor(prod.ebookDetails?.author || 'Author');
    setIsEditingProduct(true);
  };

  // Duplicate Product
  const handleDuplicateProduct = (prod: Product) => {
    const cloned: Product = {
      ...prod,
      id: `${prod.id}-copy-${Date.now().toString().slice(-4)}`,
      name: `${prod.name} (Copy)`,
      status: 'draft',
      sku: `${prod.sku || 'SKU'}-COPY`,
    };
    onSaveProduct(cloned);
  };

  // Save product from form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCategoryObj = CATEGORIES.find((c) => c.id === formCategoryId);
    const categoryName = selectedCategoryObj ? selectedCategoryObj.name : 'Digital Products';

    const prodId = editingProduct ? editingProduct.id : `prod-${Date.now().toString().slice(-6)}`;

    const newOrUpdatedProduct: Product = {
      id: prodId,
      name: formName.trim(),
      tagline: formTagline.trim() || formName.trim(),
      description: formDescription.trim(),
      longDescription: formLongDescription.trim() || formDescription.trim(),
      priceUSD: Number(formPriceUSD) || 0,
      originalPriceUSD: Number(formOriginalPriceUSD) || Number(formPriceUSD) || 0,
      costPerItem: Number(formCostPerItem) || 0,
      categoryId: formCategoryId,
      categoryName,
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 1,
      deliveryType: formDeliveryType,
      deliveryFormat: formDeliveryFormat,
      downloadSize: formDownloadSize,
      version: formVersion,
      licenseType: formLicenseType,
      badge: formBadge ? formBadge : undefined,
      status: formStatus,
      stock: Number(formStock),
      sku: formSku,
      features: formFeatures.filter(Boolean),
      tags: formTags.filter(Boolean),
      systemRequirements: editingProduct?.systemRequirements || ['Compatible with modern operating systems and web browsers'],
      includedFiles: editingProduct?.includedFiles || [formDeliveryFormat, 'License Verification Certificate'],
      gradientTheme: formGradientTheme,
      iconType: formIconType,
      ebookDetails: formDeliveryType === 'ebook' ? {
        format: formEbookFormat,
        pages: Number(formEbookPages),
        author: formEbookAuthor,
      } : undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    onSaveProduct(newOrUpdatedProduct);
    setIsEditingProduct(false);
  };

  // Add Feature item
  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFormFeatures([...formFeatures, newFeatureInput.trim()]);
      setNewFeatureInput('');
    }
  };

  // Remove Feature item
  const handleRemoveFeature = (idx: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== idx));
  };

  // Add Tag
  const handleAddTag = () => {
    if (newTagInput.trim() && !formTags.includes(newTagInput.trim())) {
      setFormTags([...formTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Filter products for the table
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    const matchesStatus = 
      selectedStatusFilter === 'all' || 
      (selectedStatusFilter === 'active' && p.status !== 'draft') ||
      (selectedStatusFilter === 'draft' && p.status === 'draft');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Shopify-Style Navigation Bar */}
      <header className="h-16 bg-zinc-950 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">8cloud Admin</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                Shopify-Style Engine
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Logged in: {currentUser?.email || 'babasamsung2@gmail.com'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddProduct}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Live Store</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-56 bg-zinc-950/80 border-r border-white/10 p-4 space-y-6 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-3 mb-2">
              Management
            </div>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
              <span className="ml-auto font-mono text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders</span>
              <span className="ml-auto font-mono text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-white/5 space-y-2">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Auto-Sync</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Every product added or edited immediately updates in your real storefront.
            </p>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#060609]">
          
          {/* TAB 1: PRODUCTS TABLE (DEFAULT) */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header and Quick Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Products Management</h1>
                  <p className="text-xs text-zinc-400">
                    Add, edit, duplicate, and remove digital products, software keys & e-books.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, SKU, or tags..."
                    className="w-full bg-zinc-900 border border-white/5 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-zinc-900 border border-white/10 text-xs text-zinc-300 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="bg-zinc-900 border border-white/10 text-xs text-zinc-300 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-mono tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Category & Type</th>
                        <th className="py-3 px-4">Selling Price</th>
                        <th className="py-3 px-4">Original Price</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                            {/* Product Title & Badge */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                                  {p.deliveryType === 'ebook' ? (
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                  ) : p.deliveryType === 'license_key' ? (
                                    <Key className="w-5 h-5 text-cyan-400" />
                                  ) : (
                                    <Code className="w-5 h-5 text-emerald-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-white truncate max-w-xs flex items-center gap-2">
                                    <span>{p.name}</span>
                                    {p.badge && (
                                      <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-500 truncate max-w-xs font-mono">
                                    ID: {p.id} · {p.version || 'v1.0'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              {p.status === 'draft' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-white/10">
                                  Draft
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                  ● Active
                                </span>
                              )}
                            </td>

                            {/* Category & Type */}
                            <td className="py-3.5 px-4">
                              <div className="text-zinc-300 font-medium">{p.categoryName}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                {p.deliveryType.replace('_', ' ').toUpperCase()}
                              </div>
                            </td>

                            {/* Selling Price */}
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              {formatPrice(p.priceUSD, currency)}
                            </td>

                            {/* Original Price */}
                            <td className="py-3.5 px-4 font-mono text-zinc-500 line-through">
                              {formatPrice(p.originalPriceUSD, currency)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Edit Product"
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateProduct(p)}
                                  title="Duplicate Product"
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 border border-white/10 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                      onDeleteProduct(p.id);
                                    }
                                  }}
                                  title="Delete Product"
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                            No products found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DASHBOARD / ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Sales & Store Performance</h1>
                <p className="text-xs text-zinc-400">
                  Shopify-grade real-time overview of revenue, transactions, and store activity.
                </p>
              </div>

              {/* 4 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Total Sales Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {formatPrice(totalRevenue, currency)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <span>↑ +18.4% this week</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Fulfilled Orders</span>
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono">
                    100% Instant Delivery Rate
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Average Order Value</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {formatPrice(averageOrderVal, currency)}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Across digital packages
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Active Catalog SKUs</span>
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {activeProductsCount}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {products.length - activeProductsCount} in draft mode
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Recent Customer Transactions</h3>
                <div className="space-y-2">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{ord.customerName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono font-normal">
                            ({ord.customerEmail})
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Order #{ord.id} · {ord.items.length} items · Payment via {ord.paymentMethod.toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold font-mono text-cyan-400">
                          {formatPrice(ord.total, currency)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">● Fulfilled</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Customer Orders</h1>
                <p className="text-xs text-zinc-400">
                  Track buyer details, issued cryptographic keys, and fulfillment status.
                </p>
              </div>

              <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-mono tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-900/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                            {ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">{ord.customerName}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">{ord.customerEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            {ord.items.map((i) => i.product.name).join(', ')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 uppercase">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {formatPrice(ord.total, currency)}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 text-[11px] font-mono">
                            {new Date(ord.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE SETTINGS & RESTORE */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Store & Gateway Configuration</h1>
                  <p className="text-xs text-zinc-400">
                    Manage Subdomain routing, Private Admin security, and Razorpay payment credentials.
                  </p>
                </div>

                {settingsSavedToast && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Settings Saved Successfully!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-6">

                {/* SECTION 1: SUBDOMAIN & PRIVATE ADMIN SECURITY */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Subdomain & Private Mode (Security)</h3>
                        <p className="text-[11px] text-zinc-400">
                          Isolate the admin panel to a private subdomain or secret access route.
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      Subdomain Auto-Routed
                    </span>
                  </div>

                  {/* Private Mode Toggle */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Hide Admin Buttons on Public Storefront</span>
                        {settingsPrivateMode && (
                          <span className="text-[10px] font-mono text-emerald-400">● 100% PRIVATE</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        When enabled, shoppers on the main store will never see the Admin link. Only you can access via subdomain, secret URL, or Admin Google account.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsPrivateMode}
                        onChange={(e) => setSettingsPrivateMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Secret Routes & Subdomain Access Links */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-zinc-400 uppercase font-mono tracking-wide">
                      Ways to Access Private Admin Panel:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                        <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>1. Private Subdomain</span>
                        </div>
                        <code className="block text-[11px] text-zinc-400 font-mono break-all">
                          https://admin.yourdomain.com
                        </code>
                        <div className="text-[10px] text-zinc-500">
                          Auto-opens Admin panel directly when loaded on admin.* hostname.
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                        <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>2. Secret URL Parameter</span>
                        </div>
                        <code className="block text-[11px] text-zinc-400 font-mono break-all">
                          https://yourdomain.com/?admin=portal
                        </code>
                        <div className="text-[10px] text-zinc-500">
                          Also opens via hash #admin or keyboard shortcut Ctrl + Shift + A
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DNS Setup Guide */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2 text-xs">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>How to connect your subdomain in Vercel / Cloudflare / DNS:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                      <li>Log in to your Domain Registrar (GoDaddy, Namecheap, Hostinger, or Cloudflare).</li>
                      <li>Go to <strong>DNS Records</strong> and add a new <strong>CNAME Record</strong>:</li>
                      <li className="pl-4 font-mono text-cyan-300">
                        Type: <span className="text-white">CNAME</span> | Name/Host: <span className="text-white">admin</span> | Target: <span className="text-white">cname.vercel-dns.com</span>
                      </li>
                      <li>In Vercel Project Settings &rarr; <strong>Domains</strong> &rarr; Add <span className="text-white font-mono">admin.yourdomain.com</span>.</li>
                      <li>That&apos;s all! Our app automatically detects the admin subdomain and routes to this private panel.</li>
                    </ol>
                  </div>

                  {/* Master Admin PIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Master Admin Security PIN</label>
                      <input
                        type="text"
                        value={settingsAdminPin}
                        onChange={(e) => setSettingsAdminPin(e.target.value)}
                        placeholder="8821"
                        maxLength={10}
                        className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Enter this 4-digit code to unlock the admin panel from any browser.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Authorized Admin Gmail</label>
                      <input
                        type="text"
                        readOnly
                        value="babasamsung2@gmail.com"
                        className="w-full bg-zinc-900 border border-white/10 text-xs text-zinc-300 px-3 py-2 rounded-xl font-mono cursor-not-allowed"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Logging in with this Gmail unlocks admin status automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: RAZORPAY PAYMENT GATEWAY CONFIGURATION */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
                        ₹
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Razorpay Payments Gateway (India & Global)</h3>
                        <p className="text-[11px] text-zinc-400">
                          Receive customer payments via UPI, Google Pay, PhonePe, Cards & NetBanking directly into your bank.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        settingsRazorpayTestMode
                          ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                          : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                      }`}>
                        {settingsRazorpayTestMode ? 'Test Mode (Sandbox)' : 'Live Production Mode'}
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettingsRazorpayTestMode(true)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settingsRazorpayTestMode
                          ? 'bg-amber-500/10 border-amber-400 text-white'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-300">Test Sandbox Mode</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Test purchases without real money using test UPI/cards (Keys start with rzp_test_)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsRazorpayTestMode(false)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !settingsRazorpayTestMode
                          ? 'bg-cyan-500/10 border-cyan-400 text-white'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-cyan-300">Live Production Mode</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Collect real payments deposited into your Indian Bank Account (Keys start with rzp_live_)
                      </div>
                    </button>
                  </div>

                  {/* Key Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-300 mb-1 font-medium">
                        Razorpay Key ID * {settingsRazorpayTestMode ? '(rzp_test_...)' : '(rzp_live_...)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsRazorpayKey}
                        onChange={(e) => setSettingsRazorpayKey(e.target.value)}
                        placeholder={settingsRazorpayTestMode ? 'rzp_test_xxxxxxxxxxxxxx' : 'rzp_live_xxxxxxxxxxxxxx'}
                        className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Public key used to trigger the Razorpay standard checkout popup.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1 font-medium">
                        Razorpay Key Secret (Optional / Webhooks)
                      </label>
                      <input
                        type="password"
                        value={settingsRazorpaySecret}
                        onChange={(e) => setSettingsRazorpaySecret(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Stored securely for signature authentication and payment webhooks.
                      </p>
                    </div>
                  </div>

                  {/* Razorpay Requirements Checklist (Answers user's question directly!) */}
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-2 text-xs">
                    <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Razorpay shuru karne ke liye aapko kya details chahiye? (Checklist):</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">1.</span>
                        <span><strong>Razorpay Account:</strong> <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">dashboard.razorpay.com <ExternalLink className="w-2.5 h-2.5" /></a> par free signup karein (Takes 2 minutes).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">2.</span>
                        <span><strong>KYC Documents:</strong> Aapka PAN Card, Aadhar Card, aur Bank Account details (Jaha aapke store ka paisa transfer hoga).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">3.</span>
                        <span><strong>API Key ID & Secret:</strong> Dashboard me <em>Account & Settings &rarr; API Keys</em> me &quot;Generate Key&quot; par click karein.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">4.</span>
                        <span><strong>Bank Settlement:</strong> Razorpay customer se paisa collect karke daily T+2 days me seedhe aapke bank account me bhej deta hai.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save All Store & Gateway Settings</span>
                  </button>
                </div>

              </form>

              {/* SECTION 3: CATALOG BACKUP & RESET */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Catalog Backup & Reset</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If you ever want to revert all custom added/deleted products back to the original verified 8cloud store inventory, click below.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset store catalog to initial defaults? Any newly created test products will be reset.')) {
                      onResetCatalog();
                    }
                  }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Restore Verified Default Catalog</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FULL SHOPIFY-STYLE PRODUCT CREATION / EDIT MODAL */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center">
                  <Package className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingProduct ? 'Edit Product (Shopify Style)' : 'Add New Product (Shopify Style)'}
                  </h2>
                  <div className="text-[11px] text-zinc-400">
                    Configure title, pricing, digital delivery format & marketing features
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProduct(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProductForm} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                  1. Product Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Product Title / Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Master E-Book on Distributed Systems"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Short Tagline *</label>
                    <input
                      type="text"
                      required
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. High-throughput architecture patterns"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Store Category *</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value as CategoryId)}
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Delivery Protocol *</label>
                    <select
                      value={formDeliveryType}
                      onChange={(e) => {
                        const val = e.target.value as DeliveryType;
                        setFormDeliveryType(val);
                        if (val === 'ebook') {
                          setFormDeliveryFormat('Digital E-Book (PDF + EPUB)');
                        } else if (val === 'license_key') {
                          setFormDeliveryFormat('Cryptographic 25-Digit License Key');
                        } else {
                          setFormDeliveryFormat('.ZIP Download Archive');
                        }
                      }}
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="license_key">Software License Key</option>
                      <option value="ebook">Digital E-Book (PDF/EPUB)</option>
                      <option value="direct_download">Direct Download Package</option>
                      <option value="prompt_bundle">AI Prompt Bundle</option>
                      <option value="access_link">Portal Access / Course</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Publishing Status *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="active">Active (Visible in Store)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Marketing Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Clear description of the product benefits and what the buyer receives..."
                    className="w-full bg-zinc-900 border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Inventory */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                  2. Pricing & Financials (USD)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Selling Price ($ USD) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formPriceUSD}
                      onChange={(e) => setFormPriceUSD(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Compare-at Price ($ USD)</label>
                    <input
                      type="number"
                      min={1}
                      value={formOriginalPriceUSD}
                      onChange={(e) => setFormOriginalPriceUSD(Number(e.target.value))}
                      placeholder="e.g. 59"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Cost Per Item ($ USD)</label>
                    <input
                      type="number"
                      min={0}
                      value={formCostPerItem}
                      onChange={(e) => setFormCostPerItem(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">SKU / Inventory Code</label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. 8CLD-EBOOK-01"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Product Badge (Optional)</label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. Best Seller, New, Hot Deal"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery Specs (E-book details if ebook selected) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                  3. Digital Delivery Specifications
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Delivery Format Label *</label>
                    <input
                      type="text"
                      required
                      value={formDeliveryFormat}
                      onChange={(e) => setFormDeliveryFormat(e.target.value)}
                      placeholder="e.g. Instant PDF Download + EPUB"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">File / Download Size</label>
                    <input
                      type="text"
                      value={formDownloadSize}
                      onChange={(e) => setFormDownloadSize(e.target.value)}
                      placeholder="e.g. 45 MB or 180 Pages"
                      className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {formDeliveryType === 'ebook' && (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="text-[11px] font-semibold text-purple-300">
                      📖 E-Book Specific Information
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1">Formats</label>
                        <input
                          type="text"
                          value={formEbookFormat}
                          onChange={(e) => setFormEbookFormat(e.target.value)}
                          placeholder="PDF + EPUB + MOBI"
                          className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Page Count</label>
                        <input
                          type="number"
                          value={formEbookPages}
                          onChange={(e) => setFormEbookPages(Number(e.target.value))}
                          placeholder="240"
                          className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Author Name</label>
                        <input
                          type="text"
                          value={formEbookAuthor}
                          onChange={(e) => setFormEbookAuthor(e.target.value)}
                          placeholder="Alex Vance"
                          className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Features List Manager */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <label className="block text-zinc-400">Key Features List</label>
                <div className="space-y-2">
                  {formFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...formFeatures];
                          updated[idx] = e.target.value;
                          setFormFeatures(updated);
                        }}
                        className="flex-1 bg-zinc-900 border border-white/10 text-white px-3 py-1.5 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add another highlight feature..."
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Section 5: Tags */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <label className="block text-zinc-400">Tags & Categorization</label>
                <div className="flex flex-wrap gap-2">
                  {formTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag (e.g. security, vpn, ai)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingProduct ? 'Save & Update Storefront' : 'Publish Product to Store'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
