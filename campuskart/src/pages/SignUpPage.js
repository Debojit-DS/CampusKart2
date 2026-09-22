/**
 * SignUp Page Component (§5.3)
 * Route: '/signup'
 */

import { apiService } from '../api/apiService.js';
import { store } from '../data/store.js';
import { toast } from '../components/ui/Toast.js';

export function renderSignUpPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-dot-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
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

    <!-- Centered Sign Up Card -->
    <div class="bg-surface-bright" style="
      width: 100%;
      max-width: 480px;
      padding: 40px 36px;
      border: 1px solid var(--surface-container);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
      position: relative;
      transform: rotate(0.4deg);
    ">
      <!-- Rust-colored Pin Dot per §5.3 -->
      <span class="pin-dot pin-rust"></span>
      
      <!-- Decorative Tape -->
      <span class="tape-strip tape-top-right"></span>

      <!-- Title & Subcopy -->
      <div style="margin-bottom: 24px; text-align: center;">
        <h1 class="display-md" style="font-size: 30px; color: var(--on-surface); margin-bottom: 6px;">Join your campus community</h1>
        <p class="body-md" style="color: var(--on-surface-variant); font-size: 14px;">Sign in with your college to connect, trade, and discover.</p>
      </div>

      <!-- Form Error Banner -->
      <div id="signup-error-banner" style="display: none; background: rgba(193, 97, 63, 0.15); border: 1px solid var(--error); color: var(--error); padding: 10px 14px; border-radius: var(--radius-default); font-size: 13px; margin-bottom: 20px;"></div>

      <!-- Form -->
      <form id="signup-form">
        <!-- 1. College Email -->
        <div class="form-group">
          <label class="form-label" for="signup-email">College Email</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">mail</span>
            <input
              type="text"
              id="signup-email-username"
              class="form-input"
              placeholder="yourname"
              required
              style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
            />
            <span style="
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: auto;
              padding: 0 12px;
              display: flex;
              align-items: center;
              background: var(--surface-container);
              color: var(--on-surface-variant);
              font-family: var(--font-mono);
              font-size: 14px;
              border-top-right-radius: var(--radius-default);
              border-bottom-right-radius: var(--radius-default);
              border-left: 1px solid var(--surface-container-high);
              pointer-events: none;
            ">@heritageit.edu.in</span>
          </div>
          <div class="form-helper">Must use your official college email to verify your student status.</div>
        </div>

        <!-- 2. Full Name -->
        <div class="form-group">
          <label class="form-label" for="signup-name">Full Name</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">person</span>
            <input
              type="text"
              id="signup-name"
              class="form-input has-icon"
              placeholder="e.g. Maya Lin"
              required
            />
          </div>
        </div>

        <!-- 3. Password -->
        <div class="form-group">
          <label class="form-label" for="signup-password">Password</label>
          <div class="form-input-wrapper">
            <span class="material-symbols-outlined form-input-icon">lock</span>
            <input
              type="password"
              id="signup-password"
              class="form-input has-icon"
              placeholder="At least 6 characters"
              minlength="6"
              required
            />
            <button
              type="button"
              id="signup-toggle-pwd-btn"
              style="position: absolute; right: 10px; color: var(--on-surface-variant); display: flex; align-items: center;"
              aria-label="Toggle password visibility"
            >
              <span class="material-symbols-outlined" style="font-size: 20px;">visibility</span>
            </button>
          </div>
        </div>

        <!-- Department & Year (2 Column Grid) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px;">
          <!-- 4. Department -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="signup-dept">Department</label>
            <select id="signup-dept" class="form-input" style="background-color: var(--surface);" required>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Eng</option>
              <option value="Mechanical Engineering">Mechanical Eng</option>
              <option value="Civil Engineering">Civil Eng</option>
              <option value="Electronics & Comm">Electronics &amp; Comm</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Architecture & Design">Architecture</option>
              <option value="Business Administration">Business</option>
            </select>
          </div>

          <!-- 5. Year -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="signup-year">Year of Study</label>
            <select id="signup-year" class="form-input" style="background-color: var(--surface);" required>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3" selected>Third Year</option>
              <option value="4">Fourth Year</option>
              <option value="5">Grad / PhD</option>
            </select>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          id="signup-submit-btn"
          class="btn btn-primary"
          style="width: 100%; font-weight: 700; padding: 12px; font-size: 15px;"
        >
          <span>Create account</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <!-- Footer Link -->
      <div style="text-align: center; margin-top: 24px; font-size: 13px; color: var(--on-surface-variant);">
        Already have an account? <a href="#/login" style="color: var(--primary); font-weight: 600;">Log in here</a>
      </div>
    </div>
  `;

  // Password visibility toggle
  const pwdInput = container.querySelector('#signup-password');
  const toggleBtn = container.querySelector('#signup-toggle-pwd-btn');
  toggleBtn.addEventListener('click', () => {
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    toggleBtn.querySelector('span').innerText = isPwd ? 'visibility_off' : 'visibility';
  });

  // Handle form submission
  const form = container.querySelector('#signup-form');
  const errorBanner = container.querySelector('#signup-error-banner');
  const submitBtn = container.querySelector('#signup-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';

    const username = container.querySelector('#signup-email-username').value.trim();
    const email = `${username}@heritageit.edu.in`;
    const fullName = container.querySelector('#signup-name').value.trim();
    const password = pwdInput.value;
    const department = container.querySelector('#signup-dept').value;
    const yearOfStudy = container.querySelector('#signup-year').value;

    if (!username || !fullName || !password) {
      errorBanner.innerText = 'Please fill in all required fields.';
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
      await store.signup({ email, fullName, password, department, yearOfStudy });
      toast.success('Account created! Verification code sent.');
      router.navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      errorBanner.innerText = 'Sign up failed. Please check your information and try again.';
      errorBanner.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Create account</span><span class="material-symbols-outlined">arrow_forward</span>`;
    }
  });

  return container;
}
