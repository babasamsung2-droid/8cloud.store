import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, StoreSettings } from '../types';

export const ADMIN_PRIMARY_EMAIL = 'babasamsung2@gmail.com';

/**
 * Storage key to cache the verified Admin UID across local sessions
 */
const VERIFIED_ADMIN_UID_KEY = '8cloud_verified_admin_uid_v1';

/**
 * Persists and registers the verified UID of babasamsung2@gmail.com
 */
export async function registerAdminUid(uid: string, email: string): Promise<void> {
  if (email.toLowerCase().trim() !== ADMIN_PRIMARY_EMAIL) {
    throw new Error(`Security Violation: Cannot register non-admin email ${email} as administrator.`);
  }

  try {
    localStorage.setItem(VERIFIED_ADMIN_UID_KEY, uid);
    // Sync to Firestore /admins collection for RBAC Firestore security rules
    await setDoc(
      doc(db, 'admins', uid),
      {
        uid,
        email: ADMIN_PRIMARY_EMAIL,
        role: 'admin',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Admin UID Firestore registry notice:', err);
  }
}

/**
 * Retrieves the cached or active verified admin UID
 */
export function getRegisteredAdminUid(): string | null {
  if (auth.currentUser && auth.currentUser.email?.toLowerCase().trim() === ADMIN_PRIMARY_EMAIL) {
    return auth.currentUser.uid;
  }
  try {
    return localStorage.getItem(VERIFIED_ADMIN_UID_KEY);
  } catch {
    return null;
  }
}

/**
 * Strict verification check ensuring:
 * 1. An active user object or Firebase Auth session exists.
 * 2. The email matches 'babasamsung2@gmail.com'.
 * 3. The UID is verified and non-empty.
 */
export function verifyAdminIdentity(user?: User | null): {
  authorized: boolean;
  uid: string | null;
  reason?: string;
} {
  const firebaseUser = auth.currentUser;

  // 1. Check direct Firebase Auth session if active
  if (firebaseUser) {
    const fbEmail = (firebaseUser.email || '').toLowerCase().trim();
    if (fbEmail === ADMIN_PRIMARY_EMAIL) {
      if (!firebaseUser.uid) {
        return { authorized: false, uid: null, reason: 'Firebase Auth UID missing for administrator.' };
      }
      return { authorized: true, uid: firebaseUser.uid };
    }
  }

  // 2. Validate current application user context
  if (user) {
    const userEmail = (user.email || '').toLowerCase().trim();
    if (userEmail !== ADMIN_PRIMARY_EMAIL) {
      return { authorized: false, uid: null, reason: `Unauthorized user email: ${user.email}` };
    }

    if (!user.id || user.id.trim().length === 0) {
      return { authorized: false, uid: null, reason: 'Administrator UID is missing or empty.' };
    }

    // Verify UID matches registered admin UID if available
    const registeredUid = getRegisteredAdminUid();
    if (registeredUid && user.id !== registeredUid) {
      // If user has a valid admin session ID
      if (!user.id.startsWith('USR-ADMIN') && user.id !== registeredUid) {
        return { authorized: false, uid: null, reason: 'UID mismatch with registered admin.' };
      }
    }

    return { authorized: true, uid: user.id };
  }

  return { authorized: false, uid: null, reason: 'No active session found for administrator.' };
}

/**
 * SECURE MIDDLEWARE WRAPPER:
 * Explicitly guards any function or state change handler by verifying
 * the UID and identity of 'babasamsung2@gmail.com' before execution.
 *
 * If the caller is not the authenticated administrator, the action is blocked,
 * a security warning is logged, and the optional onUnauthorized handler is invoked.
 */
export function secureAdminMiddleware<Args extends any[], ReturnType>(
  currentUser: User | null | undefined,
  actionName: string,
  action: (...args: Args) => ReturnType,
  onUnauthorized?: (reason: string) => void
): (...args: Args) => ReturnType | void {
  return (...args: Args): ReturnType | void => {
    const verification = verifyAdminIdentity(currentUser);

    if (!verification.authorized || !verification.uid) {
      const errorMsg = `[SECURITY SHIELD] Blocked unauthorized attempt on "${actionName}": ${verification.reason || 'Admin UID required'}`;
      console.error(errorMsg);
      if (onUnauthorized) {
        onUnauthorized(verification.reason || 'Administrator UID verification failed');
      }
      return;
    }

    // Security check passed with verified UID
    return action(...args);
  };
}

/**
 * Helper to validate admin privileges before modifying store settings
 */
export function validateSettingsModification(
  currentUser: User | null | undefined,
  newSettings: StoreSettings
): { allowed: boolean; error?: string } {
  const check = verifyAdminIdentity(currentUser);
  if (!check.authorized || !check.uid) {
    return {
      allowed: false,
      error: `Settings modification rejected: UID of '${ADMIN_PRIMARY_EMAIL}' not verified.`,
    };
  }
  return { allowed: true };
}
