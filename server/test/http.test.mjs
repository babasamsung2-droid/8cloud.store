import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../http.mjs';
import { ApiError } from '../core.mjs';

async function setup(t) {
  let writes = 0;
  const server = createApi({ allowedOrigin: 'https://www.8cloud.store',
    auth: { verifyIdToken: async token => { if (token !== 'valid') throw new Error('bad token'); return { uid: 'buyer', email_verified: true }; } },
    repo: { consumeApi: async () => {}, listProducts: async () => [] },
    commerce: { listOrders: async uid => [{ id: 'receipt', uid }],
      createOrder: async () => { writes++; return { id: 'created' }; },
      webhook: async () => { throw new ApiError(400, 'Webhook signature is invalid.'); } },
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return { base: `http://127.0.0.1:${server.address().port}`, writes: () => writes };
}
test('unauthenticated and expired sessions cannot view orders', async t => {
  const s = await setup(t);
  assert.equal((await fetch(`${s.base}/orders`)).status, 401);
  assert.equal((await fetch(`${s.base}/orders`, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
});
test('allowed browser origin receives CORS; different origin rejected', async t => {
  const s = await setup(t);
  const allowed = await fetch(`${s.base}/orders`, { headers: { Origin: 'https://www.8cloud.store', Authorization: 'Bearer valid' } });
  assert.equal(allowed.status, 200); assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.8cloud.store');
  assert.equal(allowed.headers.get('cache-control'), 'no-store');
  const rejected = await fetch(`${s.base}/orders`, { headers: { Origin: 'https://attacker.example', Authorization: 'Bearer valid' } });
  assert.equal(rejected.status, 403);
});
test('invalid JSON, wrong media type and oversized bodies cannot create orders', async t => {
  const s = await setup(t); const headers = { Authorization: 'Bearer valid', 'Content-Type': 'application/json' };
  assert.equal((await fetch(`${s.base}/orders`, { method: 'POST', headers, body: '{' })).status, 400);
  assert.equal((await fetch(`${s.base}/orders`, { method: 'POST', headers: { Authorization: 'Bearer valid' }, body: '{}' })).status, 415);
  assert.equal((await fetch(`${s.base}/orders`, { method: 'POST', headers, body: JSON.stringify({ value: 'x'.repeat(65536) }) })).status, 413);
  assert.equal(s.writes(), 0);
});
test('unsigned webhook rejected independently of browser authentication', async t => {
  const s = await setup(t);
  const response = await fetch(`${s.base}/webhooks/razorpay`, { method: 'POST', body: '{}' });
  assert.equal(response.status, 400);
});
