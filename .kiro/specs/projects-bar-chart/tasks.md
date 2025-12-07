# Implementation Plan

- [x] 1. Create data aggregation utility for projects
  - Create `src/utils/projectsData.ts` file with TypeScript interfaces for project counts and chart data
  - Implement `aggregateProjectsByYear()` function to read all person JSON files and count projects by year and type
  - Implement `getProjectsChartData()` function to transform aggregated data into Chart.js format
  - Handle edge cases: missing years, "Atual" values, invalid data
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 1.1 Write unit tests for data aggregation functions
  - Create test file for projectsData utility
  - Test year parsing and project counting logic
  - Test handling of edge cases and invalid data
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Create the ProjectsBarChart Astro component
  - Create `src/components/ProjectsBarChart.astro` file
  - Define component props interface (title, height, showLegend)
  - Implement server-side data fetching using aggregation utility
  - Create canvas element with appropriate container structure
  - Add semantic HTML with proper heading and ARIA labels
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 4.4_

- [x] 3. Implement client-side chart initialization
  - Add script block to load Chart.js from CDN
  - Initialize Chart.js with bar chart configuration
  - Configure datasets with distinct colors for each project type (research: blue, extension: green, development: amber)
  - Set up responsive options and maintain aspect ratio
  - Configure tooltip to show all datasets for a year on hover
  - Configure y-axis to start at zero with integer steps
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.5_

- [x] 4. Add responsive styling and accessibility features
  - Create CSS for responsive chart container
  - Ensure chart scales properly on mobile devices
  - Add keyboard navigation support
  - Implement focus indicators for interactive elements
  - Add fallback content for browsers without canvas support
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Implement error handling
  - Add try-catch blocks in data aggregation functions
  - Display meaningful error messages when data processing fails
  - Add fallback UI when Chart.js fails to load
  - Show "No data available" message for empty datasets
  - Log warnings for invalid or skipped projects
  - _Requirements: 4.3_

- [x] 6. Integrate component into a page
  - Add ProjectsBarChart component to the home page (`src/pages/index.astro`) or create a dedicated projects page
  - Configure component with appropriate title and dimensions
  - Test that chart renders correctly with real data
  - Verify responsive behavior at different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.3_

- [ ]* 7. Perform accessibility and cross-browser testing
  - Test with screen readers (NVDA/JAWS)
  - Verify keyboard navigation works correctly
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Verify color contrast meets WCAG AA standards
  - Test on mobile devices (iOS and Android)
  - _Requirements: 3.2, 3.4, 3.5_
