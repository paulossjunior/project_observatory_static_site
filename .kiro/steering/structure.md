# Project Structure

## Astro Project Organization

```
/
├── src/
│   ├── pages/          # File-based routing - each .astro file becomes a route
│   ├── components/     # Reusable Astro and framework components
│   ├── layouts/        # Page layout templates
│   ├── content/        # Content collections (markdown/MDX files)
│   └── styles/         # Global styles and CSS
├── public/             # Static assets (images, fonts, etc.) - served as-is
├── astro.config.mjs    # Astro configuration
└── package.json        # Dependencies and scripts
```

## Key Conventions

- **Pages**: Files in `src/pages/` automatically become routes
  - `src/pages/index.astro` → `/`
  - `src/pages/about.astro` → `/about`
  - `src/pages/data/[id].astro` → `/data/:id` (dynamic routes)

- **Components**: Reusable `.astro` components or framework-specific components
  - Use `.astro` for static/server-rendered components
  - Use framework components (React, Vue, etc.) for interactive islands

- **Content Collections**: Structured content in `src/content/` with type-safe frontmatter

- **Static Assets**: Place in `public/` directory, referenced with `/` prefix

## JSON-Driven Content Architecture

This site generates pages dynamically from JSON data files:

- **Data Location**: JSON files should be stored in `src/data/` or `public/data/`
  - `src/data/` - For data processed at build time
  - `public/data/` - For data that might be fetched client-side

- **Dynamic Page Generation**: Use `getStaticPaths()` in dynamic routes to generate pages from JSON
  ```astro
  // Example: src/pages/projects/[id].astro
  export async function getStaticPaths() {
    const projects = await import('../data/projects.json');
    return projects.map(project => ({
      params: { id: project.id },
      props: { project }
    }));
  }
  ```

- **Content Types**: Organize JSON files by content type:
  - `projects.json` - Research, Extension, and Education projects
  - `research.json` - Research activities and outputs
  - `students.json` - Student information
  - `scholarships.json` - Scholarship opportunities

- **Components**: Build reusable components that accept data as props for consistent rendering across generated pages
