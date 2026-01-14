import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SupDino',
  tagline: 'Master algorithms, mathematics, and distributed systems - your comprehensive guide to computational thinking and system design',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://supdino.com',
  baseUrl: '/',

  organizationName: 'supdino',
  projectName: 'supdino',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/l00pss/supdino/tree/main/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/l00pss/supdino/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/supdino-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'light',
    },
    navbar: {
      title: 'SupDino',
      logo: {
        alt: 'SupDino Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Articles',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          type: 'search',
          position: 'left',
        },
        {
          href: 'https://github.com/l00pss/supdino',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'html',
          position: 'right',
          value: '<a href="https://www.buymeacoffee.com/l00pss" target="_blank" rel="noopener noreferrer" class="navbar-buymeacoffee">☕ Buy me a coffee</a>',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Algorithms',
              to: '/docs/algorithms/intro',
            },
            {
              label: 'Mathematics',
              to: '/docs/mathematics/intro',
            },
            {
              label: 'Distributed Systems',
              to: '/docs/distributed-systems/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/l00pss/supdino',
            },
            {
              label: 'Contribute',
              href: 'https://github.com/l00pss/supdino/blob/main/CONTRIBUTING.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SupDino. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['go', 'bash', 'json'],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

