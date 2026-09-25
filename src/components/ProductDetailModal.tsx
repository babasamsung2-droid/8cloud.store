import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  Check, 
  Star, 
  ShieldCheck, 
  HardDrive, 
  FileCode, 
  Cpu, 
  ExternalLink,
  Download,
  Heart,
  BookOpen,
  BookMarked,
  Tablet,
  Smartphone
} from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { ProductArtwork } from './ProductArtwork';
import { SAMPLE_REVIEWS } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  currency: CurrencyCode;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  currency,
  onAddToCart,
  onQuickBuy,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const isEbook = product.categoryId === 'ebooks';

  const discountPercent = Math.round(
    ((product.originalPriceUSD - product.priceUSD) / product.originalPriceUSD) * 100
  );

  const reviews = SAMPLE_REVIEWS.filter((r) => r.productId === product.id);

  const handleAdd = () => {
    onAddToCart(product);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl bg-zinc-950 border rounded-3xl shadow-2xl overflow-hidden my-8 ${
        isEbook ? 'border-purple-500/40 shadow-purple-500/10' : 'border-cyan-500/30 shadow-cyan-500/10'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          {/* Left Column: Product Artwork & Technical Specs */}
          <div className="md:col-span-5 p-6 bg-zinc-900/30 flex flex-col justify-between space-y-6">
            <div>
              <ProductArtwork product={product} className="shadow-2xl" />

              {/* Delivery Protocol Badge */}
              <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/70 border border-white/5 space-y-2">
                <div className={`text-[11px] font-mono flex items-center gap-1.5 ${isEbook ? 'text-purple-400' : 'text-cyan-400'}`}>
                  {isEbook ? <BookOpen className="w-3.5 h-3.5 text-purple-400" /> : <Zap className="w-3 h-3 text-cyan-400" />}
                  <span>{isEbook ? 'E-BOOK DELIVERY SPECIFICATION' : 'FULFILLMENT SPECIFICATION'}</span>
                </div>
                <div className="text-xs text-zinc-200 font-medium">
                  {product.deliveryFormat}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {isEbook 
                    ? 'Instant DRM-free download bundle available in My Vault immediately upon order.' 
                    : 'Automated dispatch directly to screen upon payment confirmation.'}
                </div>
              </div>

              {/* E-book File Format Specification Box */}
              {isEbook && (
                <div className="mt-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wide">
                    Supported File Formats:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-purple-500/30 text-purple-200">
                      <div className="font-bold">PDF</div>
                      <div className="text-[9px] text-zinc-400">Vector Print</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-purple-500/30 text-purple-200">
                      <div className="font-bold">EPUB</div>
                      <div className="text-[9px] text-zinc-400">Reflowable</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                      <div className="font-bold">KINDLE</div>
                      <div className="text-[9px] text-zinc-400">.mobi/.azw</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="space-y-2 text-xs text-zinc-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100% Cryptographic Verification Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{isEbook ? '100% DRM-Free Universal Reader Access' : 'Commercial Usage Rights Included'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module & Tabs */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-medium ${isEbook ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {product.categoryName}
                  </span>
                  <span>·</span>
                  <span>{product.version}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-zinc-500">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Highlighted E-book Format Badge Strip */}
              {isEbook && (
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-400/40 text-purple-300 font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-purple-300" />
                    DIGITAL E-BOOK
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300">
                    PDF + EPUB + KINDLE
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    DRM-FREE LICENSE
                  </span>
                </div>
              )}

              {/* Title & Tagline */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {product.longDescription}
              </p>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-xs font-medium pb-1.5 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? isEbook ? 'text-purple-400 border-b-2 border-purple-400 font-semibold' : 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Features & Inclusions
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-xs font-medium pb-1.5 transition-colors cursor-pointer ${
                    activeTab === 'specs'
                      ? isEbook ? 'text-purple-400 border-b-2 border-purple-400 font-semibold' : 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isEbook ? 'Format & Reader Specs' : 'System Compatibility'}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`text-xs font-medium pb-1.5 transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? isEbook ? 'text-purple-400 border-b-2 border-purple-400 font-semibold' : 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Verified Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="py-4 min-h-[140px]">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">
                      {isEbook ? 'What is Included Inside this E-Book:' : 'Core Capabilities:'}
                    </div>
                    <ul className="space-y-2">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isEbook ? 'text-purple-400' : 'text-cyan-400'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {product.includedFiles && (
                      <div className="pt-2">
                        <div className="text-[11px] font-mono text-zinc-500 mb-1">DOWNLOAD INCLUSIONS:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.includedFiles.map((file, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-300 font-mono">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">
                      {isEbook ? 'File Formats & E-Reader Compatibility:' : 'System & Software Requirements:'}
                    </div>

                    {isEbook ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                            <span className="font-semibold text-purple-300 block">PDF Version</span>
                            <p className="text-[11px] text-zinc-400">
                              High-resolution vector formatting designed for Mac, Windows, iPad, and large tablets. Searchable text & clickable table of contents.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                            <span className="font-semibold text-purple-300 block">ePub & Kindle</span>
                            <p className="text-[11px] text-zinc-400">
                              Reflowable typography for Apple Books, Amazon Kindle Scribe/Paperwhite, reMarkable, and Kobo ereaders.
                            </p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-400">
                          <span className="font-semibold text-zinc-200">DRM-Free Terms: </span>
                          Full personal ownership. You can read, highlight, annotate, and sync across any device or ereader without restrictions.
                        </div>
                      </div>
                    ) : (
                      <>
                        {product.systemRequirements && product.systemRequirements.length > 0 ? (
                          <ul className="space-y-2">
                            {product.systemRequirements.map((req, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-400">
                            Universal cloud delivery. Accessible via standard web browser or terminal CLI.
                          </p>
                        )}
                        <div className="mt-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-400">
                          <span className="font-semibold text-zinc-200">License Terms: </span>
                          {product.licenseType}. Includes perpetual personal and client project utilization.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-zinc-200">{rev.author}</span>
                            <span className="text-zinc-500 font-mono">{rev.date}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400">{rev.role}</div>
                          <p className="text-xs text-zinc-300 italic pt-1">
                            &quot;{rev.comment}&quot;
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-4">
                        Rated {product.rating}/5 across {product.reviewsCount} verified purchasers worldwide.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contiguous Purchase Block */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 block">
                    {isEbook ? 'DIGITAL E-BOOK PRICE' : 'INSTANT ASSET PRICE'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-extrabold font-mono text-white ${
                      isEbook ? 'glow-text-purple' : 'glow-text-cyan'
                    }`}>
                      {formatPrice(product.priceUSD, currency)}
                    </span>
                    <span className="text-sm font-mono text-zinc-500 line-through">
                      {formatPrice(product.originalPriceUSD, currency)}
                    </span>
                    {discountPercent > 0 && (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isEbook 
                          ? 'text-purple-300 bg-purple-950/60 border-purple-400/40' 
                          : 'text-cyan-400 bg-cyan-950/60 border-cyan-400/30'
                      }`}>
                        SAVE {discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 block">
                    ⚡ 0-SECOND DELIVERY
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {isEbook ? 'PDF + ePub Instant Download' : 'In Stock & Verified'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                      isWishlisted
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border-white/15'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-400' : ''}`} />
                  </button>
                )}

                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-white/15 hover:border-white/30 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>{addedNotice ? 'Added to Bag! ✓' : 'Add to Bag'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onQuickBuy(product);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-zinc-950 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    isEbook
                      ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 shadow-purple-500/25 hover:shadow-purple-400/40'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/25 hover:shadow-cyan-400/40'
                  }`}
                >
                  {isEbook ? <BookOpen className="w-4 h-4 text-zinc-950" /> : <Zap className="w-4 h-4 fill-zinc-950" />}
                  <span>Instant Quick Checkout</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
