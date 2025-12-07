# Design Document

## Overview

This feature adds an individual project bar chart to each researcher's profile page. The design leverages the existing `ProjectsBarChart.astro` component and extends the `projectsData.ts` utility with a new function to aggregate projects for a single person. This approach maximizes code reuse while providing researcher-specific visualizations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Person Profile Page ([id].astro)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         PersonProjectsChart.astro Component           │  │
│  │  (Wrapper component for individual researcher)        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  ProjectsBarChart.astro (reused component)      │  │  │
│  │  │  - Receives pre-aggregated data as prop         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ aggregated data for person       │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      src/utils/projectsData.ts (extended)             │  │
│  │  - aggregateProjectsByYear() (existing)               │  │
│  │  - aggregateProjectsForPerson() (NEW)                 │  │
│  │  - getProjectsChartData() (existing)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ PersonData                       │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      Person's JSON data                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Profile Page Load**: Person profile page receives PersonData for the specific researcher
2. **Data Aggregation**: New utility function processes only that person's projects
3. **Component Rendering**: PersonProjectsChart wrapper passes data to reused ProjectsBarChart
4. **Chart Display**: Chart.js renders the visualization with researcher-specific data

## Components and Interfaces

### 1. Extended Data Utility (`src/utils/projectsData.ts`)

**New Function**:

```typescript
/**
 * Aggregate projects for a single person by year and type
 * @param personData - Data for a specific person
 * @returns Array of project counts per year for that person
 */
function aggregateProjectsForPerson(personData: PersonData): ProjectCount[]
```

**Implementation Details**:
- Accept PersonData as parameter (not fetch all people)
- Process only the three project arrays from that person
- Use same logic as `aggregateProjectsByYear()` but for single person
- Return same ProjectCount[] structure
- Handle cases where person has no projects (return empty array)

### 2. Wrapper Component (`src/components/PersonProjectsChart.astro`)

**Purpose**: Prepare data for a specific person and render the chart

**Props**:
```typescript
interface Props {
  personData: PersonData;
  personName: string;
}
```

**Structure**:
```astro
---
import { aggregateProjectsForPerson } from '../utils/projectsData';
import ProjectsBarChart from './ProjectsBarChart.astro';

const { personData, personName } = Astro.props;

const aggregatedData = aggregateProjectsForPerson(personData);
const hasProjects = aggregatedData.length > 0;
---

{hasProjects ? (
  <ProjectsBarChart 
    title={`${personName}'s Projects by Year`}
    aggregatedData={aggregatedData}
    height={350}
    showLegend={true}
  />
) : (
  <div class="no-projects-message">
    <p>No project data available for this researcher.</p>
  </div>
)}
```

### 3. Modified ProjectsBarChart Component

**Changes Required**:
- Add optional `aggregatedData` prop to accept pre-computed data
- If `aggregatedData` is provided, skip the `aggregateProjectsByYear()` call
- Otherwise, fetch all data as before (for home page usage)

**Updated Props**:
```typescript
interface Props {
  title?: string;
  height?: number;
  showLegend?: boolean;
  aggregatedData?: ProjectCount[]; // NEW: optional pre-aggregated data
}
```

**Logic**:
```astro
---
// If aggregatedData is provided, use it; otherwise fetch all
const aggregatedData = Astro.props.aggregatedData 
  ? Astro.props.aggregatedData 
  : await aggregateProjectsByYear();
---
```

### 4. Integration into Profile Page

**Location**: Add chart after PersonHeader, before other sections

```astro
---
import PersonProjectsChart from '../../components/PersonProjectsChart.astro';
// ... other imports
---

<PersonHeader ... />

<PersonProjectsChart 
  personData={personData}
  personName={personData.informacoes_pessoais.nome_completo}
/>

<AcademicSection ... />
<!-- other sections -->
```

## Data Models

### Input (PersonData - existing)

```typescript
interface PersonData {
  informacoes_pessoais: PersonalInfo;
  projetos_pesquisa: Project[];
  projetos_extensao: Project[];
  projetos_desenvolvimento: Project[];
  // ... other fields
}
```

### Output (ProjectCount[] - existing)

```typescript
interface ProjectCount {
  year: number;
  research: number;
  extension: number;
  development: number;
}
```

## Styling Considerations

### Chart Sizing
- **Home Page Chart**: height = 400px (shows all researchers)
- **Profile Page Chart**: height = 350px (shows single researcher, typically fewer data points)

### Positioning
- Place chart in a dedicated section after the header
- Add subtle background to distinguish from other sections
- Maintain consistent spacing with other profile sections

### Responsive Behavior
- On mobile: Chart scales down appropriately
- Maintain readability of labels and legend
- Tooltip remains functional on touch devices

## Error Handling

### No Projects Case
- Display friendly message: "No project data available for this researcher"
- Style consistently with other empty states
- Don't render chart canvas

### Invalid Data
- Skip projects with invalid years (same as global chart)
- Log warnings for debugging
- Continue processing valid projects

### Chart Rendering Errors
- Reuse error handling from ProjectsBarChart component
- Display fallback message if Chart.js fails to load

## Performance Considerations

### Build Time
- Minimal impact: aggregation happens once per person during build
- Reuses existing Chart.js CDN (no additional downloads)
- No impact on bundle size

### Page Load
- Chart data embedded in HTML (no additional requests)
- Chart.js loaded from CDN (cached across pages)
- Fast rendering for typical project counts (< 50 projects)

## Testing Strategy

### Unit Tests (Optional)
- Test `aggregateProjectsForPerson()` with sample PersonData
- Verify correct counting for each project type
- Test edge cases: no projects, single project, many projects

### Integration Tests
- Verify chart appears on profile pages
- Check that only researcher's projects are shown
- Verify chart doesn't appear when no projects exist

### Visual Tests
- Compare styling with home page chart
- Verify responsive behavior
- Test on multiple researcher profiles with varying data

## Accessibility

- Reuses all accessibility features from ProjectsBarChart
- ARIA labels include researcher name
- Keyboard navigation works consistently
- Screen reader announces researcher-specific data

## Implementation Approach

### Phase 1: Extend Utility
1. Add `aggregateProjectsForPerson()` function to `projectsData.ts`
2. Test with sample data

### Phase 2: Modify Existing Component
1. Update ProjectsBarChart to accept optional `aggregatedData` prop
2. Maintain backward compatibility for home page usage

### Phase 3: Create Wrapper
1. Create PersonProjectsChart component
2. Handle no-projects case

### Phase 4: Integrate
1. Add to person profile page
2. Position appropriately
3. Test across multiple profiles

## Future Enhancements

1. **Comparison View**: Show researcher's projects alongside department/institution average
2. **Project Details on Click**: Click bar to see list of projects for that year
3. **Collaboration Indicator**: Highlight projects with multiple researchers
4. **Timeline View**: Alternative visualization showing project duration
5. **Export**: Download researcher's project data as CSV
