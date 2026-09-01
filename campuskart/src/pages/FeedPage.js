/**
 * Home Feed / Corkboard Page Component (§5.4, §10.1, §10.2)
 * Route: '/feed', '/category/:categorySlug', '/search'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderFilterChipBar } from '../components/listing/FilterChipBar.js';
import { renderListingCard } from '../components/listing/ListingCard.js';
import { openFilterModal } from '../components/ui/FilterModal.js';
import { apiService } from '../api/apiService.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderFeedPage({ params = {}, queryParams = {}, router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  const activeCategory = params.categorySlug || queryParams.category || 'all';
  const searchQuery = queryParams.q || '';
  const currentFilters = {
    category: activeCategory,
    search: searchQuery,
    condition: queryParams.condition || '',
    minPrice: queryParams.minPrice || '',
    maxPrice: queryParams.maxPrice || '',
    sort: queryParams.sort || 'newest'
  };

  const categories = await apiService.getCategories();

  // Initial skeleton rendering while data loads
  container.innerHTML = `
    ${renderTopNavBar({ activeCategory, activeRoute: '/feed' })}
    ${renderFilterChipBar({
      categories,
      activeCategory,
      activeCondition: currentFilters.condition,
      hasActiveFilters: Boolean(currentFilters.condition || currentFilters.minPrice || currentFilters.maxPrice)
    })}

    <main class="container-custom" style="flex: 1; padding-top: 24px; padding-bottom: 60px;">
      <!-- Search/Category Heading (if filtered or searching) -->
      ${searchQuery ? `
        <div style="margin-bottom: 24px; display: flex; align-items: baseline; justify-content: space-between;">
          <div>
            <span class="utility-label" style="color: var(--on-surface-variant);">Search Results</span>
            <h1 class="headline-sm" style="color: var(--on-surface); margin-top: 2px;">
              "${escapeHtml(searchQuery)}"
            </h1>
          </div>
          <a href="#/feed" class="btn btn-ghost btn-sm" style="color: var(--primary);">Clear search</a>
        </div>
      ` : activeCategory !== 'all' ? `
        <div style="margin-bottom: 24px;">
          <span class="utility-label" style="color: var(--primary);">Category</span>
          <h1 class="headline-sm" style="color: var(--on-surface); margin-top: 2px; text-transform: capitalize;">
            ${escapeHtml(activeCategory)}
          </h1>
        </div>
      ` : ''}

      <!-- Corkboard Masonry Grid -->
      <div id="corkboard-feed-grid" class="corkboard-masonry">
        ${[1, 2, 3, 4, 5, 6].map(() => `
          <div class="corkboard-masonry-item" style="background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 12px; height: 280px;">
            <div class="skeleton" style="width: 100%; height: 160px; margin-bottom: 12px;"></div>
            <div class="skeleton" style="width: 70%; height: 18px; margin-bottom: 8px;"></div>
            <div class="skeleton" style="width: 40%; height: 14px;"></div>
          </div>
        `).join('')}
      </div>
    </main>

    ${renderFooter()}
  `;

  // Bind filter drawer trigger
  container.querySelector('#open-filters-modal-btn')?.addEventListener('click', () => {
    openFilterModal({
      currentFilters,
      onApply: (newFilters) => {
        const query = new URLSearchParams();
        if (newFilters.minPrice) query.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) query.set('maxPrice', newFilters.maxPrice);
        if (newFilters.condition) query.set('condition', newFilters.condition);
        if (newFilters.sort && newFilters.sort !== 'newest') query.set('sort', newFilters.sort);
        if (searchQuery) query.set('q', searchQuery);

        const target = activeCategory !== 'all'
          ? `/category/${activeCategory}?${query.toString()}`
          : `/feed?${query.toString()}`;

        router.navigate(target);
      }
    });
  });

  // Fetch real listings
  try {
    const result = await apiService.getListings(currentFilters);
    if (!result) return container;
    const listings = result.data || result;
    const grid = container.querySelector('#corkboard-feed-grid');

    if (listings.length === 0) {
      grid.className = '';
      grid.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto; position: relative;">
          <span class="pin-dot"></span>
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--primary); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">search_off</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">No listings pinned here yet</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">
            Be the first student to post an item or request in this category!
          </p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <a href="#/feed" class="btn btn-outlined btn-sm">Clear Filters</a>
            <a href="#/listing/new" class="btn btn-primary btn-sm">Post a Listing</a>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = listings.map(listing => renderListingCard(listing)).join('');
    }
  } catch (e) {
    console.error('Error loading feed:', e);
    const grid = container.querySelector('#corkboard-feed-grid');
    const errorMsg = ErrorHandler.getErrorMessage(e);
    grid.className = '';
    grid.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
          <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
        </div>
        <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load listings</h2>
        <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(errorMsg)}</p>
        <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
      </div>
    `;
  }
  
  return container;
}
