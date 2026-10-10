import test from 'node:test';
import assert from 'node:assert/strict';
import { createFetchApi } from '../fetch-api.mjs';
import { createFirebaseRestAuth, createSupabaseAdapters } from '../supabase-adapters.mjs';

test('Edge routing preserves CORS, authentication and JSON body limits', async () => {
  let writes = 0;
  const api = createFetchApi({ allowedOrigin: 'https://www.8cloud.store', auth: { verifyIdToken: async () => ({ uid: 'buyer', email_verified: true }) },
    repo: { consumeApi: async () => {} }, commerce: { createOrder: async () => { writes++; return { id: 'order' }; } } }, '/commerce');
  const req = (path, init) => api(new Request(`https://api.example/commerce${path}`, init));
  assert.equal((await req('/orders')).status, 401);
  assert.equal((await req('/orders', { headers: { Origin: 'https://bad.example' } })).status, 403);
  const preflight = await req('/orders', { method: 'OPTIONS', headers: { Origin: 'https://www.8cloud.store' } });
  assert.equal(preflight.status, 204); assert.equal(await preflight.text(), '');
  const headers = { Authorization: 'Bearer token', 'Content-Type': 'application/json' };
  assert.equal((await req('/orders', { method: 'POST', headers, body: JSON.stringify({ value: 'x'.repeat(65536) }) })).status, 413);
  assert.equal(writes, 0);
  assert.equal((await req('/orders', { method: 'POST', headers, body: '{}' })).status, 201);
  assert.equal(writes, 1);
  assert.equal((await api(new Request('https://api.example/commerce-other/orders'))).status, 404);
});

test('Firebase REST verifier requires valid JWT, correct project, current account and exact owner UID', async () => {
  const payload = { sub: 'owner', aud: 'project', iss: 'https://securetoken.google.com/project', auth_time: 100 };
  const user = { localId: 'owner', email: 'babasamsung2@gmail.com', emailVerified: true, validSince: '90' };
  const options = { projectId: 'project', apiKey: 'public-key', adminUid: 'owner', verifyJwt: async () => ({ payload }),
    request: async () => Response.json({ users: [user] }) };
  assert.equal((await createFirebaseRestAuth(options).verifyIdToken('token')).storeAdmin, true);
  assert.equal((await createFirebaseRestAuth({ ...options, adminUid: 'other' }).verifyIdToken('token')).storeAdmin, false);
  for (const patch of [{ disabled: true }, { validSince: '101' }, { localId: 'wrong' }, { validSince: undefined }, { tenantId: 'unsupported' }]) {
    await assert.rejects(createFirebaseRestAuth({ ...options, request: async () => Response.json({ users: [{ ...user, ...patch }] }) }).verifyIdToken('token'));
  }
  await assert.rejects(createFirebaseRestAuth({ ...options, verifyJwt: async () => { throw new Error('bad signature'); } }).verifyIdToken('token'));
  await assert.rejects(createFirebaseRestAuth({ ...options, projectId: 'wrong' }).verifyIdToken('token'));
});

test('Supabase storage denies public buckets and changed or missing file versions', async () => {
  let isPublic = false; let modified = '2026-10-10T00:00:00Z';
  const record = { generation: '123', object_id: 'object', last_modified: modified };
  const client = { storage: { getBucket: async () => ({ data: { public: isPublic } }), from: () => ({ info: async () => ({ data: { id: 'object', lastModified: modified } }) }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: record }) }) }) }) };
  const { storage } = createSupabaseAdapters(client);
  const file = { objectPath: 'private-products/book.pdf', generation: '123' };
  await storage.assertPrivate(file);
  isPublic = true; await assert.rejects(storage.assertPrivate(file));
  isPublic = false; modified = '2026-10-11T00:00:00Z'; await assert.rejects(storage.assertPrivate(file));
  await assert.rejects(storage.assertPrivate({ ...file, generation: 'wrong' }));
});
