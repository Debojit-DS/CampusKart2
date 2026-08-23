/**
 * ConditionBadge Component (§4.6)
 */

import { formatCondition } from '../../utils/formatters.js';

export function renderConditionBadge(condition = 'good', showIcon = false) {
  const label = formatCondition(condition);
  const isNew = condition === 'new' || condition === 'like_new';
  const iconHtml = showIcon ? `<span class="material-symbols-outlined" style="font-size: 14px; margin-right: 2px;">new_releases</span>` : '';

  return `
    <span class="condition-badge ${isNew ? 'condition-new' : ''}">
      ${iconHtml}${label}
    </span>
  `;
}
