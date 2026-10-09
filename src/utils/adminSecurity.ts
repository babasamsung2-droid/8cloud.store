import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, StoreSettings } from '../types';

export const ADMIN_PRIMARY_EMAIL = 'babasamsung2@gmail.com';

export async function registerAdminUid(uid: string, email: string): Promise<void> {
  const firebaseUser = auth.currentUser;
  const cleanEmail = email.toLowerCase().trim();

  if (
    !firebaseUser ||
    firebaseUser.uid !== uid ||
    !firebaseUser.emailVerified ||
    cleanEmail !== ADMIN_PRIMARY_EMAIL ||
    firebaseUser.email?.toLowerCase().trim() !== ADMIN_PRIMARY_EMAIL
  ) {
    throw new Error('A verified Firebase administrator session is required.');
  }

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
}

export function getRegisteredAdminUid(): string | null {
  const firebaseUser = auth.currentUser;
  if (
    firebaseUser?.emailVerified &&
    firebaseUser.email?.toLowerCase().trim() === ADMIN_PRIMARY_EMAIL
  ) {
    return firebaseUser.uid;
  }
  return null;
}

export function verifyAdminIdentity(user?: User | null): {
  authorized: boolean;
  uid: string | null;
  reason?: string;
} {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return { authorized: false, uid: null, reason: 'No active Firebase session.' };
  }

  if (!firebaseUser.emailVerified) {
    return { authorized: false, uid: null, reason: 'Administrator email is not verified.' };
  }

  const firebaseEmail = (firebaseUser.email || '').toLowerCase().trim();
  if (firebaseEmail !== ADMIN_PRIMARY_EMAIL) {
    return { authorized: false, uid: null, reason: 'Firebase account is not an administrator.' };
  }

  if (user && user.id !== firebaseUser.uid) {
    return { authorized: false, uid: null, reason: 'Application user does not match the Firebase session.' };
  }

  return { authorized: true, uid: firebaseUser.uid };
}

export function secureAdminMiddleware<Args extends unknown[], ReturnType>(
  currentUser: User | null | undefined,
  actionName: string,
  action: (...args: Args) => ReturnType,
  onUnauthorized?: (reason: string) => void
): (...args: Args) => ReturnType | void {
  return (...args: Args): ReturnType | void => {
    const verification = verifyAdminIdentity(currentUser);

    if (!verification.authorized || !verification.uid) {
      const reason = verification.reason || 'Verified Firebase administrator session required';
      console.error(`[SECURITY] Blocked unauthorized attempt on "${actionName}": ${reason}`);
      onUnauthorized?.(reason);
      return;
    }

    return action(...args);
  };
}

export function validateSettingsModification(
  currentUser: User | null | undefined,
  _newSettings: StoreSettings
): { allowed: boolean; error?: string } {
  const check = verifyAdminIdentity(currentUser);
  if (!check.authorized || !check.uid) {
    return {
      allowed: false,
      error: 'Settings modification rejected: verified Firebase administrator session required.',
    };
  }
  return { allowed: true };
}
