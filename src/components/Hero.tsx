import React from 'react';
import { 
  ArrowRight, 
  KeyRound, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  CreditCard,
  QrCode
} from 'lucide-react';
import { CategoryId } from '../types';

interface HeroProps {
  onShopNow: () => void;
  onOpenValidator: () => void;
  onSelectCategory: (c: CategoryId) => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onOpenValidator, onSelectCategory }) => {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Cyber Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Copy, Action Buttons */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Quiet Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>THE 2026 DIGITAL ASSET VAULT</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300">0s Delivery</span>
            </div>

            {/* Master Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                Digital Life
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Ultra-modern digital marketplace for authentic Software License Keys, evaluated AI Prompt Blueprints, 4K Creator Kits, and high-performance Web Dev Assets. Immediate cryptographic delivery to your screen and vault.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>

              <button
                onClick={onOpenValidator}
                className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/15 hover:border-cyan-500/40 text-zinc-100 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Verify a License Key</span>
              </button>
            </div>

            {/* Trust Markers & Payment Supported */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Instant 0-Second Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>100% Genuine Cryptographic Keys</span>
              </div>
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>UPI, Cards & Crypto Accepted</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Cyber Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Glow Border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />

              {/* Main Glassmorphic Showcase Box */}
              <div className="relative rounded-2xl bg-zinc-950/85 border border-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                
                {/* Simulated Digital Delivery Card */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-cyan-400">LIVE FULFILLMENT STREAM</div>
                      <div className="text-sm font-semibold text-white">Cloud Delivery Dispatcher</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                    ONLINE (0ms)
                  </span>
                </div>

                {/* Sample Key Generation Preview */}
                <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/5 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>ASSET: CloudShield Enterprise VPN</span>
                    <span className="text-cyan-400">1-YR SEAT</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-cyan-500/20">
                    <span className="text-xs text-zinc-200 tracking-wider">
                      8CLD-VPN9-A8F2-77Q1-X99M
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-400/30">
                      ENCRYPTED
                    </span>
                  </div>
                </div>

                {/* Instant delivery breakdown metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <div className="text-lg font-bold font-mono text-cyan-400">0.0s</div>
                    <div className="text-[10px] text-zinc-500">Wait Time</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <div className="text-lg font-bold font-mono text-purple-400">100%</div>
                    <div className="text-[10px] text-zinc-500">Valid Rate</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <div className="text-lg font-bold font-mono text-white">4.95★</div>
                    <div className="text-[10px] text-zinc-500">Rating</div>
                  </div>
                </div>

                {/* Supported Payment badges inside hero */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5">
                  <span>Direct UPI & Card Integrations:</span>
                  <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded border border-white/5 text-[10px]">UPI</span>
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded border border-white/5 text-[10px]">VISA</span>
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded border border-white/5 text-[10px]">RUPAY</span>
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded border border-white/5 text-[10px]">USDT</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Live Metrics Proof Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              50,000+
            </div>
            <div className="text-xs text-zinc-400">Digital Assets & Keys Delivered</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400 tracking-tight">
              0.00s
            </div>
            <div className="text-xs text-zinc-400">Automated Delivery Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400 tracking-tight">
              99.98%
            </div>
            <div className="text-xs text-zinc-400">First-Time Activation Rate</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              4.95 / 5.0
            </div>
            <div className="text-xs text-zinc-400">Customer Satisfaction (2,400+ reviews)</div>
          </div>
        </div>

      </div>
    </section>
  );
};
