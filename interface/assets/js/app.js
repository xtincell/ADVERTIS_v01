// ADVERT Strategic Interface - Main Application
// Version: 2.0
// Brand: AMARA

console.log('🎨 ADVERT Strategic Interface loaded');
console.log('📦 Brand: AMARA - Wear Your Story');

// Global app state
const ADVERT_APP = {
  currentDocument: null,
  currentSection: null,
  searchIndex: null,

  init() {
    console.log('✅ App initialized');
    this.setupEventListeners();
    this.detectCurrentPage();
  },

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Export buttons
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', () => this.exportAllDocuments());
    }
  },

  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('document-')) {
      const match = path.match(/document-([a-z]).html/);
      if (match) {
        this.currentDocument = match[1].toUpperCase();
        console.log(`📄 Current document: ${this.currentDocument}`);
      }
    } else {
      console.log('🏠 Dashboard page');
    }
  },

  handleSearch(query) {
    if (query.length < 2) return;
    console.log(`🔍 Searching for: ${query}`);
    // Search implementation will go here
  },

  exportAllDocuments() {
    console.log('📄 Exporting all documents as PDF...');
    alert('Export All Documents\n\nThis feature will generate a combined PDF of all 8 strategic documents.\n\nImplementation requires html2pdf.js library.');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ADVERT_APP.init();
});
