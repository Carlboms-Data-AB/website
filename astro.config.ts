import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

// Served from the apex domain, so there is no `base` to set — but internal
// links still go through the helper in src/site.ts rather than being written by
// hand, because that is what keeps this file and the one in
// carlbomsdata/rowmantic-print-web, which is served from a subdirectory,
// the same shape.
//
// The `~` alias is not configured here: Astro reads it from tsconfig.json's
// `paths` and hands it to Vite.
export default defineConfig({
  site: 'https://carlbomsdata.se',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwind()],
  },
});
