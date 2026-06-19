/**
 * Utility functions
 *
 * Reusable helper functions used across the app.
 */

/**
 * Format a number as a currency string.
 */
export function formatCurrency(amount: number, locale = "vi-VN", currency = "VND"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

/**
 * Format a Date to a localized date string.
 */
export function formatDate(date: Date | string, locale = "vi-VN"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID (for local use, not crypto-secure).
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Truncate a string to a maximum length and add ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
