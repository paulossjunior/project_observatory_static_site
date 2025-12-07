# Global Statistics for Main Page (index.astro)

## Overview
Add comprehensive global statistics to the main page that aggregate data from all researchers' JSON files, providing an overview of the entire academic observatory.

## Proposed Statistics

### 📊 **1. Overview Cards (Top Section)**

**Key Metrics:**
- **Total Researchers**: Count of all researchers in the system
- **Total Publications**: Sum of all publications (all types) from all researchers
- **Total Projects**: Sum of all research, extension, and development projects
- **Active Projects**: Count of ongoing projects across all researchers
- **Total Supervisions**: Sum of all student supervisions (ongoing + completed)
- **Years of Combined Experience**: Sum of all researchers' years of experience

**Visual Design:**
- 6 large stat cards with gradient backgrounds
- Icons for each metric
- Animated counters on page load
- Hover effects

---

### 📈 **2. Publications Timeline (Global)**

**Chart Type:** Line Chart

**Data:**
- Aggregate publications by year across all researchers
- Show trend of total publications over time
- Identify peak productivity years

**Features:**
- Data labels on points
- Smooth curve
- Total count in title
- Year range displayed

---

### 🎓 **3. Researchers by Academic Degree**

**Chart Type:** Doughnut Chart

**Data:**
- Count researchers by highest degree:
  - PhD (Doutorado)
  - Master's (Mestrado)
  - Specialization (Especialização)
  - Undergraduate (Graduação)

**Features:**
- Percentage labels
- Color-coded segments
- Legend with counts

---

### 📚 **4. Publications by Type (Global)**

**Chart Type:** Horizontal Bar Chart

**Data:**
- Journal Articles
- Conference Papers
- Books
- Book Chapters
- Extended Abstracts
- Other types

**Features:**
- Total count per type
- Sorted by quantity (descending)
- Color-coded bars

---

### 🔬 **5. Projects Distribution**

**Chart Type:** Stacked Bar Chart by Year

**Data:**
- Research projects (blue)
- Extension projects (green)
- Development projects (amber)
- Stacked by year

**Features:**
- Shows project distribution over time
- Total per year
- Legend with totals

---

### 👥 **6. Student Supervisions Overview**

**Chart Type:** Stacked Bar Chart

**Data:**
- PhD supervisions
- Master's supervisions
- Undergraduate supervisions
- Other types

**Split by:**
- Ongoing (blue)
- Completed (green)

**Features:**
- Total per type
- Percentage completed
- Stacked visualization

---

### 🏛️ **7. Committee Participations**

**Chart Type:** Bar Chart

**Data:**
- Total committee participations by type
- PhD defenses
- Master's defenses
- Qualification exams
- Undergraduate

**Features:**
- Total count
- Sorted by quantity

---

### 🤝 **8. Top Research Collaborations**

**Chart Type:** Network-style or Bar Chart

**Data:**
- Most frequent collaborators across all projects
- Number of collaborative projects
- Top 15-20 collaborators

**Features:**
- Shows research network strength
- Collaboration intensity

---

### 💰 **9. Funding Sources Overview**

**Chart Type:** Horizontal Bar Chart

**Data:**
- Top funding agencies across all researchers
- Number of funded projects per agency
- Total unique funding sources

**Features:**
- Shows main supporters
- Funding diversity

---

### 📅 **10. Activity Heatmap (Last 10 Years)**

**Chart Type:** Calendar Heatmap

**Data:**
- Combined activity intensity by year
- Publications + Projects + Supervisions
- Color intensity based on activity level

**Features:**
- Visual pattern recognition
- Peak activity identification
- Trend visualization

---

### 🌍 **11. Research Areas Cloud**

**Chart Type:** Word Cloud or Tag Cloud

**Data:**
- All research areas from all researchers
- Size based on frequency
- Color-coded by main category

**Features:**
- Interactive (click to filter researchers)
- Visual representation of expertise
- Main research themes

---

### 📊 **12. Productivity Metrics Table**

**Table Format:**

| Metric | Total | Average per Researcher | Median |
|--------|-------|------------------------|--------|
| Publications | X | Y | Z |
| Projects | X | Y | Z |
| Supervisions | X | Y | Z |
| Committees | X | Y | Z |
| Years Active | X | Y | Z |

**Features:**
- Sortable columns
- Comparison metrics
- Statistical insights

---

### 🎯 **13. Impact Summary**

**Visual:** Radar Chart (Aggregate)

**Dimensions:**
- Research Output (total publications)
- Teaching Impact (total supervisions)
- Extension Work (extension projects)
- Academic Service (committees)
- Collaboration (unique collaborators)
- Funding Success (funded projects)

**Features:**
- Normalized scores
- Overall observatory profile
- Balanced view

---

### 📈 **14. Growth Trends**

**Chart Type:** Multi-line Chart

**Data:**
- Publications growth over last 10 years
- Projects growth
- Supervisions growth
- New researchers added

**Features:**
- Trend lines
- Growth rate indicators
- Year-over-year comparison

---

### 🏆 **15. Top Performers Section**

**Lists:**

**Most Prolific Publishers:**
- Top 5 researchers by publication count
- Name + count + trend

**Most Active Supervisors:**
- Top 5 by total supervisions
- Name + count (ongoing/completed)

**Most Collaborative:**
- Top 5 by number of projects with collaborators
- Name + collaboration count

**Most Funded:**
- Top 5 by number of funded projects
- Name + funding sources

**Features:**
- Mini leaderboards
- Links to researcher profiles
- Visual indicators (medals/badges)

---

### 📍 **16. Institution Distribution**

**Chart Type:** Pie or Bar Chart

**Data:**
- Count of researchers by current institution
- Institutional affiliations
- Collaboration between institutions

**Features:**
- Institution names
- Researcher counts
- Percentage distribution

---

### 📆 **17. Timeline of Milestones**

**Visual:** Horizontal Timeline

**Data:**
- First publication year
- First project year
- Major milestones
- Recent achievements

**Features:**
- Interactive timeline
- Key events highlighted
- Historical perspective

---

## Implementation Priority

### **Phase 1 - Essential (Immediate Impact)**
1. ✅ Overview Cards (6 key metrics)
2. ✅ Publications Timeline (Global)
3. ✅ Projects Distribution by Year
4. ✅ Student Supervisions Overview
5. ✅ Publications by Type

### **Phase 2 - Enhanced Insights**
6. Researchers by Academic Degree
7. Committee Participations
8. Funding Sources Overview
9. Productivity Metrics Table
10. Impact Summary Radar

### **Phase 3 - Advanced Analytics**
11. Top Performers Section
12. Research Areas Cloud
13. Top Collaborations
14. Growth Trends
15. Activity Heatmap

### **Phase 4 - Specialized**
16. Institution Distribution
17. Timeline of Milestones

---

## Layout Proposal for index.astro

```
┌─────────────────────────────────────────────────────────┐
│                    Page Header                           │
│              Academic Observatory                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Global Statistics Dashboard                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  XXX   │ │  XXX   │ │  XXX   │ │  XXX   │          │
│  │Researc.│ │ Publi. │ │Project.│ │Superv. │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│  ┌────────┐ ┌────────┐                                  │
│  │  XXX   │ │  XXX   │                                  │
│  │ Active │ │ Years  │                                  │
│  └────────┘ └────────┘                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         Publications Timeline (All Researchers)          │
│              [Line Chart]                                │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│  Publications by Type    │ │  Projects Distribution   │
│    [Bar Chart]           │ │    [Stacked Bar]         │
└──────────────────────────┘ └──────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│  Student Supervisions    │ │  Committee Participation │
│    [Stacked Bar]         │ │    [Bar Chart]           │
└──────────────────────────┘ └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Top Performers Section                      │
│  Most Prolific | Most Active | Most Collaborative       │
│   Publishers   | Supervisors |    Researchers           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Research Areas Cloud                        │
│         [Interactive Word Cloud]                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              All Researchers                             │
│         [Grid of Person Cards]                           │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### New Utility File: `src/utils/globalStats.ts`

```typescript
export interface GlobalStats {
  totalResearchers: number;
  totalPublications: number;
  totalProjects: number;
  activeProjects: number;
  totalSupervisions: number;
  combinedExperience: number;
  publicationsByYear: Map<number, number>;
  publicationsByType: Map<string, number>;
  projectsByYear: Map<number, ProjectYearData>;
  supervisionsByType: SupervisionTypeData[];
  committeesByType: CommitteeTypeData[];
  topCollaborators: CollaboratorData[];
  fundingSources: FundingData[];
  topPublishers: ResearcherRanking[];
  topSupervisors: ResearcherRanking[];
  researchAreas: AreaFrequency[];
}

export async function calculateGlobalStats(): Promise<GlobalStats>
```

### New Component: `src/components/GlobalStatsDashboard.astro`

- Aggregates data from all researchers
- Displays overview cards
- Renders global charts
- Shows top performers

---

## Benefits

1. **Immediate Overview**: Visitors see the scope and impact at a glance
2. **Credibility**: Large numbers demonstrate institutional strength
3. **Trends**: Historical data shows growth and evolution
4. **Comparison**: Helps understand individual vs collective contributions
5. **Discovery**: Research areas and collaborations visible
6. **Engagement**: Interactive elements encourage exploration
7. **SEO**: Rich content improves search visibility

---

## Data Sources

All statistics calculated from:
- `informacoes_pessoais`
- `formacao_academica`
- `projetos_*` (pesquisa, extensao, desenvolvimento)
- `producao_bibliografica` (all types)
- `orientacoes` (em_andamento, concluidas)
- `bancas`
- `areas_de_atuacao`
- `linhas_de_pesquisa`

---

## Performance Considerations

- All calculations done at build time (SSG)
- No runtime overhead
- Pre-computed aggregations
- Cached results
- Fast page loads

---

## Next Steps

1. Review and approve statistics selection
2. Prioritize implementation phases
3. Create utility functions for global aggregation
4. Build GlobalStatsDashboard component
5. Integrate into index.astro
6. Test with real data
7. Optimize performance
8. Add animations and interactions

