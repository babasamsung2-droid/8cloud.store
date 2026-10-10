import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdmin, normalizeProduct, requireAdmin } from '../admin.mjs';
import { createApi } from '../http.mjs';
import { checkConfig } from '../check-config.mjs';

const draft = () => ({ id: 'ebook', name: 'My ebook', amount: 29900, active: false, files: [],
  display: { categoryId: 'ebooks', tagline: 'Learn something', description: 'Real ebook', deliveryFormat: 'PDF', downloadSize: '1 MB', version: '1.0', licenseType: 'Personal use' } });
const file = { id: 'pdf', name: 'book.pdf', objectPath: 'private-products/book/v1.pdf', generation: '123' };
test('admin access requires a verified server claim, not an email or browser role', () => {
  for (const user of [{ email_verified: true, email: 'babasamsung2@gmail.com', role: 'admin' }, { storeAdmin: true }, { email_verified: true, storeAdmin: 'true' }]) assert.throws(() => requireAdmin(user));
  assert.doesNotThrow(() => requireAdmin({ email_verified: true, storeAdmin: true }));
});
test('drafts may omit files but publishing requires private versioned files and valid prices', () => {
  assert.equal(normalizeProduct(draft()).active, false);
  for (const value of [{ ...draft(), active: true }, { ...draft(), amount: 1.25 }, { ...draft(), amount: -1 }, { ...draft(), files: [{ ...file, objectPath: 'public/book.pdf' }] }]) assert.throws(() => normalizeProduct(value));
  assert.equal(normalizeProduct({ ...draft(), active: true, files: [file] }).files[0].generation, '123');
});
test('private-file failure prevents product persistence', async () => {
  let writes = 0;
  const admin = createAdmin({ repo: { saveProduct: async () => { writes++; } }, storage: { assertPrivate: async () => { throw new Error('public file'); } } });
  await assert.rejects(admin.save({ uid: 'admin' }, { ...draft(), files: [file] }));
  assert.equal(writes, 0);
});
test('upload rejects unsupported names and mismatched file content', async () => {
  let writes = 0;
  const admin = createAdmin({ storage: { upload: async () => { writes++; return file; } } });
  for (const [name, bytes] of [['../book.pdf', Buffer.from('%PDF-')], ['book.pdf', Buffer.from('wrong')], ['book.exe', Buffer.from('%PDF-')], ['book.zip', Buffer.from('x')]]) await assert.rejects(admin.upload({ uid: 'a' }, name, bytes));
  assert.equal(writes, 0);
  assert.deepEqual(await admin.upload({ uid: 'a' }, 'book.pdf', Buffer.from('%PDF-1.7')), { file });
});
test('HTTP admin routes deny customers and enforce authentication before upload', async t => {
  let writes = 0;
  const server = createApi({ allowedOrigin: 'https://www.8cloud.store', commerce: {},
    auth: { verifyIdToken: async token => ({ uid: 'u', email_verified: true, storeAdmin: token === 'admin' }) },
    repo: { consumeApi: async () => {} }, admin: { dashboard: async () => ({ products: [] }), save: async () => { writes++; return { saved: true }; }, upload: async () => { writes++; return { file }; } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/admin/dashboard', '/admin/products', '/admin/files']) {
    const method = path.endsWith('dashboard') ? 'GET' : 'POST';
    assert.equal((await fetch(base + path, { method })).status, 401);
    assert.equal((await fetch(base + path, { method, headers: { Authorization: 'Bearer customer' } })).status, 403);
  }
  assert.equal(writes, 0);
  assert.equal((await fetch(base + '/admin/dashboard', { headers: { Authorization: 'Bearer admin' } })).status, 200);
  assert.equal((await fetch(base + '/admin/products', { method: 'POST', headers: { Authorization: 'Bearer admin', 'Content-Type': 'application/json' }, body: JSON.stringify(draft()) })).status, 200);
  assert.equal(writes, 1);
});
test('configuration validation reports names without exposing secrets', () => {
  const issues = checkConfig({ RAZORPAY_KEY_SECRET: 'never-print-this-secret' });
  assert.ok(issues.length > 0); assert.ok(!issues.join().includes('never-print'));
});
