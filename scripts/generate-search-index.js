#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Truncates text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 200) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
}

/**
 * Extracts project data (research, extension, development)
 * @param {Array} projects - Array of projects
 * @param {string} type - Project type
 * @param {Object} personData - Person metadata
 * @returns {Array<Object>} Array of search entries
 */
function extractProjects(projects, type, personData) {
  if (!projects || !Array.isArray(projects)) return [];
  
  return projects.map((project, index) => {
    const description = Array.isArray(project.descricao) 
      ? project.descricao.join(' ') 
      : (project.descricao || '');
    
    const integrantes = project.integrantes 
      ? project.integrantes.map(i => i.nome).join(', ')
      : '';
    
    // Generate same ID as in ProjectsSection component
    const projectId = `projeto-${index}-${project.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`;
    
    return {
      title: project.nome || 'Sem título',
      content: truncateText(description),
      type: type,
      category: project.tipo || type,
      personName: personData.personName,
      personId: personData.personId,
      url: `/person/${personData.personSlug}#${projectId}`,
      metadata: {
        year: project.ano_inicio || '',
        yearEnd: project.ano_conclusao || '',
        status: project.ano_conclusao === 'Atual' ? 'Em andamento' : 'Concluído',
        integrantes: integrantes
      }
    };
  });
}

/**
 * Extracts publication data
 * @param {Object} producaoBibliografica - Publication data
 * @param {Object} personData - Person metadata
 * @returns {Array<Object>} Array of search entries
 */
function extractPublications(producaoBibliografica, personData) {
  if (!producaoBibliografica) return [];
  
  const entries = [];
  
  // Articles in journals
  if (producaoBibliografica.artigos_periodicos) {
    producaoBibliografica.artigos_periodicos.forEach((article, index) => {
      const artigoId = `artigo-${index}-${article.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`;
      entries.push({
        title: article.titulo || 'Sem título',
        content: truncateText(`${article.autores || ''} ${article.revista || ''}`),
        type: 'publicacao',
        category: 'Artigo em Periódico',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#${artigoId}`,
        metadata: {
          year: article.ano || '',
          authors: article.autores || '',
          venue: article.revista || '',
          doi: article.doi || ''
        }
      });
    });
  }
  
  // Conference papers
  if (producaoBibliografica.trabalhos_completos_congressos) {
    producaoBibliografica.trabalhos_completos_congressos.forEach(paper => {
      entries.push({
        title: paper.titulo || 'Sem título',
        content: truncateText(`${paper.autores || ''} ${paper.evento || ''}`),
        type: 'publicacao',
        category: 'Trabalho Completo em Congresso',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#publicacoes`,
        metadata: {
          year: paper.ano || '',
          authors: paper.autores || '',
          venue: paper.evento || ''
        }
      });
    });
  }
  
  // Book chapters
  if (producaoBibliografica.capitulos_livros) {
    producaoBibliografica.capitulos_livros.forEach(chapter => {
      entries.push({
        title: chapter.titulo || 'Sem título',
        content: truncateText(`${chapter.autores || ''} ${chapter.livro || ''}`),
        type: 'publicacao',
        category: 'Capítulo de Livro',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#publicacoes`,
        metadata: {
          year: chapter.ano || '',
          authors: chapter.autores || '',
          venue: chapter.livro || ''
        }
      });
    });
  }
  
  return entries;
}

/**
 * Extracts orientation data
 * @param {Object} orientacoes - Orientation data
 * @param {Object} personData - Person metadata
 * @returns {Array<Object>} Array of search entries
 */
function extractOrientations(orientacoes, personData) {
  if (!orientacoes) return [];
  
  const entries = [];
  const types = [
    'mestrado_concluidas',
    'doutorado_concluidas',
    'pos_doutorado_concluidas',
    'graduacao_concluidas',
    'iniciacao_cientifica_concluidas',
    'mestrado_andamento',
    'doutorado_andamento',
    'graduacao_andamento',
    'iniciacao_cientifica_andamento'
  ];
  
  types.forEach(type => {
    if (orientacoes[type] && Array.isArray(orientacoes[type])) {
      orientacoes[type].forEach(orientation => {
        entries.push({
          title: orientation.titulo || 'Sem título',
          content: truncateText(`${orientation.orientando || ''} ${orientation.instituicao || ''}`),
          type: 'orientacao',
          category: type.replace(/_/g, ' '),
          personName: personData.personName,
          personId: personData.personId,
          url: `/person/${personData.personSlug}#orientacoes`,
          metadata: {
            year: orientation.ano || '',
            student: orientation.orientando || '',
            institution: orientation.instituicao || ''
          }
        });
      });
    }
  });
  
  return entries;
}

/**
 * Extracts education and area data
 * @param {Array} formacao - Education data
 * @param {Array} areas - Area data
 * @param {Array} linhas - Research lines
 * @param {Object} personData - Person metadata
 * @returns {Array<Object>} Array of search entries
 */
function extractEducationAndAreas(formacao, areas, linhas, personData) {
  const entries = [];
  
  // Education
  if (formacao && Array.isArray(formacao)) {
    formacao.forEach(edu => {
      entries.push({
        title: `${edu.tipo || ''} - ${edu.nome_instituicao || ''}`,
        content: truncateText(edu.descricao || ''),
        type: 'formacao',
        category: edu.tipo || 'Formação',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#formacao`,
        metadata: {
          year: edu.ano_conclusao || edu.ano_inicio || '',
          institution: edu.nome_instituicao || ''
        }
      });
    });
  }
  
  // Areas of expertise
  if (areas && Array.isArray(areas)) {
    areas.forEach(area => {
      entries.push({
        title: area.area || 'Área de Atuação',
        content: truncateText(`${area.subarea || ''} ${area.especialidade || ''}`),
        type: 'area-atuacao',
        category: 'Área de Atuação',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#areas`,
        metadata: {}
      });
    });
  }
  
  // Research lines
  if (linhas && Array.isArray(linhas)) {
    linhas.forEach(linha => {
      entries.push({
        title: linha.nome || 'Linha de Pesquisa',
        content: truncateText(linha.objetivo || ''),
        type: 'linha-pesquisa',
        category: 'Linha de Pesquisa',
        personName: personData.personName,
        personId: personData.personId,
        url: `/person/${personData.personSlug}#linhas`,
        metadata: {}
      });
    });
  }
  
  return entries;
}

/**
 * Reads all JSON files from the source directory
 * @returns {Array<Object>} Array with data from all curricula
 */
function loadAllSourceFiles() {
  const sourceDir = path.join(__dirname, '..', 'source');
  
  if (!fs.existsSync(sourceDir)) {
    console.error('Error: source/ directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('Error: No JSON files found in source/ directory');
    process.exit(1);
  }

  const allData = [];
  
  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Extract person metadata
      const personInfo = data.informacoes_pessoais || {};
      const personSlug = extractSlugFromFilename(file);
      const personData = {
        personName: personInfo.nome_completo || 'Unknown',
        personId: personInfo.id_lattes || '',
        personSlug: personSlug,
        fileName: file,
        data: data
      };
      
      allData.push(personData);
      console.log(`✓ Loaded ${file}`);
    } catch (error) {
      console.warn(`Warning: Error parsing ${file}: ${error.message}`);
    }
  }
  
  return allData;
}

/**
 * Extract person slug from filename
 * Example: "00_Paulo-Sergio-dos-Santos-Junior_8400407353673370.json" -> "paulo-sergio-dos-santos-junior"
 * @param {string} filename - Filename
 * @returns {string} Person slug
 */
function extractSlugFromFilename(filename) {
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
 * Generates a unique ID for an entry
 * @param {Object} entry - Search entry
 * @returns {string} Unique ID
 */
function generateId(entry) {
  const str = `${entry.personId}-${entry.type}-${entry.title}`;
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
}

/**
 * Generates search index from all persons data
 * @param {Array<Object>} allPersonsData - Data from all curricula
 * @returns {Array<Object>} Array of search index entries
 */
function generateSearchIndex(allPersonsData) {
  const searchIndex = [];
  
  for (const personData of allPersonsData) {
    const data = personData.data;
    
    // Extract projects
    if (data.projetos_pesquisa) {
      const entries = extractProjects(data.projetos_pesquisa, 'projeto-pesquisa', personData);
      searchIndex.push(...entries);
    }
    
    if (data.projetos_extensao) {
      const entries = extractProjects(data.projetos_extensao, 'projeto-extensao', personData);
      searchIndex.push(...entries);
    }
    
    if (data.projetos_desenvolvimento) {
      const entries = extractProjects(data.projetos_desenvolvimento, 'projeto-desenvolvimento', personData);
      searchIndex.push(...entries);
    }
    
    // Extract publications
    if (data.producao_bibliografica) {
      const entries = extractPublications(data.producao_bibliografica, personData);
      searchIndex.push(...entries);
    }
    
    // Extract orientations
    if (data.orientacoes) {
      const entries = extractOrientations(data.orientacoes, personData);
      searchIndex.push(...entries);
    }
    
    // Extract education and areas
    const eduEntries = extractEducationAndAreas(
      data.formacao_academica,
      data.areas_de_atuacao,
      data.linhas_de_pesquisa,
      personData
    );
    searchIndex.push(...eduEntries);
  }
  
  // Add unique IDs to all entries
  searchIndex.forEach(entry => {
    entry.id = generateId(entry);
  });
  
  return searchIndex;
}

console.log('Generating search index...');
const allPersonsData = loadAllSourceFiles();
console.log(`Loaded ${allPersonsData.length} curricula`);

const searchIndex = generateSearchIndex(allPersonsData);
console.log(`Generated ${searchIndex.length} search entries`);

// Write search index to public directory
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'search-index.json');
try {
  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✓ Search index written to ${outputPath}`);
  
  // Calculate and display file size
  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  File size: ${sizeKB} KB`);
  
  if (stats.size > 500 * 1024) {
    console.warn('  Warning: Search index exceeds 500KB target');
  }
} catch (error) {
  console.error(`Error writing search index: ${error.message}`);
  process.exit(1);
}

console.log('✓ Search index generation complete');
process.exit(0);
