/**
 * OfferModal Component (§4.9 & §5.5)
 * Used when making a new offer or countering an existing offer with INR (₹) support.
 */

import { createModal } from './Modal.js';
import { formatPrice } from '../../utils/formatters.js';

export function openOfferModal({ listing = {}, initialAmount = null, isCounter = false, onSubmit = () => {} } = {}) {
  const currentPrice = listing.price || 0;
  const defAmount = initialAmount !== null ? initialAmount : currentPrice;
  const currency = listing.currency || 'INR';

  const contentHtml = `
    <form id="offer-modal-form">
      <div style="background: var(--surface); padding: 14px 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); margin-bottom: 20px;">
        <div style="font-size: 13px; color: var(--on-surface-variant); margin-bottom: 2px;">Item:</div>
        <div style="font-weight: 700; color: var(--on-surface); font-size: 15px;">${listing.title || 'Listing'}</div>
        <div style="font-size: 14px; color: var(--primary); margin-top: 4px; font-family: var(--font-mono); font-weight: 700;">
          Listed Price: ${formatPrice(currentPrice, currency)}
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 16px;">
        <label class="form-label" for="offer-amount-input">
          ${isCounter ? 'Your Counter Offer (₹)' : 'Your Offer Amount (₹)'}
        </label>
        <div class="form-input-wrapper">
          <span class="form-input-icon" style="font-weight: 700;">₹</span>
          <input
            type="number"
            id="offer-amount-input"
            class="form-input has-icon"
            style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--primary);"
            value="${defAmount}"
            min="1"
            max="1000000"
            required
            autofocus
          />
        </div>
        <div class="form-helper">Offers are non-binding agreements to meet on campus and pay in person via cash or UPI.</div>
      </div>

      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" id="offer-cancel-btn" class="btn btn-outlined btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">
          <span class="material-symbols-outlined" style="font-size: 18px;">local_offer</span>
          ${isCounter ? 'Send Counter Offer' : 'Submit Offer'}
        </button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: isCounter ? 'Counter Offer' : 'Make an Offer',
    contentHtml
  });

  modal.modalBox.querySelector('#offer-cancel-btn').addEventListener('click', () => modal.close());

  modal.modalBox.querySelector('#offer-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(modal.modalBox.querySelector('#offer-amount-input').value);
    if (!amount || amount <= 0) return;
    onSubmit(amount);
    modal.close();
  });
}
