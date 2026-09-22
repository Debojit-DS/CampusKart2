/**
 * AdminPage Component
 * Route: '/admin'
 */

import { renderTopNavBar } from '../components/layout/TopNavBar.js';
import { renderFooter } from '../components/layout/Footer.js';
import { renderAvatar } from '../components/ui/Avatar.js';
import { apiService } from '../api/apiService.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { toast } from '../components/ui/Toast.js';
import { escapeHtml } from '../utils/formatters.js';

export async function renderAdminPage({ router } = {}) {
  const container = document.createElement('div');
  container.className = 'corkboard-canvas-bg';
  container.style.cssText = `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `;

  let activeTab = 'analytics';

  try {
    const analytics = await apiService.adminGetAnalytics();

    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/admin' })}

      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="max-width: 960px; margin: 0 auto;">
          <div style="margin-bottom: 28px;">
            <div class="utility-label" style="color: var(--primary); margin-bottom: 4px;">ADMINISTRATION</div>
            <h1 class="headline-sm" style="color: var(--on-surface);">Admin Dashboard</h1>
          </div>

          <!-- Tabs -->
          <div style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--surface-container); padding-bottom: 12px;">
            ${['analytics', 'users', 'listings', 'reports'].map(tab => `
              <button
                type="button"
                class="admin-tab-btn"
                data-tab="${tab}"
                style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: ${activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)'}; border-bottom: 2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}; padding-bottom: 12px; margin-bottom: -13px;"
              >
                ${tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            `).join('')}
          </div>

          <!-- Tab content -->
          <div id="admin-tab-content">
            ${renderAnalyticsTab(analytics)}
          </div>
        </div>
      </main>

      ${renderFooter()}
    `;

    // Tab switching
    container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tab = btn.dataset.tab;
        const content = container.querySelector('#admin-tab-content');
        try {
          if (tab === 'analytics') {
            const data = await apiService.adminGetAnalytics();
            content.innerHTML = renderAnalyticsTab(data);
          } else if (tab === 'users') {
            const users = await apiService.adminGetUsers();
            content.innerHTML = renderUsersTab(users, router);
            bindUserAdminButtons(content, router);
          } else if (tab === 'listings') {
            const listings = await apiService.adminGetListings();
            content.innerHTML = renderListingsTab(listings, router);
            bindListingAdminButtons(content, router);
          } else if (tab === 'reports') {
            const reports = await apiService.adminGetReports();
            content.innerHTML = renderReportsTab(reports, router);
          }
          container.querySelectorAll('.admin-tab-btn').forEach(b => {
            const isActive = b.dataset.tab === tab;
            b.style.color = isActive ? 'var(--primary)' : 'var(--on-surface-variant)';
            b.style.borderBottom = isActive ? '2px solid var(--primary)' : 'transparent';
          });
        } catch (e) {
          toast.error(ErrorHandler.getErrorMessage(e));
        }
      });
    });
  } catch (e) {
    console.error('Error loading admin:', e);
    container.innerHTML = `
      ${renderTopNavBar({ activeRoute: '/admin' })}
      <main class="container-custom" style="flex: 1; padding-top: 36px; padding-bottom: 64px;">
        <div style="text-align: center; padding: 60px 20px; background: var(--surface-bright); border: 1px solid var(--surface-container); border-radius: var(--radius-lg); max-width: 540px; margin: 40px auto;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(193, 97, 63, 0.15); display: flex; align-items: center; justify-content: center; color: var(--error); margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">error_outline</span>
          </div>
          <h2 class="headline-sm" style="margin-bottom: 8px;">Failed to load admin dashboard</h2>
          <p class="body-md" style="color: var(--on-surface-variant); margin-bottom: 24px; font-size: 14px;">${escapeHtml(ErrorHandler.getErrorMessage(e))}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Try Again</button>
        </div>
      </main>
      ${renderFooter()}
    `;
  }

  return container;
}

function renderAnalyticsTab(data) {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); text-align: center;">
        <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--primary);">${data.totalUsers}</div>
        <div style="font-size: 12px; color: var(--on-surface-variant);">Total Users</div>
      </div>
      <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); text-align: center;">
        <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--success);">${data.activeListings}</div>
        <div style="font-size: 12px; color: var(--on-surface-variant);">Active Listings</div>
      </div>
      <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); text-align: center;">
        <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--info);">${data.soldListings}</div>
        <div style="font-size: 12px; color: var(--on-surface-variant);">Sold Listings</div>
      </div>
      <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container); text-align: center;">
        <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--warning);">${data.recentSignups7d}</div>
        <div style="font-size: 12px; color: var(--on-surface-variant);">New (7d)</div>
      </div>
    </div>
    ${data.topCategories?.length > 0 ? `
      <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container);">
        <h4 style="font-size: 13px; color: var(--on-surface-variant); margin-bottom: 12px;">Top Categories</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.topCategories.map(c => `
            <span style="background: var(--surface-container-high); padding: 4px 10px; border-radius: var(--radius-full); font-size: 12px; font-family: var(--font-mono);">
              ${escapeHtml(c.categoryTopId || 'unknown')} (${c._count?.id || 0})
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderUsersTab(users, router) {
  if (!users || users.length === 0) {
    return '<div class="bg-surface-bright" style="padding: 32px; text-align: center; border-radius: var(--radius-default); border: 1px solid var(--surface-container);"><p style="color: var(--on-surface-variant);">No users found.</p></div>';
  }
  return `
    <div class="bg-surface-bright" style="border-radius: var(--radius-default); border: 1px solid var(--surface-container); overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--surface-container);">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">User</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Status</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Rating</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr style="border-bottom: 1px solid var(--surface-container);">
              <td style="padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  ${renderAvatar({ user, size: 28 })}
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--on-surface);">${escapeHtml(user.fullName)}</div>
                    <div style="font-size: 11px; color: var(--on-surface-variant);">${escapeHtml(user.email)}</div>
                  </div>
                </div>
              </td>
              <td style="padding: 12px 16px;">
                <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: ${user.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}; color: ${user.status === 'active' ? 'var(--success)' : 'var(--error)'};">
                  ${user.status}
                </span>
              </td>
              <td style="padding: 12px 16px; font-family: var(--font-mono); font-size: 13px;">${Number(user.ratingAverage || 0).toFixed(1) || '-'}</td>
              <td style="padding: 12px 16px;">
                ${user.status === 'active' ? `
                  <button type="button" class="btn btn-ghost btn-sm admin-suspend-btn" data-id="${user.id}" data-status="suspended" style="color: var(--warning); font-size: 12px;">Suspend</button>
                  <button type="button" class="btn btn-ghost btn-sm admin-ban-btn" data-id="${user.id}" data-status="banned" style="color: var(--error); font-size: 12px;">Ban</button>
                ` : `
                  <button type="button" class="btn btn-ghost btn-sm admin-activate-btn" data-id="${user.id}" data-status="active" style="color: var(--success); font-size: 12px;">Activate</button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindUserAdminButtons(container, router) {
  container.querySelectorAll('.admin-suspend-btn, .admin-ban-btn, .admin-activate-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const id = btn.dataset.id;
        const status = btn.dataset.status;
        let reason = '';
        if (status === 'suspended' || status === 'banned') {
          reason = prompt(`Reason for ${status}:`) || '';
        }
        await apiService.adminUpdateUser(id, status, reason);
        toast.success('User updated');
        router.handleRouteChange();
      } catch (e) {
        toast.error(ErrorHandler.getErrorMessage(e));
      }
    });
  });
}

function renderListingsTab(listings, router) {
  if (!listings || listings.length === 0) {
    return '<div class="bg-surface-bright" style="padding: 32px; text-align: center; border-radius: var(--radius-default); border: 1px solid var(--surface-container);"><p style="color: var(--on-surface-variant);">No listings found.</p></div>';
  }
  return `
    <div class="bg-surface-bright" style="border-radius: var(--radius-default); border: 1px solid var(--surface-container); overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--surface-container);">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Listing</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Seller</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Status</th>
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--on-surface-variant);">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${listings.map(l => `
            <tr style="border-bottom: 1px solid var(--surface-container);">
              <td style="padding: 12px 16px; font-size: 13px; color: var(--on-surface);">${escapeHtml(l.title)}</td>
              <td style="padding: 12px 16px; font-size: 12px; color: var(--on-surface-variant);">${escapeHtml(l.seller?.fullName || 'Unknown')}</td>
              <td style="padding: 12px 16px;">
                <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: ${l.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}; color: ${l.status === 'active' ? 'var(--success)' : 'var(--error)'};">
                  ${l.status}
                </span>
              </td>
              <td style="padding: 12px 16px;">
                ${l.status === 'active' ? `
                  <button type="button" class="btn btn-ghost btn-sm admin-remove-listing-btn" data-id="${l.id}" style="color: var(--error); font-size: 12px;">Remove</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindListingAdminButtons(container, router) {
  container.querySelectorAll('.admin-remove-listing-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        if (!confirm('Are you sure you want to remove this listing?')) return;
        const id = btn.dataset.id;
        const reason = prompt('Reason for removal:') || '';
        await apiService.adminRemoveListing(id, reason);
        toast.success('Listing removed');
        router.handleRouteChange();
      } catch (e) {
        toast.error(ErrorHandler.getErrorMessage(e));
      }
    });
  });
}

function renderReportsTab(reports, router) {
  if (!reports || reports.length === 0) {
    return '<div class="bg-surface-bright" style="padding: 32px; text-align: center; border-radius: var(--radius-default); border: 1px solid var(--surface-container);"><p style="color: var(--on-surface-variant);">No reports found.</p></div>';
  }
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${reports.map(r => `
        <div class="bg-surface-bright" style="padding: 16px; border-radius: var(--radius-default); border: 1px solid var(--surface-container);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--on-surface);">${escapeHtml(r.reason.replace(/_/g, ' '))}</div>
              <div style="font-size: 12px; color: var(--on-surface-variant); margin-top: 4px;">
                Reported by: ${escapeHtml(r.reporter?.fullName || 'Unknown')}
                ${r.reportedUser ? ` | Against: ${escapeHtml(r.reportedUser.fullName)}` : ''}
                ${r.listing ? ` | Listing: ${escapeHtml(r.listing.title)}` : ''}
              </div>
              ${r.details ? `<div style="font-size: 12px; color: var(--on-surface-variant); margin-top: 4px;">${escapeHtml(r.details)}</div>` : ''}
            </div>
            <div style="display: flex; gap: 8px;">
              ${r.status === 'open' ? `
                <button type="button" class="btn btn-ghost btn-sm admin-resolve-btn" data-id="${r.id}" data-status="resolved" style="color: var(--success); font-size: 12px;">Resolve</button>
                <button type="button" class="btn btn-ghost btn-sm admin-dismiss-btn" data-id="${r.id}" data-status="dismissed" style="color: var(--on-surface-variant); font-size: 12px;">Dismiss</button>
              ` : `
                <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: rgba(52,211,153,0.15); color: var(--success);">${r.status}</span>
              `}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
