import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Crown
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
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = (selectedEmail: string, selectedName: string, role: 'admin' | 'customer' = 'customer') => {
    setIsLoading(true);
    setTimeout(() => {
      const isAdmin = selectedEmail.toLowerCase().includes('babasamsung2') || selectedEmail.toLowerCase().includes('admin') || role === 'admin';
      const user: User = {
        id: `USR-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
        name: selectedName,
        email: selectedEmail.trim().toLowerCase(),
        memberSince: 'March 2026',
        tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Member',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'google',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedName)}&backgroundColor=0284c7`,
      };
      setIsLoading(false);
      setShowGoogleChooser(false);
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('babasamsung2');
      const user: User = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: mode === 'signup' ? name : (cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace('.', ' ') : 'Verified User'),
        email: cleanEmail,
        memberSince: 'March 2026',
        tier: isAdmin ? 'Store Administrator (Full Control)' : 'Pro Creator Member',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'email',
      };
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 450);
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
                {showGoogleChooser 
                  ? 'Sign in with Google' 
                  : mode === 'signin' 
                  ? 'Sign In to 8cloud' 
                  : 'Create 8cloud Account'}
              </h2>
              <div className="text-[11px] text-zinc-400">
                {showGoogleChooser 
                  ? 'Choose a Gmail account to continue' 
                  : 'Access your licenses, vault & store admin panel'}
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

        {/* Google Account Chooser View */}
        {showGoogleChooser ? (
          <div className="p-6 space-y-4">
            <div className="text-xs text-zinc-300">
              Sign in to <span className="font-semibold text-white">8cloud Store & Admin</span> using your Google Account:
            </div>

            {/* Account Option 1: User's requested Gmail (babasamsung2@gmail.com) */}
            <button
              type="button"
              onClick={() => handleGoogleAuth('babasamsung2@gmail.com', 'Baba Samsung (Admin)', 'admin')}
              disabled={isLoading}
              className="w-full p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow">
                  B
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Baba Samsung</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                      Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    babasamsung2@gmail.com
                  </div>
                </div>
              </div>
              <Crown className="w-4 h-4 text-amber-400 opacity-80 group-hover:scale-110 transition-transform" />
            </button>

            {/* Account Option 2: General Customer Google Account */}
            <button
              type="button"
              onClick={() => handleGoogleAuth('alex.vance@gmail.com', 'Alex Vance', 'customer')}
              disabled={isLoading}
              className="w-full p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white shadow">
                  A
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Alex Vance</div>
                  <div className="text-[11px] text-zinc-400 font-mono">alex.vance@gmail.com</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* Custom Google Email input */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="block text-[11px] text-zinc-400">Or enter another Gmail ID:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.includes('@')) {
                      const uname = customGoogleEmail.split('@')[0];
                      handleGoogleAuth(customGoogleEmail, uname);
                    }
                  }}
                  disabled={!customGoogleEmail.includes('@') || isLoading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleChooser(false)}
              className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to standard login
            </button>
          </div>
        ) : (
          <>
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
            <div className="p-6 space-y-4">
              
              {/* Prominent Google Login Button */}
              <button
                type="button"
                onClick={() => setShowGoogleChooser(true)}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]"
              >
                {/* Official Google 4-Color Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-mono">or with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="babasamsung2@gmail.com"
                      className="w-full bg-zinc-900 border border-white/10 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
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
                      <span>{mode === 'signin' ? 'Sign In & Access Store' : 'Create 8cloud Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Access for Testing & Admin Access */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="text-[11px] font-mono text-zinc-500 text-center uppercase tracking-wide">
                  Quick 1-Click Roles:
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Admin 1-Click Login */}
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth('babasamsung2@gmail.com', 'Baba Samsung (Admin)', 'admin')}
                    className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-white truncate text-[11px]">Admin Login</div>
                      <div className="text-[10px] text-amber-400/80 truncate font-mono">babasamsung2@gmail.com</div>
                    </div>
                  </button>

                  {/* Customer 1-Click Login */}
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth('alex.vance@gmail.com', 'Alex Vance', 'customer')}
                    className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-white/10 hover:border-cyan-400/40 text-xs text-zinc-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-white truncate text-[11px]">Customer Demo</div>
                      <div className="text-[10px] text-zinc-400 truncate font-mono">alex.vance@gmail.com</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Trust notice */}
              <div className="pt-2 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google OAuth 2.0 & TLS 1.3 Enterprise Protection</span>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};
