/**
 * LeaderboardPage Component
 * Route: '/leaderboard'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderAvatar } from '../components/ui/Avatar.js';
import { apiService } from '../api/apiService.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderLeaderboardPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  try {
    const [topSellers, mostHelpful, trends] = await Promise.all([
      apiService.getLeaderboard('top_sellers'),
      apiService.getLeaderboard('most_helpful'),
      apiService.getTrends(),
    ]);

    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/leaderboard' })}

      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="max-width: 720px; margin: 0 auto;">
          <div style="margin-bottom: 32px;">
            <div class="utility-label" style="color: var(--primary); margin-bottom: 4px;">CAMPUS COMMUNITY</div>
            <h1 class="headline-sm" style="color: var(--on-surface);">Leaderboard</h1>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
            <!-- Top Sellers -->
            <div class="bg-surface-bright" style="padding: 20px; border-radius: var(--radius-default); border: 1px solid var(--surface-container);">
              <h3 style="font-size: 14px; color: var(--on-surface-variant); margin-bottom: 16px; font-family: var(--font-mono); text-transform: uppercase;">Top Sellers</h3>
              ${topSellers.length === 0 ? '<p style="color: var(--on-surface-variant); font-size: 13px;">No sellers yet.</p>' : topSellers.map((user, idx) => `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--primary); font-weight: 700; width: 20px;">#${idx + 1}</span>
                  ${renderAvatar({ user, size: 32 })}
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(user.fullName)}</div>
                    <div style="font-size: 11px; color: var(--on-surface-variant);">${user._count?.listings || 0} sales</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Most Helpful -->
            <div class="bg-surface-bright" style="padding: 20px; border-radius: var(--radius-default); border: 1px solid var(--surface-container);">
              <h3 style="font-size: 14px; color: var(--on-surface-variant); margin-bottom: 16px; font-family: var(--font-mono); text-transform: uppercase;">Most Helpful</h3>
              ${mostHelpful.length === 0 ? '<p style="color: var(--on-surface-variant); font-size: 13px;">No ratings yet.</p>' : mostHelpful.map((user, idx) => `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--primary); font-weight: 700; width: 20px;">#${idx + 1}</span>
                  ${renderAvatar({ user, size: 32 })}
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(user.fullName)}</div>
                     <div style="font-size: 11px; color: var(--on-surface-variant);">★ ${Number(user.ratingAverage || 0).toFixed(1) || '5.0'} (${user.ratingCount || 0})</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Trends -->
          ${trends.length > 0 ? `
            <div class="bg-surface-bright" style="padding: 20px; border-radius: var(--radius-default); border: 1px solid var(--surface-container);">
              <h3 style="font-size: 14px; color: var(--on-surface-variant); margin-bottom: 16px; font-family: var(--font-mono); text-transform: uppercase;">Trending Categories (7 days)</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${trends.map(t => `
                  <span style="background: var(--surface-container-high); color: var(--on-surface); font-size: 12px; padding: 6px 12px; border-radius: var(--radius-full); font-family: var(--font-mono);">
                    ${escapeHtml(t.categoryTopId || 'unknown')} (${t._count?.id || 0})
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </main>

      ${renderFooter()}
    `;
  } catch (e) {
    console.error('Error loading leaderboard:', e);
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/leaderboard' })}
      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load leaderboard</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(ErrorHandler.getErrorMessage(e))}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
        </div>
      </main>
      ${renderFooter()}
    `;
  }

  return container;
}
