# website

The Carlboms Data AB site — <https://carlbomsdata.se>. Astro 6, Tailwind v4,
four dependencies, no build plugins.

## Shape

Shares its file tree with `Carlboms-Data-AB/rowmantic-print-web`; most files are
byte-identical. Only three differ: `src/styles/theme.css` (accent colour),
`src/copy.ts` (the words), `src/components/Landing.astro` (the sections). Shared
styling lives in `src/styles/brand.css` and is copied across, not rewritten per
repo — don't put styling in a component `<style>` block.

Every word on the page is in `src/copy.ts`. The site is Swedish only; the empty
`other`/`alternates` fields are what keep the language toggle and hreflang tags
from rendering.

## Run

`npm install`, `npm run dev` (localhost:4321), `npm run build`. Pushing to `main`
publishes; PRs build without deploying.

## Contact form

Posts JSON to an Anvil app (`carlbomsdata-form-submission.anvil.app`) with a
`source: "carlbomsdata"` field, so enquiries can be told apart from the
Rowmantic Print page.
