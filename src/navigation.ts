import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Erbjudande',
      href: getPermalink('/tjanster'),
    },
    {
      text: 'Referenser',
      href: getPermalink('/case'),
    },
    {
      text: 'Om Carlboms Data',
      href: getPermalink('/om'),
    },
    {
      text: 'Kontakt',
      href: getPermalink('/kontakt'),
    },
  ],
  actions: [{ text: 'Boka rådgivning', href: getPermalink('/kontakt'), variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Erbjudande',
      links: [
        { text: 'Systemintegration', href: getPermalink('/tjanster') },
        { text: 'Automation & PLC', href: getPermalink('/tjanster') },
        { text: 'HMI, SCADA & övervakning', href: getPermalink('/tjanster') },
      ],
    },
    {
      title: 'Carlboms Data',
      links: [
        { text: 'Om mig', href: getPermalink('/om') },
        { text: 'Referenser', href: getPermalink('/case') },
        { text: 'Kontakt', href: getPermalink('/kontakt') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/carlboms-data-ab' },
  ],
  footNote: `
    &copy; ${new Date().getFullYear()} Carlboms Data AB · Org.nr 559494-0461 · Baserat i Lund
  `,
};
