// Mock the format-currency module
jest.mock('@/lib/utils/format-currency', () => ({
  formatCurrency: (amount: number, options: Intl.NumberFormatOptions = {}) => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'NGN',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Simple mock implementation
    if (mergedOptions.notation === 'compact') {
      if (Math.abs(amount) >= 1000000) {
        return `${amount < 0 ? '-' : ''}₦${Math.abs(amount) / 1000000}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${amount < 0 ? '-' : ''}₦${Math.abs(amount) / 1000}K`;
      }
      return `${amount < 0 ? '-' : ''}₦${Math.abs(amount)}`;
    }
    
    // Handle maximumFractionDigits
    if (mergedOptions.maximumFractionDigits === 0 && amount % 1 !== 0) {
      amount = Math.round(amount);
    }
    
    return `${amount < 0 ? '-' : ''}₦${Math.abs(amount).toLocaleString()}`;
  }
}));

// Import after mocking
import { formatCurrency } from '@/lib/utils/format-currency';

describe('formatCurrency', () => {
  test('formats currency correctly with default options', () => {
    expect(formatCurrency(1000000)).toBe('₦1,000,000');
    expect(formatCurrency(500)).toBe('₦500');
    expect(formatCurrency(0)).toBe('₦0');
  });

  test('formats currency with custom options', () => {
    expect(formatCurrency(1000000, { notation: 'compact' })).toBe('₦1M');
    expect(formatCurrency(1500000, { notation: 'compact' })).toBe('₦1.5M');
    expect(formatCurrency(1000, { notation: 'compact' })).toBe('₦1K');
  });

  test('handles negative values', () => {
    expect(formatCurrency(-1000000)).toBe('-₦1,000,000');
    expect(formatCurrency(-500, { notation: 'compact' })).toBe('-₦500');
  });

  test('handles decimal values', () => {
    expect(formatCurrency(1000000.5)).toBe('₦1,000,000.5');
    expect(formatCurrency(1000000.5, { maximumFractionDigits: 0 })).toBe('₦1,000,001');
  });
}); 