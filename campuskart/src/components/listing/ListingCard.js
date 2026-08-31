/**
 * ListingCard Component (§4.3)
 * Supports Variant A (Photo card), Variant B ("Wanted" text card with Violet styling), and Compact variant.
 */

import { getDeterministicRotation, formatPrice, escapeHtml } from '../../utils/formatters.js';
import { renderPriceTag } from '../ui/PriceTag.js';
import { renderConditionBadge } from '../ui/ConditionBadge.js';

function getCategoryLabel(category) {
  if (!category) return 'Academic';
  if (typeof category === 'object') return category.label || category.slug || 'Academic';
  return category;
}

export function renderListingCard(listing = {}, { variant = 'default', isBookmarked = false } = {}) {
  const rotation = getDeterministicRotation(listing.id);
  // Backend returns seller embedded in listing
  const seller = listing.seller || {};
  const currency = listing.currency || 'INR';
  const categoryLabel = getCategoryLabel(listing.categoryTop);

  // Variant B: "Wanted" Text Card (Styled in prominent Violet)
  if (listing.type === 'wanted') {
    return `
      <div
        class="listing-card corkboard-masonry-item"
        style="background: linear-gradient(135deg, var(--primary) 0%, #6D28D9 100%); color: #FFFFFF; padding: 22px; border-radius: var(--radius-default); transform: rotate(${rotation}deg); position: relative; cursor: pointer; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);"
        onclick="window.location.hash = '#/listing/${listing.id}'"
      >
        <!-- Pin Dot (Rust for Wanted) -->
        <span class="pin-dot pin-rust"></span>

        <!-- Decorative Tape -->
        <span class="tape-strip tape-top-right"></span>

        <!-- Badge & Category -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="background: rgba(0, 0, 0, 0.25); color: #EDE9FE; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-sm); letter-spacing: 0.06em;">
            WANTED REQUEST
          </span>
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #DDD6FE;">
            ${escapeHtml(categoryLabel)}
          </span>
        </div>

        <!-- Title -->
        <h3 class="headline-sm" style="font-size: 19px; line-height: 1.35; color: #FFFFFF; margin-bottom: 10px; font-weight: 700;">
          ${escapeHtml(listing.title)}
        </h3>

        <!-- Description -->
        <p style="font-size: 14px; line-height: 1.5; color: rgba(255, 255, 255, 0.9); margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(listing.description)}
        </p>

        <!-- Divider -->
        <div style="height: 1px; background: rgba(255, 255, 255, 0.2); margin-bottom: 14px;"></div>

        <!-- Footer row with poster & CTA -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #EDE9FE;">
            <span class="material-symbols-outlined" style="font-size: 18px;">person</span>
            <span>${escapeHtml(seller.fullName || 'Student')}</span>
          </div>

          <button
            type="button"
            class="btn btn-sm"
            style="background: #FFFFFF; color: #5B21B6; font-weight: 700; border-radius: var(--radius-sm); padding: 5px 12px; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"
            onclick="event.stopPropagation(); window.location.hash = '#/listing/${listing.id}'"
          >
            <span class="material-symbols-outlined" style="font-size: 16px;">chat</span>
            <span>Message</span>
          </button>
        </div>
      </div>
    `;
  }

  // Variant C: Compact Card (for Similar Listings strip)
  if (variant === 'compact') {
    const mainImage = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600';
    return `
      <div
        class="listing-card"
        style="background-color: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 10px; cursor: pointer; position: relative;"
        onclick="window.location.hash = '#/listing/${listing.id}'"
      >
        <div style="position: relative; aspect-ratio: 1 / 1; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 8px;">
          <img src="${mainImage}" alt="${escapeHtml(listing.title)}" class="listing-img" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; bottom: 8px; right: 8px;">
            ${renderPriceTag({ amount: listing.price, currency, variant: 'chip' })}
          </div>
        </div>
        <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--on-surface); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(listing.title)}
        </h4>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--on-surface-variant);">
          <span>${renderConditionBadge(listing.condition)}</span>
          <span style="font-family: var(--font-mono);">${escapeHtml(categoryLabel)}</span>
        </div>
      </div>
    `;
  }

  // Variant A: Standard Photo Corkboard Card
  const mainImage = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800';

  return `
    <div
      class="listing-card corkboard-masonry-item"
      style="background-color: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 12px; transform: rotate(${rotation}deg); position: relative; cursor: pointer;"
      onclick="window.location.hash = '#/listing/${listing.id}'"
    >
      <!-- Top Center Pin Dot -->
      <span class="pin-dot"></span>

      <!-- Image Area with Notched Price Tag -->
      <div style="position: relative; width: 100%; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 12px; background: var(--surface);">
        <img
          src="${mainImage}"
          alt="${escapeHtml(listing.title)}"
          class="listing-img"
          style="width: 100%; height: auto; min-height: 160px; max-height: 240px; object-fit: cover; display: block;"
        />
        <div style="position: absolute; top: 10px; right: 0; z-index: 5;">
          ${renderPriceTag({ amount: listing.price, currency, variant: 'notch' })}
        </div>
      </div>

      <!-- Title -->
      <h3 class="headline-sm" style="font-size: 17px; line-height: 1.35; color: var(--on-surface); margin-bottom: 8px; font-weight: 700;">
        ${escapeHtml(listing.title)}
      </h3>

      <!-- Meta Row: Condition Badge + Pickup Location -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; color: var(--on-surface-variant);">
        ${renderConditionBadge(listing.condition)}
        <span style="display: inline-flex; align-items: center; gap: 2px;">
          <span class="material-symbols-outlined" style="font-size: 14px; color: var(--outline);">location_on</span>
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${escapeHtml(listing.pickupLocation)}</span>
        </span>
      </div>

      <!-- Description Snippet -->
      <p style="font-size: 13px; line-height: 1.5; color: var(--on-surface-variant); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">
        ${escapeHtml(listing.description)}
      </p>

      <!-- Footer Info -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--on-surface-variant); border-top: 1px solid var(--surface-container); padding-top: 8px; margin-top: 4px;">
        <span style="font-family: var(--font-mono); text-transform: uppercase; color: var(--primary); font-weight: 600;">${escapeHtml(categoryLabel)}</span>
        <span>By ${escapeHtml(seller.fullName || 'Student')}</span>
      </div>
    </div>
  `;
}
