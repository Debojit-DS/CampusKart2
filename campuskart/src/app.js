/**
 * CampusKart Application Bootstrap & Route Definitions (Inter + Violet + Theme Toggle)
 */

import { Router } from './utils/router.js';
import { store } from './data/store.js';

// Page components
import { renderLandingPage } from './pages/LandingPage.js';
import { renderLoginPage } from './pages/LoginPage.js';
import { renderSignUpPage } from './pages/SignUpPage.js';
import { renderVerifyEmailPage } from './pages/VerifyEmailPage.js';
import { renderForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { renderResetPasswordPage } from './pages/ResetPasswordPage.js';
import { renderLeaderboardPage } from './pages/LeaderboardPage.js';
import { renderWishlistPage } from './pages/WishlistPage.js';
import { renderAdminPage } from './pages/AdminPage.js';
import { renderFeedPage } from './pages/FeedPage.js';
import { renderListingDetailPage } from './pages/ListingDetailPage.js';
import { renderCreateListingPage } from './pages/CreateListingPage.js';
import { renderMessagesPage } from './pages/MessagesPage.js';
import { renderProfilePage } from './pages/ProfilePage.js';
import { renderSavedPage } from './pages/SavedPage.js';
import { renderNotificationsPage } from './pages/NotificationsPage.js';
import { renderStaticLegalPage } from './pages/StaticLegalPage.js';

// Helper to mount pages into DOM
async function mountView(appRoot, renderFnOrPromise) {
  appRoot.innerHTML = '';
  try {
    const result = await renderFnOrPromise;
    if (typeof result === 'string') {
      appRoot.innerHTML = result;
    } else if (result instanceof HTMLElement) {
      appRoot.appendChild(result);
    }
  } catch (err) {
    console.error('Page render error:', err);
    appRoot.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <h1 class="display-md text-primary" style="margin-bottom: 12px;">Something went wrong</h1>
        <p class="body-lg text-on-surface-variant" style="margin-bottom: 24px; font-family: var(--font-mono); font-size: 13px; color: var(--error);">${err.message || 'Unknown error'}</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }
}

export function initApp(appRoot) {
  const routes = [
    // Marketing & Auth (Public)
    {
      path: '/',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderLandingPage(ctx))
    },
    {
      path: '/login',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderLoginPage(ctx))
    },
    {
      path: '/signup',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderSignUpPage(ctx))
    },
    {
      path: '/verify-email',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderVerifyEmailPage(ctx))
    },
    {
      path: '/forgot-password',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderForgotPasswordPage(ctx))
    },
    {
      path: '/reset-password',
      authRequired: false,
      handler: (ctx) => mountView(appRoot, renderResetPasswordPage(ctx))
    },
    {
      path: '/leaderboard',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderLeaderboardPage(ctx))
    },
    {
      path: '/wishlist',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderWishlistPage(ctx))
    },
    {
      path: '/admin',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderAdminPage(ctx))
    },

    // Marketplace Feed & Search (Protected)
    {
      path: '/feed',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderFeedPage(ctx))
    },
    {
      path: '/home',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderFeedPage(ctx))
    },
    {
      path: '/category/:categorySlug',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderFeedPage(ctx))
    },
    {
      path: '/search',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderFeedPage(ctx))
    },

    // Listing Details & Creation (Protected)
    {
      path: '/listing/new',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderCreateListingPage(ctx))
    },
    {
      path: '/listing/:listingId',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderListingDetailPage(ctx))
    },

    // Messaging & Negotiation (Protected)
    {
      path: '/messages',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderMessagesPage(ctx))
    },
    {
      path: '/messages/:conversationId',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderMessagesPage(ctx))
    },

    // User Profile, Watchlist & Activity (Protected)
    {
      path: '/profile',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderProfilePage(ctx))
    },
    {
      path: '/profile/:userId',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderProfilePage(ctx))
    },
    {
      path: '/saved',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderSavedPage(ctx))
    },
    {
      path: '/notifications',
      authRequired: true,
      handler: (ctx) => mountView(appRoot, renderNotificationsPage(ctx))
    },

    // Static & Legal Content (Public)
    {
      path: '/about',
      authRequired: false,
      handler: () => mountView(appRoot, renderStaticLegalPage({ pageType: 'about' }))
    },
    {
      path: '/safety',
      authRequired: false,
      handler: () => mountView(appRoot, renderStaticLegalPage({ pageType: 'safety' }))
    },
    {
      path: '/reports',
      authRequired: false,
      handler: () => mountView(appRoot, renderStaticLegalPage({ pageType: 'reports' }))
    },
    {
      path: '/privacy',
      authRequired: false,
      handler: () => mountView(appRoot, renderStaticLegalPage({ pageType: 'privacy' }))
    }
  ];

  const router = new Router(routes);
  router.setContainer(appRoot);

  try {
    router.handleRouteChange();
  } catch (err) {
    console.error('[initApp] Initial route handling failed:', err);
    appRoot.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <h1 class="display-md text-primary" style="margin-bottom: 12px;">Something went wrong</h1>
        <p class="body-lg text-on-surface-variant" style="margin-bottom: 24px; font-family: var(--font-mono); font-size: 13px; color: var(--error);">${err.message || 'Unknown error'}</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }

  // Global Theme toggle trigger
  window.toggleAppTheme = () => {
    store.toggleTheme();
  };

  // Subscribe to reactive store changes to refresh active views
  store.subscribe('auth_change', () => {
    router.handleRouteChange();
  });

  store.subscribe('theme_change', () => {
    router.handleRouteChange();
  });

  return router;
}
