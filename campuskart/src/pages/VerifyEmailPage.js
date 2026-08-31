/**
 * VerifyEmail Page Component (§10.7)
 * Route: '/verify-email'
 */

import { apiService } from '../api/apiService.js';
import { toast } from '../components/ui/Toast.js';

export function renderVerifyEmailPage({ queryParams = {}, router } = {}) {
  const email = queryParams.email ? decodeURIComponent(queryParams.email) : 'your student email';

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
      max-width: 440px;
      padding: 40px 36px;
      border: 1px solid var(--surface-container);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
      position: relative;
      text-align: center;
    ">
      <span class="pin-dot pin-teal"></span>

      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--success); margin: 0 auto 20px;">
        <span class="material-symbols-outlined filled" style="font-size: 28px;">mark_email_read</span>
      </div>

      <h1 class="display-md" style="font-size: 26px; color: var(--on-surface); margin-bottom: 8px;">Verify your identity</h1>
      <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
        We sent a 6-digit campus verification code to <br/><strong style="color: var(--primary); font-family: var(--font-mono);">${email}</strong>
      </p>

      <form id="verify-form">
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
          ${[1, 2, 3, 4, 5, 6].map(i => `
            <input
              type="text"
              class="code-input form-input"
              maxlength="1"
              style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--primary); padding: 0;"
              required
            />
          `).join('')}
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 12px; margin-bottom: 16px;">
          <span>Confirm &amp; Go to Corkboard</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>

        <button type="button" id="resend-code-btn" class="btn btn-ghost btn-sm" style="font-size: 13px;">
          Didn't receive it? Resend code
        </button>
      </form>
    </div>
  `;

  // Auto-focus progression for code inputs
  const inputs = container.querySelectorAll('.code-input');
  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  container.querySelector('#resend-code-btn').addEventListener('click', () => {
    toast.info(`New 6-digit code sent to ${email}`);
  });

  container.querySelector('#verify-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = Array.from(inputs).map(input => input.value.trim()).join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    try {
      await apiService.verifyEmail(email, code);
      toast.success('Identity verified! Welcome to your campus feed.');
      router.navigate('/feed');
    } catch (err) {
      toast.error(err.message === 'INVALID_OR_EXPIRED_CODE' ? 'Invalid or expired code. Please try again.' : 'Verification failed. Please try again.');
      inputs.forEach(input => { input.value = ''; });
      inputs[0].focus();
    }
  });

  return container;
}
