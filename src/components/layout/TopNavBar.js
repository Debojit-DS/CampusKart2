/**
 * TopNavBar Component (§4.1)
 * Sticky header with responsive navigation, search, light/dark mode toggle, and profile controls.
 */

import { store } from '../../data/store.js';
import { renderAvatar } from '../ui/Avatar.js';

export function renderTopNavBar({ activeCategory = '', activeRoute = '' } = {}) {
  const isAuth = store.isAuthenticated();
  const currentUser = store.getCurrentUser() || {};
  const unreadNotifs = store.getUnreadNotificationCount();
  const unreadMessages = store.getUnreadMessageCount();
  const currentTheme = store.getTheme();

  const brandLink = isAuth ? '#/feed' : '#/';

  const navCategories = [
    { label: 'Academic', slug: 'academic' },
    { label: 'Hostel', slug: 'hostel' },
    { label: 'Electronics', slug: 'electronics' },
    { label: 'Cycles', slug: 'cycles' }
  ];

  const themeIcon = currentTheme === 'light' ? 'dark_mode' : 'light_mode';
  const themeTooltip = currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';

  return `
    <header class="top-nav-bar" style="position: sticky; top: 0; z-index: 50; height: 64px; background-color: var(--surface); border-bottom: 1px solid var(--surface-container); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--margin-mobile); box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
      <!-- Left: Brand Wordmark -->
      <div style="display: flex; align-items: center; gap: 28px;">
        <a href="${brandLink}" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 10px var(--primary);"></span>
          <span class="display-md" style="font-size: 24px; line-height: 1; color: var(--primary); font-weight: 800; letter-spacing: -0.03em;">CampusKart</span>
        </a>

        <!-- Center: Category Nav Links (Desktop) -->
        ${isAuth ? `
          <nav class="hidden-mobile" style="display: flex; align-items: center; gap: 20px;">
            ${navCategories.map(cat => {
              const isActive = activeCategory.toLowerCase() === cat.slug;
              return `
                <a href="#/category/${cat.slug}" style="font-family: var(--font-body); font-size: 14px; font-weight: 600; color: ${isActive ? 'var(--primary)' : 'var(--on-surface-variant)'}; padding: 6px 0; border-bottom: 2px solid ${isActive ? 'var(--primary)' : 'transparent'}; transition: color 150ms ease;">
                  ${cat.label}
                </a>
              `;
            }).join('')}
          </nav>
        ` : ''}
      </div>

      <!-- Right: Search, Post Listing CTA, Theme Toggle, Icons & Profile -->
      <div style="display: flex; align-items: center; gap: 10px;">
        <!-- Theme Toggle Button (Light/Dark Mode) -->
        <button
          type="button"
          class="theme-toggle-btn"
          id="global-theme-toggle-btn"
          title="${themeTooltip}"
          aria-label="${themeTooltip}"
          onclick="window.toggleAppTheme()"
        >
          <span class="material-symbols-outlined" style="font-size: 20px;">${themeIcon}</span>
        </button>

        ${isAuth ? `
          <!-- Search Input -->
          <form id="nav-search-form" style="position: relative; display: flex; align-items: center;" onsubmit="event.preventDefault(); const q = this.querySelector('input').value; if(q) window.location.hash = '#/search?q=' + encodeURIComponent(q);">
            <span class="material-symbols-outlined" style="position: absolute; left: 10px; color: var(--on-surface-variant); font-size: 18px; pointer-events: none;">search</span>
            <input
              type="text"
              name="q"
              placeholder="Search campus..."
              class="form-input has-icon"
              style="height: 36px; padding-left: 34px; padding-right: 12px; font-size: 13px; width: 160px; background: var(--surface-bright); border-radius: var(--radius-full); transition: width 200ms ease;"
              onfocus="this.style.width='220px'"
              onblur="this.style.width='160px'"
            />
          </form>

          <!-- Post Listing Button -->
          <a href="#/listing/new" class="btn btn-primary btn-sm" style="font-weight: 700; border-radius: var(--radius-full);">
            <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
            <span>Post Listing</span>
          </a>

          <!-- Saved / Bookmarks -->
          <a href="#/saved" class="btn-icon btn-ghost" title="Saved Listings" aria-label="Saved Listings" style="position: relative;">
            <span class="material-symbols-outlined" style="${activeRoute === '/saved' ? 'color: var(--primary);' : ''}">bookmark</span>
          </a>

          <!-- Messages -->
          <a href="#/messages" class="btn-icon btn-ghost" title="Messages" aria-label="Messages" style="position: relative;">
            <span class="material-symbols-outlined" style="${activeRoute.startsWith('/messages') ? 'color: var(--primary);' : ''}">chat</span>
            ${unreadMessages > 0 ? `
              <span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
            ` : ''}
          </a>

          <!-- Notifications -->
          <a href="#/notifications" class="btn-icon btn-ghost" title="Notifications" aria-label="Notifications" style="position: relative;">
            <span class="material-symbols-outlined" style="${activeRoute === '/notifications' ? 'color: var(--primary);' : ''}">notifications</span>
            ${unreadNotifs > 0 ? `
              <span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
            ` : ''}
          </a>

          <!-- Profile -->
          <a href="#/profile" title="${currentUser.fullName || 'Profile'}" aria-label="Profile" style="margin-left: 2px;">
            ${renderAvatar({ user: currentUser, size: 32 })}
          </a>
        ` : `
          <a href="#/login" class="btn btn-ghost btn-sm">Log in</a>
          <a href="#/signup" class="btn btn-primary btn-sm">Sign Up</a>
        `}
      </div>
    </header>
  `;
}
