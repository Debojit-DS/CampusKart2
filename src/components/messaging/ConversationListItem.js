/**
 * ConversationListItem Component (§5.6)
 */

import { formatRelativeTime, escapeHtml } from '../../utils/formatters.js';
import { store } from '../../data/store.js';

export function renderConversationListItem(conversation = {}, { isActive = false } = {}) {
  const currentUser = store.getCurrentUser() || {};
  const currentUserId = currentUser.id || 'user-me';

  const otherUserId = conversation.participantIds.find(id => id !== currentUserId) || conversation.participantIds[0];
  const otherUser = store.getUserById(otherUserId) || { fullName: 'Student' };
  const listing = store.getListingById(conversation.listingId) || { title: 'Listing', images: [] };

  const mainImage = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200';
  const hasUnread = conversation.unreadCountForCurrentUser > 0;

  return `
    <div
      class="conversation-list-item"
      style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        cursor: pointer;
        border-bottom: 1px solid var(--surface-container);
        background-color: ${isActive ? 'var(--surface-container-high)' : 'transparent'};
        border-left: ${isActive ? '4px solid var(--primary)' : '4px solid transparent'};
        transition: background 150ms ease;
      "
      onclick="window.location.hash = '#/messages/${conversation.id}'"
    >
      <!-- Small Listing Thumbnail with Pin & Unread Dot -->
      <div style="position: relative; width: 48px; height: 48px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; background: var(--surface); border: 1px solid var(--surface-container); transform: rotate(-1deg);">
        <img src="${mainImage}" alt="${escapeHtml(listing.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
        ${hasUnread ? `
          <span style="position: absolute; top: 3px; right: 3px; width: 8px; height: 8px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 4px var(--primary);"></span>
        ` : ''}
      </div>

      <!-- Text Details -->
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <h4 style="font-size: 14px; font-weight: ${hasUnread ? '700' : '600'}; color: var(--on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(otherUser.fullName)}
          </h4>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--on-surface-variant); flex-shrink: 0;">
            ${formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div style="font-size: 12px; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
          ${escapeHtml(listing.title)}
        </div>

        <div style="font-size: 13px; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(conversation.lastMessagePreview || 'No messages yet')}
        </div>
      </div>
    </div>
  `;
}
