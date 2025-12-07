# Design Document - Site Search

## Overview

A funcionalidade de busca será implementada como uma solução client-side usando JavaScript vanilla, aproveitando a arquitetura estática do Astro. A busca será realizada em um índice JSON pré-construído durante o build time, garantindo performance e eliminando a necessidade de backend. A interface será integrada ao layout existente do site com design responsivo e acessível.

O sistema indexará todos os arquivos JSON encontrados na pasta `source/`, permitindo busca unificada através de múltiplos currículos acadêmicos. Cada resultado de busca incluirá informação sobre qual pessoa está associada ao conteúdo encontrado.

**Decisões de Design Chave:**

1. **Client-side Search**: Escolhemos busca client-side para aproveitar a natureza estática do Astro, eliminando necessidade de backend e garantindo resposta rápida (< 500ms conforme Req 1.4).

2. **Fuse.js para Fuzzy Matching**: Biblioteca leve e eficiente que suporta busca fuzzy com até 2 caracteres de erro (Req 4.1), case-insensitive (Req 4.5), e scoring de relevância (Req 2.3).

3. **Build-time Index Generation**: Gerar índice durante build garante que o conteúdo esteja sempre sincronizado com os dados JSON e otimiza performance em runtime.

4. **Lazy Loading**: Carregar search-index.json apenas quando necessário reduz tempo de carregamento inicial da página (Req 1.4).

5. **Mobile-First UI**: Interface adaptativa que expande para fullscreen em mobile garante usabilidade em todos os dispositivos (Req 5.1-5.5).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Build Time                            │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │ person.json  │────────▶│ Search Index    │          │
│  │ (source)     │         │ Generator       │          │
│  └──────────────┘         └────────┬────────┘          │
│                                    │                     │
│                                    ▼                     │
│                           ┌─────────────────┐           │
│                           │ search-index.json│           │
│                           └─────────────────┘           │
└─────────────────────────────────────────────────────────┘
                                    │
                                    │ deployed
                                    ▼
┌─────────────────────────────────────────────────────────┐
│                    Runtime (Browser)                     │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │ Search UI    │◀───────▶│ Search Engine   │          │
│  │ Component    │         │ (Fuse.js)       │          │
│  └──────────────┘         └────────┬────────┘          │
│                                    │                     │
│                                    ▼                     │
│                           ┌─────────────────┐           │
│                           │ search-index.json│           │
│                           │ (loaded)        │           │
│                           └─────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Search Library**: Fuse.js - biblioteca JavaScript leve para busca fuzzy
- **UI Framework**: Astro components com JavaScript vanilla
- **Styling**: CSS inline/scoped seguindo o padrão existente do site
- **Build Process**: Script Node.js para gerar índice de busca

## Components and Interfaces

### 1. Search Index Generator (Build Time)

**Responsabilidade**: Processar todos os arquivos JSON da pasta source e gerar um índice de busca otimizado consolidado

**Localização**: `scripts/generate-search-index.js`

**Interface**:
```javascript
/**
 * Lê todos os arquivos JSON da pasta source
 * @returns {Array<Object>} - Array com dados de todos os currículos
 */
function loadAllSourceFiles()

/**
 * Gera índice de busca a partir dos dados de múltiplos currículos
 * @param {Array<Object>} allPersonsData - Dados de todos os arquivos JSON
 * @returns {Array<SearchIndexEntry>} - Array de entradas indexadas
 */
function generateSearchIndex(allPersonsData)

/**
 * Estrutura de uma entrada no índice
 * @typedef {Object} SearchIndexEntry
 * @property {string} id - Identificador único
 * @property {string} title - Título do item
 * @property {string} content - Conteúdo textual para busca
 * @property {string} type - Tipo de conteúdo (projeto, publicação, etc)
 * @property {string} category - Categoria específica
 * @property {string} personName - Nome da pessoa associada ao conteúdo
 * @property {string} personId - ID Lattes da pessoa
 * @property {string} url - URL completa para a página da pessoa
 * @property {Object} metadata - Metadados adicionais (ano, autores, etc)
 */
```

**Conteúdo Indexado** (de todos os arquivos JSON em source/):
- Informações pessoais (nome, áreas de atuação)
- Projetos de pesquisa (nome, descrição, integrantes)
- Projetos de extensão (nome, descrição, integrantes)
- Projetos de desenvolvimento (nome, descrição, integrantes)
- Publicações (título, autores, revista/evento)
- Orientações (título, orientando, instituição)
- Formação acadêmica (tipo, instituição, descrição)
- Áreas de atuação (área, subárea, especialidade)
- Linhas de pesquisa (nome, objetivo)

### 2. Search Component (Astro)

**Responsabilidade**: Interface de usuário para entrada de busca

**Localização**: `src/components/Search.astro`

**Interface**:
```astro
---
// Props (nenhuma necessária)
---
<div class="search-container">
  <input type="search" id="search-input" placeholder="Buscar..." />
  <div id="search-results" class="search-results"></div>
</div>
```

**Comportamento**:
- Campo de busca sempre visível no topo da página
- Debounce de 300ms para evitar buscas excessivas
- Exibição de resultados em dropdown/overlay
- Responsivo para mobile e desktop

### 3. Search Engine (Client-side)

**Responsabilidade**: Executar buscas no índice carregado

**Localização**: `src/scripts/search-engine.js`

**Interface**:
```javascript
class SearchEngine {
  /**
   * Inicializa o motor de busca
   * @param {Array<SearchIndexEntry>} index - Índice de busca
   */
  constructor(index)
  
  /**
   * Executa busca
   * @param {string} query - Termo de busca
   * @param {Object} options - Opções de filtro
   * @returns {Array<SearchResult>} - Resultados ordenados por relevância
   */
  search(query, options = {})
  
  /**
   * Aplica filtros aos resultados
   * @param {Array<SearchResult>} results - Resultados da busca
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array<SearchResult>} - Resultados filtrados
   */
  applyFilters(results, filters)
}
```

**Configuração Fuse.js**:
```javascript
{
  keys: ['title', 'content', 'metadata.autores', 'personName'],
  threshold: 0.4, // Tolerância para fuzzy matching (~2 caracteres de erro - Req 4.1)
  distance: 100,
  minMatchCharLength: 2, // Mínimo 2 caracteres (Req 1.2)
  includeScore: true, // Para ordenação por relevância (Req 2.3)
  includeMatches: true, // Para highlighting (Req 2.2)
  ignoreLocation: true, // Buscar em qualquer posição do texto
  useExtendedSearch: false,
  isCaseSensitive: false // Case-insensitive (Req 4.5)
}
```

**Rationale**: Esta configuração balanceia precisão e flexibilidade. O threshold de 0.4 permite erros de digitação sem retornar resultados irrelevantes. includeMatches permite destacar termos encontrados (Req 2.2), e includeScore permite ordenação por relevância (Req 2.3).

### 4. Search UI Controller

**Responsabilidade**: Gerenciar interações do usuário e atualizar UI

**Localização**: `src/scripts/search-ui.js`

**Interface**:
```javascript
class SearchUI {
  /**
   * Inicializa a UI de busca
   * @param {SearchEngine} searchEngine - Instância do motor de busca
   */
  constructor(searchEngine)
  
  /**
   * Renderiza resultados na UI
   * @param {Array<SearchResult>} results - Resultados a exibir
   */
  renderResults(results)
  
  /**
   * Destaca termos de busca nos resultados
   * @param {string} text - Texto original
   * @param {Array} matches - Posições de correspondência
   * @returns {string} - HTML com termos destacados
   */
  highlightMatches(text, matches)
  
  /**
   * Atualiza filtros ativos
   * @param {Object} filters - Filtros selecionados
   */
  updateFilters(filters)
}
```

## Data Models

### Search Index Entry

```typescript
interface SearchIndexEntry {
  id: string;                    // UUID ou hash único
  title: string;                 // Título principal
  content: string;               // Texto completo para busca
  type: ContentType;             // Tipo de conteúdo
  category: string;              // Categoria específica
  personName: string;            // Nome da pessoa associada
  personId: string;              // ID Lattes da pessoa
  url: string;                   // URL completa (/person/[id]#section)
  metadata: {
    year?: string;               // Ano (para projetos/publicações)
    authors?: string;            // Autores (para publicações)
    institution?: string;        // Instituição
    status?: string;             // Status (em andamento/concluído)
    [key: string]: any;          // Outros metadados
  };
}

enum ContentType {
  PROJECT_RESEARCH = 'projeto-pesquisa',
  PROJECT_EXTENSION = 'projeto-extensao',
  PROJECT_DEVELOPMENT = 'projeto-desenvolvimento',
  PUBLICATION = 'publicacao',
  ORIENTATION = 'orientacao',
  EDUCATION = 'formacao',
  AREA = 'area-atuacao',
  RESEARCH_LINE = 'linha-pesquisa'
}
```

### Search Result

```typescript
interface SearchResult {
  item: SearchIndexEntry;        // Entrada do índice
  score: number;                 // Score de relevância (0-1)
  matches: Array<{               // Correspondências encontradas
    key: string;                 // Campo onde foi encontrado
    indices: Array<[number, number]>; // Posições de início/fim
    value: string;               // Valor do campo
  }>;
}
```

### Filter Options

```typescript
interface FilterOptions {
  types?: ContentType[];         // Filtrar por tipos de conteúdo (Req 3.1, 3.2)
  yearRange?: {                  // Filtrar por período
    start?: number;
    end?: number;
  };
  status?: string[];             // Filtrar por status
}
```

**Rationale**: Filtros permitem que usuários refinem resultados por categoria (Req 3.1-3.5). A lógica AND para múltiplos filtros (Req 3.3) garante resultados mais precisos. Contadores visuais por tipo (Req 3.5) ajudam usuários a entender a distribuição de conteúdo.

## Error Handling

### Build Time Errors

1. **Pasta source não encontrada**
   - Ação: Falhar o build com mensagem clara
   - Log: "Error: source/ directory not found"

2. **Nenhum arquivo JSON encontrado em source/**
   - Ação: Falhar o build
   - Log: "Error: No JSON files found in source/ directory"

3. **JSON inválido em arquivo específico**
   - Ação: Log warning e continuar com outros arquivos
   - Log: "Warning: Error parsing [filename]: [detalhes]"

4. **Falha ao escrever search-index.json**
   - Ação: Falhar o build
   - Log: "Error writing search index: [detalhes]"

### Runtime Errors

1. **Falha ao carregar search-index.json**
   - Ação: Exibir mensagem de erro na UI
   - Fallback: Desabilitar busca gracefully
   - Mensagem: "Busca temporariamente indisponível"

2. **Query muito curta (< 2 caracteres)**
   - Ação: Não executar busca
   - Feedback: Mensagem sutil "Digite ao menos 2 caracteres"
   - Rationale: Evita buscas muito amplas e melhora performance (Req 1.2)

3. **Nenhum resultado encontrado**
   - Ação: Exibir mensagem amigável com sugestões
   - Mensagem: "Nenhum resultado encontrado para '[query]'. Tente outros termos."
   - Sugestões: Oferecer termos alternativos baseados em fuzzy matching (Req 4.4)
   - Rationale: Ajuda usuários a reformular buscas e encontrar conteúdo relevante (Req 1.5)

4. **Erro durante busca**
   - Ação: Log no console, exibir mensagem genérica
   - Mensagem: "Erro ao realizar busca. Tente novamente."

## Testing Strategy

### Unit Tests

1. **Search Index Generator**
   - Teste: Geração correta de entradas para cada tipo de conteúdo
   - Teste: Tratamento de campos opcionais/ausentes
   - Teste: Geração de IDs únicos
   - Teste: Sanitização de conteúdo HTML

2. **Search Engine**
   - Teste: Busca exata retorna resultados corretos
   - Teste: Busca fuzzy com erros de digitação
   - Teste: Ordenação por relevância
   - Teste: Aplicação de filtros

3. **Search UI**
   - Teste: Highlighting de termos de busca
   - Teste: Renderização de diferentes tipos de resultado
   - Teste: Atualização de contadores de filtros

### Integration Tests

1. **Build Process**
   - Teste: Execução completa do script de geração
   - Teste: Arquivo search-index.json criado corretamente
   - Teste: Integração com build do Astro

2. **End-to-End**
   - Teste: Busca funciona após deploy
   - Teste: Navegação para resultados funciona
   - Teste: Filtros funcionam corretamente
   - Teste: Responsividade em diferentes tamanhos de tela

### Manual Testing

1. **Usabilidade**
   - Teste: Interface intuitiva e fácil de usar
   - Teste: Feedback visual adequado
   - Teste: Performance em dispositivos móveis

2. **Acessibilidade**
   - Teste: Navegação por teclado
   - Teste: Compatibilidade com screen readers
   - Teste: Contraste de cores adequado

3. **Performance**
   - Teste: Tempo de resposta < 500ms
   - Teste: Tamanho do search-index.json aceitável (< 500KB)
   - Teste: Sem travamentos durante digitação

## Fuzzy Search and Suggestions

### Fuzzy Matching Implementation

O sistema implementa busca fuzzy para tolerar erros de digitação (Req 4.1-4.5):

1. **Tolerância a Erros**
   - Aceita até 2 caracteres de diferença (threshold 0.4 no Fuse.js)
   - Exemplos: "publicaçao" encontra "publicação", "pesquiza" encontra "pesquisa"
   - Rationale: Usuários frequentemente cometem erros de digitação; fuzzy matching melhora taxa de sucesso (Req 4.1)

2. **Case-Insensitive**
   - Busca não diferencia maiúsculas de minúsculas (Req 4.5)
   - "PROJETO" = "projeto" = "Projeto"
   - Rationale: Simplifica busca para usuários, eliminando preocupação com capitalização

3. **Priorização de Resultados**
   - Correspondências exatas aparecem primeiro (Req 4.3)
   - Correspondências fuzzy aparecem depois, ordenadas por score
   - Indicador visual sutil para sugestões fuzzy (Req 4.2)
   - Rationale: Usuários veem primeiro o que procuram exatamente, mas ainda têm acesso a sugestões

4. **Sugestões de Termos Alternativos**
   - Quando nenhum resultado exato é encontrado, sistema sugere termos similares (Req 4.4)
   - Baseado em termos existentes no índice com alta similaridade
   - Exemplo: "Buscar por 'desenvolvimento' em vez de 'desenvovimento'?"
   - Rationale: Ajuda usuários a reformular buscas e encontrar conteúdo relevante

## UI/UX Design

### Search Input

```
┌─────────────────────────────────────────────────┐
│  🔍  Buscar projetos, publicações...            │
└─────────────────────────────────────────────────┘
```

- Posição: Fixo no topo, abaixo do header (Req 1.1)
- Estilo: Consistente com design existente
- Ícone: Lupa (🔍) à esquerda
- Placeholder: Texto descritivo indicando tipos de conteúdo pesquisáveis
- Foco: Borda destacada, sem outline padrão
- Mínimo: 2 caracteres para iniciar busca (Req 1.2)
- Debounce: 300ms após última tecla (otimização de performance)

**Rationale**: Campo sempre visível (Req 1.1) facilita acesso rápido à busca. Debounce reduz número de buscas durante digitação, melhorando performance.

### Search Results Dropdown

```
┌─────────────────────────────────────────────────┐
│  Filtros: [Todos] [Pesquisa (12)] [Pub (8)] ...│
├─────────────────────────────────────────────────┤
│  📊 Projeto de Pesquisa                         │
│  Laboratório de Educação em Desenvolvimento...  │
│  ...ambiente que simula o dia-a-dia...          │
│  Paulo Sergio dos Santos Junior • 2013 - Atual  │
├─────────────────────────────────────────────────┤
│  📄 Publicação                                  │
│  From Continuous Software Engineering...        │
│  Paulo Sergio dos Santos Junior, et al.         │
│  2023                                           │
├─────────────────────────────────────────────────┤
│  Mostrando 15 de 42 resultados                  │
└─────────────────────────────────────────────────┘
```

- Posição: Dropdown abaixo do input
- Max-height: 70vh com scroll
- Ordenação: Por relevância (Req 2.3), exatas primeiro (Req 4.3)
- Cada resultado mostra: título, tipo, trecho relevante, pessoa associada (Req 2.1)
- Highlighting: Termos de busca em negrito/cor (Req 2.2)
- Hover: Background sutil
- Click: Navega para seção correspondente (Req 2.4)
- Limite: Máximo 50 resultados (Req 2.5)
- Filtros: Mostram contadores por tipo (Req 3.5)
- Mobile: Fullscreen overlay (Req 5.3)
- Tempo de resposta: < 500ms (Req 1.4)

**Rationale**: Layout otimizado para escaneabilidade rápida. Highlighting visual (Req 2.2) permite identificar rapidamente relevância. Informação da pessoa associada ajuda contexto. Fullscreen em mobile maximiza espaço para resultados (Req 5.3).

### Empty State

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              🔍                                 │
│                                                 │
│     Nenhum resultado encontrado                 │
│                                                 │
│     Tente outros termos de busca ou             │
│     remova alguns filtros                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────────────────────┐
│              ⏳ Buscando...                     │
└─────────────────────────────────────────────────┘
```

## Performance Considerations

1. **Index Size Optimization**
   - Limitar conteúdo indexado a ~200 caracteres por entrada
   - Remover stopwords comuns em português se necessário
   - Comprimir JSON no build (gzip)
   - Target: < 500KB para search-index.json
   - Rationale: Índice menor = carregamento mais rápido, contribuindo para meta de < 500ms (Req 1.4)

2. **Search Debouncing**
   - Delay de 300ms após última tecla
   - Cancelar buscas anteriores pendentes
   - Rationale: Reduz número de buscas durante digitação, melhorando performance e atingindo meta de < 500ms (Req 1.4)

3. **Lazy Loading**
   - Carregar search-index.json apenas quando campo é focado pela primeira vez
   - Cachear índice após primeiro carregamento
   - Rationale: Reduz tempo de carregamento inicial da página, carregando busca apenas quando necessário

4. **Result Pagination**
   - Exibir inicialmente 10 resultados
   - "Carregar mais" para próximos 10
   - Máximo de 50 resultados totais (Req 2.5)
   - Rationale: Limitar resultados melhora performance de renderização e usabilidade

5. **Mobile Optimization**
   - Reduzir tamanho de preview de resultados
   - Simplificar filtros em telas pequenas
   - Touch-friendly targets (min 44x44px) (Req 5.4)
   - Fullscreen overlay em mobile (Req 5.3)
   - Ajustar visualização quando teclado virtual aparece (Req 5.5)
   - Rationale: Garante usabilidade em dispositivos móveis (Req 5.1-5.5)

## Accessibility

Todas as funcionalidades de acessibilidade atendem aos requisitos de navegação por teclado e compatibilidade com tecnologias assistivas.

1. **Keyboard Navigation**
   - Tab: Navegar entre input e resultados
   - Arrow keys: Navegar entre resultados
   - Enter: Selecionar resultado
   - Escape: Fechar resultados
   - Rationale: Garante que busca seja totalmente operável via teclado, essencial para acessibilidade

2. **ARIA Attributes**
   - `role="search"` no container
   - `aria-label` descritivo no input (ex: "Buscar projetos, publicações e conteúdo acadêmico")
   - `aria-live="polite"` para resultados
   - `aria-expanded` para estado do dropdown
   - Rationale: Fornece contexto semântico para tecnologias assistivas

3. **Screen Reader Support**
   - Anunciar número de resultados (ex: "15 resultados encontrados")
   - Anunciar quando filtros são aplicados (ex: "Filtrado por Publicações, 8 resultados")
   - Labels claros para todos os controles
   - Rationale: Usuários de screen readers recebem feedback equivalente ao visual

4. **Visual**
   - Contraste mínimo 4.5:1 (WCAG AA)
   - Foco visível em todos os elementos interativos
   - Não depender apenas de cor para informação
   - Touch targets mínimo 44x44px em mobile (Req 5.4)
   - Rationale: Garante usabilidade para usuários com deficiências visuais ou motoras

## Integration Points

1. **Astro Layout**
   - Adicionar `<Search />` component no layout principal
   - Incluir scripts necessários no `<head>`
   - Adicionar estilos globais se necessário

2. **Build Process**
   - Adicionar script ao `package.json`:
     ```json
     "scripts": {
       "prebuild": "node scripts/generate-search-index.js",
       "build": "astro build"
     }
     ```

3. **Navigation**
   - Resultados linkam para páginas individuais de cada pessoa (Req 2.4)
   - URLs no formato `/person/[lattes-id]#section` ou similar
   - Smooth scroll ao navegar para resultado na mesma página
   - Fechar busca após seleção
   - Rationale: Navegação direta para conteúdo relevante melhora experiência do usuário (Req 2.4)

## Requirements Traceability

Esta seção mapeia como cada requisito é atendido pelo design:

### Requirement 1: Busca por Palavras-chave
- **1.1** Campo visível no topo → Search Component sempre presente no layout
- **1.2** Mínimo 2 caracteres → Validação no SearchUI + configuração Fuse.js
- **1.3** Busca em todos os tipos → Search Index Generator indexa todos os Content Types
- **1.4** Resposta < 500ms → Lazy loading, debouncing, índice otimizado (< 500KB)
- **1.5** Mensagem quando vazio → Empty state no SearchUI

### Requirement 2: Resultados Organizados
- **2.1** Título, tipo e trecho → Estrutura SearchIndexEntry + renderização no SearchUI
- **2.2** Highlighting de termos → Fuse.js includeMatches + highlightMatches()
- **2.3** Ordenação por relevância → Fuse.js scoring + ordenação secundária por ano
- **2.4** Click navega para seção → URLs com âncoras + event handlers
- **2.5** Máximo 50 resultados → Limitação no SearchEngine.search()

### Requirement 3: Filtros por Tipo
- **3.1** Opções de filtro → Filter UI controls no SearchUI
- **3.2** Filtrar por tipo selecionado → applyFilters() no SearchEngine
- **3.3** Múltiplos filtros com AND → Lógica de combinação no applyFilters()
- **3.4** Atualização imediata → Event listeners + re-render
- **3.5** Contadores por tipo → Agregação de resultados + display nos filtros

### Requirement 4: Busca Fuzzy
- **4.1** Tolerância a 2 caracteres → Fuse.js threshold 0.4
- **4.2** Indicação visual de sugestões → Styling diferenciado para fuzzy matches
- **4.3** Priorizar exatas → Ordenação por score (exatas têm score melhor)
- **4.4** Sugerir termos alternativos → Algoritmo de sugestão baseado no índice
- **4.5** Case-insensitive → Fuse.js isCaseSensitive: false

### Requirement 5: Responsividade Mobile
- **5.1** Layout adaptativo → CSS responsive + media queries
- **5.2** Expansão em foco → JavaScript para expandir campo
- **5.3** Lista vertical otimizada → Fullscreen overlay + layout simplificado
- **5.4** Operável por toque → Touch targets 44x44px + eventos touch
- **5.5** Ajuste com teclado virtual → JavaScript para detectar e ajustar viewport

### Requirement 6: Indexação Completa
- **6.1** Projetos de pesquisa → Função de extração no generator
- **6.2** Projetos de extensão → Função de extração no generator
- **6.3** Projetos de desenvolvimento → Função de extração no generator
- **6.4** Publicações → Função de extração no generator
- **6.5** Orientações, formação, áreas → Funções de extração no generator

## Future Enhancements (Out of Scope)

- Histórico de buscas recentes
- Sugestões de busca (autocomplete)
- Busca por voz
- Analytics de termos mais buscados
- Exportar resultados de busca
- Busca avançada com operadores booleanos
