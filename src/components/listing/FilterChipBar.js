/**
 * FilterChipBar Component (§4.5)
 * Horizontal scrollable category filters and drawer trigger.
 */

export function renderFilterChipBar({
  categories = [],
  activeCategory = 'all',
  activeCondition = '',
  hasActiveFilters = false
} = {}) {
  return `
    <div class="filter-chip-bar-container" style="position: sticky; top: 64px; z-index: 40; background-color: var(--surface-container-lowest); border-bottom: 1px solid var(--surface-container);">
      <div class="container-custom" style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; padding-bottom: 10px;">
        <!-- Horizontal Scrollable Category Chips -->
        <div class="chip-bar" style="padding: 0; flex: 1;">
          <a
            href="#/feed"
            class="chip ${activeCategory === 'all' ? 'active' : ''}"
            style="text-decoration: none;"
          >
            All Items
          </a>

          ${categories.filter(c => c.slug !== 'all').map(cat => {
            const isActive = activeCategory.toLowerCase() === cat.slug.toLowerCase();
            return `
              <a
                href="#/category/${cat.slug}"
                class="chip ${isActive ? 'active' : ''}"
                style="text-decoration: none;"
              >
                ${cat.label}
              </a>
            `;
          }).join('')}
        </div>

        <!-- Filter Drawer Button -->
        <button
          type="button"
          id="open-filters-modal-btn"
          class="btn btn-outlined btn-sm"
          style="margin-left: 12px; font-family: var(--font-mono); font-size: 12px; ${hasActiveFilters ? 'border-color: var(--primary); color: var(--primary);' : ''}"
        >
          <span class="material-symbols-outlined" style="font-size: 16px;">tune</span>
          <span>Filters ${hasActiveFilters ? '•' : ''}</span>
        </button>
      </div>
    </div>
  `;
}
