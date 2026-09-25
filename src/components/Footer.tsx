import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Check, 
  KeyRound, 
  QrCode, 
  Lock 
} from 'lucide-react';
import { FAQ_ITEMS } from '../data/products';
import { CategoryId } from '../types';

interface FooterProps {
  onSelectCategory: (c: CategoryId) => void;
  onOpenValidator: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectCategory, 
  onOpenValidator,
  onOpenAdminLogin 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-zinc-950/90 relative z-10">
      
      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="text-center space-y-2 mb-10">
          <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            Clarity & Transparency
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Instant digital delivery, cryptographic licensing guarantees, and refund protocols.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border-white/5 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter / Instant Voucher Banner */}
      <section className="border-y border-white/5 bg-zinc-900/30 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>INSTANT $10 STORE CREDIT VOUCHER</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Get Drop Alerts & Weekly Cryptographic Key Deals
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Join 32,000+ developers, AI engineers, and creators. We never send spam.
          </p>

          {newsletterSubscribed ? (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-xs text-cyan-300 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You are in! Use code at checkout:</span>
              </div>
              <div className="font-mono text-sm font-bold text-white tracking-wider">
                WELCOME10
              </div>
              <div className="text-[10px] text-zinc-400">10% discount automatically ready for your bag.</div>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-zinc-950 border border-white/10 text-xs text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Unlock Voucher</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Main Footer Links & Brand Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
                  <span className="text-cyan-400 font-extrabold text-xs">8</span>
                </div>
              </div>
              <span className="font-heading">8cloud<span className="text-cyan-400">.store</span></span>
            </a>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The premier digital asset destination for developers, AI builders, and creators. Automated 0-second delivery for Software Keys, Evaluated Prompts, Creator Suites, and Modern Code Starters.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <button 
                onClick={onOpenValidator}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify a Key</span>
              </button>
              <span>·</span>
              <span className="text-emerald-400">Status: All Systems Operational</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-white tracking-wider uppercase">Catalog</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => onSelectCategory('software-keys')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  Software & License Keys
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('ai-prompts')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  AI Prompts & Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('social-media')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  Social Media Content Kits
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('elearning')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  Digital Courses & E-Learning
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('ebooks')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  Digital E-Books & Guides
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('web-assets')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                  Web Development Assets
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-white tracking-wider uppercase">Trust & Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a href="#faq" className="hover:text-cyan-300 transition-colors">
                  Instant Delivery FAQ
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-cyan-300 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-cyan-300 transition-colors">
                  Privacy Policy & Data Security
                </a>
              </li>
              <li>
                <a href="#refunds" className="hover:text-cyan-300 transition-colors">
                  7-Day Activation Guarantee
                </a>
              </li>
              <li>
                <a href="#commercial" className="hover:text-cyan-300 transition-colors">
                  Commercial Licensing Rights
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media & Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-white tracking-wider uppercase">Connect</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                  X (formerly Twitter) · @8cloudstore
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                  GitHub Developers
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                  Discord Community (18k Members)
                </a>
              </li>
              <li>
                <a href="mailto:support@8cloud.store" className="hover:text-cyan-300 transition-colors">
                  24/7 Support: support@8cloud.store
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              © {new Date().getFullYear()} 8cloud.store Inc. All rights reserved. Zero-latency digital delivery.
            </span>
            {onOpenAdminLogin && (
              <>
                <span className="text-zinc-700 hidden sm:inline">·</span>
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="text-[10px] text-zinc-600 hover:text-amber-400 font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  title="Store Administrator Portal"
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>Admin Access</span>
                </button>
              </>
            )}
          </div>

          {/* Payment rails badge */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">UPI</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">VISA</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">RUPAY</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">APPLE PAY</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">CRYPTO</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
