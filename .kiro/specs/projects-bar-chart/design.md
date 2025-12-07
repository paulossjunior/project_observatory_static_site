# Design Document

## Overview

This feature introduces an interactive bar chart visualization that displays the quantity of research, extension, and development projects by year. The solution leverages Chart.js, a lightweight and widely-adopted charting library, to create a responsive and accessible visualization component within the Astro-based static site.

The design follows the existing architecture patterns in the codebase, utilizing:
- Server-side data processing during build time (following Astro's static generation approach)
- TypeScript for type safety
- Reusable Astro components for UI elements
- Utility functions for data transformation

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Astro Page                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         ProjectsBarChart.astro Component              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Canvas Element (Chart.js renders here)         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Client-side Script (chart initialization)      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ aggregated data                  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      src/utils/projectsData.ts                        │  │
│  │  - aggregateProjectsByYear()                          │  │
│  │  - getProjectsChartData()                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ raw project data                 │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      src/utils/personData.ts (existing)               │  │
│  │  - getAllPeople()                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ JSON files
                            │
                ┌───────────────────────┐
                │   source/*.json       │
                └───────────────────────┘
```

### Data Flow

1. **Build Time**: Astro reads JSON files from `source/` directory
2. **Data Aggregation**: Utility functions process and aggregate project data by year and type
3. **Component Rendering**: Astro component receives aggregated data as props
4. **Client Hydration**: Chart.js initializes on the client side with the embedded data
5. **User Interaction**: Chart.js handles hover effects, tooltips, and responsive behavior

## Components and Interfaces

### 1. Data Aggregation Utility (`src/utils/projectsData.ts`)

**Purpose**: Process raw JSON data and aggregate projects by year and type

**Key Functions**:

```typescript
interface ProjectCount {
  year: number;
  research: number;
  extension: number;
  development: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

interface ChartData {
  labels: string[]; // years as strings
  datasets: ChartDataset[];
}

/**
 * Aggregate all projects by year and type
 * @returns Array of project counts per year
 */
function aggregateProjectsByYear(): Promise<ProjectCount[]>

/**
 * Transform aggregated data into Chart.js format
 * @param aggregatedData - Project counts by year
 * @returns Chart.js compatible data structure
 */
function getProjectsChartData(aggregatedData: ProjectCount[]): ChartData
```

**Implementation Details**:
- Read all person JSON files using existing `getAllPeople()` function
- Extract projects from `projetos_pesquisa`, `projetos_extensao`, and `projetos_desenvolvimento` arrays
- Parse `ano_inicio` field to determine project year
- Handle edge cases:
  - Missing or invalid year values (skip the project)
  - `ano_conclusao: "Atual"` (count in start year only)
  - Projects without a type field (infer from parent array name)
- Group projects by year and count by type
- Sort years in ascending order
- Return structured data ready for chart rendering

### 2. Bar Chart Component (`src/components/ProjectsBarChart.astro`)

**Purpose**: Render an interactive bar chart using Chart.js

**Props**:
```typescript
interface Props {
  title?: string;
  height?: number;
  showLegend?: boolean;
}
```

**Structure**:
```astro
---
// Server-side: Data fetching and processing
import { aggregateProjectsByYear, getProjectsChartData } from '../utils/projectsData';

const { title = 'Projects by Year', height = 400, showLegend = true } = Astro.props;

const aggregatedData = await aggregateProjectsByYear();
const chartData = getProjectsChartData(aggregatedData);
---

<div class="chart-container">
  {title && <h2>{title}</h2>}
  <canvas id="projects-chart" height={height}></canvas>
</div>

<script define:vars={{ chartData, showLegend }}>
  // Client-side: Chart initialization
  // Import Chart.js from CDN
  // Initialize chart with data
  // Configure options (responsive, tooltips, legend, etc.)
</script>

<style>
  /* Responsive container styles */
  /* Accessibility enhancements */
</style>
```

**Chart.js Configuration**:
- **Type**: `bar`
- **Colors**: 
  - Research: `#3b82f6` (blue)
  - Extension: `#10b981` (green)
  - Development: `#f59e0b` (amber)
- **Options**:
  - Responsive: true
  - Maintain aspect ratio: true
  - Legend position: top
  - Tooltip mode: 'index' (show all datasets for a year)
  - Scales: 
    - Y-axis: Begin at zero, integer steps only
    - X-axis: Display all year labels

### 3. Integration Point

The component can be added to any Astro page:

```astro
---
import ProjectsBarChart from '../components/ProjectsBarChart.astro';
---

<ProjectsBarChart 
  title="Research, Extension, and Development Projects by Year"
  height={500}
  showLegend={true}
/>
```

## Data Models

### Input Data Structure (from JSON files)

```typescript
// Existing PersonData interface includes:
interface PersonData {
  projetos_pesquisa: Project[];
  projetos_extensao: Project[];
  projetos_desenvolvimento: Project[];
}

interface Project {
  nome: string;
  ano_inicio: string;  // e.g., "2019", "2020"
  ano_conclusao: string; // e.g., "2022", "Atual"
  tipo: string;
  // ... other fields
}
```

### Aggregated Data Structure

```typescript
interface ProjectCount {
  year: number;
  research: number;
  extension: number;
  development: number;
}

// Example:
// [
//   { year: 2019, research: 5, extension: 2, development: 1 },
//   { year: 2020, research: 7, extension: 3, development: 2 },
//   ...
// ]
```

### Chart Data Structure (Chart.js format)

```typescript
interface ChartData {
  labels: string[]; // ["2019", "2020", "2021", ...]
  datasets: [
    {
      label: "Research",
      data: [5, 7, 6, ...],
      backgroundColor: "#3b82f6",
      borderColor: "#2563eb",
      borderWidth: 1
    },
    {
      label: "Extension",
      data: [2, 3, 4, ...],
      backgroundColor: "#10b981",
      borderColor: "#059669",
      borderWidth: 1
    },
    {
      label: "Development",
      data: [1, 2, 1, ...],
      backgroundColor: "#f59e0b",
      borderColor: "#d97706",
      borderWidth: 1
    }
  ]
}
```

## Error Handling

### Data Processing Errors

1. **Missing or Invalid JSON Files**
   - Log warning to console
   - Skip the file and continue processing others
   - Ensure at least empty arrays are returned

2. **Invalid Year Values**
   - Skip projects with non-numeric or missing `ano_inicio`
   - Log warning with project name for debugging

3. **Empty Dataset**
   - Display message: "No project data available"
   - Render empty chart container with appropriate styling

### Chart Rendering Errors

1. **Chart.js Load Failure**
   - Display fallback message: "Unable to load chart visualization"
   - Provide text-based summary of data as alternative

2. **Canvas Not Supported**
   - Detect canvas support
   - Show fallback content for older browsers

## Testing Strategy

### Unit Tests

1. **Data Aggregation Functions**
   - Test with sample JSON data containing various project types
   - Test year parsing and counting logic
   - Test handling of "Atual" in `ano_conclusao`
   - Test edge cases: empty arrays, missing fields, invalid years

2. **Data Transformation Functions**
   - Verify Chart.js data structure format
   - Test color assignments
   - Test label generation

### Integration Tests

1. **Component Rendering**
   - Verify component renders without errors
   - Check canvas element is created
   - Verify data is correctly passed to client script

2. **End-to-End Visual Tests**
   - Build the site and verify chart appears
   - Test responsive behavior at different viewport sizes
   - Verify tooltips display correct information
   - Test keyboard navigation

### Accessibility Tests

1. **ARIA Labels**
   - Verify canvas has appropriate aria-label
   - Check legend is keyboard accessible

2. **Screen Reader Compatibility**
   - Test with NVDA/JAWS
   - Verify alternative text is meaningful

3. **Keyboard Navigation**
   - Ensure chart can be navigated with Tab key
   - Verify focus indicators are visible

## Performance Considerations

1. **Build Time Performance**
   - Data aggregation happens once at build time
   - No runtime data processing overhead
   - Minimal impact on build time (< 100ms for typical dataset)

2. **Client-Side Performance**
   - Chart.js loaded from CDN (cached by browsers)
   - Minimal JavaScript bundle size impact
   - Chart renders quickly (< 200ms for typical dataset)

3. **Bundle Size**
   - Chart.js: ~200KB (minified, from CDN)
   - Component code: < 5KB
   - No impact on main bundle (CDN delivery)

## Dependencies

### New Dependencies

- **Chart.js** (v4.x): Loaded via CDN
  - URL: `https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js`
  - License: MIT
  - Rationale: Industry-standard, well-maintained, excellent documentation, accessibility features built-in

### Existing Dependencies

- Astro (already installed)
- TypeScript types for Node.js (already installed)
- Existing `personData.ts` utility functions

## Accessibility Features

1. **Semantic HTML**: Chart wrapped in semantic container with heading
2. **ARIA Labels**: Canvas element includes descriptive aria-label
3. **Keyboard Navigation**: Chart.js provides built-in keyboard support
4. **Color Contrast**: Colors chosen meet WCAG AA standards
5. **Alternative Content**: Text summary available if chart fails to load
6. **Responsive Design**: Chart scales appropriately on all devices
7. **Focus Management**: Visible focus indicators for interactive elements

## Future Enhancements

1. **Filtering**: Add controls to filter by project type
2. **Date Range Selection**: Allow users to select specific year ranges
3. **Export**: Add button to export chart as image or data as CSV
4. **Drill-Down**: Click on bar to see list of projects for that year/type
5. **Animations**: Add smooth transitions when data updates
6. **Multiple Views**: Toggle between bar, line, and stacked bar charts
