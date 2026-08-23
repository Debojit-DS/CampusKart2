/**
 * StaticLegalPage Component (§10.10)
 * Routes: '/about', '/safety', '/reports', '/privacy'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';

export function renderStaticLegalPage({ pageType = 'about' } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  const pageContent = {
    about: {
      title: 'About CampusKart',
      subtitle: 'Someone in your college already has what you need.',
      content: `
        <h3>Our Mission</h3>
        <p>CampusKart was designed as a modern tribute to the hostel corridor corkboard noticeboard. Every semester, thousands of college students spend fortunes on textbooks, drafting equipment, calculators, mini fridges, and bicycles, while graduating seniors scramble to give them away or sell them off.</p>
        <p>We bridge this gap with a trusted, campus-exclusive platform where real verified peers can trade directly without middleman markups, shipping delays, or internet strangers.</p>

        <h3>Core Principles</h3>
        <ul>
          <li><strong>Exclusively Verified Students:</strong> Only users with authenticated .edu institutional email addresses can join and post.</li>
          <li><strong>Zero Platform Fees:</strong> We never take a cut of student transactions. You pay each other directly in person via cash, Venmo, Zelle, or UPI.</li>
          <li><strong>Safe Campus Handoffs:</strong> All exchanges occur in designated public campus spots like department lobbies, dining halls, and library entrances.</li>
        </ul>
      `
    },
    safety: {
      title: 'Campus Safety & Rules',
      subtitle: 'Guidelines for safe and smooth peer-to-peer campus exchanges.',
      content: `
        <h3>Recommended Meetup Spots</h3>
        <p>Always conduct transactions in populated, well-lit campus areas during daylight or busy evening hours. Recommended locations include:</p>
        <ul>
          <li>Central Library Gate &amp; Lobby</li>
          <li>Hostel Reception / Common Room</li>
          <li>Student Activity Center / Campus Quad</li>
          <li>Department Ground Floor Corridors</li>
        </ul>

        <h3>Safe Trading Checklist</h3>
        <ul>
          <li>Inspect the item in person before completing payment.</li>
          <li>Never share sensitive personal information (room numbers, banking passwords).</li>
          <li>Report suspicious listings or unverified users immediately.</li>
        </ul>
      `
    },
    reports: {
      title: 'Community Guidelines',
      subtitle: 'Keeping the digital corkboard helpful, honest, and respectful.',
      content: `
        <h3>Prohibited Items</h3>
        <p>To preserve campus trust and legal compliance, the following items are strictly forbidden on CampusKart:</p>
        <ul>
          <li>Cheating materials, leaked exam questions, or forged academic documents</li>
          <li>Weapons, hazardous chemicals, or prescription medications</li>
          <li>Counterfeit goods or stolen campus property</li>
        </ul>

        <h3>Dispute Resolution</h3>
        <p>If you encounter an issue with a listing or another member, use the in-app report link or contact your campus student administrator.</p>
      `
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How CampusKart protects your student data and identity.',
      content: `
        <h3>Data We Collect</h3>
        <p>We only collect information necessary to verify your student status and facilitate campus marketplace listings: your college email address, full name, department, year of study, and posted listings.</p>

        <h3>No Data Selling</h3>
        <p>We do not sell, rent, or monetize student personal information to third-party ad networks or data brokers.</p>
      `
    }
  };

  const current = pageContent[pageType] || pageContent.about;

  container.innerHTML = `
    ${renderTopNavBar({ activeRoute: `/${pageType}` })}

    <main class="container-custom" style="flex: 1; padding-top: 48px; padding-bottom: 64px;">
      <div style="max-width: 760px; margin: 0 auto;">
        <!-- Page Card -->
        <div class="bg-surface-bright" style="
          border: 1px solid var(--surface-container);
          border-radius: var(--radius-lg);
          padding: 48px 40px;
          position: relative;
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        ">
          <span class="pin-dot"></span>

          <!-- Subnav Tabs -->
          <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--surface-container); padding-bottom: 16px; margin-bottom: 32px; overflow-x: auto;">
            ${['about', 'safety', 'reports', 'privacy'].map(type => {
              const labels = { about: 'About', safety: 'Safety & Rules', reports: 'Guidelines', privacy: 'Privacy Policy' };
              const isActive = type === pageType;
              return `
                <a
                  href="#/${type}"
                  style="
                    font-family: var(--font-mono);
                    font-size: 13px;
                    font-weight: ${isActive ? '700' : '500'};
                    color: ${isActive ? 'var(--primary)' : 'var(--on-surface-variant)'};
                    text-decoration: none;
                    white-space: nowrap;
                  "
                >
                  ${labels[type]}
                </a>
              `;
            }).join('')}
          </div>

          <!-- Title -->
          <h1 class="display-md" style="color: var(--on-surface); margin-bottom: 8px;">${current.title}</h1>
          <p class="body-lg" style="color: var(--primary); font-family: var(--font-mono); font-size: 14px; margin-bottom: 32px;">
            ${current.subtitle}
          </p>

          <!-- Content Body -->
          <div style="color: var(--on-surface); font-size: 15px; line-height: 1.7;" class="static-page-content">
            ${current.content}
          </div>
        </div>
      </div>
    </main>

    ${renderFooter()}
  `;

  return container;
}
