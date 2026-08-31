/**
 * Login Page Component (§5.2)
 * Route: '/login'
 */

import { apiService } from '../api/apiService.js';
import { toast } from '../components/ui/Toast.js';

export function renderLoginPage({ queryParams = {}, router } = {}) {
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

  container.innerHTML = `
    <!-- Top-left Brand Logo -->
    <div style="position: absolute; top: 24px; left: 24px;">
      <a href="#/" style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
        <span class="display-md" style="font-size: 22px; font-weight: 700; color: var(--primary);">CampusKart</span>
      </a>
    </div>

    <!-- Centered Login Card -->
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
      <!-- Pin Dot -->
      <span class="pin-dot"></span>
      
      <!-- Decorative Tape -->
      <span class="tape-strip tape-bottom-right"></span>

      <!-- Title & Subcopy -->
      <div style="margin-bottom: 28px; text-align: center;">
        <h1 class="display-lg" style="font-size: 36px; color: var(--primary); margin-bottom: 6px;">Welcome back</h1>
        <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px;">Access your campus account to trade &amp; message</p>
      </div>

      <!-- Form Error Banner -->
      <div id="login-error-banner" style="display: none; background: rgba(193, 97, 63, 0.15); border: 1px solid var(--error); color: var(--error); padding: 10px 14px; border-radius: var(--radius-default); font-size: 13px; margin-bottom: 20px;"></div>

      <!-- Form -->
      <form id="login-form">
        <!-- College Email -->
        <div class="form-group">
          <label class="form-label" for="login-email">College Email</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">mail</span>
            <input
              type="email"
              id="login-email"
              class="form-input has-icon"
              placeholder="student@college.edu"
              value="alex.chen@campus.edu"
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="form-group" style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
            <a href="#/forgot-password" style="font-size: 12px; color: var(--primary); font-family: var(--font-mono);">Forgot?</a>
          </div>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">lock</span>
            <input
              type="password"
              id="login-password"
              class="form-input has-icon"
              placeholder="••••••••"
              value="student123"
              style="padding-right: 40px;"
              required
            />
            <button
              type="button"
              id="toggle-pwd-btn"
              style="position: absolute; right: 10px; color: var(--on-surface-variant); display: flex; align-items: center;"
              aria-label="Toggle password visibility"
            >
              <span class="material-symbols-outlined" style="font-size: 20px;">visibility</span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          id="login-submit-btn"
          class="btn btn-primary"
          style="width: 100%; font-weight: 700; padding: 12px; font-size: 15px;"
        >
          <span>Log in</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <!-- Footer Link -->
      <div style="text-align: center; margin-top: 24px; font-size: 13px; color: var(--on-surface-variant);">
        New here? <a href="#/signup" style="color: var(--primary); font-weight: 600;">Create an account</a>
      </div>
    </div>
  `;

  // Password visibility toggle
  const pwdInput = container.querySelector('#login-password');
  const toggleBtn = container.querySelector('#toggle-pwd-btn');
  toggleBtn.addEventListener('click', () => {
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    toggleBtn.querySelector('span').innerText = isPwd ? 'visibility_off' : 'visibility';
  });

  // Handle form submission
  const form = container.querySelector('#login-form');
  const errorBanner = container.querySelector('#login-error-banner');
  const submitBtn = container.querySelector('#login-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';

    const email = container.querySelector('#login-email').value.trim();
    const password = pwdInput.value;

    if (!email || !password) {
      errorBanner.innerText = 'Please enter your college email and password.';
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
      await apiService.login(email, password);
      toast.success('Logged in successfully!');
      const returnUrl = queryParams.returnUrl ? decodeURIComponent(queryParams.returnUrl) : '/feed';
      router.navigate(returnUrl);
    } catch (err) {
      errorBanner.innerText = 'Invalid credentials or network error. Please try again.';
      errorBanner.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Log in</span><span class="material-symbols-outlined">arrow_forward</span>`;
    }
  });

  return container;
}
