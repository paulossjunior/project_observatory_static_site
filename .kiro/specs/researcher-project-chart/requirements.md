# Requirements Document

## Introduction

This feature will add an individual project bar chart to each researcher's profile page, showing their personal distribution of research, extension, and development projects over time. This complements the global chart on the home page by providing researcher-specific insights.

## Glossary

- **System**: The Astro-based academic observatory website
- **Researcher Profile Page**: The individual page for each person showing their academic information
- **Individual Project Chart**: A bar chart component displaying projects for a single researcher
- **Project Types**: Three categories - Research (projetos_pesquisa), Extension (projetos_extensao), and Development (projetos_desenvolvimento)
- **PersonData**: The data structure containing all information about a researcher

## Requirements

### Requirement 1

**User Story:** As a site visitor viewing a researcher's profile, I want to see a bar chart showing their projects by year and type, so that I can quickly understand their research activity timeline

#### Acceptance Criteria

1. WHEN viewing a researcher profile page, THE System SHALL display a bar chart showing the researcher's projects grouped by year
2. WHEN the chart is displayed, THE System SHALL use three distinct colored bars representing research, extension, and development projects
3. WHEN the chart is displayed, THE System SHALL include a legend identifying each project type
4. WHEN a researcher has no projects, THE System SHALL display a message indicating no project data is available
5. WHEN hovering over a bar, THE System SHALL display a tooltip with the exact count and project type for that year

### Requirement 2

**User Story:** As a site visitor, I want the individual chart to only show data for the specific researcher, so that I can focus on their contributions

#### Acceptance Criteria

1. WHEN aggregating data for the chart, THE System SHALL only process projects from the current researcher's data
2. WHEN counting projects, THE System SHALL extract data from projetos_pesquisa, projetos_extensao, and projetos_desenvolvimento arrays
3. WHEN processing projects, THE System SHALL use the ano_inicio field to determine the project year
4. WHEN a project has ano_conclusao set to "Atual", THE System SHALL include it in the count for its start year
5. THE System SHALL display only years where the researcher has at least one project

### Requirement 3

**User Story:** As a site visitor, I want the chart to be positioned appropriately on the profile page, so that it provides context without overwhelming other information

#### Acceptance Criteria

1. WHEN the profile page loads, THE System SHALL display the chart after the personal header section
2. WHEN the profile page loads, THE System SHALL display the chart before the detailed project listings
3. THE System SHALL size the chart appropriately for the page layout
4. THE System SHALL maintain responsive behavior on mobile devices
5. THE System SHALL include a descriptive title indicating it shows the researcher's projects

### Requirement 4

**User Story:** As a developer, I want to reuse existing chart components and utilities, so that the implementation is maintainable and consistent

#### Acceptance Criteria

1. THE System SHALL reuse the existing Chart.js integration from ProjectsBarChart component
2. THE System SHALL create a new utility function to aggregate projects for a single person
3. THE System SHALL maintain consistent styling with the global projects chart
4. THE System SHALL use the same color scheme for project types across all charts
5. THE System SHALL handle errors consistently with other chart components
