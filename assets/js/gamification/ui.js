import { LEVELS, BADGES } from './config.js';
import { getState, subscribe } from './engine.js';

export function showToast(message) {
  const container = getOrCreateToastContainer();
  const toast = document.createElement('div');
  toast.className = 'gamification-toast';
  toast.innerHTML = message.replace('\n', '<br>');
  container.appendChild(toast);
  
  // force reflow for animation
  void toast.offsetWidth;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getOrCreateToastContainer() {
  let container = document.getElementById('gamification-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gamification-toasts';
    document.body.appendChild(container);
    
    // Inject styles here so it's self-contained
    const style = document.createElement('style');
    style.innerHTML = `
      #gamification-toasts {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .gamification-toast {
        background: #2c3e50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Inter', -apple-system, sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        text-align: center;
        line-height: 1.4;
      }
      .gamification-toast.show {
        opacity: 1;
        transform: translateY(0);
      }
      @media (prefers-reduced-motion: reduce) {
        .gamification-toast { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }
  return container;
}

function renderBadge(b, isUnlocked) {
  var bg = isUnlocked ? 'var(--bg, #fff)' : 'var(--code-bg, #f9f9f9)';
  var border = isUnlocked ? 'var(--border, #e0e0e0)' : 'var(--border, #eee)';
  var opacity = isUnlocked ? '1' : '0.6';
  var filter = isUnlocked ? 'none' : 'grayscale(100%)';
  return (
    '<div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ' + bg + '; border: 1px solid ' + border + '; border-radius: 8px; opacity: ' + opacity + '; transition: all 0.2s;">' +
      '<div style="font-size: 1.8rem; filter: ' + filter + ';">' + b.icon + '</div>' +
      '<div>' +
        '<div style="font-weight: 700; color: var(--text, #2c3e50);">' + b.name + '</div>' +
        '<div style="font-size: 0.85rem; color: #7f8c8d;">' + b.description + '</div>' +
      '</div>' +
    '</div>'
  );
}

export function initUI(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const render = (state) => {
    // calculate progress to next level
    let nextLevelXP = LEVELS[LEVELS.length - 1].xp;
    let prevLevelXP = 0;

    for (let i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].level === state.level) {
        prevLevelXP = LEVELS[i].xp;
        if (i + 1 < LEVELS.length) {
          nextLevelXP = LEVELS[i + 1].xp;
        } else {
          nextLevelXP = state.xp; // Max level
        }
        break;
      }
    }

    let pct = 100;
    if (nextLevelXP > prevLevelXP) {
      pct = Math.min(100, Math.round(((state.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));
    }

    const unlockedBadges = BADGES.filter(b => state.badges.includes(b.id));
    const badgesHTML = BADGES.map(b => renderBadge(b, state.badges.includes(b.id))).join('');

    container.innerHTML = `
      <div class="gamification-widget" style="background: var(--code-bg, #ffffff); border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid var(--border, #eaeaea); font-family: 'Inter', -apple-system, sans-serif; margin-bottom: 2rem;">
        <h3 style="margin-top: 0; color: var(--primary, #2c3e50); border-bottom: 2px solid var(--border, #eee); padding-bottom: 10px; margin-bottom: 20px;">Your Progress</h3>

        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <strong style="font-size: 1.2rem; color: var(--primary, #3498db);">Level ${state.level}</strong>
          <span style="color: #7f8c8d; font-size: 0.9rem; font-weight: 600;">${state.xp} / ${nextLevelXP} XP</span>
        </div>

        <div style="background: var(--border, #ecf0f1); border-radius: 10px; height: 12px; overflow: hidden; margin-bottom: 25px;">
          <div style="background: var(--primary, #3498db); height: 100%; width: ${pct}%; transition: width 0.5s ease;"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
          <div style="background: var(--bg, #fafafa); padding: 15px; border-radius: 8px; border: 1px solid var(--border, #eee); text-align: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text, #2c3e50);">${state.completedArticles.length}</div>
            <div style="font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; font-weight: 700;">Articles</div>
          </div>
          <div style="background: var(--bg, #fafafa); padding: 15px; border-radius: 8px; border: 1px solid var(--border, #eee); text-align: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text, #2c3e50);">${state.completedQuizzes.length}</div>
            <div style="font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; font-weight: 700;">Quizzes</div>
          </div>
          <div style="background: var(--bg, #fafafa); padding: 15px; border-radius: 8px; border: 1px solid var(--border, #eee); text-align: center; grid-column: span 2;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text, #2c3e50);">${state.interactedElements.length}</div>
            <div style="font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; font-weight: 700;">Interactive Experiments</div>
          </div>
        </div>

        <h4 style="margin: 0 0 15px 0; color: var(--text, #2c3e50); font-size: 1.1rem;">Badges (${unlockedBadges.length}/${BADGES.length})</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">${badgesHTML}</div>
      </div>
    `;
  };

  render(getState());
  subscribe(render);
}

