# website

The company site for **Carlboms Data AB**.

<https://carlbomsdata.se>

Astro 6 and Tailwind v4. Four dependencies, no build plugins, no template
underneath it.

---

## Two repositories, one shape

This repository and
[`Carlboms-Data-AB/rowmantic-print-web`](https://github.com/Carlboms-Data-AB/rowmantic-print-web)
have the same file tree, and the files below are **byte-identical** in both:

```
src/styles/brand.css        every rule the two sites share
src/site.ts                 internal links, base-path aware
src/layouts/Base.astro      the document
src/components/Nav.astro
src/components/Footer.astro
src/components/Contact.astro
src/components/ContactForm.astro
src/components/Shot.astro
src/pages/404.astro
tsconfig.json
.gitignore
.github/workflows/deploy.yml
public/robots.txt
```

Three things differ, and only three:

| | This repository | rowmantic-print-web |
|---|---|---|
| `src/styles/theme.css` | the green accent | the rose accent |
| `src/copy.ts` | the company's words | the product's words, sv + en |
| `src/components/Landing.astro` | services, references, about | steps, integration modes, the tools |

`brand.css` reaches every accent through a token in `theme.css`, so the two
sites cannot drift apart visually. A styling fix belongs in `brand.css` and is
carried across by copying that one file:

```sh
cp src/styles/brand.css ../rowmantic-print-web/src/styles/brand.css
```

It therefore also holds classes this site does not use — `.steps`, `.proof`,
`.ticks`. That is the point: the day this site wants a numbered how-it-works
section, the styling is already there and already identical.

**Do not put styling in a component's `<style>` block.** A scoped rule cannot be
shared, and sharing is the whole arrangement.

---

## Running it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # writes dist/
```

Pushing to `main` publishes. Pull requests build without deploying, so a page
that does not compile cannot become the live one.

---

## Where the words are

**Every word on the page is in [`src/copy.ts`](src/copy.ts).** Editing copy does
not mean touching markup.

The site is Swedish only. `copy.ts` keeps the fields a second language would
need — `other` and `alternates` — and leaving them out is what makes the
language toggle and the hreflang tags not render. Adding English later means
filling those in and adding `src/pages/en/index.astro`, which is exactly what
the other repository does.

Anchors (`#tjanster`, `#varfor`, `#referenser`, `#om`, `#kontakt`) are addresses,
not copy. A link someone sent last month should keep working, so they stay as
they are even where the surrounding words change.

---

## Images

| File | Used for |
|---|---|
| `src/assets/images/og.png` | the social preview, picked up automatically by `Base.astro` |
| `src/assets/images/tobias-portrait.jpg` | the portrait in the about section |
| `public/favicon.svg` | the mark — also the logo in the header and the footer |
| `public/favicon.ico`, `public/apple-touch-icon.png` | generated from `favicon.svg` |

`Shot.astro` renders a screenshot from `src/assets/images/` and draws a labelled
placeholder until the file exists. This site does not use it yet; the product
page does.

---

## The contact form

Posts JSON to an Anvil app (`carlbomsdata-form-submission.anvil.app`), which
sends the mail through SMTP2Go.

The form sends a **`source: "carlbomsdata"`** field so an enquiry from here can
be told apart from one sent from the Rowmantic Print page — without it both
arrive as the same `Förfrågan från <namn>`. The handler currently ignores it;
see that repository's README for the change it needs.

Status strings come from
[02-voice.md §2.9](https://github.com/Carlboms-Data-AB/brand-guide/blob/main/brand/02-voice.md),
not written fresh.

---

## What is deliberately absent

- **No linter or formatter.** Four dependencies was the point.
- **No sitemap.** `@astrojs/sitemap` was dropped with the rest of the template.
  A one-page site loses little; add it back to *both* repositories if it is
  wanted, not just this one.
- **No HTML or CSS minification.** `astro-compress` went the same way.
- **No view transitions.** `ClientRouter` was carried by the template and served
  no purpose on a single page.
