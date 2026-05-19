import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Tjänster',
      href: getPermalink('/tjanster'),
    },
    {
      text: 'Case',
      href: getPermalink('/case'),
    },
    {
      text: 'Om oss',
      href: getPermalink('/om'),
    },
    {
      text: 'Kontakt',
      href: getPermalink('/kontakt'),
    },
  ],
  actions: [{ text: 'Boka möte', href: getPermalink('/kontakt'), variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Tjänster',
      links: [
        { text: 'Specialutvecklad mjukvara', href: getPermalink('/tjanster') },
        { text: 'Systemintegration', href: getPermalink('/tjanster') },
        { text: 'Nätverk & fjärråtkomst', href: getPermalink('/tjanster') },
        { text: 'Automatiserad rapportering', href: getPermalink('/tjanster') },
      ],
    },
    {
      title: 'Företag',
      links: [
        { text: 'Om oss', href: getPermalink('/om') },
        { text: 'Case', href: getPermalink('/case') },
        { text: 'Kontakt', href: getPermalink('/kontakt') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/Carlboms-Data-AB' },
  ],
  footNote: `
    &copy; ${new Date().getFullYear()} Carlboms Data AB · Org.nr 559494-0461
  `,
};
