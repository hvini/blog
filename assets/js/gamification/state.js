const STORAGE_KEY = "myblog.gamification";
const CURRENT_VERSION = 1;

function getDefaultState() {
  return {
    version: CURRENT_VERSION,
    xp: 0,
    level: 1,
    completedArticles: [],
    completedQuizzes: [],
    interactedElements: [],
    badges: [],
    events: {}
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const state = JSON.parse(raw);
    if (state.version !== CURRENT_VERSION) {
      // Future migration logic can be placed here
    }
    return state;
  } catch (e) {
    console.error("Gamification: Error loading state", e);
    return getDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Gamification: Error saving state", e);
  }
}

export function getLevelForXP(xp, levels) {
  let current = levels[0].level;
  for (const l of levels) {
    if (xp >= l.xp) current = l.level;
    else break;
  }
  return current;
}
