/**
 * AMARA Strategic Interface - Advanced Navigation
 * Features: Scroll-spy, Presentation Mode, Search, Back-to-top, Progress indicator
 */

class NavigationManager {
  constructor() {
    this.currentSection = null;
    this.sections = [];
    this.sidebarLinks = [];
    this.presentationMode = false;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.setupScrollSpy();
    this.setupSmoothScroll();
    this.setupProgressIndicator();
    this.setupBackToTop();
    this.setupSidebarToggle();
    this.setupPresentationMode();
    this.setupKeyboardNav();
    console.log('✅ Advanced Navigation initialized');
  }

  /**
   * SCROLL SPY - Highlight active section in sidebar
   */
  setupScrollSpy() {
    this.sections = document.querySelectorAll('.content-section');
    this.sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (this.sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  updateActiveSection(sectionId) {
    this.currentSection = sectionId;

    // Update sidebar links
    this.sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update presentation dots if in presentation mode
    if (this.presentationMode) {
      this.updatePresentationDots(sectionId);
    }
  }

  /**
   * SMOOTH SCROLL - Smooth scrolling to sections
   */
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#top') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 100;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL hash without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  /**
   * PROGRESS INDICATOR - Reading progress bar
   */
  setupProgressIndicator() {
    // Create progress bar if doesn't exist
    let progressIndicator = document.querySelector('.progress-indicator');
    if (!progressIndicator) {
      progressIndicator = document.createElement('div');
      progressIndicator.className = 'progress-indicator';
      progressIndicator.innerHTML = '<div class="progress-bar"></div>';
      document.body.appendChild(progressIndicator);
    }

    const progressBar = progressIndicator.querySelector('.progress-bar');

    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / documentHeight) * 100;

      progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
  }

  /**
   * BACK TO TOP - Floating button
   */
  setupBackToTop() {
    let backToTop = document.querySelector('.back-to-top');

    if (!backToTop) {
      backToTop = document.createElement('button');
      backToTop.className = 'back-to-top';
      backToTop.innerHTML = '↑';
      backToTop.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(backToTop);
    }

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
  }

  /**
   * SIDEBAR TOGGLE - Mobile menu
   */
  setupSidebarToggle() {
    const sidebar = document.querySelector('.document-sidebar');
    if (!sidebar) return;

    // Create toggle button if doesn't exist in header
    let toggle = document.querySelector('.sidebar-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'btn btn-ghost sidebar-toggle';
      toggle.innerHTML = '☰ Menu';
      toggle.style.display = 'none'; // Hidden on desktop

      const header = document.querySelector('.app-header');
      if (header) {
        const nav = header.querySelector('.header-nav');
        if (nav) {
          nav.insertBefore(toggle, nav.firstChild);
        }
      }
    }

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });

    // Close sidebar when clicking a link on mobile
    this.sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  /**
   * PRESENTATION MODE - Fullscreen presentation
   */
  setupPresentationMode() {
    // Create presentation mode button if doesn't exist
    let presentBtn = document.querySelector('.present-mode-btn');
    if (!presentBtn) {
      presentBtn = document.createElement('button');
      presentBtn.className = 'btn btn-ghost present-mode-btn';
      presentBtn.innerHTML = '🎬 Present';
      presentBtn.title = 'Enter presentation mode (P)';

      const header = document.querySelector('.app-header');
      if (header) {
        const nav = header.querySelector('.header-nav');
        if (nav) {
          nav.appendChild(presentBtn);
        }
      }
    }

    presentBtn.addEventListener('click', () => {
      this.togglePresentationMode();
    });
  }

  togglePresentationMode() {
    const body = document.body;

    if (!this.presentationMode) {
      // Enter presentation mode
      this.presentationMode = true;
      body.classList.add('presentation-mode');

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Fullscreen request denied:', err);
        });
      }

      // Create presentation controls
      this.createPresentationControls();

    } else {
      // Exit presentation mode
      this.presentationMode = false;
      body.classList.remove('presentation-mode');

      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }

      // Remove presentation controls
      const controls = document.querySelector('.presentation-controls');
      if (controls) {
        controls.remove();
      }
    }
  }

  createPresentationControls() {
    let controls = document.querySelector('.presentation-controls');
    if (controls) controls.remove();

    controls = document.createElement('div');
    controls.className = 'presentation-controls';

    const sections = Array.from(this.sections);
    const currentIndex = sections.findIndex(s => s.id === this.currentSection);

    controls.innerHTML = `
      <div class="presentation-nav">
        <button class="presentation-btn" id="prev-section" ${currentIndex <= 0 ? 'disabled' : ''}>
          ← Previous
        </button>
        <button class="presentation-btn" id="next-section" ${currentIndex >= sections.length - 1 ? 'disabled' : ''}>
          Next →
        </button>
      </div>
      <div class="presentation-dots">
        ${sections.map((s, i) =>
          `<div class="presentation-dot ${i === currentIndex ? 'active' : ''}" data-section="${s.id}"></div>`
        ).join('')}
      </div>
      <button class="presentation-btn" id="exit-presentation">Exit (ESC)</button>
    `;

    document.body.appendChild(controls);

    // Setup event listeners
    document.getElementById('prev-section')?.addEventListener('click', () => this.navigateSection(-1));
    document.getElementById('next-section')?.addEventListener('click', () => this.navigateSection(1));
    document.getElementById('exit-presentation')?.addEventListener('click', () => this.togglePresentationMode());

    document.querySelectorAll('.presentation-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const sectionId = e.target.dataset.section;
        this.navigateToSection(sectionId);
      });
    });
  }

  navigateSection(direction) {
    const sections = Array.from(this.sections);
    const currentIndex = sections.findIndex(s => s.id === this.currentSection);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < sections.length) {
      this.navigateToSection(sections[newIndex].id);
    }
  }

  navigateToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updatePresentationDots(sectionId) {
    const dots = document.querySelectorAll('.presentation-dot');
    dots.forEach(dot => {
      if (dot.dataset.section === sectionId) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update prev/next buttons
    const sections = Array.from(this.sections);
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');

    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= sections.length - 1;
  }

  /**
   * KEYBOARD NAVIGATION
   */
  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // P key - Toggle presentation mode
      if (e.key === 'p' || e.key === 'P') {
        if (!e.target.matches('input, textarea')) {
          this.togglePresentationMode();
        }
      }

      // ESC key - Exit presentation mode
      if (e.key === 'Escape' && this.presentationMode) {
        this.togglePresentationMode();
      }

      // Arrow keys in presentation mode
      if (this.presentationMode) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigateSection(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigateSection(1);
        }
      }

      // / key - Focus search
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const searchInput = document.getElementById('docSearch');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Exit presentation on fullscreen change
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && this.presentationMode) {
        this.togglePresentationMode();
      }
    });
  }
}

/**
 * SEARCH ENGINE - Global search across content
 */
class SearchEngine {
  constructor() {
    this.index = [];
    this.results = [];
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.buildSearchIndex();
    this.setupSearchUI();
    console.log('✅ Search engine initialized');
  }

  buildSearchIndex() {
    // Index all content sections
    const sections = document.querySelectorAll('.content-section');

    sections.forEach(section => {
      const sectionId = section.id;
      const sectionTitle = section.querySelector('.section-title')?.textContent || '';
      const paragraphs = section.querySelectorAll('p, li, td, h3, h4');

      paragraphs.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 20) {
          this.index.push({
            id: sectionId,
            title: sectionTitle,
            content: text,
            element: el
          });
        }
      });
    });

    console.log(`📚 Indexed ${this.index.length} content blocks`);
  }

  search(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    this.index.forEach(item => {
      const content = item.content.toLowerCase();
      if (content.includes(lowerQuery)) {
        const index = content.indexOf(lowerQuery);
        const start = Math.max(0, index - 40);
        const end = Math.min(content.length, index + query.length + 40);
        const snippet = (start > 0 ? '...' : '') +
                       item.content.substring(start, end) +
                       (end < content.length ? '...' : '');

        results.push({
          id: item.id,
          title: item.title,
          snippet: snippet,
          element: item.element
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }

  setupSearchUI() {
    const searchInput = document.getElementById('docSearch');
    if (!searchInput) return;

    // Create results container
    let resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'search-results';
      searchInput.parentElement.appendChild(resultsContainer);
    }

    // Search on input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value;
        this.performSearch(query, resultsContainer);
      }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.remove('active');
      }
    });

    // Focus search on / key handled in NavigationManager
  }

  performSearch(query, resultsContainer) {
    if (!query || query.length < 2) {
      resultsContainer.classList.remove('active');
      return;
    }

    const results = this.search(query);

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-result-item">
          <div class="search-result-title">No results found</div>
          <div class="search-result-snippet">Try different keywords</div>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = results.map(result => `
        <div class="search-result-item" data-section="${result.id}">
          <div class="search-result-title">${result.title}</div>
          <div class="search-result-path">#${result.id}</div>
          <div class="search-result-snippet">${this.highlightQuery(result.snippet, query)}</div>
        </div>
      `).join('');

      // Add click handlers
      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const sectionId = item.dataset.section;
          const target = document.getElementById(sectionId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            resultsContainer.classList.remove('active');
          }
        });
      });
    }

    resultsContainer.classList.add('active');
  }

  highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }
}

// Initialize on page load
const navigationManager = new NavigationManager();
const searchEngine = new SearchEngine();

// Export for external use
if (typeof window !== 'undefined') {
  window.NavigationManager = navigationManager;
  window.SearchEngine = searchEngine;
}
