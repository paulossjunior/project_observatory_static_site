import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// TypeScript interfaces for research line data structures

export interface LinhaPesquisa {
  id?: string;
  nome: string;
  objetivo?: string;
}

export interface PersonReference {
  id: string;
  nome: string;
  role: 'professor' | 'student' | 'collaborator';
}

export interface ProjectReference {
  id: string;
  nome: string;
  tipo: 'pesquisa' | 'extensao' | 'desenvolvimento';
  status: 'em_andamento' | 'concluido';
  ano_inicio: string;
  ano_fim?: string;
  personId: string;
  personName: string;
}

export interface PublicationReference {
  id: string;
  titulo: string;
  tipo: string;
  ano: string;
  autores: string[];
  personId: string;
  personName: string;
}

export interface ResearchLineStats {
  totalPeople: number;
  totalProjects: number;
  totalPublications: number;
  activeProjects: number;
  completedProjects: number;
  recentActivity: string; // ISO date
}

export interface ResearchLineData {
  id: string;
  nome: string;
  objetivo?: string;
  people: PersonReference[];
  projects: ProjectReference[];
  publications: PublicationReference[];
  stats: ResearchLineStats;
}

interface PersonData {
  informacoes_pessoais: {
    nome_completo: string;
    [key: string]: any;
  };
  linhas_de_pesquisa?: LinhaPesquisa[];
  projetos_pesquisa?: any[];
  projetos_extensao?: any[];
  projetos_desenvolvimento?: any[];
  producao_bibliografica?: {
    artigos_periodicos?: any[];
    livros_publicados?: any[];
    capitulos_livros?: any[];
    trabalhos_completos_congressos?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Extract person ID from filename
 * Example: "00_Paulo-Sergio-dos-Santos-Junior_8400407353673370.json" -> "paulo-sergio-dos-santos-junior"
 */
function extractIdFromFilename(filename: string): string {
  const withoutExtension = filename.replace('.json', '');
  const parts = withoutExtension.split('_');
  
  if (parts.length >= 3) {
    const nameParts = parts.slice(1, -1);
    const name = nameParts.join('-');
    return name.toLowerCase();
  }
  
  return withoutExtension.toLowerCase();
}

/**
 * Generate a unique ID for a research line based on its name
 */
function generateResearchLineId(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

/**
 * Determine person role based on their data
 */
function determinePersonRole(personData: PersonData): 'professor' | 'student' | 'collaborator' {
  // Check professional positions for professor/teacher roles
  const positions = personData.atuacao_profissional || [];
  const hasTeachingRole = positions.some((pos: any) => 
    pos.enquadramento?.toLowerCase().includes('professor') ||
    pos.cargo_funcao?.toLowerCase().includes('professor')
  );
  
  if (hasTeachingRole) {
    return 'professor';
  }
  
  // Check if they have completed degrees (likely student or former student)
  const academicDegrees = personData.formacao_academica || [];
  if (academicDegrees.length > 0) {
    return 'student';
  }
  
  return 'collaborator';
}

/**
 * Load all person JSON files from source directory
 */
async function loadAllPeople(): Promise<Map<string, { id: string; data: PersonData }>> {
  const sourceDir = join(process.cwd(), 'source');
  const peopleMap = new Map<string, { id: string; data: PersonData }>();
  
  try {
    const files = await readdir(sourceDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      try {
        const filePath = join(sourceDir, file);
        const content = await readFile(filePath, 'utf-8');
        const data: PersonData = JSON.parse(content);
        
        if (!data.informacoes_pessoais?.nome_completo) {
          console.warn(`Skipping ${file}: missing required field nome_completo`);
          continue;
        }
        
        const id = extractIdFromFilename(file);
        peopleMap.set(id, { id, data });
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading source directory:', error);
  }
  
  return peopleMap;
}

/**
 * Get all research lines from all person JSON files and aggregate relationships
 */
export async function getAllResearchLines(): Promise<Map<string, ResearchLineData>> {
  const peopleMap = await loadAllPeople();
  const researchLinesMap = new Map<string, ResearchLineData>();
  
  // First pass: collect all research lines and their definitions
  for (const [personId, { data: personData }] of peopleMap) {
    const linhasPesquisa = personData.linhas_de_pesquisa || [];
    
    for (const linha of linhasPesquisa) {
      const linhaId = linha.id || generateResearchLineId(linha.nome);
      
      if (!researchLinesMap.has(linhaId)) {
        researchLinesMap.set(linhaId, {
          id: linhaId,
          nome: linha.nome,
          objetivo: linha.objetivo,
          people: [],
          projects: [],
          publications: [],
          stats: {
            totalPeople: 0,
            totalProjects: 0,
            totalPublications: 0,
            activeProjects: 0,
            completedProjects: 0,
            recentActivity: ''
          }
        });
      }
    }
  }
  
  // Second pass: build relationships
  for (const [personId, { data: personData }] of peopleMap) {
    const personName = personData.informacoes_pessoais.nome_completo;
    const personRole = determinePersonRole(personData);
    const linhasPesquisa = personData.linhas_de_pesquisa || [];
    
    // Map person's research lines
    const personResearchLineIds = linhasPesquisa.map(linha => 
      linha.id || generateResearchLineId(linha.nome)
    );
    
    // Add person to their research lines
    for (const linhaId of personResearchLineIds) {
      const researchLine = researchLinesMap.get(linhaId);
      if (researchLine) {
        // Check if person is not already added
        if (!researchLine.people.some(p => p.id === personId)) {
          researchLine.people.push({
            id: personId,
            nome: personName,
            role: personRole
          });
        }
      }
    }
    
    // Process projects
    const allProjects = [
      ...(personData.projetos_pesquisa || []).map((p: any) => ({ ...p, tipo: 'pesquisa' as const })),
      ...(personData.projetos_extensao || []).map((p: any) => ({ ...p, tipo: 'extensao' as const })),
      ...(personData.projetos_desenvolvimento || []).map((p: any) => ({ ...p, tipo: 'desenvolvimento' as const }))
    ];
    
    for (const project of allProjects) {
      const projectLinhas = project.linhas_pesquisa || personResearchLineIds;
      const projectId = generateResearchLineId(project.nome);
      const status = project.ano_conclusao?.toLowerCase() === 'atual' ? 'em_andamento' : 'concluido';
      
      for (const linhaId of projectLinhas) {
        const researchLine = researchLinesMap.get(linhaId);
        if (researchLine) {
          researchLine.projects.push({
            id: projectId,
            nome: project.nome,
            tipo: project.tipo,
            status,
            ano_inicio: project.ano_inicio,
            ano_fim: project.ano_conclusao !== 'Atual' ? project.ano_conclusao : undefined,
            personId,
            personName
          });
        }
      }
    }
    
    // Process publications
    const producao = personData.producao_bibliografica || {};
    const allPublications = [
      ...(producao.artigos_periodicos || []).map((p: any) => ({ ...p, tipo: 'Artigo de Periódico' })),
      ...(producao.livros_publicados || []).map((p: any) => ({ ...p, tipo: 'Livro' })),
      ...(producao.capitulos_livros || []).map((p: any) => ({ ...p, tipo: 'Capítulo de Livro' })),
      ...(producao.trabalhos_completos_congressos || []).map((p: any) => ({ ...p, tipo: 'Trabalho Completo em Congresso' }))
    ];
    
    for (const publication of allPublications) {
      const publicationLinhas = publication.linhas_pesquisa || personResearchLineIds;
      const publicationId = generateResearchLineId(publication.titulo);
      
      for (const linhaId of publicationLinhas) {
        const researchLine = researchLinesMap.get(linhaId);
        if (researchLine) {
          researchLine.publications.push({
            id: publicationId,
            titulo: publication.titulo,
            tipo: publication.tipo,
            ano: publication.ano?.toString() || '',
            autores: publication.autores ? publication.autores.split(';').map((a: string) => a.trim()) : [],
            personId,
            personName
          });
        }
      }
    }
  }
  
  // Third pass: calculate statistics
  for (const [linhaId, researchLine] of researchLinesMap) {
    researchLine.stats.totalPeople = researchLine.people.length;
    researchLine.stats.totalProjects = researchLine.projects.length;
    researchLine.stats.totalPublications = researchLine.publications.length;
    researchLine.stats.activeProjects = researchLine.projects.filter(p => p.status === 'em_andamento').length;
    researchLine.stats.completedProjects = researchLine.projects.filter(p => p.status === 'concluido').length;
    
    // Find most recent activity
    const allDates: string[] = [];
    researchLine.projects.forEach(p => {
      if (p.ano_inicio) allDates.push(p.ano_inicio);
      if (p.ano_fim) allDates.push(p.ano_fim);
    });
    researchLine.publications.forEach(p => {
      if (p.ano) allDates.push(p.ano);
    });
    
    if (allDates.length > 0) {
      const sortedDates = allDates.sort((a, b) => b.localeCompare(a));
      researchLine.stats.recentActivity = `${sortedDates[0]}-01-01`;
    }
  }
  
  return researchLinesMap;
}

/**
 * Get a specific research line by ID with all relationships
 */
export async function getResearchLineById(id: string): Promise<ResearchLineData | null> {
  const allResearchLines = await getAllResearchLines();
  return allResearchLines.get(id) || null;
}

/**
 * Get all research lines for a specific person
 */
export async function getResearchLinesForPerson(personId: string): Promise<LinhaPesquisa[]> {
  const peopleMap = await loadAllPeople();
  const person = peopleMap.get(personId);
  
  if (!person) {
    console.warn(`Person with ID ${personId} not found`);
    return [];
  }
  
  return person.data.linhas_de_pesquisa || [];
}

/**
 * Get all research lines for a specific project
 */
export async function getResearchLinesForProject(projectId: string, personId: string): Promise<LinhaPesquisa[]> {
  const peopleMap = await loadAllPeople();
  const person = peopleMap.get(personId);
  
  if (!person) {
    console.warn(`Person with ID ${personId} not found`);
    return [];
  }
  
  const personData = person.data;
  const allProjects = [
    ...(personData.projetos_pesquisa || []),
    ...(personData.projetos_extensao || []),
    ...(personData.projetos_desenvolvimento || [])
  ];
  
  const project = allProjects.find(p => generateResearchLineId(p.nome) === projectId);
  
  if (!project) {
    console.warn(`Project with ID ${projectId} not found for person ${personId}`);
    return [];
  }
  
  // If project has explicit research line references, use those
  if (project.linhas_pesquisa && Array.isArray(project.linhas_pesquisa)) {
    const personLinhas = personData.linhas_de_pesquisa || [];
    return project.linhas_pesquisa
      .map((linhaId: string) => personLinhas.find(l => (l.id || generateResearchLineId(l.nome)) === linhaId))
      .filter((l: LinhaPesquisa | undefined): l is LinhaPesquisa => l !== undefined);
  }
  
  // Otherwise, return all person's research lines
  return personData.linhas_de_pesquisa || [];
}

/**
 * Get all research lines for a specific publication
 */
export async function getResearchLinesForPublication(publicationId: string, personId: string): Promise<LinhaPesquisa[]> {
  const peopleMap = await loadAllPeople();
  const person = peopleMap.get(personId);
  
  if (!person) {
    console.warn(`Person with ID ${personId} not found`);
    return [];
  }
  
  const personData = person.data;
  const producao = personData.producao_bibliografica || {};
  const allPublications = [
    ...(producao.artigos_periodicos || []),
    ...(producao.livros_publicados || []),
    ...(producao.capitulos_livros || []),
    ...(producao.trabalhos_completos_congressos || [])
  ];
  
  const publication = allPublications.find(p => generateResearchLineId(p.titulo) === publicationId);
  
  if (!publication) {
    console.warn(`Publication with ID ${publicationId} not found for person ${personId}`);
    return [];
  }
  
  // If publication has explicit research line references, use those
  if (publication.linhas_pesquisa && Array.isArray(publication.linhas_pesquisa)) {
    const personLinhas = personData.linhas_de_pesquisa || [];
    return publication.linhas_pesquisa
      .map((linhaId: string) => personLinhas.find(l => (l.id || generateResearchLineId(l.nome)) === linhaId))
      .filter((l: LinhaPesquisa | undefined): l is LinhaPesquisa => l !== undefined);
  }
  
  // Otherwise, return all person's research lines
  return personData.linhas_de_pesquisa || [];
}
