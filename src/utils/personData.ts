import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// TypeScript interfaces for person data
export interface PersonalInfo {
  id_lattes: string;
  nome_completo: string;
  nome_citacoes: string;
  sexo: string;
  endereco_profissional: string;
  atualizacao_cv: string;
  url: string;
  texto_resumo: string;
}

export interface AcademicDegree {
  tipo: string;
  nome_instituicao: string;
  ano_inicio: string;
  ano_conclusao: string;
  descricao: string;
}

export interface ProfessionalPosition {
  instituicao: string;
  instituicao_nome: string;
  instituicao_sigla: string;
  periodo: string | null;
  ano_inicio: string | null;
  ano_fim: string | null;
  vinculo: string | null;
  enquadramento: string | null;
  regime: string | null;
}

export interface ProjectIntegrant {
  nome: string;
  papel: string;
}

export interface ProjectFinancier {
  nome: string;
  tipo_apoio: string;
}

export interface Project {
  nome: string;
  ano_inicio: string;
  ano_conclusao: string;
  descricao: string[];
  tipo: string;
  integrantes: ProjectIntegrant[];
  financiadores?: ProjectFinancier[];
}

export interface AreaAtuacao {
  grande_area: string;
  area: string;
  subarea: string;
  especialidade: string;
  descricao_completa: string;
}

export interface LinhaPesquisa {
  nome: string;
  objetivo: string;
}

export interface ArtigoPeriodico {
  titulo: string;
  ano: number;
  autores: string;
  revista: string;
  volume: string;
  numero: string;
  paginas: string;
  issn: string;
  doi: string;
  qualis: string;
}

export interface ProducaoBibliografica {
  artigos_periodicos: ArtigoPeriodico[];
  livros_publicados: any[];
  capitulos_livros: any[];
  trabalhos_completos_congressos: any[];
  resumos_expandidos: any[];
  resumos_congressos: any[];
  artigos_aceitos: any[];
  apresentacoes_trabalhos: any[];
  textos_jornais: any[];
  outras_producoes: any[];
}

export interface Orientacao {
  titulo: string;
  ano_inicio: number;
  ano_conclusao: number;
  orientando: string;
  tipo_trabalho: string;
  instituicao: string;
  curso: string;
}

export interface OrientacoesData {
  em_andamento?: {
    pos_doutorado?: Orientacao[];
    doutorado?: Orientacao[];
    mestrado?: Orientacao[];
    especializacao?: Orientacao[];
    tcc?: Orientacao[];
    iniciacao_cientifica?: Orientacao[];
    outros?: Orientacao[];
  };
  concluidas?: {
    pos_doutorado?: Orientacao[];
    doutorado?: Orientacao[];
    mestrado?: Orientacao[];
    especializacao?: Orientacao[];
    tcc?: Orientacao[];
    iniciacao_cientifica?: Orientacao[];
    outros?: Orientacao[];
  };
}

export interface Banca {
  descricao: string;
  ano: number;
  tipo: string;
  aluno: string;
  membros_banca: string[];
  titulo_trabalho: string;
  curso: string;
  universidade: string;
}

export interface BancasData {
  mestrado?: Banca[];
  doutorado?: Banca[];
  qualificacao_doutorado?: Banca[];
  qualificacao_mestrado?: Banca[];
  graduacao?: Banca[];
  outras?: Banca[];
}

export interface PersonData {
  informacoes_pessoais: PersonalInfo;
  formacao_academica: AcademicDegree[];
  atuacao_profissional: ProfessionalPosition[];
  projetos_pesquisa: Project[];
  projetos_extensao: Project[];
  projetos_desenvolvimento: Project[];
  areas_de_atuacao?: AreaAtuacao[];
  linhas_de_pesquisa?: LinhaPesquisa[];
  producao_bibliografica?: ProducaoBibliografica;
  orientacoes?: OrientacoesData;
  bancas?: BancasData;
}

export interface PersonSummary {
  id: string;
  data: PersonData;
}

/**
 * Extract person ID from filename
 * Example: "00_Paulo-Sergio-dos-Santos-Junior_8400407353673370.json" -> "paulo-sergio-dos-santos-junior"
 */
export function extractIdFromFilename(filename: string): string {
  // Remove .json extension
  const withoutExtension = filename.replace('.json', '');
  
  // Split by underscore and get the middle part (name)
  const parts = withoutExtension.split('_');
  
  // If we have at least 3 parts (number_name_id), extract the name
  if (parts.length >= 3) {
    // Join all parts except first and last (in case name has underscores)
    const nameParts = parts.slice(1, -1);
    const name = nameParts.join('-');
    return name.toLowerCase();
  }
  
  // Fallback: use the whole filename without extension
  return withoutExtension.toLowerCase();
}

/**
 * Format date range for display
 * @param inicio - Start year
 * @param fim - End year (can be "Atual" for current)
 * @returns Formatted period string
 */
export function formatPeriod(inicio: string, fim: string): string {
  if (!inicio && !fim) {
    return '';
  }
  
  if (!inicio) {
    return fim;
  }
  
  if (!fim) {
    return inicio;
  }
  
  // Handle "Atual" (current) case
  if (fim.toLowerCase() === 'atual') {
    return `${inicio} - Present`;
  }
  
  // If same year, just show once
  if (inicio === fim) {
    return inicio;
  }
  
  return `${inicio} - ${fim}`;
}

/**
 * Load all person JSON files from source directory
 * @returns Array of person data with IDs
 */
export async function getAllPeople(): Promise<PersonSummary[]> {
  const sourceDir = join(process.cwd(), 'source');
  
  try {
    const files = await readdir(sourceDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const people: PersonSummary[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = join(sourceDir, file);
        const content = await readFile(filePath, 'utf-8');
        const data: PersonData = JSON.parse(content);
        
        // Validate required fields
        if (!data.informacoes_pessoais?.nome_completo) {
          console.warn(`Skipping ${file}: missing required field nome_completo`);
          continue;
        }
        
        const id = extractIdFromFilename(file);
        people.push({ id, data });
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
    
    return people;
  } catch (error) {
    console.error('Error reading source directory:', error);
    return [];
  }
}

/**
 * Load a specific person's data by ID
 * @param id - Person ID (extracted from filename)
 * @returns Person data or null if not found
 */
export async function getPersonById(id: string): Promise<PersonData | null> {
  const people = await getAllPeople();
  const person = people.find(p => p.id === id);
  return person ? person.data : null;
}
