/**
 * PriceTag Component (§4.4)
 * Supports 'notch', 'chip', and 'large' variants with INR (₹) currency awareness.
 */

import { formatPrice } from '../../utils/formatters.js';

export function renderPriceTag({ amount = 0, currency = 'INR', variant = 'notch', className = '' } = {}) {
  const formatted = formatPrice(amount, currency || 'INR');

  if (variant === 'chip') {
    return `<span class="price-tag-chip ${className}">${formatted}</span>`;
  }

  if (variant === 'large') {
    return `<span class="price-tag-large ${className}">${formatted}</span>`;
  }

  // Default: notched tag with hole punch
  return `
    <span class="price-tag-notch ${className}">
      ${formatted}
    </span>
  `;
}
