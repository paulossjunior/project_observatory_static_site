# Requirements Document

## Introduction

This document specifies requirements for a Global Statistics Dashboard feature that aggregates and visualizes data from all researchers in the academic observatory system. The Dashboard System shall display comprehensive metrics, charts, and insights on the main page (index.astro) to provide visitors with an immediate overview of the observatory's scope, impact, and research activities.

## Glossary

- **Dashboard System**: The global statistics dashboard component and associated utilities
- **Researcher Data**: JSON files containing individual researcher information including publications, projects, supervisions, and academic details
- **Aggregation Engine**: Utility functions that collect and compute statistics across all researcher data
- **Visualization Component**: Chart.js-based components that render statistical data
- **Main Page**: The index.astro page where the dashboard is displayed
- **Build Time**: The static site generation phase when Astro processes data

## Requirements

### Requirement 1

**User Story:** As a visitor to the academic observatory site, I want to see aggregate statistics across all researchers, so that I can understand the overall scope and impact of the institution's research activities.

#### Acceptance Criteria

1. WHEN the Main Page loads, THE Dashboard System SHALL display six overview metric cards showing total researchers, total publications, total projects, active projects, total supervisions, and combined years of experience
2. THE Dashboard System SHALL calculate all statistics from Researcher Data at Build Time
3. THE Dashboard System SHALL display each metric card with a numerical value, descriptive label, and icon
4. THE Dashboard System SHALL render all overview cards above other dashboard content
5. THE Dashboard System SHALL compute totals by aggregating data from all researcher JSON files in the system

### Requirement 2

**User Story:** As a visitor, I want to see how publications have evolved over time across all researchers, so that I can identify research productivity trends and peak activity periods.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a line chart showing total publications aggregated by year across all researchers
2. WHEN aggregating publication data, THE Dashboard System SHALL include all publication types from the producao_bibliografica section
3. THE Dashboard System SHALL display data labels on each point in the publications timeline chart
4. THE Dashboard System SHALL show the year range and total publication count in the chart title
5. THE Dashboard System SHALL sort years in chronological ascending order

### Requirement 3

**User Story:** As a visitor, I want to see the distribution of different publication types, so that I can understand what kinds of research outputs the observatory produces.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a horizontal bar chart showing publication counts by type
2. THE Dashboard System SHALL aggregate the following publication types: journal articles, conference papers, books, book chapters, extended abstracts, and other types
3. THE Dashboard System SHALL sort publication types by count in descending order
4. THE Dashboard System SHALL display the count value on each bar
5. THE Dashboard System SHALL use distinct colors for each publication type

### Requirement 4

**User Story:** As a visitor, I want to see how research projects are distributed over time and by type, so that I can understand the observatory's project portfolio evolution.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a stacked bar chart showing projects by year and type
2. THE Dashboard System SHALL aggregate three project types: research projects, extension projects, and development projects
3. THE Dashboard System SHALL extract year data from project start dates
4. THE Dashboard System SHALL display total project count per year above each stacked bar
5. THE Dashboard System SHALL use distinct colors for each project type with a legend

### Requirement 5

**User Story:** As a visitor, I want to see student supervision statistics, so that I can understand the teaching and mentoring impact of the observatory's researchers.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a stacked bar chart showing supervisions by academic level and status
2. THE Dashboard System SHALL aggregate supervision types: PhD, Master's, undergraduate, and other types
3. THE Dashboard System SHALL separate supervisions into ongoing and completed categories
4. THE Dashboard System SHALL display count values on each bar segment
5. THE Dashboard System SHALL calculate completion percentages for each supervision type

### Requirement 6

**User Story:** As a visitor, I want to see committee participation statistics, so that I can understand researchers' contributions to academic evaluation processes.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a bar chart showing committee participations by type
2. THE Dashboard System SHALL aggregate committee types from the bancas section: PhD defenses, Master's defenses, qualification exams, and undergraduate defenses
3. THE Dashboard System SHALL sort committee types by count in descending order
4. THE Dashboard System SHALL display the total count on each bar
5. THE Dashboard System SHALL use distinct colors for each committee type

### Requirement 7

**User Story:** As a visitor, I want to see which researchers are top performers in different categories, so that I can identify leading contributors in the observatory.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a top performers section with four categories: most prolific publishers, most active supervisors, most collaborative researchers, and most funded researchers
2. THE Dashboard System SHALL show the top 5 researchers in each category
3. THE Dashboard System SHALL display each researcher's name, count metric, and link to their profile page
4. THE Dashboard System SHALL calculate publication counts from all publication types in producao_bibliografica
5. THE Dashboard System SHALL calculate collaboration counts from projects with multiple researchers

### Requirement 8

**User Story:** As a visitor, I want to see an overview of research areas, so that I can understand the main expertise domains in the observatory.

#### Acceptance Criteria

1. THE Dashboard System SHALL display research areas from all researchers
2. THE Dashboard System SHALL aggregate areas from the areas_de_atuacao section
3. THE Dashboard System SHALL calculate frequency of each research area across all researchers
4. THE Dashboard System SHALL display the top 20 most frequent research areas
5. THE Dashboard System SHALL present research areas in a visually organized format

### Requirement 9

**User Story:** As a visitor, I want to see funding source statistics, so that I can understand which agencies support the observatory's research.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a horizontal bar chart showing funding sources by project count
2. THE Dashboard System SHALL extract funding agency names from project financiador fields
3. THE Dashboard System SHALL aggregate funding sources across all researchers and project types
4. THE Dashboard System SHALL display the top 15 funding sources sorted by project count
5. THE Dashboard System SHALL show the count value on each bar

### Requirement 10

**User Story:** As a visitor, I want to see researchers categorized by academic degree, so that I can understand the qualification levels in the observatory.

#### Acceptance Criteria

1. THE Dashboard System SHALL display a doughnut chart showing researchers by highest academic degree
2. THE Dashboard System SHALL categorize degrees as: PhD (Doutorado), Master's (Mestrado), Specialization (Especialização), and Undergraduate (Graduação)
3. THE Dashboard System SHALL extract degree information from the formacao_academica section
4. THE Dashboard System SHALL display percentage labels on each chart segment
5. THE Dashboard System SHALL show a legend with degree names and counts

### Requirement 11

**User Story:** As a site administrator, I want all statistics to be calculated at build time, so that the main page loads quickly without runtime computation overhead.

#### Acceptance Criteria

1. THE Aggregation Engine SHALL execute all statistical calculations during Build Time
2. THE Aggregation Engine SHALL read all researcher JSON files from the data directory
3. THE Aggregation Engine SHALL cache computed results for use by Visualization Components
4. THE Dashboard System SHALL not perform any data aggregation during page render
5. THE Dashboard System SHALL generate static HTML with pre-computed statistics

### Requirement 12

**User Story:** As a developer, I want a reusable aggregation utility, so that I can easily compute global statistics and extend functionality in the future.

#### Acceptance Criteria

1. THE Aggregation Engine SHALL be implemented in a utility file at src/utils/globalStats.ts
2. THE Aggregation Engine SHALL export a calculateGlobalStats function that returns all computed statistics
3. THE Aggregation Engine SHALL export TypeScript interfaces for all statistical data structures
4. THE Aggregation Engine SHALL handle missing or malformed data gracefully without throwing errors
5. THE Aggregation Engine SHALL provide functions for each major statistical category
