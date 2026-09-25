import { CurrencyCode } from '../types';

export const CURRENCY_STORAGE_KEY = '8cloud_user_currency_v1';

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string; prefix: string }> = {
  INR: { symbol: '₹', rate: 86.5, label: 'INR (₹)', prefix: '₹' },
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', prefix: '$' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', prefix: '€' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', prefix: '£' },
};

/**
 * Detect user's initial currency based on:
 * 1. Explicitly saved user choice in localStorage
 * 2. Instant client-side timezone and browser locale (e.g. India vs US/Americas vs Europe)
 * 3. Default fallback: INR (₹)
 */
export function getInitialCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'INR';

  try {
    // 1. If user previously manually selected a currency, respect their choice
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && (saved === 'INR' || saved === 'USD' || saved === 'EUR' || saved === 'GBP')) {
      return saved as CurrencyCode;
    }

    // 2. Client-side Timezone check
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = timeZone.toLowerCase();

    // Indian timezone -> INR (Rupee)
    if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('india')) {
      return 'INR';
    }

    // United States, Canada, Americas timezones -> USD (Dollar)
    if (
      tzLower.startsWith('america/') ||
      tzLower.startsWith('us/') ||
      tzLower.startsWith('pacific/') ||
      tzLower.includes('honolulu') ||
      tzLower.includes('anchorage') ||
      tzLower.includes('chicago') ||
      tzLower.includes('denver') ||
      tzLower.includes('los_angeles') ||
      tzLower.includes('new_york') ||
      tzLower.includes('toronto') ||
      tzLower.includes('vancouver')
    ) {
      return 'USD';
    }

    // UK timezone -> GBP (£)
    if (tzLower.includes('london')) {
      return 'GBP';
    }

    // European timezones -> EUR (€)
    if (tzLower.startsWith('europe/')) {
      return 'EUR';
    }

    // 3. Browser Languages / Locales check
    const languages = navigator.languages || [navigator.language || ''];
    const hasIndianLang = languages.some((l) => {
      const lower = l.toLowerCase();
      return (
        lower.endsWith('-in') ||
        lower.startsWith('hi') ||
        lower.startsWith('mr') ||
        lower.startsWith('ta') ||
        lower.startsWith('te') ||
        lower.startsWith('bn') ||
        lower.startsWith('gu') ||
        lower.startsWith('kn') ||
        lower.startsWith('ml') ||
        lower.startsWith('pa')
      );
    });

    if (hasIndianLang) {
      return 'INR';
    }

    // Explicit North American locale -> USD
    const isNorthAmerica = languages.some((l) => {
      const lower = l.toLowerCase();
      return lower === 'en-us' || lower === 'en-ca';
    });
    if (isNorthAmerica) {
      return 'USD';
    }

    // Default requested: "BY DEFAULT INR ME DIKHNA CHAHIYE"
    return 'INR';
  } catch {
    return 'INR';
  }
}

/**
 * Asynchronously checks IP Geolocation to refine currency if user hasn't explicitly set one.
 * If user is in India -> INR
 * If user is outside India (e.g. US, Canada, others) -> USD ($)
 */
export async function fetchGeoCurrency(): Promise<CurrencyCode | null> {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    // If user already picked manually, don't overwrite
    if (saved) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const country = (data.country_code || '').toUpperCase();

    if (country === 'IN') return 'INR';
    if (country === 'US' || country === 'CA' || country === 'AU' || country === 'SG') return 'USD';
    if (country === 'GB') return 'GBP';
    if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI'].includes(country)) return 'EUR';

    // Outside India defaults to USD ($)
    return 'USD';
  } catch {
    return null;
  }
}

export function formatPrice(amountUSD: number, currency: CurrencyCode = 'INR'): string {
  const target = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = amountUSD * target.rate;
  
  if (currency === 'INR') {
    return `${target.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${target.symbol}${converted.toFixed(2)}`;
}

