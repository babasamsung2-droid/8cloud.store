import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Zap, 
  Star, 
  Eye, 
  Heart, 
  BookOpen, 
  BookMarked, 
  Check, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  DownloadCloud,
  FileCheck2,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { ProductArtwork } from './ProductArtwork';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
  isSelected?: boolean;
  onSelectCard?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  isWishlisted = false,
  onToggleWishlist,
  isSelected = false,
  onSelectCard,
}) => {
  const [showFormatsExpanded, setShowFormatsExpanded] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPriceUSD - product.priceUSD) / product.originalPriceUSD) * 100
  );

  const isEbook = product.categoryId === 'ebooks';
  const isFormatsVisible = isSelected || showFormatsExpanded;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking directly on interactive buttons, don't trigger select
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (onSelectCard) {
      onSelectCard(product);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative rounded-2xl glass-panel p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
        isSelected
          ? isEbook
            ? 'border-purple-400 bg-purple-950/25 shadow-xl shadow-purple-500/25 ring-2 ring-purple-400/60'
            : 'border-cyan-400 bg-cyan-950/25 shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/60'
          : isEbook
            ? 'border-purple-500/20 hover:border-purple-500/60 hover:shadow-purple-500/15 hover:bg-zinc-900/60'
            : 'border-white/10 hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:bg-zinc-900/60'
      }`}
    >
      
      {/* Top Part: Thumbnail & Badges */}
      <div>
        {/* Artwork Thumbnail Container */}
        <div 
          onClick={() => onSelectProduct(product)}
          className="relative cursor-pointer overflow-hidden rounded-xl mb-3.5 group/thumb"
        >
          <ProductArtwork product={product} />

          {/* Distinguished E-Book Badge or Standard Delivery */}
          {isEbook ? (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-purple-950/95 backdrop-blur-md border border-purple-400/70 text-[10px] font-mono text-purple-200 font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/60">
              <BookOpen className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span className="tracking-wide">E-BOOK</span>
              <span className="text-purple-400/60">|</span>
              <span className="text-[9px] text-zinc-300 font-normal">PDF/EPUB</span>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-cyan-400/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 shadow-sm">
              <Zap className="w-2.5 h-2.5 text-cyan-400" />
              <span>0s Delivery</span>
            </div>
          )}

          {/* Discount Tag */}
          {discountPercent > 0 && (
            <div className={`absolute top-2.5 ${isEbook ? 'left-36 sm:left-40' : 'left-24'} px-1.5 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-400/40 text-[10px] font-mono text-purple-300 font-bold`}>
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Heart Icon Button */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-950/90 border-rose-500/60 text-rose-400 shadow-lg shadow-rose-500/30 scale-105'
                  : 'bg-zinc-950/70 border-white/15 text-zinc-400 hover:text-rose-400 hover:border-rose-400/40 hover:scale-110'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                  isWishlisted ? 'fill-rose-500 text-rose-400' : ''
                }`}
              />
            </button>
          )}

          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/thumb:opacity-100 backdrop-blur-xs transition-opacity flex items-center justify-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-xs text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
              <Eye className={`w-3.5 h-3.5 ${isEbook ? 'text-purple-400' : 'text-cyan-400'}`} />
              Quick View
            </span>
          </div>
        </div>

        {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1.5">
          <span className={`font-medium flex items-center gap-1 ${isEbook ? 'text-purple-300' : 'text-cyan-400/90'}`}>
            {isEbook ? (
              <BookMarked className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            ) : null}
            <span>{product.categoryName}</span>
          </span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>{product.version}</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span className="flex items-center gap-0.5 text-amber-400 font-mono">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onSelectProduct(product)}
          className={`text-base font-bold text-white transition-colors line-clamp-1 cursor-pointer ${
            isEbook ? 'group-hover:text-purple-300' : 'group-hover:text-cyan-300'
          }`}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Short Tagline */}
        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
          {product.tagline}
        </p>

        {/* E-BOOK EXCLUSIVE: File Format Information Display */}
        {isEbook && (
          <div className="mt-3">
            {/* Format Preview & Selection Toggle Strip */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowFormatsExpanded(!showFormatsExpanded);
                if (onSelectCard) onSelectCard(product);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[11px] font-mono ${
                isFormatsVisible
                  ? 'bg-purple-950/50 border-purple-400/60 shadow-md shadow-purple-950/40 text-purple-200'
                  : 'bg-zinc-950/60 border-purple-500/20 hover:border-purple-400/50 text-zinc-300'
              }`}
              title="Click to view file format details (PDF/EPUB/Kindle)"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-400" />
                  Format:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-400/50 text-purple-200 font-bold text-[10px]">
                  PDF
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-400/50 text-purple-200 font-bold text-[10px]">
                  EPUB
                </span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/15 text-zinc-300 text-[10px]">
                  MOBI
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-purple-300 shrink-0 ml-1">
                <span>{isFormatsVisible ? 'Hide' : 'Details'}</span>
                {isFormatsVisible ? (
                  <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>
            </div>

            {/* Expanded Detailed File Format Drawer when selected */}
            {isFormatsVisible && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 animate-fadeIn text-[10px] font-mono">
                <div className="flex items-center justify-between text-purple-300 font-bold border-b border-purple-500/20 pb-1.5">
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                    Universal Format Specs
                  </span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> DRM-Free
                  </span>
                </div>

                {/* Formats Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-zinc-300">
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-purple-500/20 flex flex-col">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <FileText className="w-3 h-3 text-purple-400" /> PDF Edition
                    </span>
                    <span className="text-[9px] text-zinc-400 mt-0.5">High-Res Print & Diagrams</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-purple-500/20 flex flex-col">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <Tablet className="w-3 h-3 text-purple-400" /> EPUB Edition
                    </span>
                    <span className="text-[9px] text-zinc-400 mt-0.5">Apple Books & Kobo</span>
                  </div>
                </div>

                {/* Reader compatibility strip */}
                <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1 border-t border-purple-500/15">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-zinc-500" />
                    <span>Kindle Scribe & Mobile</span>
                  </span>
                  {product.downloadSize && (
                    <span className="text-purple-300 flex items-center gap-0.5 font-bold">
                      <DownloadCloud className="w-3 h-3 text-purple-400" />
                      {product.downloadSize}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Part: Pricing & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
        {/* Pricing Row */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-extrabold font-mono text-white tracking-tight ${
              isEbook ? 'glow-text-purple' : 'glow-text-cyan'
            }`}>
              {formatPrice(product.priceUSD, currency)}
            </span>
            <span className="text-xs font-mono text-zinc-500 line-through">
              {formatPrice(product.originalPriceUSD, currency)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {isEbook 
              ? 'Instant DRM-Free eBook' 
              : product.deliveryType === 'license_key' 
              ? 'License Key' 
              : 'Direct File'}
          </span>
        </div>

        {/* Action Buttons: Quick Buy & Add to Cart */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2 px-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-white/20 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            <span>Add</span>
          </button>

          <button
            onClick={() => onQuickBuy(product)}
            className={`w-full py-2 px-3 rounded-lg text-zinc-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              isEbook
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 shadow-purple-500/25 hover:shadow-purple-400/40'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20 hover:shadow-cyan-400/40'
            }`}
            title="Instant checkout for this asset"
          >
            {isEbook ? <BookOpen className="w-3.5 h-3.5 text-zinc-950" /> : <Zap className="w-3.5 h-3.5 fill-zinc-950" />}
            <span>Quick Buy</span>
          </button>
        </div>
      </div>

    </div>
  );
};

