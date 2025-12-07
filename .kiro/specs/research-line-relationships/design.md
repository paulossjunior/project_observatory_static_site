# Design Document: Research Line Relationships

## Overview

This feature establishes explicit relationships between research lines (linhas de pesquisa) and other entities in the academic observatory system: projects, articles, and people. Currently, the system uses text-based matching to infer relationships, which is unreliable and limited. This design introduces a structured approach using explicit identifiers in the JSON data files, enabling accurate bidirectional navigation between research lines and related content.

The implementation will:
1. Add research line identifier fields to project, publication, and person JSON data
2. Create dedicated research line pages with comprehensive views of related content
3. Display research line associations on project, publication, and person pages
4. Provide filtering, sorting, and statistics for research line content
5. Enable navigation between research lines and related entities

## Architecture

### Data Model

The system will use a **reference-based relationship model** where entities store arrays of research line identifiers:

```typescript
// Research Line Definition (in person JSON)
interface LinhaPesquisa {
  id: string;              // Unique identifier (e.g., "robotica-reabilitacao")
  nome: string;            // Display name
  objetivo?: string;       // Description/objective
}

// Project with research line references
interface Project {
  // ... existing fields
  linhas_pesquisa?: string[];  // Array of research line IDs
}

// Publication with research line references
interface Publication {
  // ... existing fields
  linhas_pesquisa?: string[];  // Array of research line IDs
}

// Person with research line references
interface Person {
  // ... existing fields
  linhas_de_pesquisa: LinhaPesquisa[];  // Full definitions
  // Projects, publications inherit person's research lines
}
```

### Page Structure

```
/
├── src/
│   ├── pages/
│   │   ├── research-line/
│   │   │   └── [id].astro          # Dynamic research line pages
│   │   ├── person/
│   │   │   └── [id].astro          # Person pages (updated)
│   │   └── index.astro             # Home page with research lines overview
│   ├── components/
│   │   ├── ResearchLineCard.astro  # Display research line summary
│   │   ├── ResearchLineDetail.astro # Full research line page content
│   │   ├── RelatedProjects.astro   # Projects list for research line
│   │   ├── RelatedPublications.astro # Publications list for research line
│   │   ├── RelatedPeople.astro     # People list for research line
│   │   └── ResearchLineBadge.astro # Small badge/tag for research lines
│   └── utils/
│       ├── researchLineData.ts     # Data aggregation utilities
│       └── researchLineRelations.ts # Relationship resolution logic
```

## Components and Interfaces

### 1. Data Aggregation Layer (`researchLineData.ts`)

This utility module aggregates all research line data from person JSON files and builds relationship maps.

```typescript
interface ResearchLineData {
  id: string;
  nome: string;
  objetivo?: string;
  people: PersonReference[];
  projects: ProjectReference[];
  publications: PublicationReference[];
  stats: {
    totalPeople: number;
    totalProjects: number;
    totalPublications: number;
    activeProjects: number;
    completedProjects: number;
    recentActivity: string; // ISO date
  };
}

interface PersonReference {
  id: string;
  nome: string;
  role: 'professor' | 'student' | 'collaborator';
}

interface ProjectReference {
  id: string;
  nome: string;
  tipo: 'pesquisa' | 'extensao' | 'desenvolvimento';
  status: 'em_andamento' | 'concluido';
  ano_inicio: string;
  ano_fim?: string;
  personId: string;
  personName: string;
}

interface PublicationReference {
  id: string;
  titulo: string;
  tipo: string;
  ano: string;
  autores: string[];
  personId: string;
  personName: string;
}

// Main aggregation function
function getAllResearchLines(): Map<string, ResearchLineData>;

// Get specific research line with all relationships
function getResearchLineById(id: string): ResearchLineData | null;

// Get all research lines for a person
function getResearchLinesForPerson(personId: string): LinhaPesquisa[];

// Get all research lines for a project
function getResearchLinesForProject(projectId: string, personId: string): LinhaPesquisa[];

// Get all research lines for a publication
function getResearchLinesForPublication(publicationId: string, personId: string): LinhaPesquisa[];
```

### 2. Research Line Page (`/research-line/[id].astro`)

Dynamic page that displays comprehensive information about a research line.

**Layout:**
- Header with research line name and objective
- Statistics summary (counts, activity timeline)
- Tabbed or sectioned view:
  - Related Projects (with filters: type, status, year)
  - Related Publications (with filters: type, year)
  - Related People (grouped by role)

**Features:**
- Sortable tables for projects and publications
- Filter controls for each section
- Activity timeline/chart showing distribution by year
- Links to person profiles, project details, publication details

### 3. Research Line Components

#### `ResearchLineCard.astro`
Compact card for displaying research line summary (used on home page or person pages).

```astro
---
interface Props {
  linha: ResearchLineData;
  showStats?: boolean;
}
---
<article class="research-line-card">
  <h3><a href={`/research-line/${linha.id}`}>{linha.nome}</a></h3>
  {linha.objetivo && <p>{linha.objetivo}</p>}
  {showStats && (
    <div class="stats">
      <span>{linha.stats.totalProjects} projetos</span>
      <span>{linha.stats.totalPublications} publicações</span>
      <span>{linha.stats.totalPeople} pesquisadores</span>
    </div>
  )}
</article>
```

#### `ResearchLineBadge.astro`
Small badge/tag for displaying research line associations inline.

```astro
---
interface Props {
  linhaId: string;
  linhaNome: string;
  size?: 'small' | 'medium';
}
---
<a href={`/research-line/${linhaId}`} class={`research-line-badge ${size}`}>
  {linhaNome}
</a>
```

#### `RelatedProjects.astro`
Displays and filters projects for a research line.

```astro
---
interface Props {
  projects: ProjectReference[];
}
---
<section class="related-projects">
  <h3>Projetos Relacionados ({projects.length})</h3>
  <div class="filters">
    <!-- Filter controls: type, status, year -->
  </div>
  <table class="sortable-table">
    <!-- Projects table with sorting -->
  </table>
</section>
```

#### `RelatedPublications.astro`
Displays and filters publications for a research line.

```astro
---
interface Props {
  publications: PublicationReference[];
}
---
<section class="related-publications">
  <h3>Publicações Relacionadas ({publications.length})</h3>
  <div class="filters">
    <!-- Filter controls: type, year range -->
  </div>
  <table class="sortable-table">
    <!-- Publications table with sorting -->
  </table>
</section>
```

#### `RelatedPeople.astro`
Displays people associated with a research line, grouped by role.

```astro
---
interface Props {
  people: PersonReference[];
}
---
<section class="related-people">
  <h3>Pesquisadores ({people.length})</h3>
  <div class="people-groups">
    <div class="group">
      <h4>Professores</h4>
      <!-- List of professors -->
    </div>
    <div class="group">
      <h4>Estudantes</h4>
      <!-- List of students -->
    </div>
    <div class="group">
      <h4>Colaboradores</h4>
      <!-- List of collaborators -->
    </div>
  </div>
</section>
```

### 4. Updated Person Page

The person page will be updated to display research line associations more prominently:

```astro
<!-- In person/[id].astro -->
<section class="research-lines">
  <h2>Linhas de Pesquisa</h2>
  <div class="research-line-cards">
    {person.linhas_de_pesquisa.map(linha => (
      <ResearchLineCard linha={linha} showStats={false} />
    ))}
  </div>
</section>
```

### 5. Updated Project Display

Projects will show their associated research lines:

```astro
<!-- In ProjectsSection.astro or project detail view -->
<div class="project-meta">
  {project.linhas_pesquisa && project.linhas_pesquisa.length > 0 && (
    <div class="research-lines">
      <strong>Linhas de Pesquisa:</strong>
      {project.linhas_pesquisa.map(linhaId => {
        const linha = getResearchLineById(linhaId);
        return linha ? <ResearchLineBadge linhaId={linhaId} linhaNome={linha.nome} /> : null;
      })}
    </div>
  )}
</div>
```

### 6. Updated Publication Display

Publications will show their associated research lines:

```astro
<!-- In ProducaoBibliograficaSection.astro or publication detail view -->
<div class="publication-meta">
  {publication.linhas_pesquisa && publication.linhas_pesquisa.length > 0 && (
    <div class="research-lines">
      <strong>Linhas de Pesquisa:</strong>
      {publication.linhas_pesquisa.map(linhaId => {
        const linha = getResearchLineById(linhaId);
        return linha ? <ResearchLineBadge linhaId={linhaId} linhaNome={linha.nome} /> : null;
      })}
    </div>
  )}
</div>
```

## Data Models

### JSON Data Structure Updates

#### Person JSON (source/*.json)
```json
{
  "linhas_de_pesquisa": [
    {
      "id": "robotica-reabilitacao",
      "nome": "Robótica de Reabilitação",
      "objetivo": "Desenvolvimento de sistemas robóticos para reabilitação..."
    },
    {
      "id": "processamento-sinais",
      "nome": "Processamento de Sinais Biológicos",
      "objetivo": "Análise e processamento de sinais biomédicos..."
    }
  ],
  "projetos_pesquisa": [
    {
      "nome": "Sistema de Controle para Cadeira de Rodas",
      "linhas_pesquisa": ["robotica-reabilitacao", "processamento-sinais"],
      // ... other fields
    }
  ],
  "producao_bibliografica": {
    "artigos_periodicos": [
      {
        "titulo": "Eye Tracking System for Wheelchair Control",
        "linhas_pesquisa": ["robotica-reabilitacao"],
        // ... other fields
      }
    ]
  }
}
```

### Research Line ID Convention

Research line IDs should follow kebab-case convention:
- "Robótica de Reabilitação" → `robotica-reabilitacao`
- "Processamento de Sinais Biológicos" → `processamento-sinais-biologicos`
- "Inteligência Artificial" → `inteligencia-artificial`

IDs must be:
- Unique across the system
- URL-safe (lowercase, hyphens only)
- Descriptive and human-readable
- Consistent across all JSON files

## Error Handling

### Missing Research Line References

When a project or publication references a research line ID that doesn't exist:
1. Log a warning during build time
2. Skip displaying the invalid research line badge
3. Continue rendering other valid research lines
4. Provide a validation script to check data integrity

### Empty Research Lines

When a research line has no associated content:
1. Still display the research line page
2. Show empty state messages for each section
3. Display only the research line name and objective
4. Suggest related research lines if available

### Data Inconsistencies

Handle cases where:
- A person defines a research line but no projects/publications reference it
- A project references a research line but the person doesn't define it
- Research line IDs have typos or inconsistent formatting

Solution: Implement a data validation script that runs during build:
```bash
npm run validate-research-lines
```

This script will:
- Check all research line ID references
- Verify consistency across person, project, and publication data
- Report warnings for orphaned or missing references
- Suggest corrections for common typos

## Testing Strategy

### Unit Tests

1. **Data Aggregation Tests**
   - Test `getAllResearchLines()` with sample data
   - Verify correct counting of projects, publications, people
   - Test relationship resolution logic
   - Validate handling of missing or invalid IDs

2. **Component Tests**
   - Test ResearchLineBadge rendering
   - Test ResearchLineCard with various data states
   - Test filter and sort functionality

### Integration Tests

1. **Page Generation Tests**
   - Verify all research line pages are generated correctly
   - Test dynamic routing with valid and invalid IDs
   - Verify navigation links work correctly

2. **Data Consistency Tests**
   - Run validation script on test data
   - Verify bidirectional relationships (person ↔ research line ↔ project)
   - Test with edge cases (empty arrays, missing fields)

### Manual Testing

1. **Visual Testing**
   - Verify research line pages display correctly
   - Test responsive design on mobile devices
   - Check accessibility (keyboard navigation, screen readers)

2. **Navigation Testing**
   - Click through research line → project → person → research line
   - Verify all links work correctly
   - Test breadcrumb navigation

3. **Filter and Sort Testing**
   - Test all filter combinations on research line pages
   - Verify sorting works correctly for projects and publications
   - Test with large datasets

### Performance Testing

1. **Build Time**
   - Measure impact on build time with research line aggregation
   - Optimize data loading if necessary

2. **Page Load Time**
   - Measure research line page load times
   - Ensure tables with many items load efficiently
   - Test with largest research lines

## Implementation Notes

### Migration Strategy

Since this is a new feature requiring data structure changes:

1. **Phase 1: Add IDs to existing research lines**
   - Update person JSON files to add `id` field to each research line
   - Use consistent naming convention

2. **Phase 2: Add research line references to projects**
   - Update project objects to include `linhas_pesquisa` array
   - Start with most important/recent projects

3. **Phase 3: Add research line references to publications**
   - Update publication objects to include `linhas_pesquisa` array
   - Prioritize recent publications

4. **Phase 4: Implement pages and components**
   - Build research line pages
   - Update existing components to display research line associations
   - Add navigation links

### Backward Compatibility

The current `LinhasPesquisaSection.astro` component uses text-based matching. During migration:
- Keep the existing component as fallback
- New components will use explicit ID-based relationships
- Gradually phase out text-based matching as data is updated

### Data Validation

Create a validation script (`scripts/validate-research-lines.js`) that:
- Runs during build process
- Checks for orphaned references
- Validates ID format and uniqueness
- Reports data quality issues
- Can be run manually: `npm run validate-research-lines`

## Visual Design

### Research Line Page Layout

```
┌─────────────────────────────────────────────┐
│ Header                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ Robótica de Reabilitação                │ │
│ │ Desenvolvimento de sistemas robóticos...│ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Statistics                                   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 12   │ │ 45   │ │ 8    │ │ 2024 │        │
│ │Proj. │ │Publ. │ │Pesq. │ │Ativ. │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                              │
│ Tabs/Sections                                │
│ ┌─────────────────────────────────────────┐ │
│ │ [Projetos] [Publicações] [Pesquisadores]│ │
│ ├─────────────────────────────────────────┤ │
│ │ Filters: [Type▼] [Status▼] [Year▼]     │ │
│ ├─────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Project 1 | Pesquisa | 2024 | ✓     │ │ │
│ │ │ Project 2 | Extensão | 2023 | ⏳    │ │ │
│ │ │ Project 3 | Pesquisa | 2023 | ✓     │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Research Line Badge Styles

- Small badge: Compact, for inline display in lists
- Medium badge: More prominent, for headers and featured content
- Color coding: Different colors for different research areas (optional)
- Hover effect: Show tooltip with research line objective

### Color Scheme

Reuse existing site colors with research line-specific accents:
- Primary: #0066cc (existing site blue)
- Research line accent: #ffc107 (amber, matching current LinhasPesquisaSection)
- Success (completed): #10b981 (green)
- Warning (in progress): #f59e0b (orange)
- Info: #3b82f6 (blue)

## Accessibility

- All research line pages must have proper heading hierarchy (h1 → h2 → h3)
- Research line badges must have descriptive aria-labels
- Filter controls must be keyboard accessible
- Tables must have proper table headers and ARIA attributes
- Color is not the only indicator of status (use icons + text)
- Focus indicators must be visible on all interactive elements
- Screen readers must announce filter changes and result counts

## Performance Considerations

### Build-Time Optimization

- Cache research line aggregation results
- Generate static pages for all research lines at build time
- Minimize data processing during page generation

### Runtime Optimization

- Lazy load large tables (pagination or virtual scrolling)
- Debounce filter changes
- Use CSS for simple interactions (hover, focus) instead of JavaScript
- Optimize images and assets

### Data Size

- Keep research line data lean (only essential fields)
- Avoid duplicating full person/project/publication objects
- Use references (IDs) instead of embedding full data
- Consider pagination for research lines with many items (>50)

## Future Enhancements

1. **Research Line Analytics**
   - Collaboration network visualization
   - Publication trends over time
   - Impact metrics (citations, h-index by research line)

2. **Advanced Filtering**
   - Multi-select filters
   - Date range pickers
   - Full-text search within research line content

3. **Research Line Comparison**
   - Side-by-side comparison of multiple research lines
   - Identify overlaps and collaborations

4. **Export Functionality**
   - Export research line data as PDF or CSV
   - Generate research line reports

5. **Integration with Search**
   - Update search index to include research line relationships
   - Enable searching by research line
   - Show research line context in search results
