import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const firebaseOverrides = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
};
const hasOverride = Object.values(firebaseOverrides).some(Boolean);
if (hasOverride && !Object.values(firebaseOverrides).every(value => typeof value === 'string' && value.trim())) {
  throw new Error('Configure all four VITE_FIREBASE_* app settings for the selected project.');
}
const app = initializeApp(hasOverride ? firebaseOverrides : firebaseConfig);
export const firestoreProfilesEnabled = import.meta.env.VITE_FIRESTORE_PROFILES_ENABLED !== 'false';

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, import.meta.env.VITE_FIRESTORE_DATABASE_ID || (hasOverride ? '(default)' : firebaseConfig.firestoreDatabaseId));
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler adhering to Firebase skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client currently offline.');
    }
  }
}
if (firestoreProfilesEnabled) testFirestoreConnection();

export { signInWithPopup, fbSignOut };
