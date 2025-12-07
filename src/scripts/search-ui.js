/**
 * SearchUI class for managing search user interface
 */
export class SearchUI {
  constructor(searchEngine) {
    this.searchEngine = searchEngine;
    this.searchInput = null;
    this.searchResults = null;
    this.debounceTimer = null;
    this.currentFilters = { types: [] };
    this.lastResults = [];
    this.selectedIndex = -1;
  }

  /**
   * Initializes the search UI
   */
  init() {
    console.log('SearchUI.init() called');
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');

    console.log('Elements:', { input: this.searchInput, results: this.searchResults });

    if (!this.searchInput || !this.searchResults) {
      console.error('Search elements not found');
      return;
    }

    console.log('Attaching event listeners...');
    this.attachEventListeners();
    console.log('Event listeners attached');
  }

  /**
   * Attaches event listeners to search elements
   */
  attachEventListeners() {
    console.log('attachEventListeners called');
    
    // Input event with debouncing
    this.searchInput.addEventListener('input', (e) => {
      console.log('Input event triggered:', e.target.value);
      this.handleInput(e.target.value);
    });

    // Focus event
    this.searchInput.addEventListener('focus', () => {
      if (this.lastResults.length > 0) {
        this.searchResults.classList.add('active');
        this.searchResults.setAttribute('aria-expanded', 'true');
      }
    });

    // Blur event (with delay to allow clicking results)
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        this.searchResults.classList.remove('active');
        this.searchResults.setAttribute('aria-expanded', 'false');
      }, 200);
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.closeResults();
      }
    });
  }

  /**
   * Handles input with debouncing
   * @param {string} value - Input value
   */
  handleInput(value) {
    clearTimeout(this.debounceTimer);

    // Validate minimum length
    if (value.trim().length < 2) {
      this.closeResults();
      return;
    }

    // Show loading state
    this.searchResults.classList.add('loading', 'active');
    this.searchResults.setAttribute('aria-expanded', 'true');

    // Debounce search
    this.debounceTimer = setTimeout(async () => {
      await this.performSearch(value);
    }, 300);
  }

  /**
   * Performs the search
   * @param {string} query - Search query
   */
  async performSearch(query) {
    try {
      const results = await this.searchEngine.search(query);
      this.lastResults = results;

      // Apply filters
      const filteredResults = this.searchEngine.applyFilters(results, this.currentFilters);

      // Remove loading state
      this.searchResults.classList.remove('loading');

      if (filteredResults.length === 0) {
        this.showEmptyState(query);
      } else {
        this.renderResults(filteredResults, query);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showErrorState();
    }
  }

  /**
   * Handles keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardNavigation(e) {
    const items = this.searchResults.querySelectorAll('.search-result-item');
    
    if (items.length === 0) {
      if (e.key === 'Escape') {
        this.closeResults();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        if (this.selectedIndex === -1) {
          this.searchInput.focus();
          items.forEach(item => item.classList.remove('selected'));
        } else {
          this.updateSelection(items);
        }
        break;
      
      case 'Enter':
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          e.preventDefault();
          const url = items[this.selectedIndex].getAttribute('data-url');
          this.navigateToResult(url);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        this.closeResults();
        break;
      
      case 'Tab':
        // Allow normal tab behavior but close results
        this.closeResults();
        break;
    }
  }

  /**
   * Updates the selected item in the results
   * @param {NodeList} items - Result items
   */
  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.focus();
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * Closes the results dropdown
   */
  closeResults() {
    this.searchResults.classList.remove('active');
    this.searchResults.setAttribute('aria-expanded', 'false');
    this.searchInput.value = '';
    this.lastResults = [];
    this.selectedIndex = -1;
  }

  /**
   * Shows empty state
   * @param {string} query - Search query
   */
  showEmptyState(query) {
    const suggestions = this.getSuggestions(query);
    let suggestionsHtml = '';
    
    if (suggestions.length > 0) {
      suggestionsHtml = `
        <p style="margin: 1rem 0 0.5rem 0; font-size: 0.875rem;">Você quis dizer:</p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          ${suggestions.map(term => `
            <button class="search-suggestion-btn" data-suggestion="${term}" 
                    style="padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid #e5e7eb; 
                           border-radius: 0.375rem; background: white; color: #0066cc; cursor: pointer;">
              ${term}
            </button>
          `).join('')}
        </div>
      `;
    }

    this.searchResults.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: #6b7280;">
        <p style="margin: 0 0 0.5rem 0; font-size: 1rem;">Nenhum resultado encontrado</p>
        <p style="margin: 0; font-size: 0.875rem;">Tente outros termos de busca ou remova alguns filtros</p>
        ${suggestionsHtml}
      </div>
    `;
    this.searchResults.classList.add('active');

    // Attach suggestion handlers
    const suggestionButtons = this.searchResults.querySelectorAll('.search-suggestion-btn');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const suggestion = button.getAttribute('data-suggestion');
        this.searchInput.value = suggestion;
        this.handleInput(suggestion);
      });
    });
  }

  /**
   * Gets search term suggestions based on index content
   * @param {string} query - Search query
   * @returns {Array<string>} Array of suggestions
   */
  getSuggestions(query) {
    if (!this.searchEngine.index) return [];

    const terms = new Set();
    const queryLower = query.toLowerCase();

    // Extract common terms from index
    this.searchEngine.index.forEach(item => {
      const words = (item.title + ' ' + item.content).toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length >= 4 && this.isSimilar(word, queryLower)) {
          terms.add(word);
        }
      });
    });

    return Array.from(terms).slice(0, 3);
  }

  /**
   * Checks if two strings are similar
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {boolean} True if similar
   */
  isSimilar(str1, str2) {
    // Simple similarity check based on common prefix
    const minLength = Math.min(str1.length, str2.length);
    if (minLength < 3) return false;

    let commonPrefix = 0;
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }

    return commonPrefix >= Math.min(3, minLength * 0.6);
  }

  /**
   * Shows error state
   */
  showErrorState() {
    this.searchResults.classList.remove('loading');
    this.searchResults.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: #ef4444;">
        <p style="margin: 0;">Erro ao realizar busca. Tente novamente.</p>
      </div>
    `;
    this.searchResults.classList.add('active');
  }

  /**
   * Renders filter controls
   * @param {Object} typeCounts - Count of results by type
   * @returns {string} HTML string
   */
  renderFilters(typeCounts) {
    const allCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
    const isAllActive = this.currentFilters.types.length === 0;

    let html = '<div class="search-filters">';
    
    // "All" filter
    html += `
      <button class="search-filter-btn ${isAllActive ? 'active' : ''}" data-filter="all">
        Todos <span class="search-filter-count">(${allCount})</span>
      </button>
    `;

    // Individual type filters
    Object.entries(typeCounts).forEach(([type, count]) => {
      const isActive = this.currentFilters.types.includes(type);
      const label = this.getTypeLabel(type);
      
      html += `
        <button class="search-filter-btn ${isActive ? 'active' : ''}" data-filter="${type}">
          ${label} <span class="search-filter-count">(${count})</span>
        </button>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * Updates active filters
   * @param {Object} filters - New filters
   */
  updateFilters(filters) {
    this.currentFilters = filters;
    const query = this.searchInput.value;
    if (query.trim().length >= 2) {
      this.performSearch(query);
    }
    
    // Announce filter change to screen readers
    if (filters.types.length > 0) {
      const filterLabel = this.getTypeLabel(filters.types[0]);
      this.searchResults.setAttribute('aria-label', `Filtrado por ${filterLabel}`);
    }
  }

  /**
   * Attaches click handlers to filter buttons
   */
  attachFilterHandlers() {
    const filterButtons = this.searchResults.querySelectorAll('.search-filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const filter = button.getAttribute('data-filter');
        
        if (filter === 'all') {
          this.currentFilters.types = [];
        } else {
          // Toggle filter
          const index = this.currentFilters.types.indexOf(filter);
          if (index > -1) {
            this.currentFilters.types.splice(index, 1);
          } else {
            this.currentFilters.types = [filter]; // Single selection for simplicity
          }
        }
        
        this.updateFilters(this.currentFilters);
      });
    });
  }

  /**
   * Renders search results
   * @param {Array} results - Search results
   * @param {string} query - Search query
   */
  renderResults(results, query) {
    this.selectedIndex = -1; // Reset selection
    const typeCounts = this.searchEngine.countByType(results);
    
    let html = '';

    // Render filters if there are multiple types
    if (Object.keys(typeCounts).length > 1) {
      html += this.renderFilters(typeCounts);
    }

    // Render result items
    results.forEach(result => {
      html += this.renderResultItem(result, query);
    });

    // Render result count
    html += `
      <div class="search-result-count">
        Mostrando ${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}
      </div>
    `;

    this.searchResults.innerHTML = html;
    this.searchResults.classList.add('active');

    // Announce results to screen readers
    this.announceResults(results.length);

    // Attach click handlers to results
    this.attachResultHandlers();
  }

  /**
   * Announces results to screen readers
   * @param {number} count - Number of results
   */
  announceResults(count) {
    const message = count === 0 
      ? 'Nenhum resultado encontrado'
      : `${count} ${count === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
    
    // Update aria-live region
    this.searchResults.setAttribute('aria-label', message);
  }

  /**
   * Renders a single result item
   * @param {Object} result - Search result
   * @param {string} query - Search query
   * @returns {string} HTML string
   */
  renderResultItem(result, query) {
    const { item, isFuzzy } = result;
    const typeLabel = this.getTypeLabel(item.type);
    const fuzzyIndicator = isFuzzy ? ' <span style="font-size: 0.75rem; color: #9ca3af;">(sugestão)</span>' : '';

    return `
      <div class="search-result-item" data-url="${item.url}" tabindex="0" role="button">
        <h3 class="search-result-title">${this.highlightMatches(item.title, query)}${fuzzyIndicator}</h3>
        <div class="search-result-meta">
          <span class="search-result-type">${typeLabel}</span>
          <span>•</span>
          <span>${item.personName}</span>
          ${item.metadata.year ? `<span>•</span><span>${item.metadata.year}</span>` : ''}
        </div>
        ${item.content ? `<p class="search-result-content">${this.highlightMatches(item.content, query)}</p>` : ''}
      </div>
    `;
  }

  /**
   * Highlights search terms in text
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {string} Text with highlights
   */
  highlightMatches(text, query) {
    if (!text || !query) return text;

    const terms = query.trim().split(/\s+/);
    let highlighted = text;

    terms.forEach(term => {
      if (term.length < 2) return;
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="search-highlight">$1</span>');
    });

    return highlighted;
  }

  /**
   * Escapes special regex characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Gets human-readable label for content type
   * @param {string} type - Content type
   * @returns {string} Type label
   */
  getTypeLabel(type) {
    const labels = {
      'projeto-pesquisa': 'Projeto de Pesquisa',
      'projeto-extensao': 'Projeto de Extensão',
      'projeto-desenvolvimento': 'Projeto de Desenvolvimento',
      'publicacao': 'Publicação',
      'orientacao': 'Orientação',
      'formacao': 'Formação',
      'area-atuacao': 'Área de Atuação',
      'linha-pesquisa': 'Linha de Pesquisa'
    };
    return labels[type] || type;
  }

  /**
   * Attaches click handlers to result items
   */
  attachResultHandlers() {
    const items = this.searchResults.querySelectorAll('.search-result-item');
    items.forEach(item => {
      const url = item.getAttribute('data-url');
      
      item.addEventListener('click', () => {
        this.navigateToResult(url);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.navigateToResult(url);
        }
      });
    });

    // Attach filter handlers
    this.attachFilterHandlers();
  }

  /**
   * Navigates to a result URL
   * @param {string} url - URL to navigate to
   */
  navigateToResult(url) {
    // Close search results
    this.closeResults();

    // Check if it's a same-page anchor
    const currentPath = window.location.pathname;
    const [targetPath, anchor] = url.split('#');

    if (targetPath === currentPath && anchor) {
      // Same page navigation - smooth scroll
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without reload
        history.pushState(null, '', url);
      } else {
        window.location.href = url;
      }
    } else {
      // Different page navigation
      window.location.href = url;
    }
  }
}
