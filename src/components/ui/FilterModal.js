/**
 * FilterModal Component (§10.5)
 * Triggered by the "Filters" chip on Feed and Category pages.
 */

import { createModal } from './Modal.js';

export function openFilterModal({ currentFilters = {}, onApply = () => {} } = {}) {
  const contentHtml = `
    <form id="filter-modal-form">
      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" style="display: block; margin-bottom: 8px;">Price Range (₹)</label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="number" id="filter-min-price" class="form-input" placeholder="Min ₹" value="${currentFilters.minPrice || ''}" min="0" />
          <span style="color: var(--on-surface-variant);">to</span>
          <input type="number" id="filter-max-price" class="form-input" placeholder="Max ₹" value="${currentFilters.maxPrice || ''}" min="0" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" style="display: block; margin-bottom: 8px;">Condition</label>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="condition-chips">
          ${['new', 'like_new', 'good', 'fair', 'used'].map(cond => {
            const isSelected = currentFilters.condition === cond;
            const labelMap = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', used: 'Used' };
            return `
              <button type="button" class="chip ${isSelected ? 'active' : ''}" data-condition="${cond}">
                ${labelMap[cond]}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 24px;">
        <label class="form-label" style="display: block; margin-bottom: 8px;">Sort By</label>
        <select id="filter-sort" class="form-input" style="background-color: var(--surface);">
          <option value="newest" ${currentFilters.sort === 'newest' ? 'selected' : ''}>Newest First</option>
          <option value="price_asc" ${currentFilters.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
          <option value="price_desc" ${currentFilters.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
        </select>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--surface-container);">
        <button type="button" id="filter-reset-btn" class="btn btn-outlined btn-sm">Clear Filters</button>
        <button type="submit" class="btn btn-primary btn-sm">Apply Filters</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: 'Filter Listings',
    contentHtml
  });

  let selectedCondition = currentFilters.condition || '';

  // Condition chip click handling
  const chipContainer = modal.modalBox.querySelector('#condition-chips');
  chipContainer.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const cond = btn.getAttribute('data-condition');
      if (selectedCondition === cond) {
        selectedCondition = '';
        btn.classList.remove('active');
      } else {
        selectedCondition = cond;
        chipContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Reset button
  modal.modalBox.querySelector('#filter-reset-btn').addEventListener('click', () => {
    onApply({ minPrice: '', maxPrice: '', condition: '', sort: 'newest' });
    modal.close();
  });

  // Submit button
  modal.modalBox.querySelector('#filter-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const minPrice = modal.modalBox.querySelector('#filter-min-price').value;
    const maxPrice = modal.modalBox.querySelector('#filter-max-price').value;
    const sort = modal.modalBox.querySelector('#filter-sort').value;

    onApply({
      minPrice,
      maxPrice,
      condition: selectedCondition,
      sort
    });
    modal.close();
  });
}
