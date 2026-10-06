export const SCORING = {
  article_completed: 10,
  quiz_completed: 50,
  chart_interacted: 15,
  slider_completed: 15
};

export const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 1500 }
];

export const BADGES = [
  {
    id: "first-article",
    name: "First Steps",
    description: "Complete your first article",
    icon: "📖",
    condition: (state) => state.completedArticles.length >= 1
  },
  {
    id: "curious-mind",
    name: "Curious Mind",
    description: "Interact with 5 interactive elements",
    icon: "🧠",
    condition: (state) => state.interactedElements.length >= 5
  },
  {
    id: "quizzer",
    name: "Quizzer",
    description: "Complete 3 quizzes",
    icon: "✅",
    condition: (state) => state.completedQuizzes.length >= 3
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Complete 5 articles",
    icon: "🔍",
    condition: (state) => state.completedArticles.length >= 5
  },
  {
    id: "experimenter",
    name: "Experimenter",
    description: "Complete/interact with 5 interactive experiments",
    icon: "🧪",
    condition: (state) => state.interactedElements.length >= 5 
  },
  {
    id: "getting-serious",
    name: "Getting Serious",
    description: "Earn 500 XP",
    icon: "🔥",
    condition: (state) => state.xp >= 500
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Earn 1,000 XP",
    icon: "💎",
    condition: (state) => state.xp >= 1000
  }
];
