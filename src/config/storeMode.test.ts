import test from 'node:test';
import assert from 'node:assert/strict';

import { getStoreRuntimeConfig } from './storeMode';

test('defaults to safe demo mode when production backend is not configured', () => {
  const config = getStoreRuntimeConfig({});

  assert.equal(config.mode, 'demo');
  assert.equal(config.checkoutEnabled, false);
});

test('keeps checkout disabled until the server-side payment integration is implemented', () => {
  const config = getStoreRuntimeConfig({
    VITE_STORE_MODE: 'production',
    VITE_CHECKOUT_API_URL: 'https://api.8cloud.store',
  });

  assert.equal(config.mode, 'demo');
  assert.equal(config.checkoutEnabled, false);
});

test('rejects insecure checkout API URLs', () => {
  const config = getStoreRuntimeConfig({
    VITE_STORE_MODE: 'production',
    VITE_CHECKOUT_API_URL: 'http://api.8cloud.store',
  });

  assert.equal(config.checkoutEnabled, false);
});
