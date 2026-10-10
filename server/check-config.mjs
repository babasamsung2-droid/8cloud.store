import { pathToFileURL } from 'node:url';

export function checkConfig(env) {
  const issues = [];
  for (const key of ['FIREBASE_PROJECT_ID', 'FIRESTORE_DATABASE_ID', 'PRIVATE_STORAGE_BUCKET', 'STOREFRONT_ORIGIN', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET']) {
    if (!env[key]?.trim()) issues.push(`${key}: missing`);
  }
  try { const url = new URL(env.STOREFRONT_ORIGIN); if (url.protocol !== 'https:' || url.origin !== env.STOREFRONT_ORIGIN) throw new Error(); }
  catch { issues.push('STOREFRONT_ORIGIN: use one exact HTTPS origin without a trailing slash'); }
  if (!['test', 'production'].includes(env.PAYMENT_MODE)) issues.push('PAYMENT_MODE: choose test or production');
  if (!env.RAZORPAY_KEY_ID?.startsWith(env.PAYMENT_MODE === 'production' ? 'rzp_live_' : 'rzp_test_')) issues.push('RAZORPAY_KEY_ID: does not match payment mode');
  if (env.PRIVATE_BUCKET_CONFIRMED !== 'true') issues.push('PRIVATE_BUCKET_CONFIRMED: private bucket controls still need verification');
  if (!['true', 'false'].includes(env.COMMERCE_ENABLED)) issues.push('COMMERCE_ENABLED: set explicitly to true or false');
  return issues;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const issues = checkConfig(process.env);
  console.log(issues.length ? `Configuration incomplete:\n${issues.map(s => `- ${s}`).join('\n')}` : 'Local configuration format valid. Cloud permissions, storage and payment integration still need live verification.');
  process.exitCode = issues.length ? 1 : 0;
}
