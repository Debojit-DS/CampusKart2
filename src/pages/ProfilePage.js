/**
 * ProfilePage Component (§10.4)
 * Route: '/profile', '/profile/:userId'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderAvatar, renderVerifiedBadge } from '../components/ui/Avatar.js';
import { renderListingCard } from '../components/listing/ListingCard.js';
import { apiService } from '../api/apiService.js';
import { store } from '../data/store.js';
import { toast } from '../components/ui/Toast.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderProfilePage({ params = {}, router } = {}) {
  const currentUser = store.getCurrentUser() || {};
  const targetUserId = params.userId || currentUser.id;
  const isOwnProfile = targetUserId === currentUser.id;

  const user = await apiService.getUserById(targetUserId) || currentUser;
  const allListings = store.getListings().filter(l => l.sellerId === targetUserId);
  const activeListings = allListings.filter(l => l.status === 'active');
  const soldListings = allListings.filter(l => l.status === 'sold');

  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  let activeTab = 'active'; // 'active' or 'sold'

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/profile' })}

    <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
      <!-- Profile Header Notice Card -->
      <div class="bg-surface-bright" style="
        border: 1px solid var(--surface-container);
        border-radius: var(--radius-lg);
        padding: 32px;
        position: relative;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        margin-bottom: 36px;
      ">
        <span class="pin-dot"></span>

        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;">
          <!-- Left: User Identity -->
          <div style="display: flex; align-items: center; gap: 20px;">
            ${renderAvatar({ user, size: 72 })}
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h1 class="headline-sm" style="font-size: 26px; color: var(--on-surface); margin: 0;">${escapeHtml(user.fullName)}</h1>
                ${user.isVerified ? renderVerifiedBadge(20) : ''}
              </div>
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--on-surface-variant); margin-top: 4px;">
                ${escapeHtml(user.department || 'Engineering')} &bull; Year ${user.yearOfStudy || 3} &bull; ${escapeHtml(user.email)}
              </div>
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; font-size: 13px;">
                <span style="color: var(--primary); font-weight: 700; font-family: var(--font-mono);">
                  ★ ${user.ratingAverage || 5.0} (${user.ratingCount || 12} campus ratings)
                </span>
                <span style="color: var(--on-surface-variant);">&bull;</span>
                <span style="color: var(--success); font-family: var(--font-mono); font-size: 12px;">
                  ✓ Verified College Student
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions (Logout / Post Notice) -->
          <div style="display: flex; gap: 10px;">
            ${isOwnProfile ? `
              <a href="#/listing/new" class="btn btn-primary btn-sm">
                <span class="material-symbols-outlined">add</span>
                <span>Post Notice</span>
              </a>
              <button type="button" id="logout-btn" class="btn btn-outlined btn-sm" style="color: var(--error); border-color: rgba(193,97,63,0.4);">
                <span class="material-symbols-outlined">logout</span>
                <span>Log out</span>
              </button>
            ` : `
              <a href="#/messages" class="btn btn-primary btn-sm">
                <span class="material-symbols-outlined">chat</span>
                <span>Message Student</span>
              </a>
            `}
          </div>
        </div>
      </div>

      <!-- Listings Tabs -->
      <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--surface-container); padding-bottom: 12px;">
        <div style="display: flex; gap: 20px;">
          <button
            type="button"
            id="tab-active-btn"
            style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 12px; margin-bottom: -13px;"
          >
            Active Listings (${activeListings.length})
          </button>
          <button
            type="button"
            id="tab-sold-btn"
            style="font-family: var(--font-mono); font-size: 14px; font-weight: 500; color: var(--on-surface-variant); padding-bottom: 12px; margin-bottom: -13px;"
          >
            Sold Archive (${soldListings.length})
          </button>
        </div>
      </div>

      <!-- Listings Grid -->
      <div id="profile-listings-grid" class="corkboard-masonry">
        ${activeListings.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--on-surface-variant);">
            <p>No active notices pinned right now.</p>
          </div>
        ` : activeListings.map(item => renderListingCard(item)).join('')}
      </div>
    </main>

    ${renderFooter()}
  `;

  // Tab toggling
  const tabActiveBtn = container.querySelector('#tab-active-btn');
  const tabSoldBtn = container.querySelector('#tab-sold-btn');
  const grid = container.querySelector('#profile-listings-grid');

  tabActiveBtn.addEventListener('click', () => {
    tabActiveBtn.style.color = 'var(--primary)';
    tabActiveBtn.style.borderBottom = '2px solid var(--primary)';
    tabSoldBtn.style.color = 'var(--on-surface-variant)';
    tabSoldBtn.style.borderBottom = 'none';
    grid.innerHTML = activeListings.length === 0
      ? `<div style="padding: 40px; text-align: center; color: var(--on-surface-variant);"><p>No active notices.</p></div>`
      : activeListings.map(item => renderListingCard(item)).join('');
  });

  tabSoldBtn.addEventListener('click', () => {
    tabSoldBtn.style.color = 'var(--primary)';
    tabSoldBtn.style.borderBottom = '2px solid var(--primary)';
    tabActiveBtn.style.color = 'var(--on-surface-variant)';
    tabActiveBtn.style.borderBottom = 'none';
    grid.innerHTML = soldListings.length === 0
      ? `<div style="padding: 40px; text-align: center; color: var(--on-surface-variant);"><p>No items marked as sold yet.</p></div>`
      : soldListings.map(item => renderListingCard(item)).join('');
  });

  // Logout handler
  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    await apiService.logout();
    toast.info('Logged out from campus account');
    router.navigate('/');
  });

  return container;
}
