import { Buffer } from 'node:buffer';
import { createRequestHandler } from './request-handler.mjs';

// Share the same authorization, size limits and routes between Node and Edge runtimes.
export function createFetchApi(options, prefix = '') {
  const handler = createRequestHandler(options);
  return async request => {
    const url = new URL(request.url);
    if (prefix && !(url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return new Response('Not found', { status: 404 });
    const headers = new Headers(); let status = 200; let body = '';
    const req = { method: request.method, url: `${url.pathname.slice(prefix.length) || '/'}${url.search}`,
      headers: Object.fromEntries(request.headers),
      async *[Symbol.asyncIterator]() {
        if (!request.body) return;
        const reader = request.body.getReader();
        try { while (true) { const value = await reader.read(); if (value.done) break; yield Buffer.from(value.value); } }
        finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      },
    };
    const res = { setHeader: (key, value) => headers.set(key, value),
      writeHead: (code, values = {}) => { status = code; for (const [key, value] of Object.entries(values)) headers.set(key, value); },
      end: (value = '') => { body = value; },
    };
    await handler(req, res);
    return new Response(status === 204 ? null : body, { status, headers });
  };
}
