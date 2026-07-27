import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
  base: '/OperaOpusMob/',
  title: 'Opera Mobile',
  description: 'Razvojna dokumentacija migracije Opera Mobile aplikacije (SvamPlus) iz Ionic/Capacitor u Expo/React Native.',
  lang: 'hr',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/OperaOpusMob/favicon.svg' }],
  ],

  themeConfig: {
    logo: { light: '/logo-light.png', dark: '/logo-light.png', alt: 'OperaOpus' },

    nav: [
      { text: 'Pregled', link: '/' },
      { text: 'Paritet', link: '/ai/FEATURE_PARITY_MATRIX' },
      { text: 'Odluke', link: '/ai/DECISION_LOG' },
      {
        text: 'GitHub',
        link: 'https://github.com/LeonLisinski/OperaOpusMob',
        target: '_blank',
      },
    ],

    sidebar: [
      {
        text: '📍 Uvod',
        items: [
          { text: 'Početna', link: '/' },
          { text: 'Karta sustava', link: '/ai/SYSTEM_MAP' },
          { text: 'Kontekst projekta', link: '/ai/PROJECT_CONTEXT' },
        ],
      },
      {
        text: '🏗️ Arhitektura',
        items: [
          { text: 'Trenutna arhitektura (Ionic)', link: '/ai/CURRENT_ARCHITECTURE' },
          { text: 'Ciljna arhitektura (Expo)', link: '/ai/TARGET_ARCHITECTURE' },
          { text: 'Strategija migracije', link: '/ai/MIGRATION_STRATEGY' },
        ],
      },
      {
        text: '📊 Status',
        items: [
          { text: 'Feature Parity Matrix', link: '/ai/FEATURE_PARITY_MATRIX' },
          { text: 'Decision Log (D001–D034)', link: '/ai/DECISION_LOG' },
          { text: 'Poznati rizici', link: '/ai/KNOWN_RISKS' },
          { text: 'Otvorena pitanja', link: '/ai/OPEN_QUESTIONS' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LeonLisinski/OperaOpusMob' },
    ],

    footer: {
      message: 'Opera Mobile — SvamPlus',
      copyright: 'Interno razvojna dokumentacija',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/LeonLisinski/OperaOpusMob/edit/main/docs/:path',
      text: 'Uredi na GitHubu',
    },

    lastUpdated: {
      text: 'Zadnja izmjena',
      formatOptions: {
        dateStyle: 'short',
      },
    },
  },

  mermaid: {
    theme: 'neutral',
  },
});
