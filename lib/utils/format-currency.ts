/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  // Format the number using Intl.NumberFormat
  const formatter = new Intl.NumberFormat('en-NG', mergedOptions);
  
  // Replace the NGN symbol with ₦
  return formatter.format(amount).replace('NGN', '₦');
} 