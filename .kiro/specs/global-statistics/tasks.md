# Implementation Plan

- [x] 1. Create global statistics utility with core aggregation functions
  - Create src/utils/globalStats.ts file with TypeScript interfaces for GlobalStats and all sub-types
  - Implement calculateGlobalStats() main function that loads all researchers and returns aggregated statistics
  - Implement aggregateOverviewMetrics() to calculate total researchers, publications, projects, active projects, supervisions, and combined experience
  - Add error handling for missing or malformed data with graceful degradation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Implement publication aggregation functions
  - Implement aggregatePublicationsByYear() to sum publications by year across all researchers
  - Implement aggregatePublicationsByType() to categorize and count all publication types (articles, books, chapters, etc.)
  - Handle all publication types from producao_bibliografica section
  - Sort publications by year in ascending order and by type in descending count order
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Implement project aggregation functions
  - Implement aggregateProjectsByYearAndType() to aggregate research, extension, and development projects by year
  - Extract year from project ano_inicio field and categorize by project type
  - Calculate total projects per year across all types
  - Sort projects by year in chronological order
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement supervision and committee aggregation functions
  - Implement aggregateSupervisionsByType() to categorize supervisions by academic level (PhD, Master's, etc.)
  - Separate supervisions into ongoing (em_andamento) and completed (concluidas) categories
  - Calculate completion rates for each supervision type
  - Implement aggregateCommitteesByType() to count committee participations by type (PhD defense, Master's defense, etc.)
  - Sort both by count in descending order
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Implement top performers calculation
  - Implement calculateTopPerformers() to identify top 5 researchers in four categories
  - Calculate most prolific publishers by counting all publication types
  - Calculate most active supervisors by total supervision count
  - Calculate most collaborative researchers by counting unique collaborators in projects
  - Calculate most funded researchers by counting projects with financiadores
  - Return researcher ID, name, and count for each category
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Implement funding and research area aggregation functions
  - Implement aggregateFundingSources() to extract and count funding agencies from project financiador fields
  - Aggregate across all researchers and project types
  - Return top 15 funding sources sorted by project count
  - Implement aggregateResearchAreas() to collect areas from areas_de_atuacao section
  - Calculate frequency of each research area and return top 20
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Implement researcher degree categorization
  - Implement aggregateResearchersByDegree() to categorize researchers by highest academic degree
  - Extract degree information from formacao_academica section
  - Categorize as PhD, Master's, Specialization, or Undergraduate
  - Calculate count and percentage for each degree level
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 8. Create GlobalStatsDashboard component with overview cards
  - Create src/components/GlobalStatsDashboard.astro component
  - Accept GlobalStats interface as props
  - Implement overview cards section displaying 6 key metrics (researchers, publications, projects, active projects, supervisions, years)
  - Style cards with gradient backgrounds, icons, and hover effects
  - Use responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 9. Add publications timeline chart to dashboard
  - Add GenericChart component for publications timeline using line chart type
  - Pass aggregated publications by year data from globalStats
  - Configure chart with data labels on points
  - Display year range and total count in chart title
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 10. Add publications by type and projects distribution charts
  - Add GenericChart component for publications by type using horizontal bar chart
  - Pass aggregated publications by type data sorted by count
  - Add GenericChart component for projects distribution using stacked bar chart
  - Pass aggregated projects by year and type data with stacked configuration
  - Display totals on bars using DataLabels plugin
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.4, 4.5_

- [x] 11. Add supervisions and committees charts to dashboard
  - Add GenericChart component for supervisions using stacked bar chart
  - Pass aggregated supervisions by type with ongoing/completed separation
  - Add GenericChart component for committees using bar chart
  - Pass aggregated committee participations by type
  - Display counts on all bars
  - _Requirements: 5.1, 5.2, 5.4, 6.1, 6.2, 6.4_

- [x] 12. Add funding sources and researchers by degree charts
  - Add GenericChart component for funding sources using horizontal bar chart
  - Pass top 15 funding sources sorted by project count
  - Add GenericChart component for researchers by degree using doughnut chart
  - Pass degree distribution with percentages
  - Display legend with degree names and counts
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 10.1, 10.2, 10.4, 10.5_

- [x] 13. Create TopPerformersSection component
  - Create src/components/TopPerformersSection.astro component
  - Accept top performers data as props (publishers, supervisors, collaborators, funded)
  - Display four columns with top 5 researchers in each category
  - Show researcher name, count metric, and link to profile page (/person/[id])
  - Implement responsive grid (4 columns desktop, 2 tablet, 1 mobile)
  - Style with cards and visual indicators
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 14. Create ResearchAreasCloud component
  - Create src/components/ResearchAreasCloud.astro component
  - Accept research areas array with counts as props
  - Display top 20 research areas in grid or flex layout
  - Size text based on frequency (larger font for more common areas)
  - Apply color coding by frequency tier
  - Implement responsive layout
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [x] 15. Integrate GlobalStatsDashboard into main page
  - Import calculateGlobalStats from src/utils/globalStats.ts in src/pages/index.astro
  - Call calculateGlobalStats() at build time to compute statistics
  - Pass computed stats to GlobalStatsDashboard component
  - Position dashboard above existing researcher cards grid
  - Add section heading "Global Statistics Dashboard" or similar
  - Ensure responsive layout works across all screen sizes
  - _Requirements: 1.1, 11.1, 11.2, 11.3, 11.4_

- [x] 16. Add responsive styling and polish
  - Add CSS for responsive grid layouts (overview cards, charts, top performers)
  - Implement breakpoints for desktop (>1024px), tablet (768-1024px), and mobile (<768px)
  - Style overview cards with gradients, shadows, and hover effects
  - Ensure chart containers are responsive with proper aspect ratios
  - Add spacing and padding for visual hierarchy
  - Test layout on various screen sizes
  - _Requirements: 1.3, 1.4_
