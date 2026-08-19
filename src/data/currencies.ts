import { Currency, CurrencyCode } from '../types';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: 'INR', symbol: '₹', rate: 1.0, label: 'Indian Rupee (₹)' },
  USD: { code: 'USD', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  AUD: { code: 'AUD', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  EUR: { code: 'EUR', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  GBP: { code: 'GBP', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  JPY: { code: 'JPY', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  CAD: { code: 'CAD', symbol: '₹', rate: 1.0, label: 'INR (₹)' },
};

/**
 * Format any numerical price strictly in Indian Rupees (₹) with Indian numeric comma grouping
 * e.g. ₹1,899 or ₹12,450
 */
export function formatCurrency(amountInINR: number, _currencyCode: CurrencyCode = 'INR'): string {
  const rounded = Math.round(amountInINR);
  return `₹${rounded.toLocaleString('en-IN')}`;
}
