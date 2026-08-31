/**
 * ResetPasswordPage Component
 * Route: '/reset-password'
 */

import { apiService } from '../api/apiService.js';
import { toast } from '../components/ui/Toast.js';

export function renderResetPasswordPage({ queryParams = {}, router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-dot-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
  `;

  const token = queryParams.token || '';

  container.innerHTML = `
    <div style="position: absolute; top: 24px; left: 24px;">
      <a href="#/" style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
        <span class="display-md" style="font-size: 22px; font-weight: 700; color: var(--primary);">CampusKart</span>
      </a>
    </div>

    <div class="bg-surface-bright" style="
      width: 100%;
      max-width: 420px;
      padding: 40px 36px;
      border: 1px solid var(--surface-container);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
      position: relative;
      transform: rotate(-0.5deg);
    ">
      <span class="pin-dot"></span>
      <span class="tape-strip tape-bottom-right"></span>

      <div style="margin-bottom: 28px; text-align: center;">
        <h1 class="display-lg" style="font-size: 36px; color: var(--primary); margin-bottom: 6px;">Reset Password</h1>
        <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px;">Enter your new password below</p>
      </div>

      <div id="reset-error-banner" style="display: none; background: rgba(193, 97, 63, 0.15); border: 1px solid var(--error); color: var(--error); padding: 10px 14px; border-radius: var(--radius-default); font-size: 13px; margin-bottom: 20px;"></div>

      <form id="reset-form">
        <input type="hidden" id="reset-token" value="${token}" />

        <div class="form-group">
          <label class="form-label" for="new-password">New Password</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">lock</span>
            <input
              type="password"
              id="new-password"
              class="form-input has-icon"
              placeholder="Min 8 characters"
              minlength="8"
              required
            />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" for="confirm-password">Confirm Password</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">lock</span>
            <input
              type="password"
              id="confirm-password"
              class="form-input has-icon"
              placeholder="Re-enter password"
              minlength="8"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          id="reset-submit-btn"
          class="btn btn-primary"
          style="width: 100%; font-weight: 700; padding: 12px; font-size: 15px;"
        >
          <span>Reset Password</span>
          <span class="material-symbols-outlined">check</span>
        </button>
      </form>
    </div>
  `;

  const form = container.querySelector('#reset-form');
  const errorBanner = container.querySelector('#reset-error-banner');
  const submitBtn = container.querySelector('#reset-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';

    const resetToken = container.querySelector('#reset-token').value.trim();
    const newPassword = container.querySelector('#new-password').value;
    const confirmPassword = container.querySelector('#confirm-password').value;

    if (!resetToken) {
      errorBanner.innerText = 'Invalid reset link. Please request a new one.';
      errorBanner.style.display = 'block';
      return;
    }

    if (newPassword.length < 8) {
      errorBanner.innerText = 'Password must be at least 8 characters.';
      errorBanner.style.display = 'block';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorBanner.innerText = 'Passwords do not match.';
      errorBanner.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="loader-dots">
        <span class="loader-dot" style="background: var(--on-primary);"></span>
        <span class="loader-dot" style="background: var(--on-primary);"></span>
        <span class="loader-dot" style="background: var(--on-primary);"></span>
      </div>
    `;

    try {
      await apiService.resetPassword(resetToken, newPassword);
      toast.success('Password reset successful! Please log in.');
      router.navigate('/login');
    } catch (err) {
      errorBanner.innerText = err.message === 'INVALID_OR_EXPIRED_TOKEN'
        ? 'This reset link has expired. Please request a new one.'
        : 'Failed to reset password. Please try again.';
      errorBanner.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Reset Password</span><span class="material-symbols-outlined">check</span>`;
    }
  });

  return container;
}
