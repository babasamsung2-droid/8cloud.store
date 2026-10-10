import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.2.12';
import { createCommerce } from '../../../server/core.mjs';
import { createAdmin } from '../../../server/admin.mjs';
import { createFetchApi } from '../../../server/fetch-api.mjs';
import { createSupabaseAdapters, createFirebaseRestAuth } from '../../../server/supabase-adapters.mjs';
import { createRazorpayGateway } from '../../../server/razorpay.mjs';

const required = (key: string) => { const value = Deno.env.get(key); if (!value) throw new Error(`Configure ${key}`); return value; };
const projectId = required('FIREBASE_PROJECT_ID');
const origin = required('STOREFRONT_ORIGIN');
if (new URL(origin).origin !== origin || !origin.startsWith('https://')) throw new Error('Use an exact HTTPS storefront origin.');
const env = { RAZORPAY_KEY_ID: Deno.env.get('RAZORPAY_KEY_ID') || '', RAZORPAY_KEY_SECRET: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
  RAZORPAY_WEBHOOK_SECRET: Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '' };
const enabled = Deno.env.get('COMMERCE_ENABLED') === 'true';
const paymentMode = Deno.env.get('PAYMENT_MODE') || 'test';
if (!['test','production'].includes(paymentMode)) throw new Error('Invalid payment mode.');
if (enabled && (!env.RAZORPAY_KEY_ID.startsWith(paymentMode === 'test' ? 'rzp_test_' : 'rzp_live_') || !env.RAZORPAY_KEY_SECRET || !env.RAZORPAY_WEBHOOK_SECRET)) throw new Error('Configure matching Razorpay credentials before enabling payments.');
const client = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
const adapters = createSupabaseAdapters(client);
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
// Permit health/catalog setup before sign-in is configured; protected routes fail closed.
const auth = createFirebaseRestAuth({ projectId, apiKey: Deno.env.get('FIREBASE_WEB_API_KEY') || '', adminUid: Deno.env.get('STORE_ADMIN_UID') || '',
  verifyJwt: (token: string) => jwtVerify(token, keys, { algorithms: ['RS256'], issuer: `https://securetoken.google.com/${projectId}`, audience: projectId, requiredClaims: ['exp','iat','sub','auth_time'] }) });
const commerce = createCommerce({ ...adapters, gateway: createRazorpayGateway(env), keyId: env.RAZORPAY_KEY_ID,
  paymentSecret: env.RAZORPAY_KEY_SECRET, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET, enabled });
const admin = createAdmin({ ...adapters, paymentMode, enabled });
const options = { ...adapters, auth, commerce, admin, allowedOrigin: origin };
const shortRoute = createFetchApi(options, '/commerce');
const longRoute = createFetchApi(options, '/functions/v1/commerce');
Deno.serve(request => new URL(request.url).pathname.startsWith('/functions/v1/') ? longRoute(request) : shortRoute(request));
