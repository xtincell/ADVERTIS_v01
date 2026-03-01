// Navigation Manager for ADVERT Interface

class NavigationManager {
  constructor() {
    this.sidebar = null;
    this.sections = [];
    this.activeSection = null;
    this.init();
  }

  init() {
    this.setupSidebar();
    this.setupScrollSpy();
    this.setupSmoothScroll();
    console.log('🧭 Navigation initialized');
  }

  setupSidebar() {
    this.sidebar = document.querySelector('.app-sidebar');
    if (!this.sidebar) return;

    // Get all sections on page
    this.sections = Array.from(document.querySelectorAll('[data-section]'));
  }

  setupScrollSpy() {
    if (!this.sidebar) return;

    // Highlight active section in sidebar based on scroll position
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setActiveSection(entry.target.dataset.section);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    this.sections.forEach((section) => observer.observe(section));
  }

  setActiveSection(sectionId) {
    this.activeSection = sectionId;

    // Update sidebar nav
    const links = document.querySelectorAll('.sidebar-nav-link');
    links.forEach((link) => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });
  }

  setupSmoothScroll() {
    // Smooth scroll to sections when clicking sidebar links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// Initialize navigation when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.navManager = new NavigationManager();
});
