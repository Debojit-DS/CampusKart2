/**
 * Avatar & VerifiedBadge Component (§4.7)
 */

export function renderAvatar({ user = {}, size = 40, className = '' } = {}) {
  const name = user.fullName || 'Student';
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = user.avatarUrl;

  if (avatarUrl) {
    return `
      <div class="avatar-container ${className}" style="width: ${size}px; height: ${size}px; border-radius: 50%; overflow: hidden; border: 1px solid var(--surface-container); flex-shrink: 0; background-color: var(--surface-container-high);">
        <img src="${avatarUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-weight:600;font-size:${size * 0.4}px;background:var(--surface-container-highest);color:var(--on-surface);\\'>${initial}</span>'" />
      </div>
    `;
  }

  return `
    <div class="avatar-container ${className}" style="width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: var(--surface-container-highest); color: var(--on-surface); font-weight: 600; font-size: ${size * 0.4}px; border: 1px solid var(--surface-container); flex-shrink: 0;">
      ${initial}
    </div>
  `;
}

export function renderVerifiedBadge(size = 16) {
  return `
    <span class="material-symbols-outlined filled" title="Verified Student (.edu)" style="font-size: ${size}px; color: var(--success); vertical-align: middle;">
      verified
    </span>
  `;
}
