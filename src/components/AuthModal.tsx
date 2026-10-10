import React, { useEffect, useState } from 'react';
import { Cloud, X } from 'lucide-react';
import { User, StoreSettings } from '../types';
import { auth, googleProvider, signInWithPopup, db, firestoreProfilesEnabled } from '../firebase';
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
  storeSettings,
}) => {
  const adminEmail = (storeSettings?.adminEmail || 'babasamsung2@gmail.com').toLowerCase().trim();
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsVerifying(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();

      if (!cleanEmail) {
        throw new Error('Google account did not provide an email address.');
      }

      const isAdmin = cleanEmail === adminEmail;
      const displayName = fbUser.displayName || cleanEmail.split('@')[0] || 'Google Customer';
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const user: User = {
        id: fbUser.uid,
        name: formattedName,
        email: cleanEmail,
        avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=${isAdmin ? 'd97706' : '0284c7'}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tier: isAdmin ? 'Store Administrator' : 'Verified Google Customer',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'google',
      };

      try {
        if (firestoreProfilesEnabled) {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            id: fbUser.uid,
            name: formattedName,
            email: cleanEmail,
            avatarUrl: fbUser.photoURL || '',
            authProvider: 'google',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (isAdmin) {
          await registerAdminUid(fbUser.uid, cleanEmail);
        }
        }
      } catch (dbErr) {
        console.warn('Firestore user profile sync warning:', dbErr);
      }

      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Google sign-in is not authorized for ${window.location.hostname}. Add this hostname in Firebase Console → Authentication → Settings → Authorized domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup blocked. Please allow popups for this website.');
      } else if (err.code !== 'auth/cancelled-popup-request') {
        setErrorMessage(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative my-6 w-full max-w-[400px] rounded-xl border border-[#d0d7de] bg-white p-6 text-[#1f2328] shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-[#656d76] transition-colors hover:bg-[#f6f8fa] hover:text-[#1f2328]"
          aria-label="Close sign in"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-zinc-950 text-cyan-400 shadow-md">
            <Cloud className="h-6 w-6" />
          </div>
        </div>

        <h1 className="mb-2 text-center font-sans text-[22px] font-semibold tracking-tight">
          Sign in to 8cloud
        </h1>
        <p className="mb-5 text-center text-xs leading-relaxed text-[#656d76]">
          Secure Google sign-in is the only enabled authentication method. Passwords and admin PINs are never collected by this storefront.
        </p>

        {errorMessage && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-[#ff8182] bg-[#ffebe9] p-3 text-xs text-[#cf222e]">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage('')} className="font-bold text-[#cf222e]">×</button>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isVerifying}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 py-2.5 text-[14px] font-medium text-[#1f2328] shadow-xs transition-colors hover:bg-[#f6f8fa] disabled:cursor-wait disabled:opacity-50"
        >
          {isVerifying ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1f2328] border-t-transparent" />
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue securely with Google</span>
            </>
          )}
        </button>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
          Admin access still requires a valid Firebase session. Server-side custom claims will be added before live payments are enabled.
        </div>
      </div>
    </div>
  );
};
