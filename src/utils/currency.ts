import { CurrencyCode } from '../types';

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string; prefix: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', prefix: '$' },
  INR: { symbol: '₹', rate: 86.5, label: 'INR (₹)', prefix: '₹' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', prefix: '€' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', prefix: '£' },
};

export function formatPrice(amountUSD: number, currency: CurrencyCode = 'USD'): string {
  const target = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = amountUSD * target.rate;
  
  if (currency === 'INR') {
    return `${target.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${target.symbol}${converted.toFixed(2)}`;
}
