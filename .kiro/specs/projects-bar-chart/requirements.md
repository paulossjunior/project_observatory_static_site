# Requirements Document

## Introduction

This feature will provide a visual representation of research, extension, and development projects over time through an interactive bar chart. The chart will aggregate project counts by year and project type, enabling users to quickly understand the distribution and evolution of academic activities across different categories.

## Glossary

- **System**: The Astro-based academic observatory website
- **Bar Chart Component**: An interactive visualization component that displays project quantities
- **Project Types**: Three categories of academic projects - Research (projetos_pesquisa), Extension (projetos_extensao), and Development (projetos_desenvolvimento)
- **Year Range**: The span of years from the earliest project start year to the most recent project end year
- **Project Count**: The number of projects active or started in a given year
- **Data Aggregation Service**: A utility that processes JSON data files to extract and count projects by year and type

## Requirements

### Requirement 1

**User Story:** As a site visitor, I want to see a bar chart showing the quantity of research, extension, and development projects by year, so that I can understand the distribution and trends of academic activities over time

#### Acceptance Criteria

1. WHEN the page loads, THE System SHALL display a bar chart with years on the x-axis and project counts on the y-axis
2. WHEN the page loads, THE System SHALL group bars by year with three distinct bars representing research, extension, and development project counts
3. WHEN the page loads, THE System SHALL use distinct colors for each project type to enable easy visual differentiation
4. WHEN the page loads, THE System SHALL include a legend identifying which color represents each project type
5. WHEN a user hovers over a bar, THE System SHALL display a tooltip showing the exact count and project type for that year

### Requirement 2

**User Story:** As a site visitor, I want the chart to accurately reflect all projects from the JSON data files, so that I can trust the information presented

#### Acceptance Criteria

1. WHEN aggregating project data, THE Data Aggregation Service SHALL read all JSON files from the source directory
2. WHEN processing each project, THE Data Aggregation Service SHALL extract the ano_inicio field to determine the project year
3. WHEN processing each project, THE Data Aggregation Service SHALL categorize projects based on their tipo field or parent array name
4. WHEN a project has ano_conclusao set to "Atual", THE Data Aggregation Service SHALL include it in the count for its start year
5. WHEN calculating totals, THE Data Aggregation Service SHALL count each project exactly once per year based on its start year

### Requirement 3

**User Story:** As a site visitor, I want the chart to be responsive and accessible, so that I can view it on any device and with assistive technologies

#### Acceptance Criteria

1. WHEN the viewport width changes, THE Bar Chart Component SHALL adjust its dimensions to fit the available space
2. WHEN rendered, THE Bar Chart Component SHALL include appropriate ARIA labels for accessibility
3. WHEN rendered on mobile devices, THE Bar Chart Component SHALL maintain readability with appropriately sized text and bars
4. WHEN using keyboard navigation, THE Bar Chart Component SHALL allow users to navigate between data points
5. WHEN using a screen reader, THE Bar Chart Component SHALL provide text alternatives describing the chart data

### Requirement 4

**User Story:** As a developer, I want the chart component to be reusable and configurable, so that I can easily integrate it into different pages or modify its appearance

#### Acceptance Criteria

1. WHEN instantiating the component, THE Bar Chart Component SHALL accept configuration options for dimensions, colors, and styling
2. WHEN provided with data, THE Bar Chart Component SHALL validate the data structure before rendering
3. WHEN an error occurs during data processing, THE Bar Chart Component SHALL display a meaningful error message to the user
4. THE Bar Chart Component SHALL be implemented as a standalone Astro component that can be imported into any page
5. THE Bar Chart Component SHALL use a well-established charting library to ensure maintainability and browser compatibility
