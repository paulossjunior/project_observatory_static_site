import Fuse from 'fuse.js';

/**
 * SearchEngine class for client-side search functionality
 */
export class SearchEngine {
  constructor() {
    this.fuse = null;
    this.index = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * Lazy loads the search index
   * @returns {Promise<void>}
   */
  async loadIndex() {
    if (this.isLoaded) return;
    
    // Return existing promise if already loading
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        console.log('Loading search index from /search-index.json');
        const response = await fetch('/search-index.json');
        if (!response.ok) {
          console.error('Failed to fetch search index:', response.status, response.statusText);
          throw new Error(`Failed to load search index: ${response.status}`);
        }
        
        this.index = await response.json();
      
      // Configure Fuse.js with optimal settings
      const options = {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'content', weight: 1 },
          { name: 'personName', weight: 1.5 },
          { name: 'metadata.authors', weight: 0.8 }
        ],
        threshold: 0.4, // Tolerância para fuzzy matching (~2 caracteres de erro)
        distance: 100,
        minMatchCharLength: 2, // Mínimo 2 caracteres
        includeScore: true, // Para ordenação por relevância
        includeMatches: true, // Para highlighting
        ignoreLocation: true, // Buscar em qualquer posição do texto
        useExtendedSearch: false,
        isCaseSensitive: false // Case-insensitive
      };

      this.fuse = new Fuse(this.index, options);
      this.isLoaded = true;
      } catch (error) {
        console.error('Error loading search index:', error);
        this.loadPromise = null;
        throw error;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Executes a search query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Ensure index is loaded
    await this.loadIndex();

    // Perform search
    const results = this.fuse.search(query.trim());

    // Sort results: exact matches first, then by score, then by year
    const sortedResults = results.sort((a, b) => {
      // Check for exact matches in title
      const aExact = a.item.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.item.title.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then sort by score (lower is better in Fuse.js)
      const scoreDiff = a.score - b.score;
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
      
      // Finally, sort by year (most recent first)
      const aYear = parseInt(a.item.metadata.year) || 0;
      const bYear = parseInt(b.item.metadata.year) || 0;
      return bYear - aYear;
    });

    // Mark fuzzy matches
    sortedResults.forEach(result => {
      const isExact = result.item.title.toLowerCase().includes(query.toLowerCase()) ||
                      result.item.content.toLowerCase().includes(query.toLowerCase());
      result.isFuzzy = !isExact && result.score > 0.2;
    });

    // Limit to 50 results
    return sortedResults.slice(0, 50);
  }

  /**
   * Applies filters to search results
   * @param {Array} results - Search results
   * @param {Object} filters - Filters to apply
   * @returns {Array} Filtered results
   */
  applyFilters(results, filters = {}) {
    let filtered = [...results];

    // Filter by content types (AND logic for multiple filters)
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(result => 
        filters.types.includes(result.item.type)
      );
    }

    // Filter by year range
    if (filters.yearRange) {
      filtered = filtered.filter(result => {
        const year = parseInt(result.item.metadata.year);
        if (!year) return true; // Keep items without year
        
        const { start, end } = filters.yearRange;
        if (start && year < start) return false;
        if (end && year > end) return false;
        return true;
      });
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(result => {
        if (!result.item.metadata.status) return true;
        return filters.status.includes(result.item.metadata.status);
      });
    }

    return filtered;
  }

  /**
   * Gets all available content types from the index
   * @returns {Array<string>} Array of content types
   */
  getContentTypes() {
    if (!this.index) return [];
    
    const types = new Set();
    this.index.forEach(item => types.add(item.type));
    return Array.from(types);
  }

  /**
   * Counts results by content type
   * @param {Array} results - Search results
   * @returns {Object} Object with type counts
   */
  countByType(results) {
    const counts = {};
    results.forEach(result => {
      const type = result.item.type;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Gets the raw index (for debugging or advanced use)
   * @returns {Array|null} The search index
   */
  getIndex() {
    return this.index;
  }
}
