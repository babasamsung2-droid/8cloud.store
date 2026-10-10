import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function assertPrivateBucketMetadata(metadata) {
  if (metadata?.iamConfiguration?.uniformBucketLevelAccess?.enabled !== true ||
      metadata?.iamConfiguration?.publicAccessPrevention !== 'enforced') {
    throw new ApiError(503, 'Private storage must enforce uniform bucket access and Public Access Prevention.');
  }
}
export function requireId(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new ApiError(400, 'Invalid identifier.');
  return value;
}
export function verifySignature(raw, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export function validateCart(input) {
  if (!Array.isArray(input) || !input.length || input.length > 20) throw new ApiError(400, 'Choose 1–20 products.');
  const seen = new Set();
  return input.map(item => {
    const productId = requireId(item?.productId);
    // Ebooks/downloads grant one personal entitlement. Multiple seats are not supported.
    if (item.quantity !== 1 || seen.has(productId)) throw new ApiError(400, 'Only one copy of each digital product is supported.');
    seen.add(productId);
    return { productId, quantity: 1 };
  });
}
export function publicOrder(order) {
  return {
    id: order.id, status: order.status, createdAt: order.createdAt,
    amount: order.amount, currency: order.currency,
    items: order.items.map(item => ({ productId: item.productId, name: item.name, amount: item.amount,
      files: item.files.map(file => ({ id: file.id, name: file.name })) })),
  };
}
export function validateProduct(product) {
  if (!product || product.active !== true || product.kind !== 'download' ||
      !Number.isSafeInteger(product.amount) || product.amount < 100 || product.amount > 100000000 ||
      typeof product.name !== 'string' || !product.name.trim() || !Array.isArray(product.files) || !product.files.length || product.files.length > 10) {
    throw new ApiError(409, 'A product is unavailable.');
  }
  const seen = new Set();
  for (const file of product.files) {
    requireId(file.id);
    if (seen.has(file.id) || typeof file.name !== 'string' || !/^[^\r\n"\\/]{1,180}$/.test(file.name) ||
        typeof file.objectPath !== 'string' || !file.objectPath.startsWith('private-products/') ||
        file.objectPath.includes('..') || !/^[0-9]+$/.test(file.generation || '')) throw new ApiError(409, 'Product files are not configured.');
    seen.add(file.id);
  }
  return product;
}

export function createCommerce({ repo, gateway, storage, keyId, paymentSecret, webhookSecret, enabled, now = () => Date.now() }) {
  function requireEnabled() { if (!enabled) throw new ApiError(503, 'Store payments are not enabled.'); }
  async function owned(uid, id) {
    const order = await repo.getOrder(requireId(id));
    // Do not disclose another buyer's order, including its existence.
    if (!order || order.uid !== uid) throw new ApiError(404, 'Order not found.');
    return order;
  }
  async function reconcile(paymentId, expectedId) {
    requireId(paymentId);
    const payment = await gateway.getPayment(paymentId);
    if (payment?.id !== paymentId) throw new ApiError(409, 'Payment identifier mismatch.');
    if (!payment?.order_id) throw new ApiError(409, 'Payment has no linked order.');
    const order = await repo.findGatewayOrder(payment.order_id);
    if (!order || (expectedId && order.id !== expectedId)) throw new ApiError(409, 'Payment order mismatch.');
    if (payment.amount !== order.amount || payment.currency !== order.currency) throw new ApiError(409, 'Payment amount mismatch.');
    if (payment.amount_refunded > 0 || payment.status === 'refunded') {
      return repo.updatePayment(order.id, payment.id, 'refunded');
    }
    if (payment.status !== 'captured' || payment.captured !== true) throw new ApiError(409, 'Payment is not captured yet. Refresh My Purchases shortly.');
    return repo.updatePayment(order.id, payment.id, 'paid');
  }
  return {
    async createOrder(uid, input) {
      requireEnabled();
      const cart = validateCart(input.items);
      const products = await Promise.all(cart.map(item => repo.getProduct(item.productId)));
      const items = products.map((product, i) => {
        validateProduct(product);
        return { productId: cart[i].productId, name: product.name, amount: product.amount,
          files: product.files.map(({ id, name, objectPath, generation }) => ({ id, name, objectPath, generation })) };
      });
      // Check immutable object generations, and reject Firebase public download tokens.
      await Promise.all(items.flatMap(item => item.files.map(file => storage.assertPrivate(file))));
      const amount = items.reduce((sum, item) => sum + item.amount, 0);
      if (!Number.isSafeInteger(amount) || amount > 100000000) throw new ApiError(400, 'Order total is too large.');
      const id = randomUUID();
      const remote = await gateway.createOrder({ amount, currency: 'INR', receipt: id, partial_payment: false });
      requireId(remote.id);
      if (remote.amount !== amount || remote.currency !== 'INR') throw new ApiError(502, 'Payment gateway order mismatch.');
      const order = { id, uid, amount, currency: 'INR', status: 'pending', gatewayOrderId: remote.id,
        createdAt: new Date(now()).toISOString(), items };
      // Do not show the payment UI unless durable order/mapping writes succeed.
      await repo.createOrder(order);
      return { ...publicOrder(order), keyId, gatewayOrderId: remote.id };
    },
    async verifyPayment(uid, input) {
      requireEnabled();
      const order = await owned(uid, input.orderId);
      requireId(input.paymentId);
      if (!verifySignature(`${order.gatewayOrderId}|${input.paymentId}`, input.signature, paymentSecret)) throw new ApiError(400, 'Payment signature is invalid.');
      return publicOrder(await reconcile(input.paymentId, order.id));
    },
    async webhook(raw, signature) {
      if (!verifySignature(raw, signature, webhookSecret)) throw new ApiError(400, 'Webhook signature is invalid.');
      let event;
      try { event = JSON.parse(raw.toString('utf8')); } catch { throw new ApiError(400, 'Invalid webhook body.'); }
      if (!['payment.captured', 'order.paid', 'payment.refunded', 'refund.processed'].includes(event.event)) return;
      const id = event.payload?.payment?.entity?.id || event.payload?.refund?.entity?.payment_id;
      if (!id) throw new ApiError(400, 'Missing payment identifier.');
      // Fetch authoritative payment state; never grant access from the webhook payload alone.
      await reconcile(id);
    },
    async reconcileOrder(uid, id) {
      const order = await owned(uid, id);
      if (order.status !== 'pending') return publicOrder(order);
      const payments = await gateway.getOrderPayments(order.gatewayOrderId);
      const captured = payments.items?.find(payment => payment.status === 'captured' && payment.captured === true);
      if (!captured) throw new ApiError(409, 'No captured payment yet. Try again shortly if you just paid.');
      return publicOrder(await reconcile(captured.id, order.id));
    },
    async listOrders(uid) { return (await repo.listOrders(uid)).map(publicOrder); },
    async download(uid, orderId, productId, fileId) {
      const order = await owned(uid, orderId);
      requireId(productId); requireId(fileId);
      if (order.status !== 'paid') throw new ApiError(403, 'This order has no active download access.');
      const file = order.items.find(item => item.productId === productId)?.files.find(file => file.id === fileId);
      if (!file) throw new ApiError(404, 'File not included in this order.');
      // Re-check gateway state so a refund also blocks access if its webhook was delayed.
      await reconcile(order.paymentId, order.id);
      const refreshed = await owned(uid, order.id);
      if (refreshed.status !== 'paid') throw new ApiError(403, 'Download access was revoked.');
      await storage.assertPrivate(file);
      // Distributed atomic hourly grant limit, not a browser counter.
      await repo.consumeDownload(order.id, productId, fileId, Math.floor(now() / 3600000), 10);
      const expiresAt = now() + 60000;
      const url = await storage.sign(file, expiresAt);
      return { url, expiresAt: new Date(expiresAt).toISOString() };
    },
  };
}
