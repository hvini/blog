/**
 * Main Controller for Post Emoji Reactions
 */

import { createStorage, EMOJI_IDS } from './storage.js';
import { triggerReactionBurst } from './confetti.js';

let storageInstance = null;

function getStorage() {
  if (!storageInstance) {
    const config = window.REACTIONS_CONFIG || {};
    storageInstance = createStorage(config);
  }
  return storageInstance;
}

function updateTotalCount(container, counts) {
  const totalEl = container.querySelector('[data-reaction-total-count]');
  if (!totalEl) return;
  const sum = EMOJI_IDS.reduce((acc, id) => acc + (counts[id] || 0), 0);
  totalEl.textContent = sum.toLocaleString();
}

function updateButtonUI(btn, emojiId, count, isReacted) {
  const countEl = btn.querySelector('[data-reaction-count]');
  if (countEl) {
    countEl.textContent = (count || 0).toLocaleString();
  }

  if (isReacted) {
    btn.classList.add('is-reacted');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.classList.remove('is-reacted');
    btn.setAttribute('aria-pressed', 'false');
  }

  // Update aria-label for accessibility
  const baseLabel = btn.getAttribute('data-reaction-label') || emojiId;
  btn.setAttribute('aria-label', `${baseLabel}: ${count} reactions${isReacted ? ' (you reacted)' : ''}`);
}

async function initContainer(container) {
  const postId = container.getAttribute('data-post-id') || window.location.pathname;
  const storage = getStorage();

  const buttons = container.querySelectorAll('[data-reaction-btn]');
  if (!buttons.length) return;

  try {
    const { counts, userReactions } = await storage.fetch(postId);

    // Initial render
    buttons.forEach(btn => {
      const emojiId = btn.getAttribute('data-reaction-btn');
      const count = counts[emojiId] || 0;
      const isReacted = userReactions.includes(emojiId);
      updateButtonUI(btn, emojiId, count, isReacted);
    });

    updateTotalCount(container, counts);

    // Remove loading state
    container.classList.add('is-ready');
  } catch (err) {
    console.warn('Reactions: error during initialization', err);
    container.classList.add('is-ready');
  }

  // Bind click handlers
  buttons.forEach(btn => {
    let isPending = false;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isPending) return;
      isPending = true;

      const emojiId = btn.getAttribute('data-reaction-btn');
      btn.classList.add('reaction-interacting');

      try {
        const { added, counts, userReactions } = await storage.toggle(postId, emojiId);

        // Micro-animation burst
        triggerReactionBurst(btn, emojiId, added);

        // Update UI
        updateButtonUI(btn, emojiId, counts[emojiId], added);
        updateTotalCount(container, counts);

        // Notify gamification system when reader reacts
        if (added) {
          document.dispatchEvent(new CustomEvent('gamification:post_reacted', {
            detail: { id: postId, emoji: emojiId }
          }));
        }
      } catch (err) {
        console.error('Reactions: failed to toggle reaction', err);
      } finally {
        setTimeout(() => {
          btn.classList.remove('reaction-interacting');
          isPending = false;
        }, 200);
      }
    });
  });
}

export function initReactions() {
  const containers = document.querySelectorAll('[data-reaction-container]');
  containers.forEach(container => {
    initContainer(container);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReactions);
} else {
  initReactions();
}

window.emojiReactions = {
  init: initReactions,
  getStorage
};
