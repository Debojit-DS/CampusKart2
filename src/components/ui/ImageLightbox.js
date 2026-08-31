/**
 * ImageLightbox Component (§5.5)
 */

export function openImageLightbox(imageUrl = '', altText = '') {
  if (!imageUrl) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(17, 14, 7, 0.95);
    backdrop-filter: blur(8px);
    z-index: 11000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fadeIn 150ms ease;
    cursor: zoom-out;
  `;

  overlay.innerHTML = `
    <button class="btn-icon btn-ghost" style="position: absolute; top: 20px; right: 20px; color: var(--on-surface); font-size: 28px; z-index: 10;" aria-label="Close Lightbox">
      <span class="material-symbols-outlined" style="font-size: 32px;">close</span>
    </button>
    <img src="${imageUrl}" alt="${altText}" style="max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 4px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); cursor: default;" />
  `;

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 150ms ease';
    setTimeout(() => overlay.remove(), 150);
  };

  overlay.addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') close();
  });

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  document.body.appendChild(overlay);
}
