import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = '',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Alex Vance');
  const [email, setEmail] = useState(initialEmail || 'alex.vance@example.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user: User = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: mode === 'signup' ? name : (email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'Verified User'),
        email: email.trim().toLowerCase(),
        memberSince: 'March 2026',
        tier: 'Pro Creator Member',
      };
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 450);
  };

  const handleQuickDemoLogin = (demoName: string, demoEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const user: User = {
        id: 'USR-8821',
        name: demoName,
        email: demoEmail,
        memberSince: 'January 2026',
        tier: 'Enterprise Key Vault Member',
      };
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to 8cloud' : 'Create 8cloud Account'}
              </h2>
              <div className="text-[11px] text-zinc-400">
                Access your license keys, order history & downloads
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 bg-zinc-900/20 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-zinc-900 border border-white/10 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-zinc-900 border border-white/10 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-zinc-400">Password</label>
              {mode === 'signin' && (
                <span className="text-[11px] text-cyan-400/80 hover:text-cyan-300 cursor-pointer">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-white/10 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In & Access Vault' : 'Create 8cloud Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="text-[11px] font-mono text-zinc-500 text-center uppercase tracking-wide">
              Quick 1-Click Authentication:
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Alex Vance', 'alex.vance@example.com')}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-white/10 hover:border-cyan-400/40 text-xs text-zinc-200 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                  AV
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Alex Vance</div>
                  <div className="text-[10px] text-zinc-400">alex.vance@example.com</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/30">
                1-CLICK SIGN IN
              </span>
            </button>
          </div>

          {/* Trust notice */}
          <div className="pt-2 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>End-to-End Cryptographic Session Protection</span>
          </div>

        </form>

      </div>
    </div>
  );
};
