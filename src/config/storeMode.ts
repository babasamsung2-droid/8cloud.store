export type StoreMode = 'demo' | 'production';

export interface StoreRuntimeConfig {
  mode: StoreMode;
  checkoutApiUrl: string | null;
  checkoutEnabled: boolean;
}

type RuntimeEnv = Record<string, string | boolean | undefined>;

function isSecureHttpUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getStoreRuntimeConfig(env: RuntimeEnv): StoreRuntimeConfig {
  const checkoutApiUrl = typeof env.VITE_CHECKOUT_API_URL === 'string'
    ? env.VITE_CHECKOUT_API_URL.trim()
    : '';
  const hasSecureCheckoutApi = isSecureHttpUrl(checkoutApiUrl);

  // Safety gate: this must remain false until checkout actually creates and
  // verifies Razorpay orders through the trusted server API.
  const serverCheckoutImplemented = false;
  const checkoutEnabled = serverCheckoutImplemented &&
    env.VITE_STORE_MODE === 'production' &&
    hasSecureCheckoutApi;

  return {
    mode: checkoutEnabled ? 'production' : 'demo',
    checkoutApiUrl: hasSecureCheckoutApi ? checkoutApiUrl : null,
    checkoutEnabled,
  };
}

const runtimeEnv = typeof import.meta.env === 'object' && import.meta.env ? import.meta.env : {};

export const STORE_RUNTIME_CONFIG = getStoreRuntimeConfig(runtimeEnv);
