import type { CurrencyCode, StoreSettings } from '../types';

const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP'];

export function sanitizeStoreSettings(input: unknown): StoreSettings {
  const value = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const currency = CURRENCIES.includes(value.storeCurrency as CurrencyCode)
    ? value.storeCurrency as CurrencyCode
    : 'INR';

  return {
    adminEmail: typeof value.adminEmail === 'string' ? value.adminEmail : 'babasamsung2@gmail.com',
    privateAdminMode: value.privateAdminMode !== false,
    subdomainEnabled: value.subdomainEnabled !== false,
    razorpayKeyId: typeof value.razorpayKeyId === 'string' ? value.razorpayKeyId : '',
    razorpayTestMode: value.razorpayTestMode !== false,
    storeName: typeof value.storeName === 'string' && value.storeName.trim()
      ? value.storeName.trim()
      : '8cloud.store',
    storeCurrency: currency,
  };
}
