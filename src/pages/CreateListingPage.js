/**
 * CreateListingPage Component (§10.3)
 * Route: '/listing/new' - INR & Violet Theme
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { apiService } from '../api/apiService.js';
import { toast } from '../components/ui/Toast.js';

export function renderCreateListingPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  let listingType = 'item'; // 'item' or 'wanted'
  let uploadedImages = [];

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: '/listing/new' })}

    <main class="container-custom" style="flex: 1; padding-top: 32px; padding-bottom: 64px;">
      <div style="max-width: 680px; margin: 0 auto;">
        <!-- Header -->
        <div style="margin-bottom: 28px; text-align: center;">
          <div class="utility-label" style="color: var(--primary); margin-bottom: 6px;">POST TO CORKBOARD</div>
          <h1 class="display-md" style="color: var(--on-surface);">Pin a New Notice</h1>
          <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px;">
            Reach verified students across your college campus in seconds.
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-surface-bright" style="
          border: 1px solid var(--surface-container);
          border-radius: var(--radius-lg);
          padding: 36px;
          box-shadow: var(--shadow-modal);
          position: relative;
        ">
          <span class="pin-dot"></span>

          <!-- Listing Type Selector Tabs -->
          <div style="display: flex; background: var(--surface); padding: 4px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); margin-bottom: 28px;">
            <button
              type="button"
              id="type-item-btn"
              class="btn"
              style="flex: 1; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700; background: var(--primary); color: var(--on-primary);"
            >
              <span class="material-symbols-outlined" style="font-size: 18px;">sell</span>
              <span>I'm Selling an Item</span>
            </button>
            <button
              type="button"
              id="type-wanted-btn"
              class="btn"
              style="flex: 1; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; color: var(--on-surface-variant);"
            >
              <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
              <span>Wanted Request (Looking to Buy)</span>
            </button>
          </div>

          <form id="create-listing-form">
            <!-- 1. Title -->
            <div class="form-group">
              <label class="form-label" for="listing-title">Listing Title *</label>
              <input
                type="text"
                id="listing-title"
                class="form-input"
                placeholder="e.g. Casio FX-991EX Calculator or Stewart Calculus 8th Ed"
                required
              />
            </div>

            <!-- 2. Photos Area (Only for Item Type) -->
            <div id="photos-section" class="form-group" style="margin-bottom: 20px;">
              <label class="form-label">Item Photos</label>
              <div
                id="image-drop-area"
                style="
                  border: 2px dashed var(--surface-container);
                  background: var(--surface);
                  border-radius: var(--radius-default);
                  padding: 24px;
                  text-align: center;
                  cursor: pointer;
                  transition: border-color 150ms ease;
                "
              >
                <span class="material-symbols-outlined" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;">add_photo_alternate</span>
                <div style="font-size: 14px; color: var(--on-surface); font-weight: 600;">Click to upload photos or paste image URL</div>
                <div style="font-size: 12px; color: var(--on-surface-variant); margin-top: 4px;">PNG, JPG up to 5MB</div>
                <input type="file" id="file-upload-input" accept="image/*" style="display: none;" multiple />
              </div>

              <!-- Quick URL Input helper -->
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <input type="url" id="image-url-input" class="form-input" placeholder="Or paste an image URL (Unsplash, imgur...)" style="font-size: 13px;" />
                <button type="button" id="add-url-btn" class="btn btn-outlined btn-sm">Add URL</button>
              </div>

              <!-- Preview thumbnail strip -->
              <div id="image-previews-container" style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;"></div>
            </div>

            <!-- 3. Price & Currency -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 16px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="listing-price">Price (₹) *</label>
                <div class="form-input-wrapper">
                  <span class="form-input-icon" style="font-weight: 700;">₹</span>
                  <input
                    type="number"
                    id="listing-price"
                    class="form-input has-icon"
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="listing-currency">Currency</label>
                <select id="listing-currency" class="form-input" style="background-color: var(--surface);">
                  <option value="INR" selected>INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <!-- 4. Category & Condition (2-col) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="listing-category">Category *</label>
                <select id="listing-category" class="form-input" style="background-color: var(--surface);" required>
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel &amp; Dorm</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Cycles">Cycles &amp; Mobility</option>
                  <option value="Stationery">Stationery &amp; Supplies</option>
                </select>
              </div>

              <div id="condition-section" class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="listing-condition">Condition</label>
                <select id="listing-condition" class="form-input" style="background-color: var(--surface);">
                  <option value="like_new">Like New (Mint)</option>
                  <option value="good" selected>Good (Light use)</option>
                  <option value="fair">Fair (Visible wear)</option>
                  <option value="new">Brand New / Unopened</option>
                </select>
              </div>
            </div>

            <!-- 5. Pickup Location -->
            <div class="form-group">
              <label class="form-label" for="listing-pickup">Campus Safe Pickup Point *</label>
              <div class="form-input-wrapper">
                <span class="material-symbols-outlined form-input-icon">location_on</span>
                <input
                  type="text"
                  id="listing-pickup"
                  class="form-input has-icon"
                  placeholder="e.g. Central Library Gate, Hostel 4 Lobby, Canteen Quad"
                  required
                />
              </div>
              <div class="form-helper">Always agree on public, well-lit campus spots.</div>
            </div>

            <!-- 6. Description -->
            <div class="form-group" style="margin-bottom: 28px;">
              <label class="form-label" for="listing-description">Description &amp; Details</label>
              <textarea
                id="listing-description"
                rows="4"
                class="form-input"
                placeholder="Include specifications, included accessories, reasons for selling, and when you can meet on campus..."
                style="resize: vertical; font-family: var(--font-body);"
              ></textarea>
            </div>

            <!-- Submit Action -->
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 14px;">
              <a href="#/feed" class="btn btn-outlined">Cancel</a>
              <button
                type="submit"
                id="submit-listing-btn"
                class="btn btn-primary"
                style="font-weight: 700; padding: 12px 24px;"
              >
                <span class="material-symbols-outlined">push_pin</span>
                <span>Pin to Corkboard</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    ${renderFooter()}
  `;

  // Toggle Item vs Wanted type
  const typeItemBtn = container.querySelector('#type-item-btn');
  const typeWantedBtn = container.querySelector('#type-wanted-btn');
  const photosSection = container.querySelector('#photos-section');
  const conditionSection = container.querySelector('#condition-section');

  typeItemBtn.addEventListener('click', () => {
    listingType = 'item';
    typeItemBtn.style.background = 'var(--primary)';
    typeItemBtn.style.color = 'var(--on-primary)';
    typeWantedBtn.style.background = 'transparent';
    typeWantedBtn.style.color = 'var(--on-surface-variant)';
    photosSection.style.display = 'block';
    conditionSection.style.display = 'block';
  });

  typeWantedBtn.addEventListener('click', () => {
    listingType = 'wanted';
    typeWantedBtn.style.background = 'var(--primary)';
    typeWantedBtn.style.color = 'var(--on-primary)';
    typeItemBtn.style.background = 'transparent';
    typeItemBtn.style.color = 'var(--on-surface-variant)';
    photosSection.style.display = 'none';
    conditionSection.style.display = 'none';
  });

  // Photo handlers
  const dropArea = container.querySelector('#image-drop-area');
  const fileInput = container.querySelector('#file-upload-input');
  const previews = container.querySelector('#image-previews-container');
  const urlInput = container.querySelector('#image-url-input');
  const addUrlBtn = container.querySelector('#add-url-btn');

  dropArea.addEventListener('click', () => fileInput.click());

  const addImageUrl = (url) => {
    if (!url) return;
    uploadedImages.push({ id: `img-${Date.now()}`, url, sortOrder: uploadedImages.length });
    renderPreviews();
  };

  const renderPreviews = () => {
    previews.innerHTML = uploadedImages.map((img, idx) => `
      <div style="position: relative; width: 64px; height: 64px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--surface-container);">
        <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover;" />
        <button
          type="button"
          onclick="event.stopPropagation(); window.removeUploadedImage(${idx})"
          style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: #fff; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 12px;"
        >
          &times;
        </button>
      </div>
    `).join('');
  };

  window.removeUploadedImage = (index) => {
    uploadedImages.splice(index, 1);
    renderPreviews();
  };

  addUrlBtn.addEventListener('click', () => {
    const val = urlInput.value.trim();
    if (val) {
      addImageUrl(val);
      urlInput.value = '';
    }
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => addImageUrl(ev.target.result);
      reader.readAsDataURL(file);
    });
  });

  // Form submit
  const form = container.querySelector('#create-listing-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = container.querySelector('#listing-title').value.trim();
    const price = container.querySelector('#listing-price').value;
    const currency = container.querySelector('#listing-currency').value || 'INR';
    const categoryTop = container.querySelector('#listing-category').value;
    const condition = listingType === 'item' ? container.querySelector('#listing-condition').value : undefined;
    const pickupLocation = container.querySelector('#listing-pickup').value.trim();
    const description = container.querySelector('#listing-description').value.trim();

    const finalImages = listingType === 'item' && uploadedImages.length === 0
      ? [{ id: 'img-default', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800', sortOrder: 0 }]
      : uploadedImages;

    const newListing = await apiService.createListing({
      type: listingType,
      title,
      price: Number(price),
      currency,
      categoryTop,
      condition,
      pickupLocation,
      description,
      images: finalImages
    });

    toast.success('Notice successfully pinned to corkboard!');
    router.navigate(`/listing/${newListing.id}`);
  });

  return container;
}
