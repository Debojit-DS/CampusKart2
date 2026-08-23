/**
 * Modal Dialog Utility Component
 */

export function createModal({ title = '', contentHtml = '', onClose = () => {} } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(17, 14, 7, 0.85);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 150ms ease;
  `;

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box bg-surface-bright';
  modalBox.style.cssText = `
    width: 100%;
    max-width: 480px;
    background: var(--surface-bright);
    border: 1px solid var(--surface-container);
    border-radius: var(--radius-lg);
    box-shadow: 0 12px 32px rgba(0,0,0,0.6);
    overflow: hidden;
    position: relative;
    animation: scaleUp 150ms ease;
  `;

  modalBox.innerHTML = `
    <div style="padding: 18px 24px; border-bottom: 1px solid var(--surface-container); display: flex; align-items: center; justify-content: space-between;">
      <h3 class="headline-sm" style="font-size: 20px; color: var(--on-surface); margin: 0;">${title}</h3>
      <button class="modal-close-btn btn-icon btn-ghost" style="color: var(--on-surface-variant);" aria-label="Close dialog">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="modal-body" style="padding: 24px;">
      ${contentHtml}
    </div>
  `;

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 150ms ease';
    setTimeout(() => {
      overlay.remove();
      onClose();
    }, 150);
  };

  overlay.querySelector('.modal-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  return {
    element: overlay,
    modalBox,
    close
  };
}
