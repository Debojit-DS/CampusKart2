/**
 * Messages / Chat & Negotiation Page Component (§5.6)
 * Route: '/messages', '/messages/:conversationId'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderConversationListItem } from '../components/messaging/ConversationListItem.js';
import { renderMessageBubble } from '../components/messaging/MessageBubble.js';
import { renderComposer } from '../components/messaging/Composer.js';
import { renderPriceTag } from '../components/ui/PriceTag.js';
import { openOfferModal } from '../components/ui/OfferModal.js';
import { toast } from '../components/ui/Toast.js';
import { apiService } from '../api/apiService.js';
import { store } from '../data/store.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderMessagesPage({ params = {}, router } = {}) {
  const activeConvId = params.conversationId || null;
  const currentUser = store.getCurrentUser() || {};
  const conversations = await apiService.getConversations();

  const container = document.createElement('div');
  container.style.cssText = `
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--background);
  `;

  // Determine active conversation details
  let activeConv = null;
  let activeListing = null;
  let counterpartUser = null;
  let messages = [];

  if (activeConvId) {
    activeConv = conversations.find(c => c.id === activeConvId);
    if (activeConv) {
      activeListing = store.getListingById(activeConv.listingId) || {};
      const counterpartId = activeConv.participantIds.find(id => id !== currentUser.id) || activeConv.participantIds[0];
      counterpartUser = store.getUserById(counterpartId) || { fullName: 'Student' };
      messages = await apiService.getMessages(activeConv.id);
    }
  }

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCountForCurrentUser || 0), 0);
  const isSellerInActiveConv = activeListing ? activeListing.sellerId === currentUser.id : false;

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/messages' })}

    <div style="flex: 1; display: flex; overflow: hidden; height: calc(100vh - 64px);">
      <!-- Left Pane: Conversation List -->
      <div
        id="conv-list-pane"
        class="${activeConvId ? 'hidden-mobile-pane' : ''}"
        style="
          width: 360px;
          min-width: 300px;
          border-right: 1px solid var(--surface-container);
          background-color: var(--surface);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        "
      >
        <!-- Inbox Header -->
        <div style="padding: 18px 20px; border-bottom: 1px solid var(--surface-container); display: flex; align-items: center; justify-content: space-between;">
          <h2 class="headline-sm" style="font-size: 20px; color: var(--on-surface); margin: 0;">Messages</h2>
          ${unreadCount > 0 ? `
            <span style="
              background: var(--primary);
              color: var(--on-primary);
              font-family: var(--font-mono);
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: var(--radius-full);
              transform: rotate(-2deg);
            ">
              ${unreadCount} Unread
            </span>
          ` : ''}
        </div>

        <!-- Conversation Scrollable List -->
        <div style="flex: 1; overflow-y: auto;">
          ${conversations.length === 0 ? `
            <div style="padding: 40px 20px; text-align: center; color: var(--on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--outline); margin-bottom: 8px;">chat_bubble_outline</span>
              <p style="font-size: 14px;">No messages yet.</p>
              <a href="#/feed" class="btn btn-outlined btn-sm" style="margin-top: 12px;">Browse corkboard</a>
            </div>
          ` : conversations.map(conv => renderConversationListItem(conv, {
            isActive: conv.id === activeConvId
          })).join('')}
        </div>
      </div>

      <!-- Right Pane: Active Thread / Thread Placeholder -->
      <div
        id="conv-thread-pane"
        class="${!activeConvId ? 'hidden-mobile-pane' : ''}"
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--background);
          position: relative;
          overflow: hidden;
        "
      >
        ${activeConv && activeListing ? `
          <!-- Thread Header -->
          <div style="
            height: 72px;
            background-color: var(--surface);
            border-bottom: 1px solid var(--surface-container);
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
          ">
            <div style="display: flex; align-items: center; gap: 14px;">
              <!-- Back to list on mobile -->
              <a href="#/messages" class="btn-icon btn-ghost hidden-desktop-pane" style="margin-right: -4px;">
                <span class="material-symbols-outlined">arrow_back</span>
              </a>

              <!-- Thumbnail -->
              <a href="#/listing/${activeListing.id}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--surface-container); flex-shrink: 0; transform: rotate(-1deg); display: block;">
                <img src="${activeListing.images?.[0]?.url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200'}" alt="${escapeHtml(activeListing.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
              </a>

              <div>
                <a href="#/listing/${activeListing.id}" style="font-weight: 700; font-size: 15px; color: var(--on-surface); text-decoration: none;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--on-surface)'">
                  ${escapeHtml(activeListing.title)}
                </a>
                <div style="font-size: 12px; color: var(--on-surface-variant); font-family: var(--font-mono);">
                  ${isSellerInActiveConv ? 'Selling to' : 'Buying from'}: <strong style="color: var(--primary);">${escapeHtml(counterpartUser.fullName)}</strong> &bull; Pickup: ${escapeHtml(activeListing.pickupLocation)}
                </div>
              </div>
            </div>

            <!-- Price Tag -->
            <div style="flex-shrink: 0;">
              ${renderPriceTag({ amount: activeListing.price, currency: activeListing.currency, variant: 'notch' })}
            </div>
          </div>

          <!-- Message Canvas -->
          <div
            id="message-canvas"
            class="corkboard-dot-bg"
            style="
              flex: 1;
              overflow-y: auto;
              padding: 24px 20px;
              display: flex;
              flex-direction: column;
            "
          >
            <!-- Date Separator -->
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background: var(--surface-container); color: var(--on-surface-variant); font-family: var(--font-mono); font-size: 11px; padding: 3px 12px; border-radius: var(--radius-full);">
                Today
              </span>
            </div>

            <div id="messages-timeline">
              ${messages.map(msg => renderMessageBubble(msg, { isCurrentUserSeller: isSellerInActiveConv })).join('')}
            </div>
          </div>

          <!-- Composer -->
          ${renderComposer({ pickupLocation: activeListing.pickupLocation })}
        ` : `
          <!-- Empty Thread Selection State -->
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--surface-container-high); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 16px;">
              <span class="material-symbols-outlined" style="font-size: 32px;">forum</span>
            </div>
            <h3 class="headline-sm" style="margin-bottom: 8px;">Select a conversation</h3>
            <p class="body-md" style="color: var(--on-surface-variant); max-width: 360px;">
              Choose a message thread from the left or browse the corkboard to start negotiating with campus peers.
            </p>
          </div>
        `}
      </div>
    </div>
  `;

  // Global Offer action callback handler for inline offer cards
  window.handleOfferAction = async (offerId, action) => {
    if (action === 'accepted') {
      await apiService.respondToOffer(offerId, 'accepted');
      toast.success('Offer accepted! You can now arrange safe campus handoff.');
      router.handleRouteChange();
    } else if (action === 'rejected') {
      await apiService.respondToOffer(offerId, 'rejected');
      toast.info('Offer declined.');
      router.handleRouteChange();
    } else if (action === 'counter') {
      const offer = store.getOfferById(offerId);
      openOfferModal({
        listing: activeListing,
        initialAmount: offer ? offer.amount : activeListing.price,
        isCounter: true,
        onSubmit: async (counterAmount) => {
          await apiService.respondToOffer(offerId, 'countered', counterAmount);
          toast.success(`Counter offer of $${counterAmount} sent!`);
          router.handleRouteChange();
        }
      });
    }
  };

  // Scroll message canvas to bottom on load
  const canvas = container.querySelector('#message-canvas');
  if (canvas) {
    setTimeout(() => {
      canvas.scrollTop = canvas.scrollHeight;
    }, 50);
  }

  // Bind Composer Actions if thread is active
  if (activeConv && activeListing) {
    const composerForm = container.querySelector('#chat-composer-form');
    const msgInput = container.querySelector('#chat-message-input');
    const photoInput = container.querySelector('#chat-photo-input');
    const quickOfferBtn = container.querySelector('#quick-offer-btn');
    const quickLocBtn = container.querySelector('#quick-location-btn');

    // Auto-grow textarea & Enter-to-send
    msgInput?.addEventListener('input', () => {
      msgInput.style.height = 'auto';
      msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';
    });

    msgInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        composerForm.dispatchEvent(new Event('submit'));
      }
    });

    // Send text message
    composerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = msgInput.value.trim();
      if (!text) return;

      msgInput.value = '';
      msgInput.style.height = '40px';

      await apiService.sendMessage(activeConv.id, { text, type: 'text' });
      router.handleRouteChange();
    });

    // Share Location quick pill
    quickLocBtn?.addEventListener('click', async () => {
      await apiService.sendMessage(activeConv.id, {
        type: 'location',
        text: `Campus Safe Pickup: ${activeListing.pickupLocation}`
      });
      toast.success('Pickup spot shared in chat!');
      router.handleRouteChange();
    });

    // Make an offer quick pill
    quickOfferBtn?.addEventListener('click', () => {
      openOfferModal({
        listing: activeListing,
        onSubmit: async (amount) => {
          await apiService.makeOffer(activeConv.id, activeListing.id, amount);
          toast.success(`Offer of $${amount} sent!`);
          router.handleRouteChange();
        }
      });
    });

    // Photo attachment simulation
    photoInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await apiService.sendMessage(activeConv.id, {
          type: 'image',
          imageUrl: ev.target.result,
          text: 'Attached image'
        });
        router.handleRouteChange();
      };
      reader.readAsDataURL(file);
    });
  }

  return container;
}
