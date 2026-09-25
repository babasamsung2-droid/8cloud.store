import React from 'react';
import { Product } from '../types';

interface ProductArtworkProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({ product, className = '', size = 'md' }) => {
  const { categoryId, name } = product;

  // Render specific cyber graphic based on category
  const renderGraphic = () => {
    switch (categoryId) {
      case 'software-keys':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent" />
            
            {/* Tech circuit lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 150" fill="none">
              <path d="M 20 20 L 60 20 L 80 50 L 140 50 L 160 80 L 180 80" stroke="#00D4FF" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M 180 130 L 130 130 L 110 100 L 70 100 L 50 70 L 20 70" stroke="#00D4FF" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="80" cy="50" r="3" fill="#00D4FF" />
              <circle cx="110" cy="100" r="3" fill="#00D4FF" />
              <circle cx="160" cy="80" r="3" fill="#00D4FF" />
            </svg>

            {/* Central Holographic Key / Chip */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-cyan-400/40 p-3 shadow-lg shadow-cyan-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  KEY_VAL
                </span>
                <span>SHA-256</span>
              </div>

              {/* Holographic Chip Core */}
              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-950 via-zinc-900 to-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                8CLD-••••-••••-••••
              </div>
            </div>
          </div>
        );

      case 'ai-prompts':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent" />

            {/* Neural Net Nodes SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 150" fill="none">
              <line x1="40" y1="40" x2="100" y2="75" stroke="#B026FF" strokeWidth="1" />
              <line x1="40" y1="110" x2="100" y2="75" stroke="#B026FF" strokeWidth="1" />
              <line x1="100" y1="75" x2="160" y2="40" stroke="#00D4FF" strokeWidth="1" />
              <line x1="100" y1="75" x2="160" y2="110" stroke="#00D4FF" strokeWidth="1" />
              <circle cx="40" cy="40" r="4" fill="#B026FF" />
              <circle cx="40" cy="110" r="4" fill="#B026FF" />
              <circle cx="100" cy="75" r="6" fill="#00D4FF" />
              <circle cx="160" cy="40" r="4" fill="#B026FF" />
              <circle cx="160" cy="110" r="4" fill="#B026FF" />
            </svg>

            {/* Central Brain / AI Core Card */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-purple-400/40 p-3 shadow-lg shadow-purple-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  SYSTEM_P
                </span>
                <span>T=0.2</span>
              </div>

              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-950 via-zinc-900 to-purple-500/20 border border-purple-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11a2 2 0 0 0 2 2h1.5a3.5 3.5 0 0 1 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5H16a2 2 0 0 0-2 2v.5a3.5 3.5 0 0 1-7 0V20a2 2 0 0 0-2-2H3.5A3.5 3.5 0 0 1 0 14.5 3.5 3.5 0 0 1 3.5 11H5a2 2 0 0 0 2-2V9.5C5.8 8.8 5 7.5 5 6a4 4 0 0 1 7-4Z" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                &lt;reasoning_loop&gt;
              </div>
            </div>
          </div>
        );

      case 'social-media':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-cyan-500/15 via-purple-500/10 to-transparent" />

            {/* Video Timeline & Waveform SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 150" fill="none">
              <rect x="20" y="25" width="160" height="100" rx="8" stroke="#00D4FF" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 30 75 Q 50 40 70 75 T 110 75 T 150 75 T 170 75" stroke="#B026FF" strokeWidth="1.5" />
            </svg>

            {/* Central Media Asset Card */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-cyan-400/40 p-3 shadow-lg shadow-cyan-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  4K_PRORES
                </span>
                <span>60 FPS</span>
              </div>

              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-950 via-zinc-900 to-purple-500/20 border border-cyan-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                ALPHA_TRANSPARENT
              </div>
            </div>
          </div>
        );

      case 'elearning':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent" />

            {/* Curriculum Tree SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 150" fill="none">
              <circle cx="100" cy="75" r="45" stroke="#B026FF" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="75" r="65" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="20" y1="75" x2="180" y2="75" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.2" />
            </svg>

            {/* Central Masterclass Portal Card */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-purple-400/40 p-3 shadow-lg shadow-purple-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  CURRICULUM
                </span>
                <span>LMS_v2</span>
              </div>

              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-950 via-zinc-900 to-purple-500/20 border border-purple-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                CERTIFIED_2026
              </div>
            </div>
          </div>
        );

      case 'ebooks':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-purple-500/25 via-cyan-500/10 to-transparent" />

            {/* Subtle editorial line grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 150" fill="none">
              <line x1="30" y1="30" x2="170" y2="30" stroke="#B026FF" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="30" y1="50" x2="170" y2="50" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.1" />
              <line x1="30" y1="70" x2="170" y2="70" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.1" />
              <line x1="30" y1="90" x2="170" y2="90" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.1" />
              <line x1="30" y1="110" x2="170" y2="110" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
            </svg>

            {/* Central 3D Digital Book Card */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-purple-400/40 p-3 shadow-lg shadow-purple-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  EBOOK_PDF
                </span>
                <span>EPUB</span>
              </div>

              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-950 via-zinc-900 to-cyan-500/20 border border-purple-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                  <path d="M6 14h7" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                DRM_FREE_TEXT
              </div>
            </div>
          </div>
        );

      case 'web-assets':
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient glow mesh */}
            <div className="absolute inset-0 bg-radial from-cyan-500/20 via-blue-500/10 to-transparent" />

            {/* Syntax Grid SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 150" fill="none">
              <rect x="25" y="25" width="150" height="100" rx="8" stroke="#00D4FF" strokeWidth="1" />
              <line x1="25" y1="45" x2="175" y2="45" stroke="#00D4FF" strokeWidth="1" />
              <circle cx="37" cy="35" r="2.5" fill="#EF4444" />
              <circle cx="47" cy="35" r="2.5" fill="#EAB308" />
              <circle cx="57" cy="35" r="2.5" fill="#22C55E" />
            </svg>

            {/* Central Code Terminal Card */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-zinc-950/90 border border-cyan-400/40 p-3 shadow-lg shadow-cyan-500/20 backdrop-blur-md flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  REACT_19
                </span>
                <span>TS_v7</span>
              </div>

              <div className="my-auto mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-950 via-zinc-900 to-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>

              <div className="text-center font-mono text-[9px] text-zinc-400 tracking-wider">
                npm i @8cloud/ui
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative w-full aspect-4/3 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/5 overflow-hidden transition-all duration-300 ${className}`}
      aria-label={name}
    >
      {renderGraphic()}
      
      {/* Subtle bottom vignette to ensure perfect legibility */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />
    </div>
  );
};
