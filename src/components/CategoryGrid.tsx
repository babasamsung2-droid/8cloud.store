import React from 'react';
import { 
  Key, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  Code, 
  BookMarked,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { CategoryId } from '../types';

interface CategoryGridProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ selectedCategory, onSelectCategory }) => {
  const getIcon = (name: string, color: string) => {
    const isCyan = color === 'cyan';
    const colorClass = isCyan ? 'text-cyan-400' : 'text-purple-400';
    switch (name) {
      case 'Key':
        return <Key className={`w-6 h-6 ${colorClass}`} />;
      case 'Cpu':
        return <Cpu className={`w-6 h-6 ${colorClass}`} />;
      case 'Sparkles':
        return <Sparkles className={`w-6 h-6 ${colorClass}`} />;
      case 'BookOpen':
        return <BookOpen className={`w-6 h-6 ${colorClass}`} />;
      case 'BookMarked':
        return <BookMarked className={`w-6 h-6 ${colorClass}`} />;
      case 'Code':
      default:
        return <Code className={`w-6 h-6 ${colorClass}`} />;
    }
  };

  return (
    <section className="py-12 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-1 tracking-wider uppercase">
              Curated Domains
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Niche Categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            All categories feature instant automated digital delivery, commercial licensing rights, and verified security checksums.
          </p>
        </div>

        {/* 6-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isCyan = cat.accentColor === 'cyan';

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative p-5 rounded-2xl glass-panel transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? isCyan
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                      : 'border-purple-400 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
                }`}
              >
                {/* Subtle corner neon accent glow */}
                <div 
                  className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-60 transition-opacity ${
                    isCyan ? 'bg-cyan-400' : 'bg-purple-500'
                  }`} 
                />

                <div>
                  {/* Top Bar: Icon + Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      isCyan 
                        ? 'bg-cyan-950/40 border-cyan-500/30 group-hover:border-cyan-400' 
                        : 'bg-purple-950/40 border-purple-500/30 group-hover:border-purple-400'
                    }`}>
                      {getIcon(cat.iconName, cat.accentColor)}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {cat.count} assets
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5 leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                {/* Bottom Tag & Click Indication */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className={`font-mono ${isCyan ? 'text-cyan-400' : 'text-purple-400'}`}>
                    {cat.highlightTag}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                    isCyan ? 'text-cyan-400' : 'text-purple-400'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
