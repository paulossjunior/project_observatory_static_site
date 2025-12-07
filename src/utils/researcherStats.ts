import type { PersonData, ArtigoPeriodico, Orientacao, Banca, Project } from './personData';

/**
 * Core statistics for a researcher
 */
export interface ResearcherStats {
  totalPublications: number;
  totalProjects: number;
  totalSupervisions: number;
  activeProjects: number;
  yearsOfExperience: number;
  ongoingSupervisions: number;
  completedSupervisions: number;
  totalCommitteeParticipations: number;
}

/**
 * Publications by year
 */
export interface PublicationsByYear {
  year: number;
  count: number;
  byQualis: Record<string, number>;
}

/**
 * Qualis distribution
 */
export interface QualisDistribution {
  qualis: string;
  count: number;
  percentage: number;
}

/**
 * Supervision statistics by type
 */
export interface SupervisionStats {
  type: string;
  ongoing: number;
  completed: number;
  total: number;
}

/**
 * Committee participation by type
 */
export interface CommitteeStats {
  type: string;
  count: number;
}

/**
 * Collaborator information
 */
export interface Collaborator {
  name: string;
  projectCount: number;
  roles: string[];
}

/**
 * Funding source information
 */
export interface FundingSource {
  agency: string;
  projectCount: number;
  supportTypes: string[];
}

/**
 * Project duration statistics
 */
export interface ProjectDuration {
  projectName: string;
  startYear: number;
  endYear: number | null;
  duration: number | null;
  type: string;
}

/**
 * Annual activity data
 */
export interface AnnualActivity {
  year: number;
  publications: number;
  projects: number;
  supervisions: number;
  committees: number;
  total: number;
}

/**
 * Impact metrics for radar chart
 */
export interface ImpactMetrics {
  research: number;      // Publications score
  teaching: number;      // Supervisions score
  extension: number;     // Extension projects score
  service: number;       // Committee participations score
  collaboration: number; // Collaborators score
  funding: number;       // Funded projects score
}

/**
 * Calculate core statistics for a researcher
 */
export function calculateCoreStats(personData: PersonData): ResearcherStats {
  const currentYear = new Date().getFullYear();
  
  // Count all publications
  const pb = personData.producao_bibliografica;
  const articlesCount = pb?.artigos_periodicos?.length || 0;
  const conferenceCount = pb?.trabalhos_completos_congressos?.length || 0;
  const booksCount = pb?.livros_publicados?.length || 0;
  const chaptersCount = pb?.capitulos_livros?.length || 0;
  const expandedAbstractsCount = pb?.resumos_expandidos?.length || 0;
  const abstractsCount = pb?.resumos_congressos?.length || 0;
  const acceptedArticlesCount = pb?.artigos_aceitos?.length || 0;
  const presentationsCount = pb?.apresentacoes_trabalhos?.length || 0;
  const newspaperCount = pb?.textos_jornais?.length || 0;
  const otherProductionsCount = pb?.outras_producoes?.length || 0;
  
  const totalPublications = articlesCount + conferenceCount + booksCount + chaptersCount + 
                           expandedAbstractsCount + abstractsCount + acceptedArticlesCount + 
                           presentationsCount + newspaperCount + otherProductionsCount;
  
  // Count projects
  const researchProjects = personData.projetos_pesquisa?.length || 0;
  const extensionProjects = personData.projetos_extensao?.length || 0;
  const developmentProjects = personData.projetos_desenvolvimento?.length || 0;
  const totalProjects = researchProjects + extensionProjects + developmentProjects;
  
  // Count active projects
  const allProjects = [
    ...(personData.projetos_pesquisa || []),
    ...(personData.projetos_extensao || []),
    ...(personData.projetos_desenvolvimento || [])
  ];
  const activeProjects = allProjects.filter(p => 
    p.ano_conclusao?.toLowerCase() === 'atual' || 
    parseInt(p.ano_conclusao) >= currentYear
  ).length;
  
  // Count supervisions
  const orientacoes = personData.orientacoes;
  let ongoingSupervisions = 0;
  let completedSupervisions = 0;
  
  if (orientacoes?.em_andamento) {
    Object.values(orientacoes.em_andamento).forEach(arr => {
      if (Array.isArray(arr)) ongoingSupervisions += arr.length;
    });
  }
  
  if (orientacoes?.concluidas) {
    Object.values(orientacoes.concluidas).forEach(arr => {
      if (Array.isArray(arr)) completedSupervisions += arr.length;
    });
  }
  
  const totalSupervisions = ongoingSupervisions + completedSupervisions;
  
  // Count committee participations
  const bancas = personData.bancas;
  let totalCommitteeParticipations = 0;
  if (bancas) {
    Object.values(bancas).forEach(arr => {
      if (Array.isArray(arr)) totalCommitteeParticipations += arr.length;
    });
  }
  
  // Calculate years of experience (from first academic degree)
  let yearsOfExperience = 0;
  if (personData.formacao_academica && personData.formacao_academica.length > 0) {
    const sortedDegrees = [...personData.formacao_academica].sort((a, b) => 
      parseInt(a.ano_inicio) - parseInt(b.ano_inicio)
    );
    const firstYear = parseInt(sortedDegrees[0].ano_inicio);
    if (!isNaN(firstYear)) {
      yearsOfExperience = currentYear - firstYear;
    }
  }
  
  return {
    totalPublications,
    totalProjects,
    totalSupervisions,
    activeProjects,
    yearsOfExperience,
    ongoingSupervisions,
    completedSupervisions,
    totalCommitteeParticipations
  };
}

/**
 * Get publications grouped by year (includes all types of bibliographic production)
 */
export function getPublicationsByYear(personData: PersonData): PublicationsByYear[] {
  const pb = personData.producao_bibliografica;
  const yearMap = new Map<number, { count: number; byQualis: Record<string, number> }>();
  
  // Helper function to process publications
  const processPublications = (items: any[] | undefined, type: string) => {
    if (!items) return;
    items.forEach((item: any) => {
      if (item.ano) {
        const existing = yearMap.get(item.ano) || { count: 0, byQualis: {} };
        existing.count++;
        
        const qualis = item.qualis || type;
        existing.byQualis[qualis] = (existing.byQualis[qualis] || 0) + 1;
        
        yearMap.set(item.ano, existing);
      }
    });
  };
  
  // Process all types of publications
  processPublications(pb?.artigos_periodicos, 'Journal Article');
  processPublications(pb?.trabalhos_completos_congressos, 'Conference Paper');
  processPublications(pb?.livros_publicados, 'Book');
  processPublications(pb?.capitulos_livros, 'Book Chapter');
  processPublications(pb?.resumos_expandidos, 'Extended Abstract');
  processPublications(pb?.resumos_congressos, 'Abstract');
  processPublications(pb?.artigos_aceitos, 'Accepted Article');
  processPublications(pb?.apresentacoes_trabalhos, 'Presentation');
  processPublications(pb?.textos_jornais, 'Newspaper Article');
  processPublications(pb?.outras_producoes, 'Other');
  
  return Array.from(yearMap.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Get publication type distribution (by type and Qualis when available)
 */
export function getQualisDistribution(personData: PersonData): QualisDistribution[] {
  const pb = personData.producao_bibliografica;
  const typeMap = new Map<string, number>();
  
  // Helper function to count publications by type
  const countByType = (items: any[] | undefined, type: string) => {
    if (!items) return;
    items.forEach((item: any) => {
      const key = item.qualis && item.qualis.trim() !== '' ? item.qualis : type;
      typeMap.set(key, (typeMap.get(key) || 0) + 1);
    });
  };
  
  // Count all types
  countByType(pb?.artigos_periodicos, 'Journal Article');
  countByType(pb?.trabalhos_completos_congressos, 'Conference Paper');
  countByType(pb?.livros_publicados, 'Book');
  countByType(pb?.capitulos_livros, 'Book Chapter');
  countByType(pb?.resumos_expandidos, 'Extended Abstract');
  countByType(pb?.resumos_congressos, 'Abstract');
  countByType(pb?.artigos_aceitos, 'Accepted Article');
  countByType(pb?.apresentacoes_trabalhos, 'Presentation');
  countByType(pb?.textos_jornais, 'Newspaper Article');
  countByType(pb?.outras_producoes, 'Other');
  
  const total = Array.from(typeMap.values()).reduce((sum, count) => sum + count, 0);
  
  return Array.from(typeMap.entries())
    .map(([qualis, count]) => ({
      qualis,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get supervision statistics by type
 */
export function getSupervisionStats(personData: PersonData): SupervisionStats[] {
  const orientacoes = personData.orientacoes;
  const stats: SupervisionStats[] = [];
  
  const types = [
    { key: 'doutorado', label: 'PhD' },
    { key: 'mestrado', label: "Master's" },
    { key: 'especializacao', label: 'Specialization' },
    { key: 'tcc', label: 'Undergraduate Thesis' },
    { key: 'iniciacao_cientifica', label: 'Undergraduate Research' },
    { key: 'pos_doutorado', label: 'Post-Doctoral' },
    { key: 'outros', label: 'Other' }
  ];
  
  types.forEach(({ key, label }) => {
    const ongoing = orientacoes?.em_andamento?.[key as keyof typeof orientacoes.em_andamento]?.length || 0;
    const completed = orientacoes?.concluidas?.[key as keyof typeof orientacoes.concluidas]?.length || 0;
    
    if (ongoing > 0 || completed > 0) {
      stats.push({
        type: label,
        ongoing,
        completed,
        total: ongoing + completed
      });
    }
  });
  
  return stats.sort((a, b) => b.total - a.total);
}

/**
 * Get committee participation statistics
 */
export function getCommitteeStats(personData: PersonData): CommitteeStats[] {
  const bancas = personData.bancas;
  const stats: CommitteeStats[] = [];
  
  const types = [
    { key: 'doutorado', label: 'PhD Defense' },
    { key: 'mestrado', label: "Master's Defense" },
    { key: 'qualificacao_doutorado', label: 'PhD Qualification' },
    { key: 'qualificacao_mestrado', label: "Master's Qualification" },
    { key: 'graduacao', label: 'Undergraduate' },
    { key: 'outras', label: 'Other' }
  ];
  
  types.forEach(({ key, label }) => {
    const count = bancas?.[key as keyof typeof bancas]?.length || 0;
    if (count > 0) {
      stats.push({ type: label, count });
    }
  });
  
  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Get collaborators from projects
 */
export function getCollaborators(personData: PersonData): Collaborator[] {
  const allProjects = [
    ...(personData.projetos_pesquisa || []),
    ...(personData.projetos_extensao || []),
    ...(personData.projetos_desenvolvimento || [])
  ];
  
  const collaboratorMap = new Map<string, { count: number; roles: Set<string> }>();
  const researcherName = personData.informacoes_pessoais.nome_completo;
  
  allProjects.forEach(project => {
    project.integrantes?.forEach(integrante => {
      // Skip the researcher themselves
      if (integrante.nome !== researcherName) {
        const existing = collaboratorMap.get(integrante.nome) || { count: 0, roles: new Set() };
        existing.count++;
        existing.roles.add(integrante.papel);
        collaboratorMap.set(integrante.nome, existing);
      }
    });
  });
  
  return Array.from(collaboratorMap.entries())
    .map(([name, data]) => ({
      name,
      projectCount: data.count,
      roles: Array.from(data.roles)
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 10); // Top 10 collaborators
}

/**
 * Get funding sources from projects
 */
export function getFundingSources(personData: PersonData): FundingSource[] {
  const allProjects = [
    ...(personData.projetos_pesquisa || []),
    ...(personData.projetos_extensao || []),
    ...(personData.projetos_desenvolvimento || [])
  ];
  
  const fundingMap = new Map<string, { count: number; types: Set<string> }>();
  
  allProjects.forEach(project => {
    project.financiadores?.forEach(financiador => {
      const existing = fundingMap.get(financiador.nome) || { count: 0, types: new Set() };
      existing.count++;
      existing.types.add(financiador.tipo_apoio);
      fundingMap.set(financiador.nome, existing);
    });
  });
  
  return Array.from(fundingMap.entries())
    .map(([agency, data]) => ({
      agency,
      projectCount: data.count,
      supportTypes: Array.from(data.types)
    }))
    .sort((a, b) => b.projectCount - a.projectCount);
}

/**
 * Get project durations
 */
export function getProjectDurations(personData: PersonData): ProjectDuration[] {
  const allProjects: { project: Project; type: string }[] = [
    ...(personData.projetos_pesquisa || []).map(p => ({ project: p, type: 'Research' })),
    ...(personData.projetos_extensao || []).map(p => ({ project: p, type: 'Extension' })),
    ...(personData.projetos_desenvolvimento || []).map(p => ({ project: p, type: 'Development' }))
  ];
  
  return allProjects.map(({ project, type }) => {
    const startYear = parseInt(project.ano_inicio);
    const endYearStr = project.ano_conclusao?.toLowerCase();
    const endYear = endYearStr === 'atual' ? null : parseInt(project.ano_conclusao);
    
    let duration: number | null = null;
    if (!isNaN(startYear)) {
      if (endYear && !isNaN(endYear)) {
        duration = endYear - startYear;
      } else if (endYearStr === 'atual') {
        duration = new Date().getFullYear() - startYear;
      }
    }
    
    return {
      projectName: project.nome,
      startYear: isNaN(startYear) ? 0 : startYear,
      endYear: (endYear && !isNaN(endYear)) ? endYear : null,
      duration,
      type
    };
  }).filter(p => p.startYear > 0);
}

/**
 * Get annual activity data
 */
export function getAnnualActivity(personData: PersonData): AnnualActivity[] {
  const yearMap = new Map<number, AnnualActivity>();
  
  // Add all publications
  const pb = personData.producao_bibliografica;
  const allPublications = [
    ...(pb?.artigos_periodicos || []),
    ...(pb?.trabalhos_completos_congressos || []),
    ...(pb?.livros_publicados || []),
    ...(pb?.capitulos_livros || []),
    ...(pb?.resumos_expandidos || []),
    ...(pb?.resumos_congressos || []),
    ...(pb?.artigos_aceitos || []),
    ...(pb?.apresentacoes_trabalhos || []),
    ...(pb?.textos_jornais || []),
    ...(pb?.outras_producoes || [])
  ];
  
  allPublications.forEach((pub: any) => {
    if (pub.ano) {
      const existing = yearMap.get(pub.ano) || { 
        year: pub.ano, publications: 0, projects: 0, supervisions: 0, committees: 0, total: 0 
      };
      existing.publications++;
      yearMap.set(pub.ano, existing);
    }
  });
  
  // Add projects
  const allProjects = [
    ...(personData.projetos_pesquisa || []),
    ...(personData.projetos_extensao || []),
    ...(personData.projetos_desenvolvimento || [])
  ];
  allProjects.forEach(project => {
    const year = parseInt(project.ano_inicio);
    if (!isNaN(year)) {
      const existing = yearMap.get(year) || { 
        year, publications: 0, projects: 0, supervisions: 0, committees: 0, total: 0 
      };
      existing.projects++;
      yearMap.set(year, existing);
    }
  });
  
  // Add supervisions
  const allSupervisions: Orientacao[] = [];
  if (personData.orientacoes?.em_andamento) {
    Object.values(personData.orientacoes.em_andamento).forEach(arr => {
      if (Array.isArray(arr)) allSupervisions.push(...arr);
    });
  }
  if (personData.orientacoes?.concluidas) {
    Object.values(personData.orientacoes.concluidas).forEach(arr => {
      if (Array.isArray(arr)) allSupervisions.push(...arr);
    });
  }
  allSupervisions.forEach(supervision => {
    if (supervision.ano_inicio) {
      const existing = yearMap.get(supervision.ano_inicio) || { 
        year: supervision.ano_inicio, publications: 0, projects: 0, supervisions: 0, committees: 0, total: 0 
      };
      existing.supervisions++;
      yearMap.set(supervision.ano_inicio, existing);
    }
  });
  
  // Add committee participations
  const allCommittees: Banca[] = [];
  if (personData.bancas) {
    Object.values(personData.bancas).forEach(arr => {
      if (Array.isArray(arr)) allCommittees.push(...arr);
    });
  }
  allCommittees.forEach(banca => {
    if (banca.ano) {
      const existing = yearMap.get(banca.ano) || { 
        year: banca.ano, publications: 0, projects: 0, supervisions: 0, committees: 0, total: 0 
      };
      existing.committees++;
      yearMap.set(banca.ano, existing);
    }
  });
  
  // Calculate totals
  yearMap.forEach(activity => {
    activity.total = activity.publications + activity.projects + activity.supervisions + activity.committees;
  });
  
  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

/**
 * Calculate impact metrics (normalized to 0-100 scale)
 */
export function calculateImpactMetrics(personData: PersonData): ImpactMetrics {
  const stats = calculateCoreStats(personData);
  const collaborators = getCollaborators(personData);
  const fundingSources = getFundingSources(personData);
  
  // Normalize metrics to 0-100 scale
  // These thresholds can be adjusted based on field norms
  const normalize = (value: number, max: number) => Math.min((value / max) * 100, 100);
  
  return {
    research: normalize(stats.totalPublications, 50),        // 50+ publications = 100
    teaching: normalize(stats.totalSupervisions, 30),        // 30+ supervisions = 100
    extension: normalize(personData.projetos_extensao?.length || 0, 10), // 10+ extension projects = 100
    service: normalize(stats.totalCommitteeParticipations, 50), // 50+ committees = 100
    collaboration: normalize(collaborators.length, 20),      // 20+ collaborators = 100
    funding: normalize(fundingSources.length, 10)            // 10+ funding sources = 100
  };
}
