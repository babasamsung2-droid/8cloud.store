import { readFile } from 'node:fs/promises';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { requireId, validateProduct, assertPrivateBucketMetadata } from './core.mjs';

// Run locally with trusted admin credentials. This file never belongs in the browser bundle.
if (!process.argv[2]) throw new Error('Usage: node --env-file=.env import-products.mjs /private/path/products.json');
const app = initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID, storageBucket: process.env.PRIVATE_STORAGE_BUCKET });
const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || '(default)');
const bucket = getStorage(app).bucket();
const [bucketMetadata] = await bucket.getMetadata();
assertPrivateBucketMetadata(bucketMetadata);
const products = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (!Array.isArray(products) || !products.length || products.length > 200) throw new Error('Import 1–200 products.');
const ids = new Set();
for (const product of products) {
  if (typeof product.active !== 'boolean') throw new Error('Product active must be a boolean.');
  requireId(product.id); if (ids.has(product.id)) throw new Error('Duplicate product ID.'); ids.add(product.id);
  validateProduct({ ...product, active: true });
  if (!['ebooks', 'web-assets', 'ai-prompts', 'social-media'].includes(product.display?.categoryId)) throw new Error('Configure a supported digital product category.');
  for (const field of ['tagline', 'description', 'longDescription', 'categoryName', 'deliveryFormat', 'downloadSize', 'version', 'licenseType', 'gradientTheme', 'iconType']) {
    if (typeof product.display?.[field] !== 'string') throw new Error(`Missing display field ${field}.`);
  }
  for (const field of ['features', 'includedFiles', 'tags']) {
    if (!Array.isArray(product.display?.[field]) || product.display[field].some(value => typeof value !== 'string')) throw new Error(`Invalid display field ${field}.`);
  }
  for (const file of product.files) {
    const [meta] = await bucket.file(file.objectPath, { generation: file.generation }).getMetadata();
    if (String(meta.generation) !== file.generation || meta.metadata?.firebaseStorageDownloadTokens) throw new Error('File generation is missing or has a permanent public download token.');
  }
}
const batch = db.batch();
for (const product of products) {
  const { id, ...value } = product;
  batch.set(db.collection('commerceProducts').doc(id), value);
}
await batch.commit();
console.log(`Imported ${products.length} products. Existing products omitted from this import are unchanged.`);
