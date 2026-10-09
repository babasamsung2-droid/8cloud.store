import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeStoreSettings } from './storeSettings';

test('removes legacy admin PIN and Razorpay secret from browser-persisted settings', () => {
  const settings = sanitizeStoreSettings({
    adminEmail: 'owner@example.com',
    adminPin: '8821',
    privateAdminMode: true,
    subdomainEnabled: true,
    razorpayKeyId: 'rzp_test_public',
    razorpayKeySecret: 'must-not-reach-browser-storage',
    razorpayTestMode: true,
    storeName: '8cloud.store',
    storeCurrency: 'INR',
  });

  assert.equal('adminPin' in settings, false);
  assert.equal('razorpayKeySecret' in settings, false);
  assert.equal(settings.razorpayKeyId, 'rzp_test_public');
});
