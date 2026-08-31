/**
 * Toast Notification Service
 */

class ToastService {
  constructor() {
    this.container = null;
  }

  ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3000) {
    this.ensureContainer();

    const toast = document.createElement('div');
    const bgColors = {
      success: 'var(--surface-container-high)',
      error: 'var(--surface-container-high)',
      info: 'var(--surface-container-high)'
    };
    const borderColors = {
      success: 'var(--success)',
      error: 'var(--error)',
      info: 'var(--primary)'
    };
    const iconNames = {
      success: 'check_circle',
      error: 'error',
      info: 'info'
    };

    toast.style.cssText = `
      background: ${bgColors[type] || 'var(--surface-container-high)'};
      border-left: 4px solid ${borderColors[type] || 'var(--primary)'};
      color: var(--on-surface);
      padding: 12px 18px;
      border-radius: 4px;
      font-size: 14px;
      font-family: var(--font-body);
      box-shadow: 0 6px 16px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: slideInRight 200ms ease;
      min-width: 260px;
      max-width: 400px;
    `;

    toast.innerHTML = `
      <span class="material-symbols-outlined" style="color: ${borderColors[type]}; font-size: 20px;">
        ${iconNames[type]}
      </span>
      <span style="flex: 1;">${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  success(msg, dur) { this.show(msg, 'success', dur); }
  error(msg, dur) { this.show(msg, 'error', dur); }
  info(msg, dur) { this.show(msg, 'info', dur); }
}

export const toast = new ToastService();
