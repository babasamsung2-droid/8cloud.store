import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createCommerce, verifySignature, validateCart, validateProduct, assertPrivateBucketMetadata } from '../core.mjs';

const secret = 'test-only-payment-secret';
const webhookSecret = 'test-only-webhook-secret';
const signature = (raw, key = secret) => createHmac('sha256', key).update(raw).digest('hex');
function setup() {
  const orders = new Map(); const grants = new Map(); const payments = new Map();
  let created = 0; let signed = 0;
  const product = { active: true, kind: 'download', name: 'Ebook', amount: 29900,
    files: [{ id: 'pdf', name: 'ebook.pdf', objectPath: 'private-products/book/v1.pdf', generation: '123' }] };
  const repo = {
    getProduct: async () => product,
    createOrder: async order => orders.set(order.id, structuredClone(order)),
    getOrder: async id => structuredClone(orders.get(id)),
    findGatewayOrder: async id => structuredClone([...orders.values()].find(order => order.gatewayOrderId === id)),
    updatePayment: async (id, paymentId, status) => {
      const order = orders.get(id);
      if (order.paymentId && order.paymentId !== paymentId) throw new Error('conflict');
      if (!(['refunded', 'revoked'].includes(order.status) && status === 'paid')) Object.assign(order, { status, paymentId });
      return structuredClone(order);
    },
    listOrders: async uid => [...orders.values()].filter(order => order.uid === uid),
    consumeDownload: async (id, productId, fileId, hour, limit) => {
      const key = `${id}|${hour}`; const count = grants.get(key) || 0;
      if (count >= limit) throw new Error('limit');
      grants.set(key, count + 1);
    },
  };
  const gateway = {
    createOrder: async input => ({ ...input, id: `order_${++created}` }),
    getPayment: async id => structuredClone(payments.get(id)),
    getOrderPayments: async orderId => ({ items: [...payments.values()].filter(payment => payment.order_id === orderId) }),
  };
  const storage = { assertPrivate: async () => {}, sign: async () => { signed++; return 'https://storage.example/signed'; } };
  const commerce = createCommerce({ repo, gateway, storage, keyId: 'rzp_test_public', paymentSecret: secret, webhookSecret, enabled: true, now: () => 100000 });
  async function purchase() {
    const order = await commerce.createOrder('buyer', { items: [{ productId: 'book', quantity: 1 }], amount: 1, discount: 99999 });
    payments.set('pay_1', { id: 'pay_1', order_id: order.gatewayOrderId, amount: 29900, currency: 'INR', status: 'captured', captured: true, amount_refunded: 0 });
    return order;
  }
  return { commerce, purchase, orders, payments, product, repo, storage, gateway, getSigned: () => signed };
}

test('cart rejects empty, excessive, duplicate, path injection and multiple copies', () => {
  for (const items of [[], [{ productId: '../book', quantity: 1 }], [{ productId: 'book', quantity: 2 }],
    [{ productId: 'book', quantity: 1 }, { productId: 'book', quantity: 1 }], Array.from({ length: 21 }, (_, i) => ({ productId: `p${i}`, quantity: 1 }))]) {
    assert.throws(() => validateCart(items));
  }
});
test('invalid signatures, payload tampering and absent secrets fail closed', () => {
  assert.equal(verifySignature('payload', signature('payload'), secret), true);
  assert.equal(verifySignature('changed', signature('payload'), secret), false);
  assert.equal(verifySignature('payload', 'bad', secret), false);
  assert.equal(verifySignature('payload', signature('payload'), ''), false);
});
test('server catalog determines total, no private paths in public receipts', async () => {
  const s = setup(); const order = await s.purchase();
  assert.equal(order.amount, 29900); assert.equal(order.currency, 'INR');
  assert.equal(JSON.stringify(order).includes('objectPath'), false);
  assert.equal(JSON.stringify(order).includes('generation'), false);
});
test('inactive catalog products cannot be purchased', async () => {
  const s = setup(); s.product.active = false;
  await assert.rejects(s.purchase(), /unavailable/);
});
test('file paths and immutable versions are validated', () => {
  const s = setup(); s.product.files[0].objectPath = 'public/ebook.pdf'; assert.throws(() => validateProduct(s.product));
  s.product.files[0].objectPath = 'private-products/ebook.pdf'; s.product.files[0].generation = ''; assert.throws(() => validateProduct(s.product));
});
test('public-token or inaccessible files block order creation', async () => {
  const s = setup(); s.storage.assertPrivate = async () => { throw new Error('public token'); };
  await assert.rejects(s.purchase(), /public token/);
});
test('unpaid order cannot issue a download', async () => {
  const s = setup(); const order = await s.purchase();
  await assert.rejects(s.commerce.download('buyer', order.id, 'book', 'pdf'), /no active/);
  assert.equal(s.getSigned(), 0);
});
test('another account cannot verify or download a buyer order', async () => {
  const s = setup(); const order = await s.purchase();
  await assert.rejects(s.commerce.verifyPayment('intruder', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) }), /not found/);
  await assert.rejects(s.commerce.download('intruder', order.id, 'book', 'pdf'), /not found/);
});
test('browser success without valid HMAC cannot grant access', async () => {
  const s = setup(); const order = await s.purchase();
  await assert.rejects(s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: '0'.repeat(64) }), /signature/);
  assert.equal(s.orders.get(order.id).status, 'pending');
});
test('authorized but uncaptured payment does not grant access', async () => {
  const s = setup(); const order = await s.purchase(); s.payments.get('pay_1').status = 'authorized'; s.payments.get('pay_1').captured = false;
  await assert.rejects(s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) }), /not captured/);
});
test('wrong amount, currency or payment order cannot fulfill', async () => {
  for (const change of [{ amount: 100 }, { currency: 'USD' }, { order_id: 'order_unknown' }]) {
    const s = setup(); const order = await s.purchase(); Object.assign(s.payments.get('pay_1'), change);
    await assert.rejects(s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) }), /mismatch/);
  }
});
test('verified captured payment grants one entitlement and 60-second link', async () => {
  const s = setup(); const order = await s.purchase();
  const paid = await s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) });
  assert.equal(paid.status, 'paid');
  const link = await s.commerce.download('buyer', order.id, 'book', 'pdf');
  assert.equal(new Date(link.expiresAt).getTime(), 160000);
  await assert.rejects(s.commerce.download('buyer', order.id, 'book', 'other-file'), /not included/);
});
test('signed webhook recovers payment when browser callback was lost; duplicates safe', async () => {
  const s = setup(); const order = await s.purchase();
  const raw = Buffer.from(JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1' } } } }));
  await s.commerce.webhook(raw, signature(raw, webhookSecret));
  await s.commerce.webhook(raw, signature(raw, webhookSecret));
  assert.equal(s.orders.size, 1); assert.equal(s.orders.get(order.id).status, 'paid');
  assert.equal((await s.commerce.listOrders('intruder')).length, 0);
});
test('tampered webhook cannot grant access', async () => {
  const s = setup(); await s.purchase(); const raw = Buffer.from('{}');
  await assert.rejects(s.commerce.webhook(raw, signature('different', webhookSecret)), /signature/);
});
test('refund revokes downloads even if refund webhook is delayed', async () => {
  const s = setup(); const order = await s.purchase();
  await s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) });
  s.payments.get('pay_1').amount_refunded = 100;
  await assert.rejects(s.commerce.download('buyer', order.id, 'book', 'pdf'), /revoked/);
  assert.equal(s.getSigned(), 0); assert.equal(s.orders.get(order.id).status, 'refunded');
});
test('hourly download grant limit enforced', async () => {
  const s = setup(); const order = await s.purchase();
  await s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) });
  for (let i = 0; i < 10; i++) await s.commerce.download('buyer', order.id, 'book', 'pdf');
  await assert.rejects(s.commerce.download('buyer', order.id, 'book', 'pdf'), /limit/);
  assert.equal(s.getSigned(), 10);
});
test('store disabled by default cannot create payment orders', async () => {
  const s = setup();
  const commerce = createCommerce({ ...s, keyId: 'test', paymentSecret: secret, webhookSecret, enabled: false });
  await assert.rejects(commerce.createOrder('buyer', { items: [{ productId: 'book', quantity: 1 }] }), /not enabled/);
});


test('buyer can recover missed callback and webhook through provider reconciliation', async () => {
  const s = setup(); const order = await s.purchase();
  await assert.rejects(s.commerce.reconcileOrder('intruder', order.id), /not found/);
  const paid = await s.commerce.reconcileOrder('buyer', order.id);
  assert.equal(paid.status, 'paid');
});
test('revoked purchases cannot be restored by a duplicate capture event', async () => {
  const s = setup(); const order = await s.purchase();
  Object.assign(s.orders.get(order.id), { status: 'revoked', paymentId: 'pay_1' });
  const value = await s.commerce.verifyPayment('buyer', { orderId: order.id, paymentId: 'pay_1', signature: signature(`${order.gatewayOrderId}|pay_1`) });
  assert.equal(value.status, 'revoked');
  await assert.rejects(s.commerce.download('buyer', order.id, 'book', 'pdf'), /no active/);
});


test('public or nonuniform storage controls fail closed', () => {
  for (const value of [{}, { iamConfiguration: { uniformBucketLevelAccess: { enabled: true }, publicAccessPrevention: 'inherited' } }, { iamConfiguration: { uniformBucketLevelAccess: { enabled: false }, publicAccessPrevention: 'enforced' } }]) {
    assert.throws(() => assertPrivateBucketMetadata(value), /Private storage/);
  }
  assert.doesNotThrow(() => assertPrivateBucketMetadata({ iamConfiguration: { uniformBucketLevelAccess: { enabled: true }, publicAccessPrevention: 'enforced' } }));
});
