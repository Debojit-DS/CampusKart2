/**
 * MessageBubble Component (§5.6)
 */

import { formatRelativeTime, escapeHtml } from '../../utils/formatters.js';
import { store } from '../../data/store.js';
import { renderAvatar } from '../ui/Avatar.js';
import { renderNegotiationOfferCard } from './NegotiationOfferCard.js';

export function renderMessageBubble(message = {}, { isCurrentUserSeller = false } = {}) {
  const currentUser = store.getCurrentUser() || {};
  const isMine = message.senderId === currentUser.id || message.sender?.id === currentUser.id;
  // Backend returns sender embedded in message
  const sender = message.sender || { fullName: 'Student' };

  // If this message is an offer, render the offer card inline
  if (message.type === 'offer' && message.offerId) {
    // Backend returns offer embedded in message
    const offer = message.offer || { id: message.offerId, amount: 0, status: 'pending' };
    return renderNegotiationOfferCard(offer, { isCurrentUserSeller });
  }

  // System notification message
  if (message.type === 'system') {
    return `
      <div style="display: flex; justify-content: center; margin: 16px 0;">
        <div style="background: var(--surface-container-highest); color: var(--on-surface-variant); font-size: 12px; padding: 6px 14px; border-radius: var(--radius-full); font-family: var(--font-mono); border: 1px solid var(--surface-container);">
          ${escapeHtml(message.text)}
        </div>
      </div>
    `;
  }

  // Location card message
  if (message.type === 'location') {
    return `
      <div style="display: flex; justify-content: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 16px;">
        ${!isMine ? `<div style="margin-right: 8px;">${renderAvatar({ user: sender, size: 28 })}</div>` : ''}
        <div style="
          max-width: 75%;
          background: ${isMine ? 'var(--surface-container-high)' : 'var(--surface-container)'};
          border: 1px solid var(--surface-variant);
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          transform: rotate(${isMine ? '0.5deg' : '-0.5deg'});
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="display: flex; align-items: center; gap: 6px; color: var(--primary); font-size: 13px; font-weight: 600; margin-bottom: 4px;">
            <span class="material-symbols-outlined" style="font-size: 18px;">location_on</span>
            <span>Campus Pickup Location</span>
          </div>
          <p style="font-size: 14px; color: var(--on-surface); line-height: 1.4;">
            ${escapeHtml(message.text)}
          </p>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--on-surface-variant); margin-top: 6px; text-align: right;">
            ${formatRelativeTime(message.createdAt)}
          </div>
        </div>
      </div>
    `;
  }

  // Photo attachment message
  if (message.type === 'image' && message.imageUrl) {
    return `
      <div style="display: flex; justify-content: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 16px;">
        ${!isMine ? `<div style="margin-right: 8px;">${renderAvatar({ user: sender, size: 28 })}</div>` : ''}
        <div style="
          max-width: 60%;
          background: ${isMine ? 'var(--surface-container-high)' : 'var(--surface-container)'};
          padding: 6px;
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        ">
          <img src="${message.imageUrl}" alt="Attachment" style="width: 100%; border-radius: var(--radius-sm); display: block;" />
          ${message.text ? `<p style="font-size: 13px; padding: 6px 4px 2px;">${escapeHtml(message.text)}</p>` : ''}
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--on-surface-variant); text-align: right; padding-right: 4px; padding-top: 2px;">
            ${formatRelativeTime(message.createdAt)}
          </div>
        </div>
      </div>
    `;
  }

  // Standard text bubble
  return `
    <div style="display: flex; justify-content: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 14px;">
      ${!isMine ? `<div style="margin-right: 8px;">${renderAvatar({ user: sender, size: 28 })}</div>` : ''}
      <div style="
        max-width: 75%;
        background-color: ${isMine ? 'var(--surface-container-high)' : 'var(--surface-container)'};
        color: var(--on-surface);
        padding: 10px 14px;
        border-radius: var(--radius-lg);
        ${isMine ? 'border-bottom-right-radius: 2px;' : 'border-bottom-left-radius: 2px;'}
        border: 1px solid var(--surface-variant);
        transform: rotate(${isMine ? '0.4deg' : '-0.4deg'});
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        <div style="font-size: 14px; line-height: 1.45; word-break: break-word;">
          ${escapeHtml(message.text)}
        </div>
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--on-surface-variant); text-align: right; margin-top: 4px; opacity: 0.8;">
          ${formatRelativeTime(message.createdAt)}
        </div>
      </div>
    </div>
  `;
}
