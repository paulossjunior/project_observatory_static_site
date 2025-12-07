import { getAllPeople, type PersonData } from './personData';
import { calculateCoreStats } from './researcherStats';

export interface GlobalStats {
  totalResearchers: number;
  totalPublications: number;
  totalProjects: number;
  activeProjects: number;
  totalSupervisions: number;
  ongoingSupervisions: number;
  completedSupervisions: number;
  combinedExperience: number;
  totalCommittees: number;
}

export interface PublicationByYear {
  year: number;
  count: number;
}

export interface PublicationByType {
  type: string;
  count: number;
}

export interface ProjectYearData {
  year: number;
  research: number;
  extension: number;
  development: number;
  total: number;
}

export interface SupervisionTypeData {
  type: string;
  ongoing: number;
  completed: number;
  total: number;
}

export interface ResearcherRanking {
  name: string;
  id: string;
  count: number;
  details?: string;
}

export interface CollaboratorData {
  name: string;
  projectCount: number;
  researchers: string[];
}

export interface FundingData {
  agency: string;
  projectCount: number;
  researchers: number;
}

export interface AreaFrequency {
  area: string;
  count: number;
  researchers: string[];
}

/**
 * Calculate global statistics across all researchers
 */
export async function calculateGlobalStats(): Promise<GlobalStats> {
  try {
    const people = await getAllPeople();
    
    let totalPublications = 0;
    let totalProjects = 0;
    let activeProjects = 0;
    let totalSupervisions = 0;
    let ongoingSupervisions = 0;
    let completedSupervisions = 0;
    let combinedExperience = 0;
    let totalCommittees = 0;
    
    people.forEach(person => {
      try {
        const stats = calculateCoreStats(person.data);
        totalPublications += stats.totalPublications;
        totalProjects += stats.totalProjects;
        activeProjects += stats.activeProjects;
        totalSupervisions += stats.totalSupervisions;
        ongoingSupervisions += stats.ongoingSupervisions;
        completedSupervisions += stats.completedSupervisions;
        combinedExperience += stats.yearsOfExperience;
        totalCommittees += stats.totalCommitteeParticipations;
      } catch (error) {
        console.warn(`Error calculating stats for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
      }
    });
    
    return {
      totalResearchers: people.length,
      totalPublications,
      totalProjects,
      activeProjects,
      totalSupervisions,
      ongoingSupervisions,
      completedSupervisions,
      combinedExperience,
      totalCommittees
    };
  } catch (error) {
    console.error('Error calculating global stats:', error);
    return {
      totalResearchers: 0,
      totalPublications: 0,
      totalProjects: 0,
      activeProjects: 0,
      totalSupervisions: 0,
      ongoingSupervisions: 0,
      completedSupervisions: 0,
      combinedExperience: 0,
      totalCommittees: 0
    };
  }
}

/**
 * Get global publications by year
 */
export async function getGlobalPublicationsByYear(): Promise<PublicationByYear[]> {
  const people = await getAllPeople();
  const yearMap = new Map<number, number>();
  
  people.forEach(person => {
    const pb = person.data.producao_bibliografica;
    const allPubs = [
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
    
    allPubs.forEach((pub: any) => {
      if (pub.ano) {
        yearMap.set(pub.ano, (yearMap.get(pub.ano) || 0) + 1);
      }
    });
  });
  
  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Get global publications by type
 */
export async function getGlobalPublicationsByType(): Promise<PublicationByType[]> {
  const people = await getAllPeople();
  const typeMap = new Map<string, number>();
  
  people.forEach(person => {
    const pb = person.data.producao_bibliografica;
    
    const addType = (items: any[] | undefined, type: string) => {
      if (items && items.length > 0) {
        typeMap.set(type, (typeMap.get(type) || 0) + items.length);
      }
    };
    
    addType(pb?.artigos_periodicos, 'Journal Articles');
    addType(pb?.trabalhos_completos_congressos, 'Conference Papers');
    addType(pb?.livros_publicados, 'Books');
    addType(pb?.capitulos_livros, 'Book Chapters');
    addType(pb?.resumos_expandidos, 'Extended Abstracts');
    addType(pb?.resumos_congressos, 'Abstracts');
    addType(pb?.artigos_aceitos, 'Accepted Articles');
    addType(pb?.apresentacoes_trabalhos, 'Presentations');
    addType(pb?.textos_jornais, 'Newspaper Articles');
    addType(pb?.outras_producoes, 'Other Productions');
  });
  
  return Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get global projects by year
 */
export async function getGlobalProjectsByYear(): Promise<ProjectYearData[]> {
  const people = await getAllPeople();
  const yearMap = new Map<number, ProjectYearData>();
  
  people.forEach(person => {
    const allProjects = [
      ...(person.data.projetos_pesquisa || []).map(p => ({ ...p, type: 'research' })),
      ...(person.data.projetos_extensao || []).map(p => ({ ...p, type: 'extension' })),
      ...(person.data.projetos_desenvolvimento || []).map(p => ({ ...p, type: 'development' }))
    ];
    
    allProjects.forEach(project => {
      const year = parseInt(project.ano_inicio);
      if (!isNaN(year)) {
        const data = yearMap.get(year) || { year, research: 0, extension: 0, development: 0, total: 0 };
        if (project.type === 'research') data.research++;
        else if (project.type === 'extension') data.extension++;
        else if (project.type === 'development') data.development++;
        data.total++;
        yearMap.set(year, data);
      }
    });
  });
  
  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

/**
 * Get global supervisions by type
 */
export async function getGlobalSupervisionsByType(): Promise<SupervisionTypeData[]> {
  const people = await getAllPeople();
  const typeMap = new Map<string, { ongoing: number; completed: number }>();
  
  const types = {
    doutorado: 'PhD',
    mestrado: "Master's",
    especializacao: 'Specialization',
    tcc: 'Undergraduate',
    iniciacao_cientifica: 'Undergraduate Research',
    pos_doutorado: 'Post-Doctoral',
    outros: 'Other'
  };
  
  people.forEach(person => {
    Object.entries(types).forEach(([key, label]) => {
      const ongoing = person.data.orientacoes?.em_andamento?.[key as keyof typeof person.data.orientacoes.em_andamento]?.length || 0;
      const completed = person.data.orientacoes?.concluidas?.[key as keyof typeof person.data.orientacoes.concluidas]?.length || 0;
      
      if (ongoing > 0 || completed > 0) {
        const existing = typeMap.get(label) || { ongoing: 0, completed: 0 };
        existing.ongoing += ongoing;
        existing.completed += completed;
        typeMap.set(label, existing);
      }
    });
  });
  
  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      ongoing: data.ongoing,
      completed: data.completed,
      total: data.ongoing + data.completed
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Get top publishers
 */
export async function getTopPublishers(limit: number = 5): Promise<ResearcherRanking[]> {
  const people = await getAllPeople();
  
  return people
    .map(person => {
      const stats = calculateCoreStats(person.data);
      return {
        name: person.data.informacoes_pessoais.nome_completo,
        id: person.id,
        count: stats.totalPublications,
        details: `${stats.totalPublications} publications`
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top supervisors
 */
export async function getTopSupervisors(limit: number = 5): Promise<ResearcherRanking[]> {
  const people = await getAllPeople();
  
  return people
    .map(person => {
      const stats = calculateCoreStats(person.data);
      return {
        name: person.data.informacoes_pessoais.nome_completo,
        id: person.id,
        count: stats.totalSupervisions,
        details: `${stats.ongoingSupervisions} ongoing, ${stats.completedSupervisions} completed`
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top project leaders
 */
export async function getTopProjectLeaders(limit: number = 5): Promise<ResearcherRanking[]> {
  const people = await getAllPeople();
  
  return people
    .map(person => {
      const stats = calculateCoreStats(person.data);
      return {
        name: person.data.informacoes_pessoais.nome_completo,
        id: person.id,
        count: stats.totalProjects,
        details: `${stats.activeProjects} active, ${stats.totalProjects} total`
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get global funding sources
 */
export async function getGlobalFundingSources(): Promise<FundingData[]> {
  const people = await getAllPeople();
  const fundingMap = new Map<string, Set<string>>();
  
  people.forEach(person => {
    const allProjects = [
      ...(person.data.projetos_pesquisa || []),
      ...(person.data.projetos_extensao || []),
      ...(person.data.projetos_desenvolvimento || [])
    ];
    
    allProjects.forEach(project => {
      project.financiadores?.forEach(financiador => {
        const researchers = fundingMap.get(financiador.nome) || new Set();
        researchers.add(person.data.informacoes_pessoais.nome_completo);
        fundingMap.set(financiador.nome, researchers);
      });
    });
  });
  
  return Array.from(fundingMap.entries())
    .map(([agency, researchers]) => ({
      agency,
      projectCount: researchers.size,
      researchers: researchers.size
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 10);
}

/**
 * Get research areas frequency
 */
export async function getResearchAreas(): Promise<AreaFrequency[]> {
  try {
    const people = await getAllPeople();
    const areaMap = new Map<string, Set<string>>();
    
    people.forEach(person => {
      try {
        person.data.areas_de_atuacao?.forEach(area => {
          if (area.grande_area) {
            const researchers = areaMap.get(area.grande_area) || new Set();
            researchers.add(person.data.informacoes_pessoais.nome_completo);
            areaMap.set(area.grande_area, researchers);
          }
        });
        
        person.data.linhas_de_pesquisa?.forEach(linha => {
          if (linha.nome) {
            const researchers = areaMap.get(linha.nome) || new Set();
            researchers.add(person.data.informacoes_pessoais.nome_completo);
            areaMap.set(linha.nome, researchers);
          }
        });
      } catch (error) {
        console.warn(`Error processing research areas for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
      }
    });
    
    return Array.from(areaMap.entries())
      .map(([area, researchers]) => ({
        area,
        count: researchers.size,
        researchers: Array.from(researchers)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  } catch (error) {
    console.error('Error getting research areas:', error);
    return [];
  }
}

/**
 * Get global committee participations by type
 */
export async function getGlobalCommitteesByType(): Promise<SupervisionTypeData[]> {
  try {
    const people = await getAllPeople();
    const typeMap = new Map<string, number>();
    
    const types = {
      doutorado: 'PhD Defense',
      mestrado: "Master's Defense",
      qualificacao_doutorado: 'PhD Qualification',
      qualificacao_mestrado: "Master's Qualification",
      graduacao: 'Undergraduate',
      outras: 'Other'
    };
    
    people.forEach(person => {
      try {
        Object.entries(types).forEach(([key, label]) => {
          const count = person.data.bancas?.[key as keyof typeof person.data.bancas]?.length || 0;
          if (count > 0) {
            typeMap.set(label, (typeMap.get(label) || 0) + count);
          }
        });
      } catch (error) {
        console.warn(`Error processing committees for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
      }
    });
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type,
        ongoing: 0,
        completed: count,
        total: count
      }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Error getting committees by type:', error);
    return [];
  }
}

/**
 * Get researchers categorized by highest academic degree
 */
export async function getResearchersByDegree(): Promise<Array<{ degree: string; count: number; percentage: number }>> {
  try {
    const people = await getAllPeople();
    const degreeMap = new Map<string, number>();
    
    const degreeOrder = ['Doutorado', 'Mestrado', 'Especialização', 'Graduação'];
    
    people.forEach(person => {
      try {
        const degrees = person.data.formacao_academica || [];
        
        // Find highest degree
        let highestDegree = 'Undergraduate';
        for (const degreeType of degreeOrder) {
          if (degrees.some(d => d.tipo?.includes(degreeType))) {
            if (degreeType === 'Doutorado') highestDegree = 'PhD';
            else if (degreeType === 'Mestrado') highestDegree = "Master's";
            else if (degreeType === 'Especialização') highestDegree = 'Specialization';
            else highestDegree = 'Undergraduate';
            break;
          }
        }
        
        degreeMap.set(highestDegree, (degreeMap.get(highestDegree) || 0) + 1);
      } catch (error) {
        console.warn(`Error processing degree for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
      }
    });
    
    const total = people.length;
    
    return Array.from(degreeMap.entries())
      .map(([degree, count]) => ({
        degree,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting researchers by degree:', error);
    return [];
  }
}

/**
 * Get most collaborative researchers (by unique collaborators)
 */
export async function getTopCollaborators(limit: number = 5): Promise<ResearcherRanking[]> {
  try {
    const people = await getAllPeople();
    
    return people
      .map(person => {
        try {
          const allProjects = [
            ...(person.data.projetos_pesquisa || []),
            ...(person.data.projetos_extensao || []),
            ...(person.data.projetos_desenvolvimento || [])
          ];
          
          const collaborators = new Set<string>();
          const researcherName = person.data.informacoes_pessoais.nome_completo;
          
          allProjects.forEach(project => {
            project.integrantes?.forEach(integrante => {
              if (integrante.nome !== researcherName) {
                collaborators.add(integrante.nome);
              }
            });
          });
          
          return {
            name: researcherName,
            id: person.id,
            count: collaborators.size,
            details: `${collaborators.size} unique collaborators`
          };
        } catch (error) {
          console.warn(`Error calculating collaborators for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
          return {
            name: person.data.informacoes_pessoais?.nome_completo || person.id,
            id: person.id,
            count: 0,
            details: '0 collaborators'
          };
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top collaborators:', error);
    return [];
  }
}

/**
 * Get most funded researchers (by number of funded projects)
 */
export async function getTopFundedResearchers(limit: number = 5): Promise<ResearcherRanking[]> {
  try {
    const people = await getAllPeople();
    
    return people
      .map(person => {
        try {
          const allProjects = [
            ...(person.data.projetos_pesquisa || []),
            ...(person.data.projetos_extensao || []),
            ...(person.data.projetos_desenvolvimento || [])
          ];
          
          const fundedProjects = allProjects.filter(p => p.financiadores && p.financiadores.length > 0);
          const fundingSources = new Set(fundedProjects.flatMap(p => p.financiadores?.map(f => f.nome) || []));
          
          return {
            name: person.data.informacoes_pessoais.nome_completo,
            id: person.id,
            count: fundedProjects.length,
            details: `${fundedProjects.length} funded projects, ${fundingSources.size} sources`
          };
        } catch (error) {
          console.warn(`Error calculating funding for ${person.data.informacoes_pessoais?.nome_completo || person.id}:`, error);
          return {
            name: person.data.informacoes_pessoais?.nome_completo || person.id,
            id: person.id,
            count: 0,
            details: '0 funded projects'
          };
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top funded researchers:', error);
    return [];
  }
}
