/**
 * CampusKart Utility Formatters & Deterministic Algorithms
 */

/**
 * Deterministically compute a fixed slight rotation between -1.5deg and +1.5deg based on item ID.
 * Prevents jitter on re-renders while giving the realistic tactile corkboard appearance.
 * @param {string} id
 * @returns {number} rotation angle in degrees
 */
export function getDeterministicRotation(id = '') {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Map hash to range [-1.5, 1.5]
  const normalized = (Math.abs(hash) % 300) / 100 - 1.5;
  return Number(normalized.toFixed(2));
}

/**
 * Locale-aware currency formatting defaulting to Indian Rupee (INR - ₹)
 * @param {number} amount
 * @param {string} currencyCode ('INR', 'USD', etc.)
 * @returns {string}
 */
export function formatPrice(amount = 0, currencyCode = 'INR') {
  const symbolMap = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const code = (currencyCode || 'INR').toUpperCase();
  const symbol = symbolMap[code] || '₹';

  // Format with Indian English locale for INR or standard for others
  const locale = code === 'INR' ? 'en-IN' : 'en-US';
  const formattedNum = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0
  }).format(amount);

  return `${symbol}${formattedNum}`;
}

/**
 * Compute relative time from ISO date string
 * @param {string} dateString
 * @returns {string}
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/**
 * Format conditions to human-readable labels
 * @param {string} condition
 * @returns {string}
 */
export function formatCondition(condition = 'good') {
  const map = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    used: 'Used'
  };
  return map[condition?.toLowerCase()] || 'Good';
}

/**
 * Sanitize text to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
