import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['fuse.js']
    },
    build: {
      rollupOptions: {
        external: []
      }
    }
  }
});
