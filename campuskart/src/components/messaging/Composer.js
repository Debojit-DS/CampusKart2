/**
 * Composer Component (§5.6)
 * Chat input bar with quick action pills and attachment trigger.
 */

export function renderComposer({ pickupLocation = '' } = {}) {
  return `
    <div class="composer-container" style="background-color: var(--surface); border-top: 1px solid var(--surface-container); padding: 12px 16px;">
      <!-- Quick Action Pills -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; overflow-x: auto; scrollbar-width: none;">
        <button
          type="button"
          id="quick-offer-btn"
          class="btn btn-outlined btn-sm"
          style="padding: 4px 10px; font-size: 12px; font-family: var(--font-mono); border-radius: var(--radius-full);"
        >
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">local_offer</span>
          <span>Make an offer</span>
        </button>

        <button
          type="button"
          id="quick-location-btn"
          class="btn btn-outlined btn-sm"
          style="padding: 4px 10px; font-size: 12px; font-family: var(--font-mono); border-radius: var(--radius-full);"
        >
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--success);">location_on</span>
          <span>Share pickup spot</span>
        </button>
      </div>

      <!-- Main Input Row -->
      <form id="chat-composer-form" style="display: flex; align-items: flex-end; gap: 10px;">
        <!-- Attachment Icon -->
        <label
          class="btn-icon btn-ghost"
          style="cursor: pointer; color: var(--on-surface-variant); flex-shrink: 0; margin-bottom: 2px;"
          title="Attach photo"
        >
          <span class="material-symbols-outlined" style="font-size: 22px;">add_circle</span>
          <input type="file" id="chat-photo-input" accept="image/*" style="display: none;" />
        </label>

        <!-- Message Textarea -->
        <div style="flex: 1; position: relative;">
          <textarea
            id="chat-message-input"
            rows="1"
            placeholder="Type a message... (Enter to send)"
            style="
              width: 100%;
              min-height: 40px;
              max-height: 120px;
              background-color: var(--surface-bright);
              border: 1px solid var(--surface-container);
              border-radius: var(--radius-lg);
              color: var(--on-surface);
              font-size: 14px;
              padding: 10px 14px;
              resize: none;
              outline: none;
              font-family: var(--font-body);
              line-height: 1.4;
            "
          ></textarea>
        </div>

        <!-- Send Button -->
        <button
          type="submit"
          class="btn btn-primary btn-icon"
          style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; margin-bottom: 2px;"
          aria-label="Send message"
        >
          <span class="material-symbols-outlined" style="font-size: 20px;">send</span>
        </button>
      </form>
    </div>
  `;
}
