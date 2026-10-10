import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { createHash, randomUUID } from 'node:crypto';
import { ApiError, requireId, assertPrivateBucketMetadata } from './core.mjs';

export async function createFirebaseAdapters(env) {
  const app = initializeApp({ credential: applicationDefault(), projectId: env.FIREBASE_PROJECT_ID, storageBucket: env.PRIVATE_STORAGE_BUCKET });
  const db = getFirestore(app, env.FIRESTORE_DATABASE_ID || '(default)');
  const bucket = getStorage(app).bucket();
  const [bucketMetadata] = await bucket.getMetadata();
  assertPrivateBucketMetadata(bucketMetadata);
  let bucketCheckedAt = Date.now();
  const orders = db.collection('commerceOrders');
  const mappings = db.collection('gatewayOrders');
  return {
    auth: getAuth(app),
    repo: {
      async adminProducts() {
        return (await db.collection('commerceProducts').orderBy('__name__').limit(201).get()).docs.map(doc => ({ ...doc.data(), id: doc.id }));
      },
      async adminOrders() {
        return (await orders.orderBy('createdAt', 'desc').limit(100).get()).docs.map(doc => doc.data());
      },
      async saveProduct(product, revision, uid, expectedExists) {
        const { id, ...value } = product;
        const ref = db.collection('commerceProducts').doc(id);
        await db.runTransaction(async tx => {
          const existing = await tx.get(ref);
          if (existing.exists !== expectedExists || (existing.data()?.revision ?? null) !== revision) throw new ApiError(409, 'Product already exists or changed in another session. Reload before saving.');
          const nextRevision = randomUUID();
          tx.set(ref, { ...value, revision: nextRevision, updatedAt: new Date().toISOString(), updatedBy: uid });
          tx.create(db.collection('commerceAudit').doc(), { action: 'product.save', productId: id, active: value.active, uid, revision: nextRevision, at: new Date().toISOString() });
        });
      },
      async listProducts() {
        const snapshot = await db.collection('commerceProducts').where('active', '==', true).limit(200).get();
        const fields = ['tagline', 'description', 'longDescription', 'categoryId', 'categoryName', 'deliveryFormat', 'downloadSize', 'version', 'licenseType', 'features', 'systemRequirements', 'includedFiles', 'tags', 'gradientTheme', 'iconType', 'ebookDetails'];
        return snapshot.docs.map(doc => {
          const value = doc.data();
          const display = Object.fromEntries(fields.filter(key => value.display?.[key] !== undefined).map(key => [key, value.display[key]]));
          return { ...display, id: doc.id, name: value.name, priceUSD: value.amount / 100 / 86.5,
            originalPriceUSD: value.amount / 100 / 86.5, rating: 0, reviewsCount: 0,
            status: 'active', deliveryType: value.display?.categoryId === 'ebooks' ? 'ebook' : 'direct_download' };
        });
      },
      async consumeApi(uid, minute, limit) {
        const ref = db.collection('apiLimits').doc(createHash('sha256').update(uid).digest('hex'));
        await db.runTransaction(async tx => {
          const value = (await tx.get(ref)).data();
          const count = value?.minute === minute ? value.count : 0;
          if (count >= limit) throw new ApiError(429, 'Too many requests. Please wait a minute.');
          tx.set(ref, { minute, count: count + 1 });
        });
      },
      async getProduct(id) { return (await db.collection('commerceProducts').doc(requireId(id)).get()).data(); },
      async getOrder(id) { return (await orders.doc(requireId(id)).get()).data(); },
      async findGatewayOrder(id) {
        const mapping = (await mappings.doc(requireId(id)).get()).data();
        return mapping ? (await orders.doc(mapping.orderId).get()).data() : null;
      },
      async createOrder(order) {
        const batch = db.batch();
        batch.create(orders.doc(order.id), order);
        batch.create(mappings.doc(order.gatewayOrderId), { orderId: order.id });
        await batch.commit();
      },
      async updatePayment(id, paymentId, status) {
        return db.runTransaction(async tx => {
          const ref = orders.doc(id);
          const order = (await tx.get(ref)).data();
          if (!order) throw new ApiError(404, 'Order not found.');
          if (order.paymentId && order.paymentId !== paymentId) throw new ApiError(409, 'Payment conflict.');
          // Duplicate/delayed events cannot restore a refunded or manually revoked entitlement.
          if (['refunded', 'revoked'].includes(order.status) && status === 'paid') return order;
          const next = { ...order, paymentId, status };
          tx.update(ref, { paymentId, status });
          return next;
        });
      },
      async listOrders(uid) {
        const snapshot = await orders.where('uid', '==', uid).orderBy('createdAt', 'desc').limit(100).get();
        return snapshot.docs.map(doc => doc.data());
      },
      async consumeDownload(orderId, productId, fileId, hour, limit) {
        const id = createHash('sha256').update(`${orderId}|${productId}|${fileId}`).digest('hex');
        const ref = db.collection('downloadLimits').doc(id);
        await db.runTransaction(async tx => {
          const order = (await tx.get(orders.doc(orderId))).data();
          const value = (await tx.get(ref)).data();
          if (order?.status !== 'paid') throw new ApiError(403, 'Download access was revoked.');
          const count = value?.hour === hour ? value.count : 0;
          if (count >= limit) throw new ApiError(429, 'Download limit reached. Try again next hour.');
          tx.set(ref, { hour, count: count + 1 });
        });
      },
    },
    storage: {
      async upload(name, bytes, uid) {
        const [metadata] = await bucket.getMetadata();
        assertPrivateBucketMetadata(metadata);
        const id = randomUUID();
        const objectPath = `private-products/${id}/${name}`;
        const object = bucket.file(objectPath);
        await object.save(bytes, { resumable: false, validation: 'crc32c', preconditionOpts: { ifGenerationMatch: 0 },
          metadata: { contentType: 'application/octet-stream', cacheControl: 'private, no-store', metadata: { uploadedBy: uid, sha256: createHash('sha256').update(bytes).digest('hex') } } });
        const [meta] = await object.getMetadata();
        return { id, name, objectPath, generation: String(meta.generation) };
      },
      async assertPrivate(file) {
        if (Date.now() - bucketCheckedAt > 60000) {
          const [metadata] = await bucket.getMetadata();
          assertPrivateBucketMetadata(metadata);
          bucketCheckedAt = Date.now();
        }
        const [meta] = await bucket.file(file.objectPath, { generation: file.generation }).getMetadata();
        if (String(meta.generation) !== file.generation || meta.metadata?.firebaseStorageDownloadTokens) throw new ApiError(409, 'Product file is not private or its version is unavailable.');
        // Bucket controls are checked at startup and at most every minute during file requests.
      },
      async sign(file, expiresAt) {
        const [url] = await bucket.file(file.objectPath, { generation: file.generation }).getSignedUrl({
          version: 'v4', action: 'read', expires: expiresAt,
          responseDisposition: `attachment; filename="${file.name}"`,
          responseType: 'application/octet-stream', queryParams: { generation: file.generation },
        });
        return url;
      },
    },
  };
}

export { createRazorpayGateway } from './razorpay.mjs';
