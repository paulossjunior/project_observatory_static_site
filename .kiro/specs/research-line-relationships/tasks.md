# Implementation Plan

- [x] 1. Create data utilities for research line aggregation
  - Create `src/utils/researchLineData.ts` with TypeScript interfaces for ResearchLineData, PersonReference, ProjectReference, and PublicationReference
  - Implement `getAllResearchLines()` function to scan all person JSON files and aggregate research line data
  - Implement `getResearchLineById(id)` function to retrieve specific research line with all relationships
  - Implement helper functions: `getResearchLinesForPerson()`, `getResearchLinesForProject()`, `getResearchLinesForPublication()`
  - Add error handling for missing or invalid research line references
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Create research line badge component
  - [x] 2.1 Implement ResearchLineBadge.astro component
    - Create component with props: linhaId, linhaNome, size (small/medium)
    - Add link to research line page using linhaId
    - Implement responsive styling with hover effects
    - Add aria-label for accessibility
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 6.3_

  - [x] 2.2 Style research line badges
    - Create CSS for small and medium badge sizes
    - Add hover and focus states
    - Ensure color contrast meets accessibility standards
    - Make badges responsive for mobile devices
    - _Requirements: 4.2, 5.2, 6.3_

- [x] 3. Create research line card component
  - [x] 3.1 Implement ResearchLineCard.astro component
    - Create component with props: linha (ResearchLineData), showStats (boolean)
    - Display research line name as clickable link
    - Display objective/description text
    - Conditionally display statistics (project count, publication count, people count)
    - _Requirements: 1.4, 2.5, 3.4, 6.1, 6.2, 6.3_

  - [x] 3.2 Style research line cards
    - Create card layout with proper spacing and typography
    - Add hover effects for interactive elements
    - Implement responsive design for mobile
    - Style statistics badges with appropriate colors
    - _Requirements: 1.4, 2.5, 3.4_

- [x] 4. Create related content components
  - [x] 4.1 Implement RelatedProjects.astro component
    - Create component with props: projects (ProjectReference[])
    - Display projects in sortable table format
    - Add filter controls for project type, status, and year
    - Implement client-side filtering logic
    - Add links to project details and person profiles
    - Display project count
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.4_

  - [x] 4.2 Implement RelatedPublications.astro component
    - Create component with props: publications (PublicationReference[])
    - Display publications in sortable table format
    - Add filter controls for publication type and year range
    - Implement client-side filtering logic
    - Add links to publication details and person profiles
    - Display publication count and sort by year (descending)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.2, 8.5_

  - [x] 4.3 Implement RelatedPeople.astro component
    - Create component with props: people (PersonReference[])
    - Group people by role (professors, students, collaborators)
    - Display person name, role, and link to profile
    - Add filter controls for role
    - Display people count for each group
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.3_

  - [x] 4.4 Add filtering and sorting client-side scripts
    - Create JavaScript module for filter state management
    - Implement filter functions for projects, publications, and people
    - Implement sort functions for table columns
    - Add event listeners for filter controls
    - Persist filter state in URL query parameters
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Create research line detail page
  - [x] 5.1 Implement dynamic route at src/pages/research-line/[id].astro
    - Implement `getStaticPaths()` to generate pages for all research lines
    - Fetch research line data using `getResearchLineById()`
    - Handle 404 for invalid research line IDs
    - Pass research line data to page components
    - _Requirements: 1.1, 2.1, 3.1, 9.1, 9.2, 9.3_

  - [x] 5.2 Build research line page layout
    - Create page header with research line name and objective
    - Add statistics summary section (counts, recent activity)
    - Include RelatedProjects component
    - Include RelatedPublications component
    - Include RelatedPeople component
    - Add breadcrumb navigation
    - _Requirements: 1.1, 1.4, 2.1, 2.5, 3.1, 3.4, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.3 Add statistics and activity timeline
    - Display total counts for projects, publications, and people
    - Calculate and display active vs completed projects
    - Show most recent activity date
    - Create simple activity timeline or chart showing distribution by year
    - Highlight most prolific researchers
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.4 Style research line detail page
    - Create responsive layout for header and sections
    - Style statistics cards with appropriate colors
    - Ensure consistent typography and spacing
    - Add mobile-responsive design
    - Implement print-friendly styles
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 6. Update person page to display research lines
  - [x] 6.1 Update person/[id].astro to show research line associations
    - Import and use ResearchLineCard component
    - Display research lines in dedicated section
    - Add links to research line pages
    - Show research line count
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.2 Update LinhasPesquisaSection.astro component
    - Replace text-based matching with ID-based relationships
    - Use ResearchLineBadge for research line links
    - Maintain backward compatibility for data without IDs
    - Update styling to match new design
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Update project displays to show research lines
  - [x] 7.1 Update ProjectsSection.astro component
    - Add research line badges to project cards
    - Fetch research line data using project's linhas_pesquisa field
    - Display research lines in project metadata section
    - Add links to research line pages
    - Handle projects without research line associations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.2 Style research line associations in project views
    - Position research line badges appropriately in project cards
    - Ensure badges don't clutter the layout
    - Make badges responsive for mobile
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Update publication displays to show research lines
  - [x] 8.1 Update ProducaoBibliograficaSection.astro component
    - Add research line badges to publication items
    - Fetch research line data using publication's linhas_pesquisa field
    - Display research lines in publication metadata section
    - Add links to research line pages
    - Sort research lines alphabetically
    - Handle publications without research line associations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Style research line associations in publication views
    - Position research line badges in publication metadata
    - Ensure consistent styling with project views
    - Make badges responsive for mobile
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Add research lines overview to home page
  - [x] 9.1 Update index.astro to display research lines
    - Fetch all research lines using `getAllResearchLines()`
    - Display research line cards in grid layout
    - Show statistics for each research line
    - Add section header and description
    - _Requirements: 1.4, 2.5, 3.4, 9.1, 9.2, 9.3_

  - [x] 9.2 Style research lines section on home page
    - Create responsive grid layout for research line cards
    - Add section styling consistent with site design
    - Ensure cards are clickable and have hover effects
    - _Requirements: 1.4, 2.5, 3.4_

- [x] 10. Create data validation script
  - [x] 10.1 Implement scripts/validate-research-lines.js
    - Scan all person JSON files for research line definitions
    - Check all project and publication linhas_pesquisa references
    - Validate research line ID format (kebab-case, URL-safe)
    - Detect orphaned references (IDs that don't exist)
    - Detect unused research lines (defined but never referenced)
    - Report warnings and errors with file locations
    - _Requirements: 7.5_

  - [x] 10.2 Integrate validation into build process
    - Add validation script to package.json scripts
    - Run validation before build in prebuild script
    - Configure to fail build on critical errors
    - Log warnings for non-critical issues
    - _Requirements: 7.5_

- [x] 11. Update sample data with research line IDs
  - [x] 11.1 Add IDs to existing research lines in person JSON files
    - Update linhas_de_pesquisa objects to include id field
    - Use consistent kebab-case naming convention
    - Ensure IDs are unique across all files
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 11.2 Add linhas_pesquisa references to projects
    - Update project objects to include linhas_pesquisa array
    - Reference research line IDs from person's research lines
    - Start with recent and important projects
    - _Requirements: 7.2, 7.5_

  - [x] 11.3 Add linhas_pesquisa references to publications
    - Update publication objects to include linhas_pesquisa array
    - Reference research line IDs from person's research lines
    - Prioritize recent publications
    - _Requirements: 7.3, 7.5_

- [x] 12. Add navigation and breadcrumbs
  - [x] 12.1 Create breadcrumb component for research line pages
    - Implement Breadcrumb.astro component
    - Display navigation path: Home > Research Lines > [Research Line Name]
    - Add structured data for SEO
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 12.2 Update site navigation to include research lines
    - Add "Research Lines" link to main navigation menu
    - Create research lines index page if needed
    - Ensure navigation is accessible and mobile-friendly
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 13. Implement accessibility features
  - [x] 13.1 Add ARIA attributes to research line components
    - Add proper heading hierarchy (h1 → h2 → h3)
    - Add aria-labels to research line badges
    - Add table headers and ARIA attributes to sortable tables
    - Implement aria-live regions for filter result announcements
    - _Requirements: 1.1, 2.1, 3.1, 8.1, 8.2, 8.3_

  - [x] 13.2 Ensure keyboard navigation
    - Make all filter controls keyboard accessible
    - Add visible focus indicators
    - Test tab navigation through research line pages
    - Ensure research line badges are keyboard accessible
    - _Requirements: 1.1, 2.1, 3.1, 8.1, 8.2, 8.3_

  - [x] 13.3 Verify color contrast and visual indicators
    - Ensure all text meets WCAG AA contrast standards
    - Use icons + text for status indicators (not just color)
    - Test with screen readers
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 14. Optimize performance
  - [x] 14.1 Implement caching for research line data
    - Cache aggregated research line data during build
    - Avoid redundant data processing
    - Optimize data loading in getStaticPaths
    - _Requirements: 1.1, 2.1, 3.1, 9.1, 9.2, 9.3_

  - [x] 14.2 Optimize large tables and lists
    - Implement pagination for research lines with many items (>50)
    - Add lazy loading for images if needed
    - Debounce filter changes to avoid excessive re-renders
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 14.3 Minimize bundle size
    - Use CSS for simple interactions instead of JavaScript
    - Avoid duplicating data in components
    - Optimize images and assets
    - _Requirements: 1.1, 2.1, 3.1_
