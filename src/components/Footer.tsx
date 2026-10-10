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
import { STORE_RUNTIME_CONFIG } from '../config/storeMode';
const FAQ_ITEMS = [
  { question: 'How do I receive my ebook or digital product?', answer: 'Sign in and complete checkout. After the server confirms captured payment, open My Purchases and request your download. If payment confirmation is delayed, use Check payment status.' },
  { question: 'Can I download my purchase again?', answer: 'Active purchases remain in your account. Each request creates a link valid for 60 seconds, with a limit of 10 link requests per file per hour. Refunded or revoked purchases no longer grant new download access.' },
  { question: 'Which file formats will I receive?', answer: 'Check the product description and included files before buying. Each product lists its actual file formats, contents and permitted use.' },
  { question: 'What payment methods are available?', answer: 'Available methods appear in Razorpay checkout. The final charge is shown in INR before payment. Demo mode does not accept purchases.' },
  { question: 'What is the refund policy?', answer: 'Refund terms will be published before live sales begin. Contact support@8cloud.store for purchase assistance.' },
];
import { CategoryId, User } from '../types';

interface FooterProps {
  onSelectCategory: (c: CategoryId) => void;
  onOpenValidator: () => void;
  currentUser?: User | null;
  onOpenAdmin?: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectCategory, 
  onOpenValidator,
  currentUser,
  onOpenAdmin,
  onOpenAdminLogin 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-zinc-950/90 relative z-10">
      
      {/* FAQ Accordion Section */}
      <section id="faq" className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="text-center space-y-2 mb-10">
          <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            Clarity & Transparency
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Payment confirmation, file formats and download access.
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
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
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
                  <div id={`faq-answer-${idx}`} className="px-5 pb-5 text-xs text-zinc-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
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
            <span>STORE UPDATES — COMING SOON</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Get Drop Alerts & Weekly Cryptographic Key Deals
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Email subscriptions are not enabled yet. Your address will not be saved.
          </p>

          <p className="text-xs text-amber-200">Newsletter signup and promotional offers will be available after launch.</p>
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
              Ebooks, guides and useful digital resources. Confirmed purchases are available in your account.
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
              <span className="text-emerald-400">{STORE_RUNTIME_CONFIG.mode === 'production' ? 'Store open' : STORE_RUNTIME_CONFIG.mode === 'test' ? 'Test store' : 'Preview — Payments Disabled'}</span>
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
                <span>X — coming soon</span>
              </li>
              <li>
                <a href="https://github.com/babasamsung2-droid/8cloud.store" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                  GitHub Developers
                </a>
              </li>
              <li>
                <span>Discord — coming soon</span>
              </li>
              <li>
                <a href="mailto:support@8cloud.store" className="hover:text-cyan-300 transition-colors">
                  Contact: support@8cloud.store
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              © {new Date().getFullYear()} 8cloud.store. All rights reserved. Store preview.
            </span>
            {/* Admin button strictly visible only when logged in as babasamsung2@gmail.com */}
            {currentUser?.email?.toLowerCase().trim() === 'babasamsung2@gmail.com' && onOpenAdmin && (
              <>
                <span className="text-zinc-700 hidden sm:inline">·</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors flex items-center gap-1 cursor-pointer bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30"
                  title="Store Administrator Portal (babasamsung2@gmail.com)"
                >
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Admin Panel (Unlocked)</span>
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
