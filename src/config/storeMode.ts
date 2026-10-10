export type StoreMode = 'demo' | 'test' | 'production';

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
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

export function getStoreRuntimeConfig(env: RuntimeEnv): StoreRuntimeConfig {
  const checkoutApiUrl = typeof env.VITE_CHECKOUT_API_URL === 'string'
    ? env.VITE_CHECKOUT_API_URL.trim()
    : '';
  const hasSecureCheckoutApi = isSecureHttpUrl(checkoutApiUrl);

  const checkoutEnabled = env.VITE_ENABLE_CHECKOUT === 'true' &&
    (env.VITE_STORE_MODE === 'test' || env.VITE_STORE_MODE === 'production') && hasSecureCheckoutApi;

  return {
    mode: checkoutEnabled ? (env.VITE_STORE_MODE === 'test' ? 'test' : 'production') : 'demo',
    checkoutApiUrl: hasSecureCheckoutApi ? checkoutApiUrl : null,
    checkoutEnabled,
  };
}

const runtimeEnv = typeof import.meta.env === 'object' && import.meta.env ? import.meta.env : {};

export const STORE_RUNTIME_CONFIG = getStoreRuntimeConfig(runtimeEnv);
