# Design Document

## Overview

The Global Statistics Dashboard aggregates data from all researchers in the academic observatory to provide comprehensive insights on the main page. The system follows Astro's static site generation approach, computing all statistics at build time for optimal performance. The design leverages existing patterns from the researcher analytics implementation while extending them to handle multi-researcher aggregation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   index.astro (Main Page)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │      GlobalStatsDashboard.astro Component          │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Overview Cards (6 key metrics)              │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Chart Components (GenericChart.astro)       │ │ │
│  │  │  - Publications Timeline                     │ │ │
│  │  │  - Publications by Type                      │ │ │
│  │  │  - Projects Distribution                     │ │ │
│  │  │  - Supervisions Overview                     │ │ │
│  │  │  - Committee Participations                  │ │ │
│  │  │  - Researchers by Degree                     │ │ │
│  │  │  - Funding Sources                           │ │ │
│  │  │  - Research Areas                            │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Top Performers Section                      │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         src/utils/globalStats.ts (Aggregation)           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  calculateGlobalStats()                            │ │
│  │  - Loads all researcher JSON files                │ │
│  │  - Aggregates metrics across researchers          │ │
│  │  - Returns GlobalStats interface                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Helper Functions                                  │ │
│  │  - aggregatePublicationsByYear()                  │ │
│  │  - aggregatePublicationsByType()                  │ │
│  │  - aggregateProjectsByYearAndType()               │ │
│  │  - aggregateSupervisionsByType()                  │ │
│  │  - aggregateCommitteesByType()                    │ │
│  │  - calculateTopPerformers()                       │ │
│  │  - aggregateFundingSources()                      │ │
│  │  - aggregateResearchAreas()                       │ │
│  │  - aggregateResearchersByDegree()                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│      src/utils/personData.ts (Data Loading)              │
│  - getAllPeople()                                        │
│  - PersonData interface                                  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Build Time**: Astro processes index.astro
2. **Data Loading**: globalStats.ts calls getAllPeople() to load all researcher JSON files
3. **Aggregation**: Helper functions process and aggregate data across all researchers
4. **Computation**: Statistics are calculated and structured into GlobalStats interface
5. **Rendering**: GlobalStatsDashboard.astro receives computed stats as props
6. **Visualization**: Chart components render using Chart.js with pre-computed data
7. **Output**: Static HTML with embedded data and client-side Chart.js initialization

## Components and Interfaces

### Core Utility: src/utils/globalStats.ts

#### GlobalStats Interface

```typescript
export interface GlobalStats {
  // Overview metrics
  overview: {
    totalResearchers: number;
    totalPublications: number;
    totalProjects: number;
    activeProjects: number;
    totalSupervisions: number;
    combinedExperience: number;
  };
  
  // Publications data
  publicationsByYear: Array<{ year: number; count: number }>;
  publicationsByType: Array<{ type: string; count: number }>;
  
  // Projects data
  projectsByYear: Array<{
    year: number;
    research: number;
    extension: number;
    development: number;
    total: number;
  }>;
  
  // Supervisions data
  supervisionsByType: Array<{
    type: string;
    ongoing: number;
    completed: number;
    total: number;
    completionRate: number;
  }>;
  
  // Committee data
  committeesByType: Array<{ type: string; count: number }>;
  
  // Funding data
  fundingSources: Array<{ agency: string; projectCount: number }>;
  
  // Research areas
  researchAreas: Array<{ area: string; count: number }>;
  
  // Researchers by degree
  researchersByDegree: Array<{ degree: string; count: number; percentage: number }>;
  
  // Top performers
  topPerformers: {
    publishers: Array<{ id: string; name: string; count: number }>;
    supervisors: Array<{ id: string; name: string; count: number }>;
    collaborators: Array<{ id: string; name: string; count: number }>;
    funded: Array<{ id: string; name: string; count: number }>;
  };
}
```

#### Main Aggregation Function

```typescript
export async function calculateGlobalStats(): Promise<GlobalStats>
```

**Implementation Strategy:**
- Load all researchers using `getAllPeople()` from personData.ts
- Iterate through each researcher's data
- Aggregate metrics using helper functions
- Return structured GlobalStats object

#### Helper Functions

Each helper function focuses on a specific aggregation task:

```typescript
// Aggregate publications by year across all researchers
function aggregatePublicationsByYear(people: PersonSummary[]): Array<{ year: number; count: number }>

// Aggregate publications by type (articles, books, etc.)
function aggregatePublicationsByType(people: PersonSummary[]): Array<{ type: string; count: number }>

// Aggregate projects by year and type
function aggregateProjectsByYearAndType(people: PersonSummary[]): Array<{...}>

// Aggregate supervisions by type and status
function aggregateSupervisionsByType(people: PersonSummary[]): Array<{...}>

// Aggregate committee participations by type
function aggregateCommitteesByType(people: PersonSummary[]): Array<{...}>

// Calculate top performers in various categories
function calculateTopPerformers(people: PersonSummary[]): {...}

// Aggregate funding sources
function aggregateFundingSources(people: PersonSummary[]): Array<{...}>

// Aggregate research areas
function aggregateResearchAreas(people: PersonSummary[]): Array<{...}>

// Categorize researchers by highest degree
function aggregateResearchersByDegree(people: PersonSummary[]): Array<{...}>
```

### Component: src/components/GlobalStatsDashboard.astro

**Purpose**: Main dashboard component that orchestrates the display of all global statistics.

**Props**:
```typescript
interface Props {
  stats: GlobalStats;
}
```

**Structure**:
```astro
---
import type { GlobalStats } from '../utils/globalStats';
import GenericChart from './GenericChart.astro';
import TopPerformersSection from './TopPerformersSection.astro';
import ResearchAreasCloud from './ResearchAreasCloud.astro';

interface Props {
  stats: GlobalStats;
}

const { stats } = Astro.props;
---

<div class="global-stats-dashboard">
  <!-- Overview Cards Section -->
  <div class="overview-cards">
    <!-- 6 metric cards -->
  </div>
  
  <!-- Publications Timeline -->
  <GenericChart 
    type="line"
    title="Publications Over Time"
    data={...}
  />
  
  <!-- Publications by Type -->
  <GenericChart 
    type="bar"
    title="Publications by Type"
    data={...}
  />
  
  <!-- Projects Distribution -->
  <GenericChart 
    type="bar"
    title="Projects by Year and Type"
    data={...}
    stacked={true}
  />
  
  <!-- Additional charts... -->
  
  <!-- Top Performers Section -->
  <TopPerformersSection performers={stats.topPerformers} />
  
  <!-- Research Areas -->
  <ResearchAreasCloud areas={stats.researchAreas} />
</div>
```

### Component: src/components/TopPerformersSection.astro

**Purpose**: Display top 5 researchers in each performance category.

**Props**:
```typescript
interface Props {
  performers: {
    publishers: Array<{ id: string; name: string; count: number }>;
    supervisors: Array<{ id: string; name: string; count: number }>;
    collaborators: Array<{ id: string; name: string; count: number }>;
    funded: Array<{ id: string; name: string; count: number }>;
  };
}
```

**Layout**:
- Four columns (one per category)
- Each column shows top 5 with name, count, and link to profile
- Responsive grid layout

### Component: src/components/ResearchAreasCloud.astro

**Purpose**: Display research areas in a visually organized format.

**Props**:
```typescript
interface Props {
  areas: Array<{ area: string; count: number }>;
}
```

**Implementation**:
- Display top 20 areas
- Size based on frequency (larger = more common)
- Grid or flex layout with varying font sizes
- Color coding by frequency tier

## Data Models

### Publication Type Mapping

```typescript
const PUBLICATION_TYPES = {
  'artigos_periodicos': 'Journal Articles',
  'trabalhos_completos_congressos': 'Conference Papers',
  'livros_publicados': 'Books',
  'capitulos_livros': 'Book Chapters',
  'resumos_expandidos': 'Extended Abstracts',
  'resumos_congressos': 'Abstracts',
  'artigos_aceitos': 'Accepted Articles',
  'apresentacoes_trabalhos': 'Presentations',
  'textos_jornais': 'Newspaper Articles',
  'outras_producoes': 'Other'
};
```

### Supervision Type Mapping

```typescript
const SUPERVISION_TYPES = {
  'doutorado': 'PhD',
  'mestrado': "Master's",
  'especializacao': 'Specialization',
  'tcc': 'Undergraduate Thesis',
  'iniciacao_cientifica': 'Undergraduate Research',
  'pos_doutorado': 'Post-Doctoral',
  'outros': 'Other'
};
```

### Committee Type Mapping

```typescript
const COMMITTEE_TYPES = {
  'doutorado': 'PhD Defense',
  'mestrado': "Master's Defense",
  'qualificacao_doutorado': 'PhD Qualification',
  'qualificacao_mestrado': "Master's Qualification",
  'graduacao': 'Undergraduate',
  'outras': 'Other'
};
```

### Academic Degree Mapping

```typescript
const DEGREE_TYPES = {
  'Doutorado': 'PhD',
  'Mestrado': "Master's",
  'Especialização': 'Specialization',
  'Graduação': 'Undergraduate'
};
```

## Error Handling

### Data Validation

**Strategy**: Graceful degradation with logging

```typescript
// Example: Handle missing or malformed data
function safeGetPublications(personData: PersonData): any[] {
  try {
    return personData.producao_bibliografica?.artigos_periodicos || [];
  } catch (error) {
    console.warn(`Error accessing publications for ${personData.informacoes_pessoais.nome_completo}:`, error);
    return [];
  }
}
```

### Missing Data Handling

- **Empty arrays**: Return empty arrays instead of null/undefined
- **Invalid years**: Skip entries with invalid year data, log warning
- **Missing fields**: Use default values (0 for counts, empty string for text)
- **Malformed JSON**: Skip file, log error, continue with other files

### Error Boundaries

- Wrap aggregation functions in try-catch blocks
- Log errors with context (researcher name, data field)
- Continue processing remaining data
- Return partial results rather than failing completely

## Testing Strategy

### Unit Tests (Optional)

**Test File**: `src/utils/globalStats.test.ts`

**Test Cases**:
1. `calculateGlobalStats()` returns correct structure
2. Publication aggregation handles all types correctly
3. Year parsing handles invalid data gracefully
4. Top performers calculation sorts correctly
5. Degree categorization handles missing formacao_academica
6. Empty data returns zero values, not errors

### Integration Tests (Optional)

**Test Scenarios**:
1. Build process completes successfully with real data
2. Dashboard renders without errors
3. All charts display with correct data
4. Links to researcher profiles work correctly

### Manual Testing

**Test Checklist**:
- [ ] Overview cards display correct totals
- [ ] Publications timeline shows all years
- [ ] Publications by type includes all categories
- [ ] Projects chart shows stacked bars correctly
- [ ] Supervisions chart separates ongoing/completed
- [ ] Committee chart displays all types
- [ ] Funding sources show top agencies
- [ ] Research areas display correctly
- [ ] Researchers by degree shows percentages
- [ ] Top performers link to correct profiles
- [ ] Page loads quickly (< 2 seconds)
- [ ] Charts are responsive on mobile
- [ ] No console errors

## Performance Considerations

### Build Time Optimization

**Current Approach**: All calculations at build time
- No runtime overhead
- Fast page loads
- Static HTML output

**Optimization Strategies**:
1. **Caching**: Store intermediate results during aggregation
2. **Parallel Processing**: Process researchers concurrently if needed
3. **Lazy Loading**: Load chart libraries only when needed
4. **Data Pruning**: Limit historical data to last 20 years

### Runtime Performance

**Chart.js Optimization**:
- Use `responsive: true` for automatic resizing
- Disable animations for faster initial render
- Limit data points (e.g., top 15 funding sources)
- Use `maintainAspectRatio: false` for better mobile layout

**Bundle Size**:
- Chart.js is already included (from researcher analytics)
- DataLabels plugin already included
- No additional dependencies needed

### Memory Considerations

**Data Volume Estimate**:
- 10 researchers × 50KB JSON = 500KB total
- Aggregated stats: ~50KB
- Acceptable for build-time processing

**Scaling Strategy**:
- Current design handles up to 100 researchers efficiently
- For larger datasets (1000+), consider:
  - Incremental aggregation
  - Database-backed statistics
  - Pre-computed summaries

## Integration with Existing Code

### Reuse Existing Components

**GenericChart.astro**: Already supports all needed chart types
- Line charts (publications timeline)
- Bar charts (publications by type, committees)
- Stacked bar charts (projects, supervisions)
- Doughnut charts (researchers by degree)

**Styling**: Reuse existing CSS from ResearcherAnalyticsDashboard
- Card styles
- Chart container styles
- Responsive grid layouts
- Color schemes

### Extend Existing Utilities

**personData.ts**: Already provides `getAllPeople()`
- No modifications needed
- Interfaces already defined

**researcherStats.ts**: Provides patterns for single-researcher stats
- Use as reference for aggregation logic
- Reuse helper functions where applicable

## Layout Design

### Page Structure (index.astro)

```
┌─────────────────────────────────────────────────────────┐
│                    Site Header                           │
│              Academic Observatory                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Global Statistics Dashboard                 │
│                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │  XXX   │ │  XXX   │ │  XXX   │                      │
│  │Researc.│ │ Publi. │ │Project.│                      │
│  └────────┘ └────────┘ └────────┘                      │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │  XXX   │ │  XXX   │ │  XXX   │                      │
│  │ Active │ │Superv. │ │ Years  │                      │
│  └────────┘ └────────┘ └────────┘                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         Publications Timeline (All Researchers)          │
│              [Line Chart - Full Width]                   │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│  Publications by Type    │ │  Projects Distribution   │
│    [Horizontal Bar]      │ │    [Stacked Bar]         │
└──────────────────────────┘ └──────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│  Student Supervisions    │ │  Committee Participation │
│    [Stacked Bar]         │ │    [Bar Chart]           │
└──────────────────────────┘ └──────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│  Researchers by Degree   │ │  Funding Sources         │
│    [Doughnut Chart]      │ │    [Horizontal Bar]      │
└──────────────────────────┘ └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Research Areas (Top 20)                     │
│         [Tag Cloud / Grid Layout]                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Top Performers                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Most   │ │   Most   │ │   Most   │ │   Most   │  │
│  │ Prolific │ │  Active  │ │Collabora.│ │  Funded  │  │
│  │Publishers│ │Supervisor│ │Researcher│ │Researcher│  │
│  │          │ │          │ │          │ │          │  │
│  │ 1. Name  │ │ 1. Name  │ │ 1. Name  │ │ 1. Name  │  │
│  │ 2. Name  │ │ 2. Name  │ │ 2. Name  │ │ 2. Name  │  │
│  │ 3. Name  │ │ 3. Name  │ │ 3. Name  │ │ 3. Name  │  │
│  │ 4. Name  │ │ 4. Name  │ │ 4. Name  │ │ 4. Name  │  │
│  │ 5. Name  │ │ 5. Name  │ │ 5. Name  │ │ 5. Name  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              All Researchers                             │
│         [Existing Grid of Person Cards]                  │
└─────────────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (> 1024px)**:
- Overview cards: 3 columns
- Charts: 2 columns side-by-side
- Top performers: 4 columns

**Tablet (768px - 1024px)**:
- Overview cards: 2 columns
- Charts: 1 column (full width)
- Top performers: 2 columns

**Mobile (< 768px)**:
- Overview cards: 1 column
- Charts: 1 column (full width)
- Top performers: 1 column

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create globalStats.ts with interfaces
2. Implement calculateGlobalStats() function
3. Implement overview metrics aggregation
4. Test with real data

### Phase 2: Publications & Projects
1. Implement publication aggregation functions
2. Implement project aggregation functions
3. Create GlobalStatsDashboard.astro component
4. Add overview cards
5. Add publications timeline chart
6. Add publications by type chart
7. Add projects distribution chart

### Phase 3: Supervisions & Committees
1. Implement supervision aggregation
2. Implement committee aggregation
3. Add supervisions chart
4. Add committees chart

### Phase 4: Additional Insights
1. Implement funding sources aggregation
2. Implement research areas aggregation
3. Implement researchers by degree aggregation
4. Add corresponding charts

### Phase 5: Top Performers
1. Implement top performers calculation
2. Create TopPerformersSection.astro component
3. Add links to researcher profiles

### Phase 6: Research Areas
1. Create ResearchAreasCloud.astro component
2. Implement visual layout
3. Add styling

### Phase 7: Integration & Polish
1. Integrate dashboard into index.astro
2. Add responsive styling
3. Test on various screen sizes
4. Optimize performance
5. Add loading states if needed

## Dependencies

**Existing Dependencies** (already in project):
- Chart.js (visualization)
- chartjs-plugin-datalabels (data labels on charts)
- Astro (framework)

**No New Dependencies Required**

## Accessibility Considerations

- All charts have descriptive titles
- Color schemes have sufficient contrast
- Charts include legends for clarity
- Data tables as fallback for screen readers
- Semantic HTML structure
- ARIA labels where appropriate

## SEO Considerations

- Rich content improves search visibility
- Structured data for statistics
- Descriptive headings (H2, H3)
- Alt text for visual elements
- Fast page load (static generation)

## Future Enhancements

**Potential Additions** (not in current scope):
1. Activity heatmap (calendar view)
2. Growth trends (year-over-year comparison)
3. Institution distribution
4. Timeline of milestones
5. Interactive filters (by year, type, etc.)
6. Export statistics as PDF/CSV
7. Comparison with previous years
8. Predictive analytics

## Summary

This design provides a comprehensive, performant, and maintainable solution for global statistics aggregation. It leverages existing components and patterns while introducing new aggregation logic. The phased implementation approach allows for incremental development and testing. All statistics are computed at build time, ensuring fast page loads and optimal user experience.
