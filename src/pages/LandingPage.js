/**
 * Landing Page Component (§5.1) - Inter & Violet Theme
 * Route: '/'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { store } from '../data/store.js';
import { renderPriceTag } from '../components/ui/PriceTag.js';
import { renderVerifiedBadge } from '../components/ui/Avatar.js';

export function renderLandingPage() {
  const testimonials = store.getTestimonials();
  const testimonial = testimonials[0] || {};
  const activeUserCount = 2400 + store.getUsers().length * 15;

  return `
    <div style="min-height: 100vh; display: flex; flex-direction: column; background-color: var(--background);">
      ${renderTopNavBar({ activeRoute: '/' })}

      <main style="flex: 1;">
        <!-- Hero Section -->
        <section style="padding: 60px 0 80px; position: relative; overflow: hidden;">
          <div class="container-custom" style="display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;" class="lg-grid-2">
            <!-- Left Column: Copy & CTAs -->
            <div style="max-width: 600px;">
              <div class="utility-label" style="color: var(--primary); margin-bottom: 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined filled" style="font-size: 16px;">school</span>
                <span>CAMPUS-EXCLUSIVE MARKETPLACE</span>
              </div>

              <h1 class="display-lg" style="margin-bottom: 20px; line-height: 1.15; color: var(--on-surface);">
                Someone in your college already has what you need.
              </h1>

              <p class="body-lg" style="color: var(--on-surface-variant); margin-bottom: 32px; line-height: 1.6;">
                Buy and sell with students from your own campus. A trusted peer-to-peer marketplace built by the community, for the community.
              </p>

              <!-- CTA and Social Proof -->
              <div style="display: flex; flex-direction: column; gap: 24px;">
                <div>
                  <a href="#/signup" class="btn btn-primary btn-lg" style="font-weight: 700; border-radius: var(--radius-default); box-shadow: 0 4px 20px var(--primary-glow);">
                    <span>Sign up with your college email</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>

                <!-- Avatar Group & Live Student Count -->
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="display: flex; align-items: center;">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--surface); object-fit: cover;" alt="Student" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--surface); object-fit: cover; margin-left: -10px;" alt="Student" />
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--surface); object-fit: cover; margin-left: -10px;" alt="Student" />
                  </div>
                  <span style="font-size: 13px; color: var(--on-surface-variant); font-family: var(--font-body);">
                    Join <strong style="color: var(--on-surface); font-family: var(--font-mono);">${activeUserCount.toLocaleString()}+</strong> students already trading
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Column: Tactile Hero Collage (Desktop) -->
            <div class="hidden-mobile" style="position: relative; height: 420px; display: flex; align-items: center; justify-content: center;">
              <!-- Background Card 1 (Bike) -->
              <div style="position: absolute; right: 20px; top: 20px; width: 260px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 12px; transform: rotate(4deg); box-shadow: var(--shadow-card); z-index: 1;">
                <span class="pin-dot pin-teal"></span>
                <img src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500" style="width: 100%; height: 130px; object-fit: cover; border-radius: 4px;" alt="Bike" />
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <div style="font-weight: 700; font-size: 14px;">City Commuter Bike</div>
                  ${renderPriceTag({ amount: 3200, currency: 'INR', variant: 'chip' })}
                </div>
              </div>

              <!-- Background Card 2 (Lab Coat) -->
              <div style="position: absolute; left: 10px; bottom: 30px; width: 250px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 12px; transform: rotate(-6deg); box-shadow: var(--shadow-card); z-index: 2;">
                <span class="pin-dot pin-rust"></span>
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" alt="Lab coat" />
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <div style="font-weight: 700; font-size: 14px;">Lab Coat &amp; Goggles</div>
                  ${renderPriceTag({ amount: 280, currency: 'INR', variant: 'chip' })}
                </div>
              </div>

              <!-- Foreground Highlight Card (Drafting Board) -->
              <div style="position: relative; width: 290px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-default); padding: 14px; transform: rotate(-1.5deg); box-shadow: var(--shadow-modal); z-index: 3;">
                <span class="pin-dot"></span>
                <span class="tape-strip tape-top-right"></span>
                <img src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600" style="width: 100%; height: 160px; object-fit: cover; border-radius: 4px;" alt="Drafting Kit" />
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                  <div>
                    <div style="font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--primary);">Drafting Board &amp; Kit</div>
                    <div style="font-size: 12px; color: var(--on-surface-variant);">Library Gate Pickup</div>
                  </div>
                  ${renderPriceTag({ amount: 850, currency: 'INR', variant: 'notch' })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- "How It Starts" 3-Step Section -->
        <section style="background-color: var(--surface-container-low); border-top: 1px solid var(--surface-container); border-bottom: 1px solid var(--surface-container); padding: 80px 0;">
          <div class="container-custom">
            <div style="text-align: center; max-width: 600px; margin: 0 auto 56px;">
              <div class="utility-label" style="color: var(--primary); margin-bottom: 8px;">HOW IT WORKS</div>
              <h2 class="display-md" style="color: var(--on-surface);">Simple, local, and straightforward.</h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px;">
              <!-- Step 1 -->
              <div style="background: var(--surface-bright); border: 1px solid var(--surface-container); padding: 32px 24px; border-radius: var(--radius-default); position: relative;">
                <div style="font-family: var(--font-mono); font-size: 36px; font-weight: 800; color: var(--primary); opacity: 0.3; line-height: 1; margin-bottom: 16px;">
                  01
                </div>
                <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 18px;">
                  <span class="material-symbols-outlined">badge</span>
                </div>
                <h3 class="headline-sm" style="font-size: 19px; margin-bottom: 10px;">Verify Identity</h3>
                <p class="body-md" style="color: var(--on-surface-variant); font-size: 15px; line-height: 1.6;">
                  Sign up using your official .edu / institutional email to ensure you connect exclusively with real verified students.
                </p>
              </div>

              <!-- Step 2 -->
              <div style="background: var(--surface-bright); border: 1px solid var(--surface-container); padding: 32px 24px; border-radius: var(--radius-default); position: relative;">
                <div style="font-family: var(--font-mono); font-size: 36px; font-weight: 800; color: var(--primary); opacity: 0.3; line-height: 1; margin-bottom: 16px;">
                  02
                </div>
                <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 18px;">
                  <span class="material-symbols-outlined">add_photo_alternate</span>
                </div>
                <h3 class="headline-sm" style="font-size: 19px; margin-bottom: 10px;">Post or Browse</h3>
                <p class="body-md" style="color: var(--on-surface-variant); font-size: 15px; line-height: 1.6;">
                  Snap a photo of your item, set a price in ₹, and pin it to the digital corkboard. Or browse what your peers are offering.
                </p>
              </div>

              <!-- Step 3 -->
              <div style="background: var(--surface-bright); border: 1px solid var(--surface-container); padding: 32px 24px; border-radius: var(--radius-default); position: relative;">
                <div style="font-family: var(--font-mono); font-size: 36px; font-weight: 800; color: var(--primary); opacity: 0.3; line-height: 1; margin-bottom: 16px;">
                  03
                </div>
                <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 18px;">
                  <span class="material-symbols-outlined">handshake</span>
                </div>
                <h3 class="headline-sm" style="font-size: 19px; margin-bottom: 10px;">Meet on Campus</h3>
                <p class="body-md" style="color: var(--on-surface-variant); font-size: 15px; line-height: 1.6;">
                  Chat securely in-app and agree to meet at safe, designated campus locations to complete the exchange.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- "Built for Trust" & Testimonial Section -->
        <section style="padding: 80px 0;">
          <div class="container-custom" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;">
            <!-- Left: Trust Pillars Checklist -->
            <div>
              <div class="utility-label" style="color: var(--primary); margin-bottom: 8px;">SAFETY &amp; TRUST</div>
              <h2 class="display-md" style="margin-bottom: 20px;">Built for trust, inherently safe.</h2>
              <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 32px; line-height: 1.6;">
                Because transactions take place exclusively within your verified campus ecosystem, you never have to deal with anonymous strangers, shipping risks, or platform fee markups.
              </p>

              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; gap: 14px;">
                  <span class="material-symbols-outlined filled" style="color: var(--success); font-size: 24px; flex-shrink: 0;">verified_user</span>
                  <div>
                    <strong style="font-family: var(--font-mono); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
                      Verified Students Only
                    </strong>
                    <span style="font-size: 14px; color: var(--on-surface-variant);">
                      Every member signs up with their institutional email, keeping the marketplace secure.
                    </span>
                  </div>
                </div>

                <div style="display: flex; gap: 14px;">
                  <span class="material-symbols-outlined filled" style="color: var(--primary); font-size: 24px; flex-shrink: 0;">savings</span>
                  <div>
                    <strong style="font-family: var(--font-mono); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
                      No Platform Money Handling
                    </strong>
                    <span style="font-size: 14px; color: var(--on-surface-variant);">
                      Pay cash or UPI directly in person. We take 0% commission on any student transaction.
                    </span>
                  </div>
                </div>

                <div style="display: flex; gap: 14px;">
                  <span class="material-symbols-outlined filled" style="color: var(--info); font-size: 24px; flex-shrink: 0;">place</span>
                  <div>
                    <strong style="font-family: var(--font-mono); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
                      Fixed Campus Pickup Spots
                    </strong>
                    <span style="font-size: 14px; color: var(--on-surface-variant);">
                      Trade in well-lit, populated spots like the campus library, canteen, or department lobby.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Rotated Testimonial Card -->
            <div style="display: flex; justify-content: center;">
              <div style="
                max-width: 420px;
                background: var(--surface-bright);
                border: 1px solid var(--surface-container);
                padding: 32px;
                border-radius: var(--radius-lg);
                transform: rotate(2deg);
                box-shadow: var(--shadow-modal);
                position: relative;
              ">
                <span class="pin-dot"></span>
                <span class="tape-strip tape-top-left"></span>

                <!-- Rating Stars -->
                <div style="color: var(--primary); display: flex; gap: 2px; margin-bottom: 16px;">
                  <span class="material-symbols-outlined filled" style="font-size: 20px;">star</span>
                  <span class="material-symbols-outlined filled" style="font-size: 20px;">star</span>
                  <span class="material-symbols-outlined filled" style="font-size: 20px;">star</span>
                  <span class="material-symbols-outlined filled" style="font-size: 20px;">star</span>
                  <span class="material-symbols-outlined filled" style="font-size: 20px;">star</span>
                </div>

                <p class="body-lg" style="font-style: italic; color: var(--on-surface); line-height: 1.6; margin-bottom: 24px;">
                  ${testimonial.quote || '"Bought my entire 2nd year biotech reference kit for 40% of retail price, met the senior outside the lab library within 20 minutes."'}
                </p>

                <div style="display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--surface-container); padding-top: 16px;">
                  <img src="${testimonial.avatarUrl}" alt="${testimonial.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;" />
                  <div>
                    <div style="font-weight: 700; color: var(--on-surface); display: flex; align-items: center; gap: 4px;">
                      <span>${testimonial.name}</span>
                      ${renderVerifiedBadge(16)}
                    </div>
                    <div style="font-size: 12px; color: var(--on-surface-variant); font-family: var(--font-mono);">
                      ${testimonial.department} &bull; ${testimonial.joinedLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
