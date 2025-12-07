# Design Document

## Overview

This design implements a dynamic page generation system in Astro that creates individual profile sites for each person in the observatory. The system reads JSON files from the `source/` folder and generates static pages at build time using Astro's file-based routing and `getStaticPaths()` function.

## Architecture

### High-Level Architecture

```
source/*.json → Data Layer → Astro Pages → Static HTML Output
```

1. **Data Layer**: JSON files in `source/` folder containing person data
2. **Page Generation**: Astro dynamic routes using `getStaticPaths()`
3. **Component Layer**: Reusable Astro components for rendering person information
4. **Static Output**: Pre-rendered HTML pages for each person

### Directory Structure

```
src/
├── pages/
│   ├── index.astro              # Main index listing all people
│   └── person/
│       └── [id].astro           # Dynamic route for individual person pages
├── components/
│   ├── PersonCard.astro         # Card component for person listing
│   ├── PersonHeader.astro       # Header with name and basic info
│   ├── AcademicSection.astro    # Academic background section
│   ├── ProfessionalSection.astro # Professional experience section
│   └── ProjectsSection.astro    # Research/extension projects section
└── utils/
    └── personData.ts            # Utility functions for loading person data
```

## Components and Interfaces

### Data Interfaces (TypeScript)

```typescript
interface PersonalInfo {
  id_lattes: string;
  nome_completo: string;
  nome_citacoes: string;
  sexo: string;
  endereco_profissional: string;
  atualizacao_cv: string;
  url: string;
  texto_resumo: string;
}

interface AcademicDegree {
  tipo: string;
  nome_instituicao: string;
  ano_inicio: string;
  ano_conclusao: string;
  descricao: string;
}

interface ProfessionalPosition {
  instituicao: string;
  instituicao_nome: string;
  instituicao_sigla: string;
  periodo: string;
  ano_inicio: string;
  ano_fim: string;
  vinculo: string;
  enquadramento: string;
  regime: string;
}

interface Project {
  nome: string;
  ano_inicio: string;
  ano_conclusao: string;
  descricao: string[];
  tipo: string;
  integrantes: Array<{
    nome: string;
    papel: string;
  }>;
  financiadores?: Array<{
    nome: string;
    tipo_apoio: string;
  }>;
}

interface PersonData {
  informacoes_pessoais: PersonalInfo;
  formacao_academica: AcademicDegree[];
  atuacao_profissional: ProfessionalPosition[];
  projetos_pesquisa: Project[];
  projetos_extensao: Project[];
  projetos_desenvolvimento: Project[];
}
```

### Utility Functions

**File**: `src/utils/personData.ts`

```typescript
// Load all person JSON files from source directory
export async function getAllPeople(): Promise<Array<{id: string, data: PersonData}>>

// Load a specific person's data by ID
export async function getPersonById(id: string): Promise<PersonData>

// Extract person ID from filename
export function extractIdFromFilename(filename: string): string

// Format date ranges for display
export function formatPeriod(inicio: string, fim: string): string
```

### Component Specifications

#### PersonCard.astro
- **Props**: `{ name: string, summary: string, id: string }`
- **Purpose**: Display person summary in index listing
- **Features**: Clickable card linking to person's profile page

#### PersonHeader.astro
- **Props**: `{ personalInfo: PersonalInfo }`
- **Purpose**: Display person's name, contact info, and summary
- **Features**: Responsive layout with professional styling

#### AcademicSection.astro
- **Props**: `{ degrees: AcademicDegree[] }`
- **Purpose**: Display academic background chronologically
- **Features**: Timeline-style layout showing degrees from most recent to oldest

#### ProfessionalSection.astro
- **Props**: `{ positions: ProfessionalPosition[] }`
- **Purpose**: Display professional experience
- **Features**: Grouped by institution, showing roles and periods

#### ProjectsSection.astro
- **Props**: `{ projects: Project[], title: string }`
- **Purpose**: Display research, extension, or development projects
- **Features**: Expandable project cards with team members and funding info

## Data Models

### Page Generation Flow

1. **Build Time**: Astro reads all JSON files from `source/` folder
2. **Data Processing**: Extract person ID from filename (e.g., `00_Paulo-Sergio-dos-Santos-Junior_8400407353673370.json` → `paulo-sergio-dos-santos-junior`)
3. **Route Generation**: Create route `/person/[id]` for each person
4. **Component Rendering**: Pass person data to components for rendering
5. **Static Output**: Generate HTML files in `dist/person/[id]/index.html`

### URL Structure

- Index page: `/` or `/index.html`
- Person pages: `/person/[person-id]/` (e.g., `/person/paulo-sergio-dos-santos-junior/`)

## Error Handling

### Missing Data Handling

- **Missing Optional Fields**: Components check for field existence before rendering
- **Missing Required Fields**: Log warning and skip person during build
- **Invalid JSON**: Catch parse errors and log detailed error message
- **Empty Arrays**: Display "No information available" message in sections

### Build-Time Validation

```typescript
function validatePersonData(data: any): boolean {
  // Check required fields exist
  if (!data.informacoes_pessoais?.nome_completo) {
    console.error('Missing required field: nome_completo');
    return false;
  }
  return true;
}
```

## Testing Strategy

### Unit Testing
- Test utility functions for data loading and ID extraction
- Test data validation functions
- Test date formatting functions

### Integration Testing
- Verify all JSON files are successfully loaded
- Verify correct number of pages are generated
- Verify navigation links work correctly

### Visual Testing
- Test responsive design on mobile, tablet, and desktop
- Verify consistent styling across all person pages
- Test with missing/optional data fields

### Build Testing
- Verify build completes without errors
- Check generated HTML structure
- Validate all internal links resolve correctly

## Styling Approach

### CSS Strategy
- Use Astro's scoped styles for component-specific styling
- Create shared CSS variables for colors, fonts, and spacing
- Implement responsive breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

### Design Principles
- Clean, academic aesthetic
- High readability with appropriate typography
- Clear visual hierarchy
- Accessible color contrast ratios (WCAG AA compliant)

## Performance Considerations

- **Static Generation**: All pages pre-rendered at build time for optimal performance
- **Image Optimization**: Use Astro's image optimization if photos are added later
- **Code Splitting**: Minimal JavaScript, primarily static HTML/CSS
- **Build Time**: Expect ~1-2 seconds per person page during build
