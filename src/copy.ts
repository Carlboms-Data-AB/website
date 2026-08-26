/**
 * Every word on the page.
 *
 * Kept in one file on purpose: editing copy should not mean touching markup,
 * and a sentence that lives on its own is a sentence anyone can change.
 *
 * The shape mirrors carlbomsdata/rowmantic-print-web. The fields the shared
 * components read — brand, home, other, alternates, meta, nav, contact, form,
 * footer — are named the same in both repositories, which is what lets
 * Base.astro, Nav.astro, Footer.astro and ContactForm.astro be identical files.
 * The section fields below them are this site's own, because the two sites sell
 * different things and therefore have different sections.
 *
 * The site is Swedish only. `other` and `alternates` are the hooks a second
 * language would use; leaving them out is what makes the language toggle and
 * the hreflang tags not render.
 */

export type Lang = 'sv';

export const SITE_NAME = 'Carlboms Data AB';
export const EMAIL = 'hello@carlbomsdata.se';

/**
 * The Anvil app, which forwards to SMTP2Go.
 *
 * SOURCE rides along so this site and the Rowmantic Print page can be told
 * apart in the inbox: without it both arrive as the same "Förfrågan från …".
 */
export const FORM_API = 'https://carlbomsdata-form-submission.anvil.app/_/api/contact';
export const LIKES_API = 'https://like-counter.anvil.app/_/api/likes';
export const SOURCE = 'carlbomsdata';

export interface NavLink {
  href: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  /** An item without an href is plain text — an address is not a link. */
  items: { label: string; href?: string }[];
}

export interface Copy {
  lang: Lang;
  htmlLang: string;
  /** The brand word in the header and the footer. */
  brand: string;
  /** Where the brand word links. */
  home: string;
  /** The other language, when there is one. Absent here. */
  other?: { href: string; label: string };
  /** hreflang tags, when the page exists in more than one language. Absent here. */
  alternates?: { hreflang: string; href: string }[];

  meta: { title: string; description: string };
  nav: { links: NavLink[]; cta: string; ctaHref: string; tools?: string; toolsHref?: string };

  hero: {
    title: string;
    lead: string;
    cta: string;
    ctaHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };
  services: {
    title: string;
    items: { icon: string; title: string; body: string; chips: string[] }[];
  };
  reasons: {
    title: string;
    items: { title: string; body: string }[];
  };
  cases: {
    title: string;
    labels: { tech: string; challenge: string; solution: string; result: string };
    items: {
      category: string;
      client: string;
      title: string;
      tech: string[];
      challenge: string;
      solution: string;
      result: string;
    }[];
  };
  about: {
    title: string;
    body: string[];
    portraitAlt: string;
    sign: { greeting: string; name: string; role: string };
  };

  contact: {
    /** The section's anchor, without the hash. An address, not copy. */
    id: string;
    heading: string;
    lead: string;
    rows: { icon: string; label: string; value: string; href?: string }[];
  };
  form: {
    name: string;
    company: string;
    email: string;
    message: string;
    placeholder: string;
    submit: string;
    sending: string;
    success: string;
    errorBefore: string;
    errorAfter: string;
    note: string;
  };
  footer: {
    tagline: string;
    columns: FooterColumn[];
    legal: string;
    note: string;
  };
  notFound: { code: string; title: string; body: string; cta: string };
}

// The anchors are the ones the live site already publishes. They are addresses,
// not copy: a link someone sent last month should not stop working because a
// section was renamed.
const sv: Copy = {
  lang: 'sv',
  htmlLang: 'sv',
  brand: 'Carlboms Data',
  home: '/',

  meta: {
    title: 'Carlboms Data — Systemintegration för tillverkningsindustrin',
    description:
      'Jag hjälper tillverkningsföretag med MES/ERP-integration, systemintegration och ' +
      'specialutvecklade verktyg som får IT och automation att fungera tillsammans.',
  },

  nav: {
    links: [],
    cta: 'Boka rådgivning',
    ctaHref: '#kontakt',
    tools: 'Verktyg',
    toolsHref: '/tools',
  },

  hero: {
    title: 'Konsult inom Systemintegration',
    lead:
      'Jag hjälper tillverkningsföretag med MES/ERP-integration, systemintegration och ' +
      'specialutvecklade verktyg.',
    cta: 'Boka ett rådgivningssamtal',
    ctaHref: '#kontakt',
    ctaSecondary: 'Se tjänster',
    ctaSecondaryHref: '#tjanster',
  },

  services: {
    title: 'Mina tjänster',
    items: [
      {
        icon: 'git-merge',
        title: 'MES/ERP-integration',
        body:
          'Jag kopplar samman produktionssystem, affärssystem och databaser så att ' +
          'informationen flödar automatiskt mellan systemen.',
        chips: ['MES / ERP', 'T-SQL', 'HTTP / REST', 'ODBC'],
      },
      {
        icon: 'cpu',
        title: 'Automation & PLC',
        body:
          'Jag programmerar, felsöker och optimerar styrsystem för en stabil och effektiv ' +
          'produktion.',
        chips: ['CODESYS', 'Structured Text', 'J1939', 'CAN'],
      },
      {
        icon: 'monitor',
        title: 'HMI, SCADA & övervakning',
        body:
          'Jag utvecklar operatörsgränssnitt och övervakning som ger rätt information till ' +
          'rätt person.',
        chips: ['WinCC', 'FUXA', 'Webb-HMI', 'Grafana'],
      },
      {
        icon: 'code',
        title: 'Specialutvecklade verktyg',
        body: 'Jag utvecklar verktyg för de behov där standardlösningar inte räcker.',
        chips: ['C# / .NET', 'Python', 'JavaScript', 'SQL'],
      },
      {
        icon: 'shield-check',
        title: 'Nätverk & fjärråtkomst',
        body:
          'Jag skapar säker fjärråtkomst till maskiner och produktionssystem så att ' +
          'felsökning kan göras utan onödiga resor.',
        chips: ['WireGuard', 'VLAN', 'SSH', 'DNS'],
      },
      {
        icon: 'search',
        title: 'Felsökning & optimering',
        body: 'Jag hittar grundorsaken till problemen — även när flera system är inblandade.',
        chips: ['Root-cause-analys', 'Prestanda', 'Kodgranskning', 'Akut support'],
      },
    ],
  },

  reasons: {
    title: 'Varför Carlboms Data',
    items: [
      {
        title: 'Både IT och automation',
        body:
          'Jag förstår hela kedjan och kan bygga lösningen mellan produktionen och ' +
          'affärssystemet.',
      },
      {
        title: 'En kontakt genom hela uppdraget',
        body:
          'Ni har direktkontakt med den som analyserar, utvecklar, testar och driftsätter ' +
          'lösningen.',
      },
      {
        title: 'Ni äger lösningen',
        body: 'Inga onödiga plattformar eller svarta lådor — ingen leverantörsinlåsning.',
      },
    ],
  },

  cases: {
    title: 'Referenser',
    labels: {
      tech: 'Tekniker',
      challenge: 'Utmaningen',
      solution: 'Lösningen',
      result: 'Resultatet',
    },
    items: [
      {
        category: 'Övervakning & loggning',
        client: 'Tillverkare av tunga industrifordon',
        title: 'Full koll på tunga fordon.',
        tech: ['Node-RED', 'JavaScript', 'J1939 CAN', 'CODESYS', 'Webb-HMI', 'Grafana', 'WireGuard'],
        challenge:
          'Tunga fordon användes i gruvor och smältverk utan samlad övervakning eller ' +
          'historisk loggning. Problem upptäcktes först när något redan hade gått fel.',
        solution:
          'Jag byggde ett webbaserat system för övervakning och loggning. Driftstatus, larm ' +
          'och styrning blev tillgängliga direkt i webbläsaren, oavsett var fordonet befann sig.',
        result:
          'Problem kunde upptäckas tidigare och planeras innan de ledde till kostsamma ' +
          'produktionsstopp. Samtidigt sparades driftdata för analys och uppföljning.',
      },
      {
        category: 'Modernisering & virtualisering',
        client: 'Tillverkningsföretag med äldre visionsystem',
        title: 'Ett äldre visionsystem i fortsatt drift.',
        tech: [
          'VMware Workstation',
          'Windows XP Embedded',
          'GigE Vision',
          'WAGO PLC',
          'MOXA NPort',
          'Seriell kommunikation',
        ],
        challenge:
          'Ett äldre visionsystem stod stilla efter att industridatorns moderkort gått ' +
          'sönder. Reservdelar gick inte längre att få tag på från leverantören.',
        solution:
          'Jag återskapade den befintliga systemmiljön som en virtuell maskin och flyttade ' +
          'den till ny hårdvara.',
        result:
          'Visionsystemet är åter i drift utan att kunden behövde ersätta den befintliga ' +
          'applikationen eller automationsutrustningen.',
      },
      {
        category: 'Säker fjärråtkomst',
        client: 'Industriföretag med geografiskt spridda anläggningar',
        title: 'Närhet på distans för snabbare felsökning.',
        tech: ['WireGuard', 'VLAN', 'SSH', 'DNS', 'Bash'],
        challenge:
          'När ett fel uppstod behövde en tekniker resa till anläggningen för att felsöka på ' +
          'plats. Det gjorde varje insats både dyr och långsam.',
        solution:
          'Jag satte upp en säker fjärranslutning som gav teknikerna tillgång till ' +
          'utrustningen direkt från kontoret.',
        result:
          'En felsökning som tidigare krävde en hel resdag kunde genomföras på cirka ' +
          '15 minuter.',
      },
      {
        category: 'Lagerautomation',
        client: 'Tillverkningsföretag med lagerverksamhet',
        title: 'Rätt etikett på rätt plats — varje gång.',
        tech: ['C# / .NET', 'Python', 'C++', 'T-SQL', 'ODBC', 'HTTP / REST'],
        challenge:
          'Tre olika system användes för etikettutskrift. Fel etikett kunde hamna på fel ' +
          'produkt, vilket orsakade reklamationer och försenade leveranser.',
        solution:
          'Jag ersatte de separata flödena med ett integrerat system som automatiskt hämtade ' +
          'rätt information och skrev ut rätt etikett för varje produkt. Användarna fick också ' +
          'ett verktyg för att själva skapa och ändra etikettmallar.',
        result:
          'Ett enda system gav bättre spårbarhet, färre felmärkningar och möjlighet att skapa ' +
          'nya etiketter direkt när behovet uppstod.',
      },
      {
        category: 'Optimering',
        client: 'Svensk kabeltillverkare',
        title: 'Nytt liv i gamla styrsystem.',
        tech: ['C# / .NET', 'WPF', 'ODBC'],
        challenge:
          'Ett egenutvecklat styrsystem hade blivit så långsamt att det påverkade produktionen.',
        solution: 'Jag optimerade den befintliga koden i stället för att ersätta hela systemet.',
        result:
          'Styrsystemet blev snabbt och responsivt igen och sparade kunden flera timmar varje dag.',
      },
    ],
  },

  about: {
    title: 'Om Carlboms Data',
    body: [
      'Jag heter Tobias Carlbom och driver Carlboms Data AB i Lund. Jag hjälper ' +
        'tillverkningsföretag med MES/ERP-integration, systemintegration och specialutvecklade ' +
        'verktyg.',
      'Min styrka är att jag arbetar med både IT och automation. Det gör att jag kan förstå ' +
        'hela kedjan — från maskiner och styrsystem till databaser, affärssystem och ' +
        'användarnas arbetsflöden.',
      'Jag arbetar prestigelöst och utgår från problemet, inte från en viss produkt eller ' +
        'plattform.',
      'Jag bygger lösningar som passar den befintliga verksamheten, utan onödig ' +
        'leverantörsinlåsning. Ni har direktkontakt med mig genom hela uppdraget och lösningen ' +
        'är er, utan inlåsning.',
    ],
    portraitAlt: 'Tobias Carlbom',
    sign: {
      greeting: 'Vänliga hälsningar,',
      name: 'Tobias Carlbom',
      role: 'Grundare · Carlboms Data AB · Lund',
    },
  },

  contact: {
    id: 'kontakt',
    heading: 'Kontakt',
    lead:
      'Hör av er så pratar vi om hur jag kan få era system att samarbeta bättre. Carlboms ' +
      'Data är baserat i Lund och arbetar med kunder i hela Sverige.',
    rows: [
      { icon: 'mail', label: 'E-post', value: EMAIL, href: `mailto:${EMAIL}` },
      { icon: 'pin', label: 'Plats', value: 'Lund, Sverige.' },
    ],
  },

  form: {
    name: 'Namn',
    company: 'Företag',
    email: 'E-post',
    // The label asks for a problem, not a subject line. 02-voice.md §2.3.
    message: 'Beskriv er utmaning',
    placeholder:
      'T.ex. "Vi hämtar produktionsdata manuellt från maskinerna och matar in den i ' +
      'affärssystemet för hand."',
    submit: 'Skicka',
    // Reuse the microcopy, do not write new. 02-voice.md §2.9.
    sending: 'Skickar…',
    success: 'Tack! Jag hör av mig inom kort.',
    errorBefore: 'Något gick fel. Försök igen eller maila ',
    errorAfter: '.',
    note:
      'Era uppgifter används endast för att återkomma om er förfrågan. Inga nyhetsbrev och ' +
      'inga tredjeparter.',
  },

  footer: {
    tagline: 'Org.nr 559494-0461\nMomsreg.nr SE559494046101\nLund, Sverige',
    columns: [
      {
        title: 'Innehåll',
        items: [
          { label: 'Mina tjänster', href: '#tjanster' },
          { label: 'Varför Carlboms Data', href: '#varfor' },
          { label: 'Referenser', href: '#referenser' },
          { label: 'Om Carlboms Data', href: '#om' },
          { label: 'Kontakt', href: '#kontakt' },
        ],
      },
      {
        title: 'Kontakt',
        items: [{ label: EMAIL, href: `mailto:${EMAIL}` }],
      },
      {
        title: 'Följ',
        items: [
          { label: 'Källkod på GitHub ↗', href: 'https://github.com/carlbomsdata/website' },
        ],
      },
    ],
    legal: 'Carlboms Data AB',
    note: 'Cookiefri sajt · ingen spårning',
  },

  notFound: {
    code: '404',
    title: 'Sidan kunde inte hittas.',
    body: 'Sidan ni letade efter finns inte längre eller har flyttats.',
    cta: 'Tillbaka till startsidan',
  },
};

export const copy: Record<Lang, Copy> = { sv };
