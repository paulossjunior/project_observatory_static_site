# Implementation Plan

- [x] 1. Set up search infrastructure and dependencies
  - Install Fuse.js library for fuzzy search functionality
  - Create scripts directory structure for build-time tools
  - Add prebuild script to package.json to generate search index
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement search index generator script
  - [x] 2.1 Create script to read all JSON files from source directory
    - Write function to scan source/ directory for .json files
    - Implement JSON parsing with error handling for each file
    - Extract person metadata (name, Lattes ID) from each file
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.2 Implement content extraction functions for each content type
    - Write function to extract and format project data (research, extension, development)
    - Write function to extract and format publication data
    - Write function to extract and format orientation data
    - Write function to extract and format education and area data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.3 Generate unified search index with all content
    - Create SearchIndexEntry objects for each content item
    - Generate unique IDs for each entry
    - Sanitize and truncate content to optimize index size
    - Associate each entry with person name and ID
    - Write consolidated search-index.json to public directory
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Create search UI component
  - [x] 3.1 Build Search.astro component with input field
    - Create search container with input field
    - Add search icon and placeholder text
    - Implement responsive styling consistent with site design
    - Add results container element
    - _Requirements: 1.1, 5.1, 5.2_

  - [x] 3.2 Implement search component styling
    - Style search input with focus states
    - Create dropdown/overlay styles for results
    - Implement mobile-responsive layout (fullscreen on mobile)
    - Add loading and empty state styles
    - Ensure accessibility (contrast, focus indicators)
    - _Requirements: 1.1, 5.1, 5.2, 5.3_

- [x] 4. Implement client-side search engine
  - [x] 4.1 Create SearchEngine class with Fuse.js integration
    - Initialize Fuse.js with configuration (threshold 0.4, keys including title/content/personName, isCaseSensitive: false)
    - Implement lazy loading of search-index.json on first use
    - Write search method that accepts query and returns results
    - Configure fuzzy matching with 2-character tolerance and case-insensitive search
    - _Requirements: 1.2, 1.3, 1.4, 4.1, 4.2, 4.5_

  - [x] 4.2 Implement filter functionality
    - Write method to apply content type filters to results
    - Implement year range filtering
    - Add status filtering (em andamento/concluído)
    - Combine multiple filters with AND logic
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.3 Add result ranking and relevance scoring
    - Configure Fuse.js scoring to prioritize exact matches over fuzzy matches
    - Implement secondary sorting by year (most recent first)
    - Limit results to maximum of 50 items
    - Add visual indicator for fuzzy match suggestions
    - _Requirements: 1.4, 2.3, 2.5, 4.2, 4.3_

- [x] 5. Implement search UI controller
  - [x] 5.1 Create SearchUI class for user interaction handling
    - Initialize SearchUI with SearchEngine instance
    - Implement input debouncing (300ms delay)
    - Add event listeners for input, focus, and blur
    - Handle minimum query length validation (2 characters)
    - _Requirements: 1.2, 1.4_

  - [x] 5.2 Implement result rendering
    - Write renderResults method to display search results
    - Create result item HTML with title, type, person name, and preview
    - Implement highlighting of search terms in results
    - Add click handlers to navigate to result URLs
    - Display result count and pagination info
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 5.3 Add filter UI controls
    - Create filter buttons/checkboxes for content types
    - Display result counts for each filter option
    - Update results when filters change
    - Show active filter indicators
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.4 Implement empty and error states
    - Display "no results" message when search returns empty
    - Implement algorithm to suggest alternative search terms based on index content
    - Show suggested terms when no exact matches found
    - Handle and display search errors gracefully
    - Add loading indicator during search
    - _Requirements: 1.5, 4.4_

- [x] 6. Add keyboard navigation and accessibility
  - [x] 6.1 Implement keyboard controls
    - Add Tab navigation between input and results
    - Implement Arrow key navigation within results
    - Add Enter key to select highlighted result
    - Add Escape key to close results dropdown
    - _Requirements: 1.1, 5.4_

  - [x] 6.2 Add ARIA attributes and screen reader support
    - Add role="search" to search container
    - Add aria-label to search input
    - Implement aria-live region for result announcements
    - Add aria-expanded state for dropdown
    - Announce result count to screen readers
    - _Requirements: 1.1, 5.4_

- [x] 7. Integrate search component into site layout
  - [x] 7.1 Add Search component to main layout
    - Import Search.astro component in main layout or index page
    - Position search component in header or prominent location
    - Include necessary scripts in page head
    - Ensure search loads on all relevant pages
    - _Requirements: 1.1_

  - [x] 7.2 Configure navigation and URL handling
    - Implement smooth scroll for same-page navigation
    - Handle cross-page navigation to person pages
    - Close search dropdown after result selection
    - Preserve search state if needed
    - _Requirements: 2.4_

- [x] 8. Optimize performance
  - [x] 8.1 Implement lazy loading and caching
    - Load search-index.json only when search is first used
    - Cache loaded index in memory
    - Implement request cancellation for pending searches
    - _Requirements: 1.4_

  - [x] 8.2 Optimize search index size
    - Limit indexed content to ~200 characters per entry
    - Remove common Portuguese stopwords if needed
    - Ensure search-index.json is under 500KB
    - Enable gzip compression for production
    - _Requirements: 1.4_

- [ ]* 9. Testing and validation
  - [ ]* 9.1 Test search functionality
    - Verify exact match searches return correct results
    - Test fuzzy matching with typos
    - Validate filter functionality
    - Test with various query lengths and special characters
    - _Requirements: 1.2, 1.3, 1.4, 4.1_

  - [ ]* 9.2 Test UI and responsiveness
    - Verify mobile responsive layout
    - Test keyboard navigation
    - Validate screen reader compatibility
    - Check visual design consistency
    - Test on different browsers
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 9.3 Performance testing
    - Measure search response time (should be < 500ms)
    - Verify index file size
    - Test with large result sets
    - Check for memory leaks during repeated searches
    - _Requirements: 1.4_
