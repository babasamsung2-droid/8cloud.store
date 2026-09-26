import React, { useState, useEffect } from 'react';
import { X, Check, Fingerprint } from 'lucide-react';
import { User, StoreSettings } from '../types';

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

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'passkey'>('signin');
  const [emailOrId, setEmailOrId] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authActionType, setAuthActionType] = useState<'credentials' | 'google' | 'apple' | 'passkey' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [passkeyStep, setPasskeyStep] = useState<'scanning' | 'success'>('scanning');

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

    setIsVerifying(true);
    setAuthActionType('credentials');

    setTimeout(() => {
      const cleanEmail = input.toLowerCase();
      const isAdmin = cleanEmail === adminEmail;

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

    setIsVerifying(true);
    setAuthActionType('credentials');

    setTimeout(() => {
      const cleanEmail = input.toLowerCase();
      const isAdmin = cleanEmail === adminEmail;
      const derivedName = fullName.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail);
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const user: User = {
        id: isAdmin ? 'USR-ADMIN-BABA' : `USR-NEW-${Math.floor(100000 + Math.random() * 900000)}`,
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
    }, 500);
  };

  // Continue with Google
  const handleGoogleLogin = (forceEmail?: string) => {
    setIsVerifying(true);
    setAuthActionType('google');

    setTimeout(() => {
      const emailToUse = (
        forceEmail || 
        initialEmail || 
        (emailOrId.includes('@') ? emailOrId : '') || 
        'customer@gmail.com'
      ).toLowerCase().trim();
      const isAdmin = emailToUse === adminEmail;

      const user: User = {
        id: isAdmin ? 'USR-ADMIN-BABA' : `USR-GGL-${Math.floor(100000 + Math.random() * 900000)}`,
        name: isAdmin ? 'Baba Samsung' : (emailToUse.split('@')[0].charAt(0).toUpperCase() + emailToUse.split('@')[0].slice(1)),
        email: emailToUse,
        memberSince: 'March 2026',
        tier: isAdmin ? 'Store Administrator (Full Control)' : 'Verified Google Customer',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'google',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(isAdmin ? 'Baba Samsung' : emailToUse)}&backgroundColor=${isAdmin ? 'd97706' : '0284c7'}`,
      };

      setIsVerifying(false);
      onLoginSuccess(user);
      onClose();
    }, 450);
  };

  // Continue with Apple
  const handleAppleLogin = () => {
    setIsVerifying(true);
    setAuthActionType('apple');

    setTimeout(() => {
      const user: User = {
        id: `USR-APL-${Math.floor(100000 + Math.random() * 900000)}`,
        name: 'Apple User',
        email: 'apple.user@privaterelay.appleid.com',
        memberSince: 'March 2026',
        tier: 'Verified Apple Customer',
        role: 'customer',
        authProvider: 'email',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Apple+User&backgroundColor=0284c7`,
      };

      setIsVerifying(false);
      onLoginSuccess(user);
      onClose();
    }, 450);
  };

  // Sign in with Passkey
  const handleStartPasskey = () => {
    setMode('passkey');
    setPasskeyStep('scanning');

    setTimeout(() => {
      setPasskeyStep('success');
      setTimeout(() => {
        const isAdmin = emailOrId.toLowerCase().trim() === adminEmail;
        const user: User = {
          id: isAdmin ? 'USR-ADMIN-BABA' : `USR-PASSKEY-${Math.floor(100000 + Math.random() * 900000)}`,
          name: isAdmin ? 'Baba Samsung' : 'Passkey Verified User',
          email: isAdmin ? adminEmail : 'user.passkey@8cloud.store',
          memberSince: 'March 2026',
          tier: isAdmin ? 'Store Administrator (Full Control)' : 'Biometric Verified User',
          role: isAdmin ? 'admin' : 'customer',
          authProvider: 'email',
        };
        onLoginSuccess(user);
        onClose();
      }, 500);
    }, 900);
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
      
      {/* Exact GitHub Styled Sign-In Card */}
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

        {/* Top GitHub Invertocat Icon */}
        <div className="flex justify-center mb-3">
          <svg className="w-12 h-12 text-[#1f2328]" viewBox="0 0 98 96" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
        </div>

        {/* Heading matching the uploaded screenshot */}
        <h1 className="text-[24px] font-light text-center text-[#1f2328] tracking-tight mb-4 font-sans">
          {mode === 'signin' && 'Sign in to GitHub'}
          {mode === 'signup' && 'Sign up to GitHub'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'passkey' && 'Sign in with a passkey'}
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

            {/* Social Authentication Buttons */}
            <div className="space-y-2">
              {/* Continue with Google */}
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

              {/* Continue with Apple */}
              <button
                type="button"
                onClick={() => handleAppleLogin()}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-white hover:bg-[#f6f8fa] active:bg-[#f3f4f6] border border-[#d0d7de] rounded-md text-[14px] font-medium text-[#1f2328] shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isVerifying && authActionType === 'apple' ? (
                  <div className="w-4 h-4 border-2 border-[#1f2328] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current text-black shrink-0" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.96-14.42-7.53-11.45-13.06-23.77-16.59-36.96-3.53-13.18-5.3-25.13-5.3-35.85 0-14.86 3.65-27.13 10.95-36.81 7.3-9.68 16.51-14.61 27.63-14.79 5.03 0 10.38 1.34 16.05 4.02 5.68 2.68 9.54 4.09 11.59 4.22 1.63 0 5.8-1.48 12.51-4.44 6.71-2.96 12.45-4.22 17.21-3.79 12.75 1.09 22.84 5.92 30.28 14.5-11.13 6.74-16.57 16.2-16.32 28.38.25 9.79 4.05 17.93 11.4 24.41 7.35 6.48 16.03 10.23 26.04 11.25-2.23 6.64-4.89 13.09-7.98 19.34zM119.22 33.02c0-7.39 2.66-14.34 7.98-20.85 5.32-6.51 11.9-10.74 19.74-12.17.65 1.52.98 3.15.98 4.89 0 7.39-2.77 14.45-8.31 21.18-5.54 6.73-12.28 10.87-20.21 12.42-.08-1.74-.18-3.56-.18-5.47z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom New to GitHub link box */}
            <div className="border border-[#d0d7de] rounded-md p-4 text-center text-[14px] text-[#1f2328] mt-4">
              New to GitHub?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className="text-[#0969da] hover:underline font-medium cursor-pointer"
              >
                Create an account
              </button>
            </div>

            {/* Passkey Link */}
            <button
              type="button"
              onClick={handleStartPasskey}
              className="text-[#0969da] hover:underline text-[12px] block mx-auto mt-4 cursor-pointer"
            >
              Sign in with a passkey
            </button>
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
                className="text-[#0969da] hover:underline font-medium cursor-pointer"
              >
                Sign in →
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
                className="text-[#0969da] hover:underline font-medium cursor-pointer"
              >
                ← Return to sign in
              </button>
            </div>
          </>
        )}

        {/* 4. PASSKEY MODE */}
        {mode === 'passkey' && (
          <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#ddf4ff] border border-[#54aeff]/30 flex items-center justify-center text-[#0969da]">
              {passkeyStep === 'scanning' ? (
                <Fingerprint className="w-8 h-8 animate-pulse text-[#0969da]" />
              ) : (
                <Check className="w-8 h-8 text-[#1a7f37]" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#1f2328]">
                {passkeyStep === 'scanning' ? 'Verify your Identity' : 'Passkey Verified'}
              </h3>
              <p className="text-xs text-[#656d76]">
                {passkeyStep === 'scanning'
                  ? 'Touch your security key or biometric sensor (Touch ID / Windows Hello)...'
                  : 'Authenticated successfully. Redirecting to 8cloud...'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-xs text-[#0969da] hover:underline cursor-pointer pt-2 inline-block"
            >
              Cancel and return to sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
