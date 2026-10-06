import { loadState, saveState, getLevelForXP } from './state.js';
import { SCORING, LEVELS, BADGES } from './config.js';
import { showToast } from './ui.js';

let state = loadState();
let listeners = [];

export function getState() { return state; }
export function getXP() { return state.xp; }
export function getLevel() { return state.level; }
export function getBadges() { return state.badges; }
export function hasBadge(id) { return state.badges.includes(id); }

export function reset() {
  state = {
    version: 1, xp: 0, level: 1,
    completedArticles: [], completedQuizzes: [],
    interactedElements: [], badges: [], events: {}
  };
  saveState(state);
  notifyListeners();
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notifyListeners() {
  listeners.forEach(fn => fn(state));
}

function checkBadges() {
  let unlockedAny = false;
  BADGES.forEach(b => {
    if (!state.badges.includes(b.id) && b.condition(state)) {
      state.badges.push(b.id);
      unlockedAny = true;
      showToast(`🏆 Badge unlocked!\n${b.name}`);
    }
  });
  return unlockedAny;
}

function processEvent(type, id, xpCategory, stateArrayName) {
  const eventKey = `${type}:${id}`;
  if (state.events[eventKey]) return; // Already processed
  
  state.events[eventKey] = true;
  
  if (stateArrayName && !state[stateArrayName].includes(id)) {
    state[stateArrayName].push(id);
  }
  
  const xpAward = SCORING[xpCategory] || 0;
  if (xpAward > 0) {
    state.xp += xpAward;
    showToast(`+${xpAward} XP\n${formatCategoryText(xpCategory)}`);
  }
  
  const oldLevel = state.level;
  state.level = getLevelForXP(state.xp, LEVELS);
  if (state.level > oldLevel) {
    showToast(`🎉 Level Up!\nYou reached Level ${state.level}`);
  }
  
  checkBadges();
  saveState(state);
  notifyListeners();
}

function formatCategoryText(cat) {
  const map = {
    article_completed: "Article completed!",
    quiz_completed: "Quiz completed!",
    chart_interacted: "Chart interacted!",
    slider_completed: "Experiment completed!"
  };
  return map[cat] || "Task completed!";
}

export function completeArticle(id) { processEvent('article', id, 'article_completed', 'completedArticles'); }
export function completeQuiz(id) { processEvent('quiz', id, 'quiz_completed', 'completedQuizzes'); }
export function interactWithChart(id) { processEvent('chart', id, 'chart_interacted', 'interactedElements'); }
export function completeSlider(id) { processEvent('slider', id, 'slider_completed', 'interactedElements'); }

// Expose generic emit for advanced usage
export function emit(eventName, payload) {
  const id = payload?.id || Date.now().toString();
  if (eventName === 'article_completed') completeArticle(id);
  else if (eventName === 'quiz_completed') completeQuiz(id);
  else if (eventName === 'chart_interacted') interactWithChart(id);
  else if (eventName === 'slider_completed') completeSlider(id);
}

// Listen to custom DOM events emitted by our interactive components
document.addEventListener('gamification:article_completed', e => completeArticle(e.detail.id));
document.addEventListener('gamification:quiz_completed', e => completeQuiz(e.detail.id));
document.addEventListener('gamification:chart_interacted', e => interactWithChart(e.detail.id));
document.addEventListener('gamification:slider_completed', e => completeSlider(e.detail.id));
