/**
 * Footer Component (§4.2)
 */

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer style="background-color: var(--surface-container-low); border-top: 1px solid var(--surface-container); padding: 32px var(--margin-mobile); margin-top: auto;">
      <div class="container-custom" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
        <!-- Brand -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
          <span class="display-md" style="font-size: 20px; font-weight: 700; color: var(--on-surface);">CampusKart</span>
        </div>

        <!-- Links -->
        <nav style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
          <a href="#/about" style="font-size: 14px; color: var(--on-surface-variant); transition: color 150ms ease;">About</a>
          <a href="#/safety" style="font-size: 14px; color: var(--on-surface-variant); transition: color 150ms ease;">Safety &amp; Rules</a>
          <a href="#/reports" style="font-size: 14px; color: var(--on-surface-variant); transition: color 150ms ease;">Community Guidelines</a>
          <a href="#/privacy" style="font-size: 14px; color: var(--on-surface-variant); transition: color 150ms ease;">Privacy Policy</a>
        </nav>

        <!-- Copyright -->
        <div style="font-family: var(--font-mono); font-size: 12px; color: var(--on-surface-variant);">
          &copy; ${currentYear} CampusKart. Built for the student community.
        </div>
      </div>
    </footer>
  `;
}
