/**
 * Saved / Bookmarks Page Component (§10.8)
 * Route: '/saved'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderListingCard } from '../components/listing/ListingCard.js';
import { apiService } from '../api/apiService.js';

export async function renderSavedPage({ router } = {}) {
  const savedListings = await apiService.getSavedListings();
  if (!savedListings) return container; // Auth failed, redirecting to login

  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/saved' })}

    <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
      <!-- Header -->
      <div style="margin-bottom: 32px; display: flex; align-items: baseline; justify-content: space-between;">
        <div>
          <div class="utility-label" style="color: var(--primary); margin-bottom: 4px;">YOUR WATCHLIST</div>
          <h1 class="display-md" style="color: var(--on-surface);">Saved Notices (${savedListings.length})</h1>
        </div>
        <a href="#/feed" class="btn btn-outlined btn-sm">Explore More</a>
      </div>

      <!-- Masonry Grid or Empty State -->
      ${savedListings.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 500px; margin: 40px auto; position: relative;">
          <span class="pin-dot"></span>
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--primary); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">bookmark_border</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">No saved notices yet</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">
            Click the bookmark icon on any notice in the corkboard to save it for easy access later.
          </p>
          <a href="#/feed" class="btn btn-primary btn-sm">Browse Corkboard</a>
        </div>
      ` : `
        <div class="corkboard-masonry">
          ${savedListings.map(listing => renderListingCard(listing)).join('')}
        </div>
      `}
    </main>

    ${renderFooter()}
  `;

  return container;
}
