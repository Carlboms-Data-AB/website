# Claude Code Configuration

Astro 6 + Tailwind v4, deployed to GitHub Pages by
`.github/workflows/deploy.yml`. Four dependencies and no template underneath —
what is here is the whole thing.

This repository is one of a pair with the other Carlboms Data site. **They have
the same file tree, and most files are byte-identical.** See the README for the
list.

## The rule that matters

Only three files may differ between the two repositories:

- `src/styles/theme.css` — the colour theme, and nothing else
- `src/copy.ts` — the words
- `src/components/Landing.astro` — the sections, which are genuinely different

Everything else — `brand.css`, `Base.astro`, `Nav.astro`, `Footer.astro`,
`Contact.astro`, `ContactForm.astro`, `Shot.astro`, `404.astro`, `tsconfig.json`,
the workflow — is shared. If a change is needed in one of them, make it here and
copy the file to the sibling repository in the same commit.

## Styling

**All styling lives in `src/styles/brand.css`.** Do not add a `<style>` block to
a component or a page: a scoped rule cannot be shared, and sharing is the whole
arrangement.

Accents go through the tokens in `theme.css` — `--accent`, `--accent-deep`,
`--accent-rgb`, `--accent-2`, the tints and the selection colours. Never write a
brand hex into `brand.css`; a rule that hard-codes green renders green on the
site that is meant to be rose.

`brand.css` deliberately contains classes this site does not use. Leave them.

## Copy

Every word is in `src/copy.ts`. Change text there, not in markup.

Anchors (`#tjanster`, `#how`, `#kontakt`, …) are addresses, not copy. Renaming
one breaks links people already have — don't, unless asked.

## Do not

- Add dependencies. The count is the point.
- Reintroduce AstroWind (`vendor/`, `src/utils/`, `src/config.yaml`, `src/types.d.ts`).
- Use the `~` alias inside `import.meta.glob` — Vite resolves the pattern before
  Astro's aliases apply and the build fails. Use a relative path.
- Hyphenate. `hyphens: none` is set on purpose: Swedish compounds break at their
  seams and read as särskrivningar.
