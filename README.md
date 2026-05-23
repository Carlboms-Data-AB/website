# Carlboms Data AB — carlbomsdata.se

Företagssajt for Carlboms Data AB. Statisk sajt byggd med Astro och Tailwind CSS, deployad till GitHub Pages.

## Teknikstack

- **Astro v6** — statisk site generator
- **Tailwind CSS v4** — utility-first CSS
- **Geist** — typsnitt (Geist + Geist Mono via Google Fonts)
- **GitHub Actions** — CI/CD till GitHub Pages
- **Anvil + SMTP2Go** — kontaktformulär-backend

## Sidor

| Sökväg | Fil | Beskrivning |
|---|---|---|
| `/` | `index.astro` | Startsida med hero, kompetenser, USP:er |
| `/tjanster` | `tjanster.astro` | Tjänsteöversikt, teknikstack, metod |
| `/referenser` | `referenser.astro` | Fem kundcase med teknikchips |
| `/om` | `om.astro` | Om Carlboms Data, värderingar |
| `/kontakt` | `kontakt.astro` | Kontaktformulär (Anvil-backend) |
| `/404` | `404.astro` | Felsida |

## Kom igång

Kräver **Node.js >= 22.12**.

```sh
npm install
npm run dev        # Lokal server på localhost:4321
npm run build      # Produktionsbygge till ./dist/
npm run preview    # Förhandsgranska bygget lokalt
```

## Projektstruktur

```
src/
├── assets/
│   ├── images/         # Bilder (optimeras vid bygge)
│   └── styles/
│       └── tailwind.css  # Designsystem: tokens, typografi, komponenter
├── components/
│   ├── site/           # Nav, Footer, CtaBand
│   └── common/         # Metadata, Analytics, SEO
├── layouts/
│   ├── Layout.astro    # Bas-layout (head, fonts, meta)
│   └── PageLayout.astro # Sidlayout med Nav + Footer
├── pages/              # Filbaserad routing
└── config.yaml         # Sajtkonfiguration
```

## Deploy

Push till `main` triggar GitHub Actions som bygger och deployar till GitHub Pages. Workflow-filen ligger i `.github/workflows/actions.yaml`.

## Kontaktformulär

Formuläret postar JSON till en Anvil-app (`carlbomsdata-form-submission.anvil.app`) som skickar e-post via SMTP2Go. Honeypot-fält för spamskydd.

## Licens

MIT
