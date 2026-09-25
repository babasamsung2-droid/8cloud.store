import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Check } from 'lucide-react';
import { Product, CategoryId, CurrencyCode, DeliveryType } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/products';

interface ProductGridProps {
  products: Product[];
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  currency: CurrencyCode;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (p: Product) => void;
  selectedProductId?: string;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'reviews';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  currency,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  wishlistIds = [],
  onToggleWishlist,
  selectedProductId,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | DeliveryType | 'ebooks'>('all');
  const [activeSearchFilter, setActiveSearchFilter] = useState('');
  const [activeCardId, setActiveCardId] = useState<string | null>(selectedProductId || null);
  
  // Option within digital courses category: 'courses-only' | 'both' | 'ebooks-only'
  const [courseContentMode, setCourseContentMode] = useState<'courses-only' | 'both' | 'ebooks-only'>('both');

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        let matchesCat = false;
        if (selectedCategory === 'all') {
          matchesCat = true;
        } else if (selectedCategory === 'elearning') {
          // User requested ebooks option inside digital courses
          if (courseContentMode === 'courses-only') {
            matchesCat = p.categoryId === 'elearning';
          } else if (courseContentMode === 'ebooks-only') {
            matchesCat = p.categoryId === 'ebooks';
          } else {
            // 'both'
            matchesCat = p.categoryId === 'elearning' || p.categoryId === 'ebooks';
          }
        } else {
          matchesCat = p.categoryId === selectedCategory;
        }

        const matchesDelivery = 
          deliveryFilter === 'all' || 
          p.deliveryType === deliveryFilter ||
          (deliveryFilter === 'ebooks' && p.categoryId === 'ebooks');

        const matchesSearch = 
          !activeSearchFilter ||
          p.name.toLowerCase().includes(activeSearchFilter.toLowerCase()) ||
          p.description.toLowerCase().includes(activeSearchFilter.toLowerCase());

        return matchesCat && matchesDelivery && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceUSD - b.priceUSD;
        if (sortBy === 'price-high') return b.priceUSD - a.priceUSD;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
        return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
      });
  }, [products, selectedCategory, deliveryFilter, activeSearchFilter, sortBy, courseContentMode]);

  return (
    <section id="catalog" className="py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col space-y-4 mb-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1 tracking-wider uppercase">
                Instant Fulfillment Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Featured Digital Catalog
              </h2>
            </div>

            {/* Total count badge */}
            <div className="text-xs font-mono text-zinc-400 self-start md:self-auto">
              SHOWING <span className="text-cyan-400 font-bold">{filteredProducts.length}</span> ASSETS
            </div>
          </div>

          {/* Filter Bar: Segmented controls (functional buttons with handlers) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/10 rounded-xl overflow-x-auto max-w-full">
              <button
                onClick={() => onSelectCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm border border-white/15'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? cat.accentColor === 'cyan'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.id === 'ebooks' ? 'E-Books' : cat.id === 'elearning' ? 'Courses' : cat.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Right Controls: Delivery Type & Sort Dropdowns */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              
              {/* Delivery Type Filter */}
              <div className="relative">
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value as any)}
                  className="appearance-none bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-xs px-3 py-1.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-400"
                  aria-label="Filter delivery type"
                >
                  <option value="all">All Formats</option>
                  <option value="ebooks">E-Books & Field Manuals (PDF/EPUB)</option>
                  <option value="license_key">Software Keys Only</option>
                  <option value="direct_download">Direct Downloads (.zip / PDF)</option>
                  <option value="prompt_bundle">AI Prompt Bundles</option>
                  <option value="access_link">LMS Course Portals</option>
                </select>
                <Filter className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-xs px-3 py-1.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-400"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured / Best Sellers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated (4.9+)</option>
                  <option value="reviews">Most Reviews</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

          </div>

          {/* Sub-bar: Digital Courses & E-Books Option (User requested E-Books option inside Courses) */}
          {selectedCategory === 'elearning' && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-purple-900/50 text-purple-300 font-mono text-[10px]">
                  CURRICULUM FILTER
                </span>
                <span className="text-zinc-300 font-medium">
                  Looking for digital courses or standalone eBooks?
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-950/70 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setCourseContentMode('both')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    courseContentMode === 'both'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All (Courses + eBooks)
                </button>
                <button
                  type="button"
                  onClick={() => setCourseContentMode('courses-only')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    courseContentMode === 'courses-only'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Video Courses
                </button>
                <button
                  type="button"
                  onClick={() => setCourseContentMode('ebooks-only')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    courseContentMode === 'ebooks-only'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  eBooks & Guides
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 4-Column Responsive Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickBuy={onQuickBuy}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                isSelected={activeCardId === product.id}
                onSelectCard={(p) => setActiveCardId((prev) => (prev === p.id ? null : p.id))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl glass-panel border-white/10 p-8">
            <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white mb-2">No matching digital assets found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              Try adjusting your category selection or delivery format filter to view more products.
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
                setDeliveryFilter('all');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
