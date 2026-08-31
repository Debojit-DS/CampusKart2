/**
 * NegotiationOfferCard Component (§4.9 & §5.6)
 * Inline offer card embedded in chat thread supporting multi-turn negotiation in INR.
 */

import { formatPrice, escapeHtml } from '../../utils/formatters.js';
import { store } from '../../data/store.js';

export function renderNegotiationOfferCard(offer = {}, { isCurrentUserSeller = false, proposerName, listingPrice } = {}) {
  const currentUser = store.getCurrentUser() || {};
  const isMine = offer.proposedById === currentUser.id;
  const currency = offer.currency || 'INR';

  const isPending = offer.status === 'pending';
  const isAccepted = offer.status === 'accepted';
  const isRejected = offer.status === 'rejected';
  const isCountered = offer.status === 'countered';

  return `
    <div
      class="negotiation-offer-card bg-surface-bright"
      style="max-width: 360px; width: 100%; margin: 16px auto; padding: 20px; border-radius: var(--radius-xl); border: 1px solid var(--surface-container); position: relative; box-shadow: var(--shadow-modal); transform: rotate(-0.5deg);"
    >
      <!-- Decorative Tape -->
      <span class="tape-strip tape-top-right"></span>

      <!-- Card Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="material-symbols-outlined" style="color: var(--primary); font-size: 20px;">local_offer</span>
          <span class="utility-label" style="font-size: 11px; color: var(--on-surface-variant);">
            ${isMine ? 'Your Offer' : `Offer from ${proposerName ? escapeHtml(proposerName) : 'Student'}`}
          </span>
        </div>

        <!-- Status Pill -->
        <span style="
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          background: ${isAccepted ? 'rgba(52, 211, 153, 0.15)' : isRejected ? 'rgba(248, 113, 113, 0.15)' : isCountered ? 'rgba(164, 158, 183, 0.15)' : 'rgba(139, 92, 246, 0.18)'};
          color: ${isAccepted ? 'var(--success)' : isRejected ? 'var(--error)' : isCountered ? 'var(--on-surface-variant)' : 'var(--primary)'};
        ">
          ${offer.status}
        </span>
      </div>

      <!-- Large Offered Price in INR -->
      <div style="text-align: center; margin: 16px 0;">
        <div style="font-family: var(--font-mono); font-size: 34px; font-weight: 800; color: var(--primary); line-height: 1;">
          ${formatPrice(offer.amount, currency)}
        </div>
        ${listingPrice ? `
          <div style="font-size: 12px; color: var(--on-surface-variant); margin-top: 4px;">
            Original Price: ${formatPrice(listingPrice, currency)}
          </div>
        ` : ''}
      </div>

      <!-- Action Buttons (Only shown to recipient when pending) -->
      ${isPending && !isMine ? `
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 16px; border-top: 1px solid var(--surface-container); padding-top: 14px;">
          <button
            type="button"
            class="btn btn-destructive btn-sm"
            style="flex: 1; padding: 7px 8px; font-size: 12px;"
            onclick="window.handleOfferAction('${offer.id}', 'rejected')"
          >
            Reject
          </button>
          <button
            type="button"
            class="btn btn-outlined btn-sm"
            style="flex: 1; padding: 7px 8px; font-size: 12px;"
            onclick="window.handleOfferAction('${offer.id}', 'counter')"
          >
            Counter
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            style="flex: 1.2; padding: 7px 8px; font-size: 12px; font-weight: 700;"
            onclick="window.handleOfferAction('${offer.id}', 'accepted')"
          >
            Accept
          </button>
        </div>
      ` : ''}

      ${isAccepted ? `
        <div style="text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--surface-container); font-size: 12px; color: var(--success); font-weight: 600;">
          <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">verified</span>
          Deal Agreed! Meet at campus pickup spot.
        </div>
      ` : ''}
    </div>
  `;
}
