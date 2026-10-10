import { createHash, randomUUID } from 'node:crypto';
import { ApiError, requireId } from './core.mjs';

export function createSupabaseAdapters(client, bucketName = 'paid-originals') {
  async function result(query) {
    const { data, error } = await query;
    if (error) {
      const status = { P0002: 409, P0003: 403, P0004: 429, '23505': 409 }[error.code];
      throw new ApiError(status || 503, status ? ({ 409: 'Record changed or already exists. Reload and try again.', 403: 'Download access was revoked.', 429: 'Rate limit reached. Try again later.' }[status]) : 'Store data is temporarily unavailable.');
    }
    return data;
  }
  const table = name => client.from(`commerce_${name}`);
  const get = async (name, column, id) => (await result(table(name).select('data').eq(column, id).maybeSingle()))?.data;
  const list = async query => (await result(query)).map(row => row.data);
  const bucket = client.storage.from(bucketName);
  async function privateBucket() {
    const data = await result(client.storage.getBucket(bucketName));
    if (data?.public !== false) throw new ApiError(503, 'Product storage is not private.');
  }
  const storage = {
    checkHealth: privateBucket,
    async assertPrivate(file) {
      await privateBucket();
      const record = await result(table('assets').select('*').eq('object_path', file.objectPath).maybeSingle());
      const info = await result(bucket.info(file.objectPath));
      if (!record || record.generation !== file.generation || record.object_id !== info?.id || record.last_modified !== info?.lastModified) throw new ApiError(409, 'The purchased file version is unavailable.');
    },
    async upload(name, bytes) {
      await privateBucket();
      const id = randomUUID(); const generation = String(Date.now());
      const objectPath = `private-products/${id}/${name}`;
      await result(bucket.upload(objectPath, bytes, { contentType: 'application/octet-stream', upsert: false, cacheControl: '0' }));
      const info = await result(bucket.info(objectPath));
      if (!info?.id || !info.lastModified) throw new ApiError(503, 'Storage did not return immutable file metadata.');
      await result(table('assets').insert({ object_path: objectPath, generation, object_id: info.id, last_modified: info.lastModified, sha256: createHash('sha256').update(bytes).digest('hex') }));
      return { id, name, objectPath, generation };
    },
    async sign(file, expiresAt) {
      await storage.assertPrivate(file);
      const seconds = Math.max(1, Math.min(60, Math.floor((expiresAt - Date.now()) / 1000)));
      return (await result(bucket.createSignedUrl(file.objectPath, seconds, { download: file.name }))).signedUrl;
    },
  };
  return { storage, repo: {
    async listProducts() {
      const rows = await result(table('products').select('id,data').eq('data->>active', 'true').order('id').limit(200));
      const fields = ['tagline','description','longDescription','categoryId','categoryName','deliveryFormat','downloadSize','version','licenseType','features','systemRequirements','includedFiles','tags','gradientTheme','iconType','ebookDetails'];
      return rows.map(({ id, data: value }) => ({ ...Object.fromEntries(fields.filter(key => value.display?.[key] !== undefined).map(key => [key, value.display[key]])),
        id, name: value.name, priceUSD: value.amount / 100 / 86.5, originalPriceUSD: value.amount / 100 / 86.5, rating: 0, reviewsCount: 0, status: 'active', deliveryType: value.display?.categoryId === 'ebooks' ? 'ebook' : 'direct_download' }));
    },
    async adminProducts() { return (await result(table('products').select('id,data').order('id').limit(201))).map(row => ({ ...row.data, id: row.id })); },
    adminOrders: () => list(table('orders').select('data').order('created_at', { ascending: false }).limit(100)),
    async saveProduct(product, revision, uid, expectedExists) {
      const { id, ...data } = product;
      await result(client.rpc('commerce_save_product', { p_id: id, p_data: { ...data, revision: randomUUID(), updatedBy: uid, updatedAt: new Date().toISOString() }, p_revision: revision, p_existing: expectedExists, p_uid: uid }));
    },
    getProduct: id => get('products', 'id', requireId(id)),
    getOrder: id => get('orders', 'id', requireId(id)),
    findGatewayOrder: id => get('orders', 'gateway_order_id', requireId(id)),
    createOrder: order => result(table('orders').insert({ id: order.id, uid: order.uid, gateway_order_id: order.gatewayOrderId, created_at: order.createdAt, data: order })),
    updatePayment: (id, paymentId, status) => result(client.rpc('commerce_update_payment', { p_id: id, p_payment: paymentId, p_status: status })),
    listOrders: uid => list(table('orders').select('data').eq('uid', uid).order('created_at', { ascending: false }).limit(100)),
    consumeApi: (uid, minute, limit) => result(client.rpc('commerce_consume_limit', { p_id: `api:${uid}`, p_window: minute, p_limit: limit, p_order: null })),
    consumeDownload: (order, product, file, hour, limit) => result(client.rpc('commerce_consume_limit', { p_id: `download:${order}:${product}:${file}`, p_window: hour, p_limit: limit, p_order: order })),
  } };
}

// Firebase Google sign-in remains on its no-billing plan; each API call verifies both JWT and current account state.
export function createFirebaseRestAuth({ projectId, apiKey, adminUid, verifyJwt, request = fetch }) {
  return { async verifyIdToken(token) {
    if (!projectId || !apiKey) throw new Error('Firebase sign-in is not configured.');
    const { payload } = await verifyJwt(token);
    if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}` || !payload.sub || !Number.isFinite(payload.auth_time)) throw new Error('Invalid Firebase session.');
    const response = await request(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Firebase session check failed.');
    const user = (await response.json()).users?.[0];
    if (!user || user.localId !== payload.sub || user.disabled || !/^\d+$/.test(user.validSince || '') || payload.auth_time < Number(user.validSince) || user.tenantId) throw new Error('Session is revoked, disabled or unsupported.');
    return { uid: user.localId, email: user.email, email_verified: user.emailVerified === true,
      storeAdmin: Boolean(adminUid && user.localId === adminUid && user.emailVerified === true && user.email?.toLowerCase() === 'babasamsung2@gmail.com') };
  } };
}
