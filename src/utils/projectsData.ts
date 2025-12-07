import { getAllPeople, type PersonData, type Project } from './personData';

/**
 * Represents the count of projects by type for a specific year
 */
export interface ProjectCount {
  year: number;
  research: number;
  extension: number;
  development: number;
}

/**
 * Chart.js dataset configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

/**
 * Chart.js compatible data structure
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Parse year from string, handling invalid values
 * @param yearStr - Year string from JSON data
 * @returns Parsed year number or null if invalid
 */
function parseYear(yearStr: string | null | undefined): number | null {
  if (!yearStr) return null;
  
  const year = parseInt(yearStr, 10);
  
  // Validate year is reasonable (between 1900 and current year + 10)
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 10) {
    return null;
  }
  
  return year;
}

/**
 * Aggregate projects for a single person by year and type
 * @param personData - Data for a specific person
 * @returns Array of project counts per year for that person, sorted by year
 */
export function aggregateProjectsForPerson(personData: PersonData): ProjectCount[] {
  try {
    // Map to store counts: year -> { research, extension, development }
    const yearCounts = new Map<number, ProjectCount>();
    
    // Process research projects
    if (personData.projetos_pesquisa && Array.isArray(personData.projetos_pesquisa)) {
      for (const project of personData.projetos_pesquisa) {
        const year = parseYear(project.ano_inicio);
        if (year !== null) {
          const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
          count.research++;
          yearCounts.set(year, count);
        } else if (project.ano_inicio) {
          console.warn(`Invalid year in research project: ${project.nome} - ${project.ano_inicio}`);
        }
      }
    }
    
    // Process extension projects
    if (personData.projetos_extensao && Array.isArray(personData.projetos_extensao)) {
      for (const project of personData.projetos_extensao) {
        const year = parseYear(project.ano_inicio);
        if (year !== null) {
          const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
          count.extension++;
          yearCounts.set(year, count);
        } else if (project.ano_inicio) {
          console.warn(`Invalid year in extension project: ${project.nome} - ${project.ano_inicio}`);
        }
      }
    }
    
    // Process development projects
    if (personData.projetos_desenvolvimento && Array.isArray(personData.projetos_desenvolvimento)) {
      for (const project of personData.projetos_desenvolvimento) {
        const year = parseYear(project.ano_inicio);
        if (year !== null) {
          const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
          count.development++;
          yearCounts.set(year, count);
        } else if (project.ano_inicio) {
          console.warn(`Invalid year in development project: ${project.nome} - ${project.ano_inicio}`);
        }
      }
    }
    
    // Convert map to array and sort by year
    const result = Array.from(yearCounts.values()).sort((a, b) => a.year - b.year);
    
    return result;
  } catch (error) {
    console.error('Error aggregating projects for person:', error);
    return [];
  }
}

/**
 * Aggregate all projects by year and type across all people
 * @returns Array of project counts per year, sorted by year
 */
export async function aggregateProjectsByYear(): Promise<ProjectCount[]> {
  try {
    const people = await getAllPeople();
    
    // Map to store counts: year -> { research, extension, development }
    const yearCounts = new Map<number, ProjectCount>();
    
    // Process each person's projects
    for (const person of people) {
      const data = person.data;
      
      // Process research projects
      if (data.projetos_pesquisa && Array.isArray(data.projetos_pesquisa)) {
        for (const project of data.projetos_pesquisa) {
          const year = parseYear(project.ano_inicio);
          if (year !== null) {
            const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
            count.research++;
            yearCounts.set(year, count);
          } else if (project.ano_inicio) {
            console.warn(`Invalid year in research project: ${project.nome} - ${project.ano_inicio}`);
          }
        }
      }
      
      // Process extension projects
      if (data.projetos_extensao && Array.isArray(data.projetos_extensao)) {
        for (const project of data.projetos_extensao) {
          const year = parseYear(project.ano_inicio);
          if (year !== null) {
            const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
            count.extension++;
            yearCounts.set(year, count);
          } else if (project.ano_inicio) {
            console.warn(`Invalid year in extension project: ${project.nome} - ${project.ano_inicio}`);
          }
        }
      }
      
      // Process development projects
      if (data.projetos_desenvolvimento && Array.isArray(data.projetos_desenvolvimento)) {
        for (const project of data.projetos_desenvolvimento) {
          const year = parseYear(project.ano_inicio);
          if (year !== null) {
            const count = yearCounts.get(year) || { year, research: 0, extension: 0, development: 0 };
            count.development++;
            yearCounts.set(year, count);
          } else if (project.ano_inicio) {
            console.warn(`Invalid year in development project: ${project.nome} - ${project.ano_inicio}`);
          }
        }
      }
    }
    
    // Convert map to array and sort by year
    const result = Array.from(yearCounts.values()).sort((a, b) => a.year - b.year);
    
    return result;
  } catch (error) {
    console.error('Error aggregating projects by year:', error);
    return [];
  }
}

/**
 * Transform aggregated data into Chart.js format
 * @param aggregatedData - Project counts by year
 * @returns Chart.js compatible data structure
 */
export function getProjectsChartData(aggregatedData: ProjectCount[]): ChartData {
  if (!aggregatedData || aggregatedData.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  
  // Extract years as labels
  const labels = aggregatedData.map(item => item.year.toString());
  
  // Create datasets for each project type
  const datasets: ChartDataset[] = [
    {
      label: 'Research',
      data: aggregatedData.map(item => item.research),
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1
    },
    {
      label: 'Extension',
      data: aggregatedData.map(item => item.extension),
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 1
    },
    {
      label: 'Development',
      data: aggregatedData.map(item => item.development),
      backgroundColor: '#f59e0b',
      borderColor: '#d97706',
      borderWidth: 1
    }
  ];
  
  return {
    labels,
    datasets
  };
}

/**
 * Get summary statistics for projects
 * @param aggregatedData - Project counts by year
 * @returns Summary object with totals and year range
 */
export function getProjectsSummary(aggregatedData: ProjectCount[]): {
  totalResearch: number;
  totalExtension: number;
  totalDevelopment: number;
  totalProjects: number;
  yearRange: string;
} {
  if (!aggregatedData || aggregatedData.length === 0) {
    return {
      totalResearch: 0,
      totalExtension: 0,
      totalDevelopment: 0,
      totalProjects: 0,
      yearRange: 'N/A'
    };
  }
  
  const totalResearch = aggregatedData.reduce((sum, item) => sum + item.research, 0);
  const totalExtension = aggregatedData.reduce((sum, item) => sum + item.extension, 0);
  const totalDevelopment = aggregatedData.reduce((sum, item) => sum + item.development, 0);
  
  const minYear = aggregatedData[0].year;
  const maxYear = aggregatedData[aggregatedData.length - 1].year;
  const yearRange = minYear === maxYear ? minYear.toString() : `${minYear} - ${maxYear}`;
  
  return {
    totalResearch,
    totalExtension,
    totalDevelopment,
    totalProjects: totalResearch + totalExtension + totalDevelopment,
    yearRange
  };
}
