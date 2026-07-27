import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: 'Opera Mobile dokumentacija',
  description: 'Razvojna i projektna dokumentacija Expo migracije',
  lang: 'hr-HR',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    siteTitle: 'Opera Mobile',

    nav: [
      { text: 'Početna', link: '/' },
      { text: 'Kontekst', link: '/ai/PROJECT_CONTEXT' },
      { text: 'Arhitektura', link: '/ai/CURRENT_ARCHITECTURE' },
      { text: 'Migracija', link: '/ai/MIGRATION_STRATEGY' },
      { text: 'Rizici i pitanja', link: '/ai/KNOWN_RISKS' },
    ],

    sidebar: {
      '/ai/': [
        {
          text: 'Projekt',
          items: [
            { text: 'Kontekst projekta', link: '/ai/PROJECT_CONTEXT' },
            { text: 'Karta sustava', link: '/ai/SYSTEM_MAP' },
          ],
        },
        {
          text: 'Arhitektura',
          items: [
            { text: 'Trenutna arhitektura', link: '/ai/CURRENT_ARCHITECTURE' },
            { text: 'Ciljna arhitektura', link: '/ai/TARGET_ARCHITECTURE' },
          ],
        },
        {
          text: 'Migracija',
          items: [
            { text: 'Strategija migracije', link: '/ai/MIGRATION_STRATEGY' },
            { text: 'Matrica pariteta funkcionalnosti', link: '/ai/FEATURE_PARITY_MATRIX' },
          ],
        },
        {
          text: 'Upravljanje projektom',
          items: [
            { text: 'Zapisnik odluka', link: '/ai/DECISION_LOG' },
            { text: 'Poznati rizici', link: '/ai/KNOWN_RISKS' },
            { text: 'Otvorena pitanja', link: '/ai/OPEN_QUESTIONS' },
          ],
        },
      ],
    },

    outline: {
      level: [2, 3],
      label: 'Na ovoj stranici',
    },

    docFooter: {
      prev: 'Prethodno',
      next: 'Sljedeće',
    },

    lastUpdatedText: 'Zadnje ažurirano',
    returnToTopLabel: 'Povratak na vrh',
    sidebarMenuLabel: 'Izbornik',
    darkModeSwitchLabel: 'Izgled',
    lightModeSwitchTitle: 'Svijetli način',
    darkModeSwitchTitle: 'Tamni način',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Pretraži dokumentaciju', buttonAriaLabel: 'Pretraži dokumentaciju' },
          modal: {
            noResultsText: 'Nema rezultata za',
            resetButtonTitle: 'Poništi pretragu',
            footer: { selectText: 'odaberi', navigateText: 'kreći se', closeText: 'zatvori' },
          },
        },
      },
    },

    footer: {
      message: 'Razvojna i projektna dokumentacija Expo migracije.',
      copyright: 'SvamPlus',
    },
  },

  mermaid: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#E7EDEA',
      primaryTextColor: '#213330',
      primaryBorderColor: '#496C60',
      lineColor: '#496C60',
      secondaryColor: '#DCE6E1',
      tertiaryColor: '#F4F7F6',
    },
  },
})
