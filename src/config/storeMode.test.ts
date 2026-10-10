import test from 'node:test';
import assert from 'node:assert/strict';

import { getStoreRuntimeConfig } from './storeMode';

test('defaults to safe demo mode when production backend is not configured', () => {
  const config = getStoreRuntimeConfig({});

  assert.equal(config.mode, 'demo');
  assert.equal(config.checkoutEnabled, false);
});

test('keeps checkout disabled without explicit operator opt-in', () => {
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


test('enables configured test checkout only after explicit opt-in', () => {
  const config = getStoreRuntimeConfig({ VITE_STORE_MODE: 'test', VITE_ENABLE_CHECKOUT: 'true', VITE_CHECKOUT_API_URL: 'https://api.example.com' });
  assert.equal(config.mode, 'test'); assert.equal(config.checkoutEnabled, true);
});
test('does not allow unknown modes or API URLs containing credentials or queries', () => {
  for (const url of ['http://api.example.com', 'https://user:pass@api.example.com', 'https://api.example.com?secret=key', 'https://api.example.com#fragment']) {
    assert.equal(getStoreRuntimeConfig({ VITE_STORE_MODE: 'production', VITE_ENABLE_CHECKOUT: 'true', VITE_CHECKOUT_API_URL: url }).checkoutEnabled, false);
  }
  assert.equal(getStoreRuntimeConfig({ VITE_STORE_MODE: 'unknown', VITE_ENABLE_CHECKOUT: 'true', VITE_CHECKOUT_API_URL: 'https://api.example.com' }).checkoutEnabled, false);
});
