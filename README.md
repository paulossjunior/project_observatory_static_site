# Academic Observatory

A modern, static website for showcasing academic research profiles with comprehensive analytics, visualizations, and detailed information about researchers, their projects, publications, and student supervisions.

## 🌟 Features

### 📊 **Comprehensive Analytics Dashboard**
- **5 Key Metrics Cards**: Publications, Projects, Supervisions, Committee Participations, Years of Experience
- **10+ Interactive Charts**: Publications timeline, type distribution, impact metrics, supervisions, committees, collaborations, funding, and more
- **Real-time Visualizations**: Powered by Chart.js with data labels
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🔍 **Advanced Search**
- Full-text search across all researcher profiles
- Search by name, research areas, publications, and projects
- Instant results with Fuse.js fuzzy search
- Search index generated at build time

### 👤 **Detailed Researcher Profiles**
- Personal information and academic background
- Professional experience timeline
- Research areas and lines of research
- Complete publication list (all types)
- Project portfolio (research, extension, development)
- Student supervisions (ongoing and completed)
- Committee participations
- Bibliographic production

### 📋 **Data Tables**
- **Active Projects**: Current projects with status, dates, and roles
- **Completed Projects**: Recently finished projects with duration
- **Ongoing Supervisions**: Current student supervisions by type
- **Completed Supervisions**: Recent graduations and completions
- Status badges (Ongoing/Done) with icons
- Sortable and filterable data

### 📈 **Visualizations**
- Publications over time (line chart)
- Publication type distribution (doughnut chart)
- Impact metrics radar (6 dimensions)
- Student supervisions by type (stacked bar)
- Committee participations (horizontal bar)
- Annual activity trends (multi-line)
- Top collaborators (horizontal bar)
- Funding sources (horizontal bar)
- Project duration distribution (bar chart)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd academic-observatory
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Add your data**
   
   Place your researcher JSON files in the `source/` directory:
   ```
   source/
   ├── 00_FirstName-LastName_ID.json
   ├── 01_FirstName-LastName_ID.json
   └── 02_FirstName-LastName_ID.json
   ```

### Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Building for Production

Build the static site:

```bash
npm run build
```

The built site will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
academic-observatory/
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── PersonHeader.astro
│   │   ├── PersonCard.astro
│   │   ├── ResearcherAnalyticsDashboard.astro
│   │   ├── ResearcherStatsCards.astro
│   │   ├── GenericChart.astro
│   │   ├── ActiveProjectsTable.astro
│   │   ├── SupervisionsTable.astro
│   │   ├── ProjectsBarChart.astro
│   │   ├── Search.astro
│   │   └── ...
│   ├── pages/               # File-based routing
│   │   ├── index.astro      # Home page (list of researchers)
│   │   └── person/
│   │       └── [id].astro   # Dynamic researcher profile pages
│   ├── scripts/             # Client-side JavaScript
│   │   ├── search-engine.js
│   │   └── search-ui.js
│   ├── utils/               # Utility functions
│   │   ├── personData.ts    # Data loading and processing
│   │   ├── projectsData.ts  # Project aggregation
│   │   └── researcherStats.ts # Statistics calculations
│   └── styles/              # Global styles
├── source/                  # JSON data files (researcher CVs)
├── public/                  # Static assets
├── scripts/                 # Build scripts
│   └── generate-search-index.js
├── .kiro/                   # Kiro IDE specs and documentation
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 📊 Data Format

### JSON Structure

Each researcher's data should be in JSON format with the following structure:

```json
{
  "informacoes_pessoais": {
    "id_lattes": "string",
    "nome_completo": "string",
    "texto_resumo": "string",
    "url": "string",
    ...
  },
  "formacao_academica": [...],
  "atuacao_profissional": [...],
  "projetos_pesquisa": [...],
  "projetos_extensao": [...],
  "projetos_desenvolvimento": [...],
  "producao_bibliografica": {
    "artigos_periodicos": [...],
    "trabalhos_completos_congressos": [...],
    "livros_publicados": [...],
    "capitulos_livros": [...],
    ...
  },
  "orientacoes": {
    "em_andamento": {...},
    "concluidas": {...}
  },
  "bancas": {...},
  "areas_de_atuacao": [...],
  "linhas_de_pesquisa": [...]
}
```

### Required Fields

Minimum required fields for each researcher:
- `informacoes_pessoais.nome_completo`
- `informacoes_pessoais.texto_resumo`

All other fields are optional and will be handled gracefully if missing.

## 🎨 Customization

### Colors

Main color scheme can be customized in component styles:
- Primary: `#667eea` (Purple)
- Research: `#3b82f6` (Blue)
- Extension: `#10b981` (Green)
- Development: `#f59e0b` (Amber)

### Chart Configuration

Charts can be customized in `src/components/ResearcherAnalyticsDashboard.astro`:
- Chart types
- Colors
- Data labels
- Tooltips
- Legends

### Analytics Metrics

Impact metrics normalization can be adjusted in `src/utils/researcherStats.ts`:
- Publication threshold (default: 50)
- Supervision threshold (default: 30)
- Committee threshold (default: 50)
- Collaborator threshold (default: 20)
- Funding threshold (default: 10)

## 🔧 Technologies

- **[Astro](https://astro.build/)** - Static site generator
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Chart.js](https://www.chartjs.org/)** - Data visualization
- **[Chart.js DataLabels](https://chartjs-plugin-datalabels.netlify.app/)** - Value labels on charts
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search
- **Node.js** - Runtime environment

## 📦 Build Process

1. **Pre-build**: Generate search index from JSON data
2. **Build**: Astro generates static HTML pages
3. **Output**: Fully static site in `dist/` directory

### Build Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run prebuild` - Generate search index (runs automatically before build)

## 🚀 Deployment

The site is fully static and can be deployed to any static hosting service:

### Recommended Platforms

- **[Vercel](https://vercel.com/)** - Zero configuration
- **[Netlify](https://www.netlify.com/)** - Automatic builds
- **[GitHub Pages](https://pages.github.com/)** - Free hosting
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Fast CDN

### Deployment Steps

1. Build the site: `npm run build`
2. Deploy the `dist/` directory to your hosting service
3. Configure custom domain (optional)

## 📈 Analytics Features

### Statistics Calculated

- Total publications (all types)
- Total projects (research + extension + development)
- Active vs completed projects
- Student supervisions (ongoing + completed)
- Committee participations
- Years of academic experience
- Top collaborators
- Funding sources
- Project durations
- Annual activity trends

### Visualizations

All charts include:
- Interactive tooltips
- Data labels showing values
- Responsive design
- Descriptive explanations
- Total counts in titles
- Color-coded categories
- Export-ready format

## 🔍 Search Features

- **Full-text search** across all fields
- **Fuzzy matching** for typo tolerance
- **Instant results** as you type
- **Highlighted matches** in results
- **Keyboard navigation** support
- **Mobile-friendly** interface

## 📱 Responsive Design

- **Desktop**: Full layout with all features
- **Tablet**: Optimized grid layouts
- **Mobile**: Single column, touch-friendly
- **Charts**: Automatically resize
- **Tables**: Horizontal scroll when needed

## 🎯 Performance

- **Static Generation**: All pages pre-rendered at build time
- **Fast Load Times**: No server-side processing
- **Optimized Assets**: Minified CSS and JavaScript
- **CDN-Ready**: Can be served from CDN
- **SEO-Friendly**: Static HTML with meta tags

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 👥 Authors

[Add author information here]

## 🙏 Acknowledgments

- Chart.js for excellent visualization library
- Astro team for the amazing static site generator
- Fuse.js for powerful search capabilities

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `.kiro/specs/`

---

**Built with ❤️ using Astro and TypeScript**
