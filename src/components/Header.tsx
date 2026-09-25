import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  KeyRound, 
  Layers, 
  X, 
  ArrowRight,
  Menu,
  ShieldCheck,
  ChevronDown,
  Heart,
  User as UserIcon
} from 'lucide-react';
import { CurrencyCode, Product, CategoryId, User } from '../types';
import { CURRENCY_RATES, formatPrice } from '../utils/currency';
import { PRODUCTS } from '../data/products';

interface HeaderProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenValidator: () => void;
  onOpenVault: () => void;
  onSelectProduct: (p: Product) => void;
  activeOrdersCount: number;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  currentUser?: User | null;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  currency,
  onChangeCurrency,
  cartCount,
  onOpenCart,
  onOpenValidator,
  onOpenVault,
  onSelectProduct,
  activeOrdersCount,
  wishlistCount = 0,
  onOpenWishlist,
  currentUser,
  onOpenLogin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter products for instant autocomplete
  const searchResults = searchQuery.trim().length > 1
    ? PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Global shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Top Banner: Trust marker & instant delivery promise */}
      <aside aria-label="Announcement" className="h-8 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-zinc-300 font-medium">⚡ 0-Second Instant Digital Delivery</span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="hidden sm:inline text-zinc-500">Global Cloud CDN Fulfillment</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenValidator}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-cyan-400" />
            <span>Verify License Key</span>
          </button>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-zinc-400">100% Activation Guarantee</span>
        </div>
      </aside>

      {/* Main Glassmorphic Sticky Header - follows strict Top Bar Contract */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSelectCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-extrabold text-sm">8</span>
                </div>
              </div>
              <span className="font-heading">8cloud<span className="text-cyan-400">.store</span></span>
            </a>
          </div>

          {/* Zone 2: 5 clean text navigation links with subtle active states */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide">
            <button
              onClick={() => onSelectCategory('software-keys')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'software-keys' 
                  ? 'text-cyan-400 border-b border-cyan-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Software Keys
            </button>
            <button
              onClick={() => onSelectCategory('ai-prompts')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'ai-prompts' 
                  ? 'text-purple-400 border-b border-purple-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              AI Prompts & Tools
            </button>
            <button
              onClick={() => onSelectCategory('social-media')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'social-media' 
                  ? 'text-cyan-400 border-b border-cyan-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Social Kits
            </button>
            <button
              onClick={() => onSelectCategory('elearning')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'elearning' 
                  ? 'text-purple-400 border-b border-purple-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => onSelectCategory('ebooks')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'ebooks' 
                  ? 'text-purple-400 border-b border-purple-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              E-Books
            </button>
            <button
              onClick={() => onSelectCategory('web-assets')}
              className={`transition-colors cursor-pointer py-1 ${
                selectedCategory === 'web-assets' 
                  ? 'text-cyan-400 border-b border-cyan-400' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Web Dev Assets
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Search, Currency, Vault, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 rounded-lg transition-colors cursor-pointer"
              title="Search catalog (Cmd+K or /)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 font-mono">⌘K</kbd>
            </button>

            {/* Currency Selector */}
            <div className="relative group">
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 text-zinc-200 text-xs px-2.5 py-1.5 pr-6 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-400 font-mono"
                aria-label="Currency"
              >
                {Object.keys(CURRENCY_RATES).map((code) => (
                  <option key={code} value={code} className="bg-zinc-900 text-white">
                    {CURRENCY_RATES[code as CurrencyCode].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* User Account / Sign In */}
            {currentUser ? (
              <button
                onClick={onOpenVault}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-cyan-500/40 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm shadow-cyan-500/10"
                title={`Account: ${currentUser.name} (${currentUser.email})`}
                aria-label="User Account"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[70px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Sign In / Register"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )
            )}

            {/* My Vault / Purchases Button */}
            <button
              onClick={onOpenVault}
              className="relative p-2 text-zinc-300 hover:text-cyan-400 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-lg transition-colors cursor-pointer"
              title="My Vault / Purchases"
              aria-label="My Vault"
            >
              <Layers className="w-4 h-4" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-zinc-950" />
              )}
            </button>

            {/* Wishlist Button */}
            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="relative p-2 text-zinc-300 hover:text-rose-400 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-lg transition-colors cursor-pointer"
                title="My Wishlist"
                aria-label="My Wishlist"
              >
                <Heart className={`w-4 h-4 transition-colors ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 font-mono text-[9px] bg-rose-500 text-white font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-zinc-950 shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-semibold text-xs rounded-lg shadow-sm shadow-cyan-500/25 transition-all cursor-pointer whitespace-nowrap"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-mono text-xs bg-zinc-950 text-cyan-400 px-1.5 py-0.2 rounded-md font-bold">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <div className="text-[11px] font-mono text-zinc-500 tracking-wider">BROWSE CATEGORIES</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => { onSelectCategory('all'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                All Digital Assets
              </button>
              <button
                onClick={() => { onSelectCategory('software-keys'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'software-keys' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                Software & License Keys
              </button>
              <button
                onClick={() => { onSelectCategory('ai-prompts'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'ai-prompts' ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                AI Prompts & Tools
              </button>
              <button
                onClick={() => { onSelectCategory('social-media'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'social-media' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                Social Media Content Kits
              </button>
              <button
                onClick={() => { onSelectCategory('elearning'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'elearning' ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                Digital Courses & E-Learning
              </button>
              <button
                onClick={() => { onSelectCategory('ebooks'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'ebooks' ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                Digital E-Books & Guides
              </button>
              <button
                onClick={() => { onSelectCategory('web-assets'); setMobileMenuOpen(false); }}
                className={`text-left text-xs py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'web-assets' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-300 hover:bg-zinc-900'}`}
              >
                Web Development Assets
              </button>
            </div>
            
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              {currentUser ? (
                <button onClick={() => { onOpenVault(); setMobileMenuOpen(false); }} className="text-cyan-400 flex items-center gap-1.5 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-[9px] font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span>{currentUser.name.split(' ')[0]}</span>
                </button>
              ) : (
                onOpenLogin && (
                  <button onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }} className="text-cyan-400 flex items-center gap-1.5 cursor-pointer">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )
              )}
              {onOpenWishlist && (
                <button onClick={() => { onOpenWishlist(); setMobileMenuOpen(false); }} className="text-rose-400 flex items-center gap-1.5 cursor-pointer">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist ({wishlistCount})</span>
                </button>
              )}
              <button onClick={() => { onOpenVault(); setMobileMenuOpen(false); }} className="text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                <Layers className="w-3.5 h-3.5" />
                <span>My Vault</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal / Popover */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-950 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-white/10 px-4 py-3 bg-zinc-900/60">
              <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search software keys, AI prompts, video packs, themes..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-zinc-400 hover:text-white mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 bg-zinc-800 rounded border border-white/5"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-3">
              {searchQuery.trim().length > 1 ? (
                searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-zinc-500 px-2">FOUND {searchResults.length} ASSETS</div>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          onSelectProduct(product);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
                            <span className="text-cyan-400 font-mono">{product.categoryName}</span>
                            <span>·</span>
                            <span>{product.deliveryFormat}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">{product.tagline}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono text-cyan-400">
                            {formatPrice(product.priceUSD, currency)}
                          </div>
                          <div className="text-[10px] text-zinc-500 line-through">
                            {formatPrice(product.originalPriceUSD, currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-sm">
                    No digital products found matching &quot;{searchQuery}&quot;
                  </div>
                )
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-3">Popular quick searches:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['VPN Key', 'Master Prompt', 'Next.js 15', '4K Overlays', 'Midjourney v7'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-cyan-400 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
