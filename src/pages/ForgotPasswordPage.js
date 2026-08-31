/**
 * ForgotPassword Page Component (§10.6)
 * Route: '/forgot-password'
 */

import { apiService } from '../api/apiService.js';
import { toast } from '../components/ui/Toast.js';

export function renderForgotPasswordPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-dot-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  `;

  container.innerHTML = `
    <div class="bg-surface-bright" style="
      width: 100%;
      max-width: 420px;
      padding: 40px 36px;
      border: 1px solid var(--surface-container);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
      position: relative;
    ">
      <span class="pin-dot"></span>

      <div style="margin-bottom: 24px; text-align: center;">
        <h1 class="display-md" style="font-size: 26px; color: var(--primary); margin-bottom: 8px;">Reset Password</h1>
        <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px;">
          Enter your institutional email address and we'll send you a password recovery link.
        </p>
      </div>

      <form id="forgot-form">
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" for="forgot-email">College Email</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">mail</span>
            <input
              type="email"
              id="forgot-email"
              class="form-input has-icon"
              placeholder="student@college.edu"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 12px; margin-bottom: 16px;">
          <span>Send Recovery Link</span>
          <span class="material-symbols-outlined">send</span>
        </button>

        <div style="text-align: center;">
          <a href="#/login" class="btn btn-ghost btn-sm" style="color: var(--on-surface-variant);">
            <span class="material-symbols-outlined" style="font-size: 16px;">arrow_back</span>
            <span>Back to Login</span>
          </a>
        </div>
      </form>
    </div>
  `;

  container.querySelector('#forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#forgot-email').value;
    await apiService.forgotPassword(email);
    toast.success(`Password reset instructions sent to ${email}`);
    router.navigate('/login');
  });

  return container;
}
