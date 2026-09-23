/**
 * ProfilePage Component (§10.4)
 * Route: '/profile', '/profile/:userId'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderAvatar, renderVerifiedBadge } from '../components/ui/Avatar.js';
import { renderListingCard } from '../components/listing/ListingCard.js';
import { apiService } from '../api/apiService.js';
import { cloudinaryService } from '../services/cloudinary.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { store } from '../data/store.js';
import { toast } from '../components/ui/Toast.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderProfilePage({ params = {}, router } = {}) {
  const currentUser = store.getCurrentUser() || {};
  const targetUserId = params.userId || currentUser.id;
  const isOwnProfile = targetUserId === currentUser.id;

  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  try {
    const [user, listingsResult] = await Promise.all([
      apiService.getUserById(targetUserId),
      apiService.getListings({ sellerId: targetUserId })
    ]);
    const resolvedUser = user || currentUser;
    if (!listingsResult) return container;
    const allListings = listingsResult.data || listingsResult;
    const activeListings = allListings.filter(l => l.status === 'active');
    const soldListings = allListings.filter(l => l.status === 'sold');

    await renderProfileContent(container, resolvedUser, activeListings, soldListings, isOwnProfile, router);
  } catch (e) {
    console.error('Error loading profile:', e);
    const errorMsg = ErrorHandler.getErrorMessage(e);
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/profile' })}
      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px; text-align: center;">
        <div style="padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load profile</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(errorMsg)}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
        </div>
      </main>
      ${renderFooter()}
    `;
  }

  return container;
}

async function renderProfileContent(container, user, activeListings, soldListings, isOwnProfile, router) {
  let activeTab = 'active';

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/profile' })}

    <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
      <!-- Profile Header Listing Card -->
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

          <!-- Right: Actions (Logout / Post Listing) -->
          <div style="display: flex; gap: 10px;">
            ${isOwnProfile ? `
              <button type="button" id="edit-profile-btn" class="btn btn-outlined btn-sm">
                <span class="material-symbols-outlined">edit</span>
                <span>Edit Profile</span>
              </button>
              <a href="#/listing/new" class="btn btn-primary btn-sm">
                <span class="material-symbols-outlined">add</span>
                 <span>Post Listing</span>
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
             <p>No active listings pinned right now.</p>
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
      ? `<div style="padding: 40px; text-align: center; color: var(--on-surface-variant);"><p>No active listings.</p></div>`
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
    await store.logout();
    toast.info('Logged out from campus account');
    router.navigate('/');
  });

  // Edit profile handler
  container.querySelector('#edit-profile-btn')?.addEventListener('click', () => {
    openEditProfileModal(user, async (updatedFields) => {
      try {
        const updated = await apiService.updateMyProfile(updatedFields);
        localStorage.setItem('campuskart_current_user', JSON.stringify(updated));
        store.notify('user_updated', updated);
        toast.success('Profile updated!');
        router.handleRouteChange();
      } catch (e) {
        toast.error(ErrorHandler.getErrorMessage(e));
      }
    });
  });

  return container;
}

function openEditProfileModal(user, onSave) {
  const modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 24px;
  `;

  let avatarUrl = user.avatarUrl || '';

  modal.innerHTML = `
    <div class="bg-surface-bright" style="width: 100%; max-width: 480px; padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--surface-container); position: relative; max-height: 90vh; overflow-y: auto;">
      <button type="button" id="close-modal-btn" class="btn-icon btn-ghost" style="position: absolute; top: 16px; right: 16px;">
        <span class="material-symbols-outlined">close</span>
      </button>

      <h2 class="headline-sm" style="margin-bottom: 24px; color: var(--on-surface);">Edit Profile</h2>

      <form id="edit-profile-form">
        <!-- Avatar -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; margin: 0 auto 12px; border: 2px solid var(--surface-container); background: var(--surface-container-high);">
            <img id="avatar-preview" src="${avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <input type="file" id="avatar-input" accept="image/*" style="display: none;" />
          <button type="button" id="change-avatar-btn" class="btn btn-ghost btn-sm">
            <span class="material-symbols-outlined" style="font-size: 16px;">photo_camera</span>
            <span>Change Photo</span>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-fullName">Full Name</label>
          <input type="text" id="edit-fullName" class="form-input" value="${escapeHtml(user.fullName || '')}" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-department">Department</label>
          <input type="text" id="edit-department" class="form-input" value="${escapeHtml(user.department || '')}" />
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-yearOfStudy">Year of Study</label>
          <select id="edit-yearOfStudy" class="form-input">
            ${[1, 2, 3, 4, 5].map(y => `<option value="${y}" ${user.yearOfStudy === y ? 'selected' : ''}>Year ${y}</option>`).join('')}
          </select>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="button" id="cancel-edit-btn" class="btn btn-outlined" style="flex: 1;">Cancel</button>
          <button type="submit" id="save-profile-btn" class="btn btn-primary" style="flex: 1;">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-modal-btn').addEventListener('click', close);
  modal.querySelector('#cancel-edit-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  // Avatar upload
  const avatarInput = modal.querySelector('#avatar-input');
  const avatarPreview = modal.querySelector('#avatar-preview');
  modal.querySelector('#change-avatar-btn').addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await cloudinaryService.upload(file, 'avatars');
      avatarUrl = result.url;
      avatarPreview.src = avatarUrl;
    } catch (err) {
      toast.error('Failed to upload avatar');
    }
  });

  // Form submit
  modal.querySelector('#edit-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#save-profile-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader-dots"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span></div>';

    onSave({
      fullName: modal.querySelector('#edit-fullName').value.trim(),
      department: modal.querySelector('#edit-department').value.trim(),
      yearOfStudy: Number(modal.querySelector('#edit-yearOfStudy').value),
      avatarUrl: avatarUrl || undefined,
    });
    close();
  });
}
