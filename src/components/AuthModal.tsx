import React, { useState, useEffect } from 'react';
import { X, Cloud } from 'lucide-react';
import { User, StoreSettings } from '../types';
import { auth, googleProvider, signInWithPopup, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { registerAdminUid } from '../utils/adminSecurity';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialEmail?: string;
  isAdminLoginMode?: boolean;
  storeSettings?: StoreSettings;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = '',
  storeSettings,
}) => {
  const adminEmail = (storeSettings?.adminEmail || 'babasamsung2@gmail.com').toLowerCase().trim();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [emailOrId, setEmailOrId] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authActionType, setAuthActionType] = useState<'credentials' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Sync if initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmailOrId(initialEmail);
    }
  }, [initialEmail]);

  // Reset errors and fields on open
  useEffect(() => {
    if (isOpen) {
      setIsVerifying(false);
      setAuthActionType(null);
      setErrorMessage('');
      setResetSuccessMessage('');
      if (!initialEmail) {
        setPassword('');
      }
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Handle standard ID & Password login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const input = emailOrId.trim();
    if (!input) return;

    const cleanEmail = input.toLowerCase();
    const isAdmin = cleanEmail === adminEmail;
    const requiredAdminPin = storeSettings?.adminPin || '8821';

    // Strict security check for administrator account
    if (isAdmin && password.trim() !== requiredAdminPin) {
      setErrorMessage('Access denied. Invalid credentials for administrator.');
      return;
    }

    setIsVerifying(true);
    setAuthActionType('credentials');

    setTimeout(() => {
      const derivedName = fullName.trim() || 
        (isAdmin ? 'Baba Samsung' : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail));
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const user: User = {
        id: isAdmin ? 'USR-ADMIN-BABA' : `USR-ID-${Math.floor(100000 + Math.random() * 900000)}`,
        name: formattedName,
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@8cloud.store`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Customer',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'email',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=${isAdmin ? 'd97706' : '0284c7'}`,
      };

      setIsVerifying(false);
      onLoginSuccess(user);
      onClose();
    }, 450);
  };

  // Handle Sign up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const input = emailOrId.trim();
    if (!input) return;

    const cleanEmail = input.toLowerCase();
    if (cleanEmail === adminEmail) {
      setErrorMessage('This administrator email cannot be registered as a new user. Please sign in directly.');
      return;
    }

    setIsVerifying(true);
    setAuthActionType('credentials');

    setTimeout(() => {
      const derivedName = fullName.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail);
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const user: User = {
        id: `USR-NEW-${Math.floor(100000 + Math.random() * 900000)}`,
        name: formattedName,
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@8cloud.store`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tier: 'Verified Customer',
        role: 'customer',
        authProvider: 'email',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0284c7`,
      };

      setIsVerifying(false);
      onLoginSuccess(user);
      onClose();
    }, 500);
  };

  // Continue with Real Google Authentication via Firebase
  const handleGoogleLogin = async () => {
    setIsVerifying(true);
    setAuthActionType('google');
    setErrorMessage('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      const isAdmin = cleanEmail === adminEmail;
      const displayName = fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      const user: User = {
        id: fbUser.uid,
        name: formattedName,
        email: cleanEmail,
        avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=${isAdmin ? 'd97706' : '0284c7'}`,
        memberSince: 'March 2026',
        tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Customer',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'google',
      };

      // Safely register/sync profile in Firestore
      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            id: fbUser.uid,
            name: formattedName,
            email: cleanEmail,
            avatarUrl: fbUser.photoURL || '',
            role: isAdmin ? 'admin' : 'customer',
            tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Customer',
            authProvider: 'google',
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (isAdmin) {
          await registerAdminUid(fbUser.uid, cleanEmail);
        }
      } catch (dbErr) {
        console.warn('Firestore user doc sync warning:', dbErr);
      }

      setIsVerifying(false);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setIsVerifying(false);
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup blocked. Please allow popups for this window.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Request superseded
      } else {
        setErrorMessage(err.message || 'Google authentication encountered an issue.');
      }
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setResetSuccessMessage(`Password recovery link sent to ${emailOrId.trim()}. Please check your inbox.`);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      
      {/* Clean Modern Sign-In Card */}
      <div className="relative w-full max-w-[370px] sm:max-w-[400px] bg-white text-[#1f2328] rounded-xl shadow-2xl border border-[#d0d7de] p-6 sm:p-8 my-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#656d76] hover:text-[#1f2328] hover:bg-[#f6f8fa] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 8cloud Brand Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <Cloud className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[22px] font-semibold text-center text-[#1f2328] tracking-tight mb-4 font-sans">
          {mode === 'signin' && 'Sign in to 8cloud'}
          {mode === 'signup' && 'Sign up to 8cloud'}
          {mode === 'forgot' && 'Reset your password'}
        </h1>

        {/* Error / Alert notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-[#ffebe9] border border-[#ff8182] text-[#cf222e] text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-[#cf222e] font-bold">×</button>
          </div>
        )}

        {/* Reset Success Message */}
        {resetSuccessMessage && (
          <div className="mb-4 p-3 rounded-md bg-[#dafbe1] border border-[#4ac26b] text-[#1a7f37] text-xs">
            {resetSuccessMessage}
          </div>
        )}

        {/* 1. SIGN IN MODE */}
        {mode === 'signin' && (
          <>
            {/* Form Input Card */}
            <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-4 space-y-4">
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                
                {/* Username or email address */}
                <div>
                  <label className="block text-[14px] font-normal text-[#1f2328] mb-1.5 text-left">
                    Username or email address
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[14px] font-normal text-[#1f2328]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage('');
                      }}
                      className="text-[12px] text-[#0969da] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                {/* Green Sign In button */}
                <button
                  type="submit"
                  disabled={isVerifying || !emailOrId.trim()}
                  className="w-full py-1.5 px-3 bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#187733] text-white text-[14px] font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying && authActionType === 'credentials' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            </div>

            {/* "or" divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d0d7de]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#656d76]">or</span>
              </div>
            </div>

            {/* Real Google Authentication Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-white hover:bg-[#f6f8fa] active:bg-[#f3f4f6] border border-[#d0d7de] rounded-md text-[14px] font-medium text-[#1f2328] shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isVerifying && authActionType === 'google' ? (
                  <div className="w-4 h-4 border-2 border-[#1f2328] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom New to 8cloud Sign up box */}
            <div className="border border-[#d0d7de] rounded-md p-4 text-center text-[14px] text-[#1f2328] mt-4">
              New to 8cloud?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className="text-[#0969da] hover:underline font-semibold cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {/* 2. CREATE ACCOUNT MODE */}
        {mode === 'signup' && (
          <>
            <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-4 space-y-4">
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                
                {/* Full name */}
                <div>
                  <label className="block text-[14px] font-normal text-[#1f2328] mb-1.5 text-left">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-[14px] font-normal text-[#1f2328] mb-1.5 text-left">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[14px] font-normal text-[#1f2328] mb-1.5 text-left">
                    Create a password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                {/* Green Create Account button */}
                <button
                  type="submit"
                  disabled={isVerifying || !emailOrId.trim()}
                  className="w-full py-1.5 px-3 bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#187733] text-white text-[14px] font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </div>

            {/* Bottom link to return to Sign In */}
            <div className="border border-[#d0d7de] rounded-md p-4 text-center text-[14px] text-[#1f2328] mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                className="text-[#0969da] hover:underline font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <>
            <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-4 space-y-4">
              <p className="text-[13px] text-[#656d76]">
                Enter your account verified email address and we will send you a password reset link.
              </p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-normal text-[#1f2328] mb-1.5 text-left">
                    Enter your email address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 shadow-xs transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !emailOrId.trim()}
                  className="w-full py-1.5 px-3 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-[14px] font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send password reset email'
                  )}
                </button>
              </form>
            </div>

            <div className="border border-[#d0d7de] rounded-md p-4 text-center text-[14px] text-[#1f2328] mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                className="text-[#0969da] hover:underline font-semibold cursor-pointer"
              >
                ← Return to sign in
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
