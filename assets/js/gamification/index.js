import * as engine from './engine.js';
import { initUI } from './ui.js';

// Setup article completion observer
function setupArticleCompletion() {
  const marker = document.querySelector('[data-article-completion]');
  if (!marker) return;

  const articleId = marker.getAttribute('data-article-completion') || window.location.pathname;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        engine.completeArticle(articleId);
        observer.disconnect(); // Only fire once per page load
      }
    });
  });

  observer.observe(marker);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupArticleCompletion();
  
  // Try to initialize UI if there's a container with this ID
  initUI('#gamification-ui-container');
});

// Expose to window for manual usage or debugging
window.gamification = {
  ...engine,
  initUI
};
