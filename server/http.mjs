import { createServer } from 'node:http';
import { ApiError } from './core.mjs';
import { requireAdmin } from './admin.mjs';

async function readBody(req, limit = 65536) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new ApiError(413, 'Request too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function createApi({ commerce, admin, auth, repo, allowedOrigin }) {
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Vary', 'Origin');
    const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
    try {
      const path = new URL(req.url, 'http://api.local').pathname;
      if (path === '/webhooks/razorpay' && req.method === 'POST') {
        await commerce.webhook(await readBody(req), req.headers['x-razorpay-signature']);
        return send(200, { received: true });
      }
      if (req.headers.origin && req.headers.origin !== allowedOrigin) throw new ApiError(403, 'Origin is not allowed.');
      if (req.headers.origin === allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.writeHead(204); return res.end();
      }
      if (path === '/health' && req.method === 'GET') return send(200, { ok: true });
      if (path === '/catalog' && req.method === 'GET') return send(200, { products: await repo.listProducts() });
      const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
      if (!token) throw new ApiError(401, 'Sign in to continue.');
      let user;
      try { user = await auth.verifyIdToken(token, true); } catch { throw new ApiError(401, 'Your sign-in session expired. Please sign in again.'); }
      if (user.email_verified !== true) throw new ApiError(403, 'A verified email is required.');
      await repo.consumeApi(user.uid, Math.floor(Date.now() / 60000), 30);
      if (path.startsWith('/admin/')) {
        requireAdmin(user);
        if (!admin) throw new ApiError(503, 'Admin service is not configured.');
        if (path === '/admin/dashboard' && req.method === 'GET') return send(200, await admin.dashboard());
        if (path === '/admin/files' && req.method === 'POST') {
          if (req.headers['content-type'] !== 'application/octet-stream') throw new ApiError(415, 'Upload a binary file.');
          const name = new URL(req.url, 'http://api.local').searchParams.get('name');
          return send(201, await admin.upload(user, name, await readBody(req, 25 * 1024 * 1024)));
        }
      }
      if (path === '/orders' && req.method === 'GET') return send(200, { orders: await commerce.listOrders(user.uid) });
      if (req.method !== 'POST') throw new ApiError(404, 'Endpoint not found.');
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw new ApiError(415, 'JSON is required.');
      let input;
      try { input = JSON.parse((await readBody(req)).toString('utf8')); } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, 'Invalid JSON.');
      }
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Invalid request.');
      if (path === '/admin/products') return send(200, await admin.save(user, input));
      if (path === '/orders') return send(201, await commerce.createOrder(user.uid, input));
      if (path === '/orders/reconcile') return send(200, await commerce.reconcileOrder(user.uid, input.orderId));
      if (path === '/payments/verify') return send(200, await commerce.verifyPayment(user.uid, input));
      if (path === '/downloads') return send(200, await commerce.download(user.uid, input.orderId, input.productId, input.fileId));
      throw new ApiError(404, 'Endpoint not found.');
    } catch (error) {
      if (!(error instanceof ApiError)) console.error('Commerce request failed:', error?.code || error?.name || 'unknown');
      send(error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.message : 'Service temporarily unavailable. Please try again.' });
    }
  });
}
