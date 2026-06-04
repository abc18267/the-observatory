// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO(owner): confirm the real production domain. Falls back to the
  // hardcoded value previously used in BaseLayout for canonical/OG URLs.
  site: 'https://theobservatory.dev',
  output: 'static',
  integrations: [
    svelte(),
    sitemap({
      // The "hidden room" is intentionally undiscoverable; keep it out of the sitemap.
      filter: (page) => !page.includes('/observatory'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['three'],
    },
  },
});
