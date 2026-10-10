import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [email, action] = process.argv.slice(2);
if (!email || !['grant', 'revoke'].includes(action) || !process.env.FIREBASE_PROJECT_ID) throw new Error('Usage: FIREBASE_PROJECT_ID set, then node set-admin.mjs verified-email grant|revoke');
const auth = getAuth(initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID }));
const user = await auth.getUserByEmail(email);
if (action === 'grant' && !user.emailVerified) throw new Error('The administrator must sign in and verify their email first.');
const claims = { ...user.customClaims };
if (action === 'grant') claims.storeAdmin = true;
else delete claims.storeAdmin;
await auth.setCustomUserClaims(user.uid, claims);
if (action === 'revoke') await auth.revokeRefreshTokens(user.uid);
console.log(`Store administrator access ${action === 'grant' ? 'granted' : 'revoked'}. Sign out and sign in again to refresh the session.`);
