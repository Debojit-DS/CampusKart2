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
import { cloudinaryService } from '../services/cloudinary.js';
import { socketService } from '../services/socket.js';
import { store } from '../data/store.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderMessagesPage({ params = {}, router } = {}) {
  const activeConvId = params.conversationId || null;
  const currentUser = store.getCurrentUser() || {};

  const container = document.createElement('div');
  container.style.cssText = `
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--background);
  `;

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/messages' })}
    <div style="flex: 1; display: flex; overflow: hidden; height: calc(100vh - 64px);">
      <div style="width: 360px; min-width: 300px; border-right: 1px solid var(--surface-container); background-color: var(--surface); display: flex; flex-direction: column; flex-shrink: 0;">
        <div style="padding: 18px 20px; border-bottom: 1px solid var(--surface-container); display: flex; align-items: center; justify-content: space-between;">
          <h2 class="headline-sm" style="font-size: 20px; color: var(--on-surface); margin: 0;">Messages</h2>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; align-items: center; justify-content: center;">
          <div class="loader-dots" style="display: flex; gap: 6px;">
            <span class="loader-dot"></span>
            <span class="loader-dot"></span>
            <span class="loader-dot"></span>
          </div>
        </div>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; background-color: var(--background); position: relative; overflow: hidden;">
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--surface-container-high); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 16px;">
            <span class="material-symbols-outlined" style="font-size: 32px;">forum</span>
          </div>
          <h3 class="headline-sm" style="margin-bottom: 8px;">Select a conversation</h3>
          <p class="body-md" style="color: var(--on-surface-variant); max-width: 360px;">Loading your messages...</p>
        </div>
      </div>
    </div>
  `;

  let conversations = [];
  let activeConv = null;
  let activeListing = null;
  let counterpartUser = null;
  let messages = [];

  try {
    const [conversationsResult, convDataResult] = await Promise.all([
      apiService.getConversations(),
      activeConvId ? apiService.getConversationById(activeConvId).catch(e => {
        console.error('Error loading conversation:', e);
        return null;
      }) : Promise.resolve(null)
    ]);

    conversations = conversationsResult || [];
    
    if (convDataResult) {
      activeConv = convDataResult.conversation;
      messages = convDataResult.messages || [];
      const conv = activeConv;
      activeListing = conv.listing || null;
      const counterpartId = currentUser.id === conv.buyerId ? conv.sellerId : conv.buyerId;
      counterpartUser = counterpartId ? (counterpartId === conv.buyerId ? conv.buyer : conv.seller) : (conv.buyer || conv.seller || { fullName: 'Student' });
    }
  } catch (e) {
    console.error('Error loading messages page:', e);
  }

  if (!conversations) return container;

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCountForCurrentUser || 0), 0);
  const isSellerInActiveConv = activeListing && activeConv ? activeConv.sellerId === currentUser.id : false;

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
                  ${isSellerInActiveConv ? 'Selling to' : 'Buying from'}: <strong style="color: var(--primary);">${escapeHtml(counterpartUser.fullName)}</strong> &bull; Pickup: ${escapeHtml(activeListing.pickupLocation || activeConv.listing?.title || '')}
                </div>
              </div>
            </div>

            <!-- Price Tag -->
            <div style="flex-shrink: 0;">
              ${renderPriceTag({ amount: activeListing.price, currency: activeListing.currency || 'INR', variant: 'notch' })}
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
          ${renderComposer({ pickupLocation: activeListing.pickupLocation || '' })}
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
      openOfferModal({
        listing: activeListing,
        initialAmount: activeListing ? activeListing.price : 0,
        isCounter: true,
        onSubmit: async (counterAmount) => {
          await apiService.respondToOffer(offerId, 'counter', counterAmount);
          toast.success(`Counter offer of ₹${counterAmount} sent!`);
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

      try {
        const sent = await apiService.sendMessage(activeConv.id, { text, type: 'text' });
        appendMessageToTimeline(sent);
      } catch (err) {
        console.error('Send message error:', err);
        toast.error('Failed to send message.');
      }
    });

    // Share Location quick pill
    quickLocBtn?.addEventListener('click', async () => {
      try {
        const sent = await apiService.sendMessage(activeConv.id, {
          type: 'location',
          text: `Campus Safe Pickup: ${activeListing.pickupLocation || ''}`,
          locationLabel: activeListing.pickupLocation || ''
        });
        toast.success('Pickup spot shared in chat!');
        appendMessageToTimeline(sent);
      } catch (err) {
        console.error('Send location error:', err);
        toast.error('Failed to share location.');
      }
    });

    // Make an offer quick pill
    quickOfferBtn?.addEventListener('click', () => {
      openOfferModal({
        listing: activeListing,
        onSubmit: async (amount) => {
          try {
            const offer = await apiService.makeOffer(activeConv.id, amount);
            toast.success(`Offer of ₹${amount} sent!`);
            appendMessageToTimeline({
              id: `local-offer-${offer.id}`,
              conversationId: activeConv.id,
              senderId: currentUser.id,
              type: 'offer',
              offerId: offer.id,
              offer,
              text: `Made an offer: ₹${amount}`,
              createdAt: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Make offer error:', err);
            toast.error(`Failed to send offer: ${err.message || 'Unknown error'}`);
          }
        }
      });
    });

    // Photo attachment
    photoInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      toast.info('Uploading image...');
      try {
        const result = await cloudinaryService.upload(file, 'chat');
        const sent = await apiService.sendMessage(activeConv.id, {
          type: 'image',
          imageUrl: result.url,
          text: 'Attached image'
        });
        appendMessageToTimeline(sent);
      } catch (err) {
        console.error('Image upload error:', err);
        toast.error('Failed to upload image. Please try again.');
      }
    });

    // Socket.IO real-time messaging
    const token = localStorage.getItem('campuskart_access_token');
    if (token) {
      socketService.connect(token);
    }

    // Join active conversation room
    socketService.joinConversation(activeConv.id);

    // Listen for new messages
    socketService.on('new_message', (message) => {
      if (message.conversationId !== activeConv.id) return;
      const canvas = container.querySelector('#message-canvas');
      const timeline = container.querySelector('#messages-timeline');
      if (canvas && timeline) {
        const isCurrentUser = message.senderId === currentUser.id;
        const bubble = renderMessageBubble(message, { isCurrentUserSeller: isSellerInActiveConv });
        timeline.insertAdjacentHTML('beforeend', bubble);
        canvas.scrollTop = canvas.scrollHeight;
      }
    });

    // Listen for typing indicators
    socketService.on('presence_typing', (data) => {
      if (data.conversationId !== activeConv.id) return;
      const header = container.querySelector('#conv-thread-pane .utility-label');
      if (header && data.userId !== currentUser.id) {
        header.innerHTML = '<span style="color: var(--success);">typing...</span>';
        setTimeout(() => {
          if (header) header.innerHTML = `Selling to`;
        }, 3000);
      }
    });

    // Emit typing on input
    let typingTimeout;
    msgInput?.addEventListener('input', () => {
      socketService.sendTyping(activeConv.id, true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socketService.sendTyping(activeConv.id, false);
      }, 2000);
    });

    window.appendMessageToTimeline = function appendMessageToTimeline(message) {
      if (!message || !activeConv) return;
      if (message.conversationId !== activeConv.id) return;
      const canvas = container.querySelector('#message-canvas');
      const timeline = container.querySelector('#messages-timeline');
      if (!canvas || !timeline) return;
      const isCurrentUser = message.senderId === currentUser.id;
      const bubble = renderMessageBubble(message, { isCurrentUserSeller: isSellerInActiveConv });
      timeline.insertAdjacentHTML('beforeend', bubble);
      canvas.scrollTop = canvas.scrollHeight;
    };
  }

  return container;
}
