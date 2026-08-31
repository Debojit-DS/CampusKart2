/**
 * WishlistPage Component
 * Route: '/wishlist'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { apiService } from '../api/apiService.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { toast } from '../components/ui/Toast.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderWishlistPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  try {
    const items = await apiService.getWishlist();
    if (!items) return container;

    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/wishlist' })}

      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="max-width: 640px; margin: 0 auto;">
          <div style="margin-bottom: 28px;">
            <div class="utility-label" style="color: var(--primary); margin-bottom: 4px;">SAVED SEARCHES</div>
            <h1 class="headline-sm" style="color: var(--on-surface);">Wishlist</h1>
            <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px; margin-top: 4px;">
              Get notified when new listings match your saved keywords.
            </p>
          </div>

          <!-- Add new keyword -->
          <div class="bg-surface-bright" style="padding: 20px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); margin-bottom: 24px;">
            <form id="add-wishlist-form" style="display: flex; gap: 12px;">
              <input
                type="text"
                id="wishlist-keyword"
                class="form-input"
                placeholder="e.g. 'calculator', 'mini fridge', 'textbook'"
                style="flex: 1;"
                required
              />
              <button type="submit" class="btn btn-primary btn-sm">
                <span class="material-symbols-outlined">add</span>
                <span>Add</span>
              </button>
            </form>
          </div>

          <!-- Wishlist items -->
          <div id="wishlist-items">
            ${items.length === 0 ? `
              <div style="text-align: center; padding: 48px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg);">
                <span class="material-symbols-outlined" style="font-size: 36px; color: var(--outline); margin-bottom: 8px;">bookmark_border</span>
                <p style="color: var(--on-surface-variant);">No saved keywords yet. Add one above!</p>
              </div>
            ` : items.map(item => `
              <div
                class="wishlist-item"
                data-id="${item.id}"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 14px 16px;
                  background: var(--surface-bright);
                  border: 1px solid var(--surface-container);
                  border-radius: var(--radius-default);
                  margin-bottom: 8px;
                "
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-outlined" style="color: var(--primary);">search</span>
                  <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--on-surface);">${escapeHtml(item.keyword)}</div>
                    ${item.category ? `<div style="font-size: 12px; color: var(--on-surface-variant);">${escapeHtml(item.category.label)}</div>` : ''}
                  </div>
                </div>
                <button type="button" class="btn-icon btn-ghost remove-wishlist-btn" data-id="${item.id}" title="Remove">
                  <span class="material-symbols-outlined" style="font-size: 18px; color: var(--error);">close</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </main>

      ${renderFooter()}
    `;

    // Add new keyword
    container.querySelector('#add-wishlist-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = container.querySelector('#wishlist-keyword');
      const keyword = input.value.trim();
      if (!keyword) return;
      try {
        await apiService.addToWishlist(keyword);
        toast.success(`"${keyword}" added to wishlist`);
        input.value = '';
        router.handleRouteChange();
      } catch (err) {
        toast.error(ErrorHandler.getErrorMessage(err));
      }
    });

    // Remove keyword
    container.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          await apiService.removeFromWishlist(id);
          toast.info('Removed from wishlist');
          router.handleRouteChange();
        } catch (err) {
          toast.error(ErrorHandler.getErrorMessage(err));
        }
      });
    });
  } catch (e) {
    console.error('Error loading wishlist:', e);
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/wishlist' })}
      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load wishlist</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(ErrorHandler.getErrorMessage(e))}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
        </div>
      </main>
      ${renderFooter()}
    `;
  }

  return container;
}
