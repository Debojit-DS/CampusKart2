/**
 * ListingDetailPage Component (§5.5)
 * Route: '/listing/:listingId'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderPriceTag } from '../components/ui/PriceTag.js';
import { renderConditionBadge } from '../components/ui/ConditionBadge.js';
import { renderAvatar, renderVerifiedBadge } from '../components/ui/Avatar.js';
import { renderListingCard } from '../components/listing/ListingCard.js';
import { openImageLightbox } from '../components/ui/ImageLightbox.js';
import { openOfferModal } from '../components/ui/OfferModal.js';
import { toast } from '../components/ui/Toast.js';
import { apiService } from '../api/apiService.js';
import { store } from '../data/store.js';
import { formatRelativeTime, escapeHtml } from '../utils/formatters.js';

export async function renderListingDetailPage({ params = {}, router } = {}) {
  const listingId = params.listingId;
  const listing = await apiService.getListingById(listingId);

  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  if (!listing) {
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/feed' })}
      <main class="container-custom" style="flex: 1; padding: 80px 20px; text-align: center;">
        <h1 class="display-md text-primary" style="margin-bottom: 12px;">Listing Not Found</h1>
        <p class="body-lg text-on-surface-variant" style="margin-bottom: 24px;">This notice might have expired, been sold, or removed.</p>
        <a href="#/feed" class="btn btn-primary">Back to Feed</a>
      </main>
      ${renderFooter()}
    `;
    return container;
  }

  const currentUser = store.getCurrentUser() || {};
  const isOwner = listing.sellerId === currentUser.id;
  const seller = await apiService.getUserById(listing.sellerId) || { fullName: 'Student', department: 'Engineering', yearOfStudy: 3 };
  const similarListings = await apiService.getSimilarListings(listing.id);
  let isBookmarked = store.isBookmarked(listing.id);

  const images = listing.images?.length > 0
    ? listing.images
    : [{ id: 'placeholder', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800', altText: listing.title }];

  let activeImageIndex = 0;

  container.innerHTML = `
    ${renderTopNavBar({ activeCategory: listing.categoryTop?.toLowerCase() || '', activeRoute: '/listing' })}

    <main class="container-custom" style="flex: 1; padding-top: 32px; padding-bottom: 64px;">
      <!-- Breadcrumb row -->
      <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--on-surface-variant); margin-bottom: 24px; font-family: var(--font-mono);">
        <a href="#/feed" style="color: var(--on-surface-variant);">Corkboard</a>
        <span>&rsaquo;</span>
        <a href="#/category/${listing.categoryTop?.toLowerCase()}" style="color: var(--on-surface-variant);">${escapeHtml(listing.categoryTop)}</a>
        ${listing.categorySub ? `<span>&rsaquo;</span><span style="color: var(--primary);">${escapeHtml(listing.categorySub)}</span>` : ''}
      </div>

      <!-- Main 2-Column Detail Section -->
      <div style="display: grid; grid-template-columns: 1fr; gap: 40px; margin-bottom: 64px;" class="lg-grid-12">
        <!-- Left: Gallery (7/12) -->
        <div style="grid-column: span 7;">
          <!-- Hero Image with Pin and Notched Price Tag -->
          <div
            id="hero-img-container"
            style="
              position: relative;
              border-radius: var(--radius-default);
              border: 1px solid var(--surface-container);
              background: var(--surface-bright);
              padding: 12px;
              transform: rotate(-0.5deg);
              box-shadow: 0 12px 32px rgba(0,0,0,0.5);
              margin-bottom: 16px;
            "
          >
            <span class="pin-dot"></span>
            <div style="position: relative; aspect-ratio: 4 / 3; width: 100%; border-radius: var(--radius-sm); overflow: hidden; background: #000; cursor: zoom-in;" id="lightbox-trigger">
              <img
                id="listing-hero-image"
                src="${images[0].url}"
                alt="${escapeHtml(listing.title)}"
                style="width: 100%; height: 100%; object-fit: cover; transition: opacity 200ms ease;"
              />
              <div style="position: absolute; top: 12px; right: 0; z-index: 5;">
                ${renderPriceTag({ amount: listing.price, currency: listing.currency, variant: 'notch' })}
              </div>
            </div>
          </div>

          <!-- Thumbnail Strip -->
          ${images.length > 1 ? `
            <div id="thumb-strip" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
              ${images.map((img, idx) => `
                <div
                  class="thumb-item"
                  data-index="${idx}"
                  style="
                    width: 72px;
                    height: 72px;
                    border-radius: var(--radius-sm);
                    border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--surface-container)'};
                    overflow: hidden;
                    cursor: pointer;
                    opacity: ${idx === 0 ? '1' : '0.65'};
                    transition: all 150ms ease;
                    flex-shrink: 0;
                  "
                >
                  <img src="${img.url}" alt="Thumbnail ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Right: Details & Actions (5/12) -->
        <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 20px;">
          <!-- Category & Title -->
          <div>
            <div class="utility-label" style="color: var(--primary); margin-bottom: 6px;">
              ${escapeHtml(listing.categoryTop || 'Academic')}${listing.categorySub ? ` &bull; ${escapeHtml(listing.categorySub)}` : ''}
            </div>
            <h1 class="display-lg" style="font-size: 32px; line-height: 1.25; color: var(--on-surface); margin-bottom: 12px;">
              ${escapeHtml(listing.title)}
            </h1>

            <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--on-surface-variant);">
              ${renderConditionBadge(listing.condition, true)}
              <span>&bull;</span>
              <span>Posted ${formatRelativeTime(listing.createdAt)}</span>
            </div>
          </div>

          <div style="height: 1px; background: var(--surface-container);"></div>

          <!-- Seller Info Card (Rotated Notice Style) -->
          <a
            href="#/profile/${seller.id}"
            style="
              display: flex;
              align-items: center;
              gap: 14px;
              background: var(--surface-bright);
              border: 1px solid var(--surface-container);
              padding: 16px;
              border-radius: var(--radius-default);
              text-decoration: none;
              transform: rotate(0.6deg);
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              position: relative;
            "
          >
            <span class="pin-dot pin-corner-left pin-teal"></span>
            ${renderAvatar({ user: seller, size: 48 })}
            <div style="flex: 1;">
              <div style="font-weight: 700; color: var(--on-surface); font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <span>${escapeHtml(seller.fullName)}</span>
                ${seller.isVerified ? renderVerifiedBadge(16) : ''}
              </div>
              <div style="font-size: 12px; color: var(--on-surface-variant); font-family: var(--font-mono);">
                Year ${seller.yearOfStudy || 3} &bull; ${escapeHtml(seller.department || 'Engineering')}
              </div>
              <div style="font-size: 12px; color: var(--primary); margin-top: 2px;">
                ★ ${seller.ratingAverage || 5.0} (${seller.ratingCount || 10} ratings)
              </div>
            </div>
            <span class="material-symbols-outlined" style="color: var(--on-surface-variant); font-size: 20px;">chevron_right</span>
          </a>

          <!-- Pickup Location -->
          <div style="background: var(--surface-container-low); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 14px 16px; display: flex; align-items: flex-start; gap: 10px;">
            <span class="material-symbols-outlined" style="color: var(--primary); font-size: 22px; flex-shrink: 0; margin-top: 2px;">location_on</span>
            <div>
              <div class="utility-label" style="font-size: 11px; color: var(--on-surface-variant); margin-bottom: 2px;">Campus Safe Pickup Point</div>
              <div style="font-weight: 600; color: var(--on-surface); font-size: 14px;">${escapeHtml(listing.pickupLocation)}</div>
            </div>
          </div>

          <!-- Description (Markdown / itemized bullets) -->
          <div style="background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 18px;">
            <div class="utility-label" style="color: var(--on-surface-variant); margin-bottom: 10px;">Description</div>
            <div style="font-size: 14px; line-height: 1.6; color: var(--on-surface); white-space: pre-line;">
              ${escapeHtml(listing.description)}
            </div>
          </div>

          <!-- Buyer / Owner Action Panel -->
          <div style="margin-top: 8px;">
            ${isOwner ? `
              <!-- Owner Controls (§10.4) -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 12px; color: var(--primary); font-family: var(--font-mono); font-weight: 600;">
                  ★ You are the seller of this item
                </div>
                <div style="display: flex; gap: 10px;">
                  <button type="button" id="mark-sold-btn" class="btn btn-outlined btn-sm" style="flex: 1;">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span>Mark as Sold</span>
                  </button>
                  <button type="button" id="delete-listing-btn" class="btn btn-destructive btn-sm">
                    <span class="material-symbols-outlined">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ` : `
              <!-- Buyer Controls (§5.5) -->
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <button
                  type="button"
                  id="message-seller-btn"
                  class="btn btn-primary btn-lg"
                  style="width: 100%; font-weight: 700; border-radius: var(--radius-default);"
                >
                  <span class="material-symbols-outlined">chat</span>
                  <span>Message Seller</span>
                </button>

                <div style="display: flex; gap: 10px;">
                  <button
                    type="button"
                    id="make-offer-btn"
                    class="btn btn-outlined"
                    style="flex: 1; font-weight: 600;"
                  >
                    <span class="material-symbols-outlined">local_offer</span>
                    <span>Make an Offer</span>
                  </button>

                  <button
                    type="button"
                    id="bookmark-btn"
                    class="btn btn-outlined btn-icon"
                    title="${isBookmarked ? 'Remove Bookmark' : 'Save for later'}"
                    aria-label="Bookmark listing"
                  >
                    <span class="material-symbols-outlined ${isBookmarked ? 'filled' : ''}" style="${isBookmarked ? 'color: var(--primary);' : ''}">
                      ${isBookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Similar Listings Strip (§5.5) -->
      ${similarListings.length > 0 ? `
        <div style="border-top: 1px solid var(--surface-container); padding-top: 40px;">
          <h2 class="display-md" style="font-size: 24px; margin-bottom: 24px; color: var(--on-surface);">Similar Listings on Campus</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
            ${similarListings.map(item => renderListingCard(item, { variant: 'compact' })).join('')}
          </div>
        </div>
      ` : ''}
    </main>

    ${renderFooter()}
  `;

  // Gallery Thumbnail Swapping
  const heroImg = container.querySelector('#listing-hero-image');
  const thumbItems = container.querySelectorAll('.thumb-item');
  thumbItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      activeImageIndex = idx;
      heroImg.src = images[idx].url;
      thumbItems.forEach(t => {
        t.style.borderColor = 'var(--surface-container)';
        t.style.opacity = '0.65';
      });
      item.style.borderColor = 'var(--primary)';
      item.style.opacity = '1';
    });
  });

  // Lightbox Zoom
  container.querySelector('#lightbox-trigger')?.addEventListener('click', () => {
    openImageLightbox(images[activeImageIndex].url, listing.title);
  });

  // Buyer Action: Bookmark Toggle
  const bookmarkBtn = container.querySelector('#bookmark-btn');
  bookmarkBtn?.addEventListener('click', async () => {
    const active = await apiService.toggleBookmark(listing.id);
    isBookmarked = active;
    const icon = bookmarkBtn.querySelector('span');
    if (active) {
      icon.className = 'material-symbols-outlined filled';
      icon.innerText = 'bookmark';
      icon.style.color = 'var(--primary)';
      toast.success('Pinned to your Saved list!');
    } else {
      icon.className = 'material-symbols-outlined';
      icon.innerText = 'bookmark_border';
      icon.style.color = '';
      toast.info('Removed from Saved list');
    }
  });

  // Buyer Action: Message Seller
  container.querySelector('#message-seller-btn')?.addEventListener('click', async () => {
    const conv = await apiService.createOrGetConversation(listing.id, listing.sellerId);
    router.navigate(`/messages/${conv.id}`);
  });

  // Buyer Action: Make an Offer
  container.querySelector('#make-offer-btn')?.addEventListener('click', () => {
    openOfferModal({
      listing,
      onSubmit: async (amount) => {
        const conv = await apiService.createOrGetConversation(listing.id, listing.sellerId);
        await apiService.makeOffer(conv.id, listing.id, amount);
        toast.success(`Offer of $${amount} sent to seller!`);
        router.navigate(`/messages/${conv.id}`);
      }
    });
  });

  // Owner Controls: Mark as Sold
  container.querySelector('#mark-sold-btn')?.addEventListener('click', async () => {
    await apiService.updateListing(listing.id, { status: 'sold' });
    toast.success('Listing marked as sold!');
    router.navigate('/profile');
  });

  // Owner Controls: Delete
  container.querySelector('#delete-listing-btn')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to remove this notice from the board?')) {
      await apiService.deleteListing(listing.id);
      toast.info('Listing removed');
      router.navigate('/feed');
    }
  });

  return container;
}
