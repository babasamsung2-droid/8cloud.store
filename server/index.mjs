import { createCommerce } from './core.mjs';
import { createFirebaseAdapters, createRazorpayGateway } from './adapters.mjs';
import { createApi } from './http.mjs';
import { createAdmin } from './admin.mjs';

const env = process.env;
for (const name of ['FIREBASE_PROJECT_ID', 'PRIVATE_STORAGE_BUCKET', 'STOREFRONT_ORIGIN', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET']) {
  if (!env[name]) throw new Error(`Configure server environment variable ${name}.`);
}
const origin = new URL(env.STOREFRONT_ORIGIN);
if (origin.protocol !== 'https:' || origin.origin !== env.STOREFRONT_ORIGIN) throw new Error('STOREFRONT_ORIGIN must be an exact HTTPS origin.');
if (!['test', 'production'].includes(env.PAYMENT_MODE)) throw new Error('PAYMENT_MODE must be test or production.');
const prefix = env.PAYMENT_MODE === 'production' ? 'rzp_live_' : 'rzp_test_';
if (!env.RAZORPAY_KEY_ID.startsWith(prefix)) throw new Error('Razorpay key does not match PAYMENT_MODE.');
// The operator must explicitly confirm bucket controls before any downloads or sales.
if (env.PRIVATE_BUCKET_CONFIRMED !== 'true') throw new Error('Enforce private bucket controls and set PRIVATE_BUCKET_CONFIRMED=true.');
const adapters = await createFirebaseAdapters(env);
const commerce = createCommerce({ ...adapters, gateway: createRazorpayGateway(env), keyId: env.RAZORPAY_KEY_ID,
  paymentSecret: env.RAZORPAY_KEY_SECRET, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET, enabled: env.COMMERCE_ENABLED === 'true' });
const admin = createAdmin({ ...adapters, paymentMode: env.PAYMENT_MODE, enabled: env.COMMERCE_ENABLED === 'true' });
const server = createApi({ commerce, admin, ...adapters, allowedOrigin: env.STOREFRONT_ORIGIN });
server.requestTimeout = 120000; // Allow bounded private uploads on slower connections.
server.headersTimeout = 10000;
server.listen(Number(env.PORT || 8080), '0.0.0.0', () => console.log('Commerce API listening.'));
