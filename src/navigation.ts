import { getPermalink } from './utils/permalinks';

// AntreSehat: navigasi = tab sheet di dalam halaman (Ambil | Papan | Loket).
// Anchor menunjuk section sheet yang sama di index.astro.
export const headerData = {
  links: [
    { text: 'Ambil', href: getPermalink('/#sheet-ambil') },
    { text: 'Papan', href: getPermalink('/#sheet-papan') },
    { text: 'Loket', href: getPermalink('/#sheet-loket') },
  ],
  actions: [],
};

export const footerData = {
  links: [],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `
    AntreSehat — papan antrean digital puskesmas (data contoh).
  `,
};
