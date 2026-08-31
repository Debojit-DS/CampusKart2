/**
 * NotificationsPage Component (§10.9)
 * Route: '/notifications'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { apiService } from '../api/apiService.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { toast } from '../components/ui/Toast.js';
import { formatRelativeTime, escapeHtml } from '../utils/formatters.js';

export async function renderNotificationsPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  try {
    const result = await apiService.getNotifications();
    if (!result) return container;
    const notifications = result.data || result;

    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/notifications' })}

      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="max-width: 640px; margin: 0 auto;">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
            <div>
              <div class="utility-label" style="color: var(--primary); margin-bottom: 4px;">ACTIVITY &amp; ALERTS</div>
              <h1 class="headline-sm" style="font-size: 26px; color: var(--on-surface);">Notifications</h1>
            </div>
            ${notifications.some(n => !n.isRead) ? `
              <button type="button" id="mark-all-read-btn" class="btn btn-ghost btn-sm" style="font-size: 13px; color: var(--primary);">
                <span class="material-symbols-outlined" style="font-size: 16px;">done_all</span>
                <span>Mark all as read</span>
              </button>
            ` : ''}
          </div>

          <!-- Notifications List -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${notifications.length === 0 ? `
              <div style="text-align: center; padding: 48px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg);">
                <p style="color: var(--on-surface-variant);">No new notifications right now.</p>
              </div>
            ` : notifications.map(notif => {
              const iconMap = {
                new_offer: { icon: 'local_offer', color: 'var(--primary)' },
                new_message: { icon: 'chat', color: 'var(--primary)' },
                offer_accepted: { icon: 'verified', color: 'var(--success)' },
                offer_rejected: { icon: 'cancel', color: 'var(--error)' },
                listing_saved_price_drop: { icon: 'bookmark', color: 'var(--info)' },
                system: { icon: 'notifications', color: 'var(--outline)' }
              };
              const meta = iconMap[notif.type] || iconMap.system;
              const title = notif.payload?.title || notif.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              const message = notif.payload?.message || '';

              let targetHash = '#/feed';
              if (notif.payload?.conversationId) targetHash = `#/messages/${notif.payload.conversationId}`;
              else if (notif.payload?.listingId) targetHash = `#/listing/${notif.payload.listingId}`;

              return `
                <div
                  class="notification-item"
                  data-id="${notif.id}"
                  data-hash="${targetHash}"
                  style="
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    background: ${notif.isRead ? 'var(--surface-bright)' : 'var(--surface-container-high)'};
                    border: 1px solid var(--surface-container);
                    border-left: ${notif.isRead ? '4px solid transparent' : '4px solid var(--primary)'};
                    padding: 16px;
                    border-radius: var(--radius-default);
                    cursor: pointer;
                    transition: background 150ms ease;
                  "
                >
                  <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: ${meta.color}; flex-shrink: 0;">
                    <span class="material-symbols-outlined">${meta.icon}</span>
                  </div>

                  <div style="flex: 1;">
                    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                      <strong style="font-size: 14px; color: var(--on-surface); font-weight: 600;">${escapeHtml(title)}</strong>
                      <span style="font-family: var(--font-mono); font-size: 11px; color: var(--on-surface-variant); flex-shrink: 0;">
                        ${formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p style="font-size: 13px; color: var(--on-surface-variant); line-height: 1.5; margin: 0;">
                      ${escapeHtml(message)}
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </main>

      ${renderFooter()}
    `;

    // Item click to mark read and navigate
    container.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', async () => {
        const notifId = item.getAttribute('data-id');
        const targetHash = item.getAttribute('data-hash');
        try {
          await apiService.markNotificationRead(notifId);
        } catch {}
        window.location.hash = targetHash;
      });
    });

    // Mark all read button
    container.querySelector('#mark-all-read-btn')?.addEventListener('click', async () => {
      try {
        await apiService.markAllNotificationsRead();
        toast.success('All notifications marked as read');
        router.handleRouteChange();
      } catch (e) {
        toast.error(ErrorHandler.getErrorMessage(e));
      }
    });
  } catch (e) {
    console.error('Error loading notifications:', e);
    const errorMsg = ErrorHandler.getErrorMessage(e);
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/notifications' })}
      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load notifications</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(errorMsg)}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
        </div>
      </main>
      ${renderFooter()}
    `;
  }

  return container;
}
