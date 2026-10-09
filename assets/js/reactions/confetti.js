/**
 * Micro-animations and particle burst engine for emoji reactions.
 * Zero external dependencies.
 */

const EMOJI_MAP = {
  like: '👍',
  love: '❤️',
  insightful: '💡',
  rocket: '🚀',
  mindblown: '🤯'
};

const SPARKLE_SHAPES = ['✦', '★', '•', '✨'];
const SPARKLE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'];

export function triggerReactionBurst(buttonEl, emojiId, isAdding) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Optional subtle haptic feedback on supported mobile devices
  if (navigator.vibrate && isAdding) {
    try { navigator.vibrate(12); } catch (_) {}
  }

  const rect = buttonEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 3;

  // Floating +1 or -1 badge
  createFloatingBadge(originX, originY, isAdding ? '+1' : '-1', isAdding ? '#10b981' : '#64748b');

  if (!isAdding) return; // Only show festive particles on addition

  // Main emoji bounce animation on button itself
  const iconEl = buttonEl.querySelector('.reaction-emoji');
  if (iconEl) {
    iconEl.classList.remove('reaction-bounce');
    // Force reflow
    void iconEl.offsetWidth;
    iconEl.classList.add('reaction-bounce');
  }

  // Create burst container
  const particleCount = 12;
  const emojiChar = EMOJI_MAP[emojiId] || '✨';

  for (let i = 0; i < particleCount; i++) {
    createParticle(originX, originY, emojiChar, i, particleCount);
  }
}

function createFloatingBadge(x, y, text, color) {
  const badge = document.createElement('div');
  badge.className = 'reaction-float-badge';
  badge.textContent = text;
  badge.style.left = `${x}px`;
  badge.style.top = `${y}px`;
  badge.style.color = color;

  document.body.appendChild(badge);

  badge.addEventListener('animationend', () => {
    badge.remove();
  }, { once: true });

  // Safety fallback
  setTimeout(() => badge.remove(), 1200);
}

function createParticle(originX, originY, emojiChar, index, total) {
  const particle = document.createElement('div');
  particle.className = 'reaction-particle';

  // Mix between the reaction emoji and sparkling star characters
  const isEmoji = index % 3 === 0;
  if (isEmoji) {
    particle.textContent = emojiChar;
    particle.style.fontSize = `${12 + Math.random() * 8}px`;
  } else {
    particle.textContent = SPARKLE_SHAPES[Math.floor(Math.random() * SPARKLE_SHAPES.length)];
    particle.style.fontSize = `${10 + Math.random() * 8}px`;
    particle.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
  }

  // Random radial trajectory
  const angle = (Math.PI * 2 * (index / total)) + ((Math.random() - 0.5) * 0.5);
  // Bias velocity upwards
  const distance = 45 + Math.random() * 55;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance - (30 + Math.random() * 30);
  const rot = (Math.random() - 0.5) * 360;

  particle.style.setProperty('--tx', `${targetX}px`);
  particle.style.setProperty('--ty', `${targetY}px`);
  particle.style.setProperty('--rot', `${rot}deg`);
  particle.style.left = `${originX}px`;
  particle.style.top = `${originY}px`;

  document.body.appendChild(particle);

  particle.addEventListener('animationend', () => {
    particle.remove();
  }, { once: true });

  // Safety removal
  setTimeout(() => particle.remove(), 1000);
}
