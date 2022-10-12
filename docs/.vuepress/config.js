const path = require('path');

module.exports = {
    title: 'chartjs-chart-treemap',
    description: 'Chart.js module for creating treemap charts',
    theme: 'chartjs',
    base: '',
    dest: path.resolve(__dirname, '../../dist/docs'),
    head: [
      ['link', {rel: 'icon', href: '/favicon.ico'}],
    ],
    plugins: [
      ['flexsearch'],
      ['redirect', {
        redirectors: [
          // Default sample page when accessing /samples.
          {base: '/samples', alternative: ['basic']},
        ],
      }],
    ],
    themeConfig: {
      repo: 'kurkle/chartjs-chart-treemap',
      logo: '/favicon.ico',
      lastUpdated: 'Last Updated',
      searchPlaceholder: 'Search...',
      editLinks: false,
      docsDir: 'docs',
      chart: {
        imports: [
          ['scripts/register.js'],
          ['scripts/data.js', 'Data'],
          ['scripts/utils.js', 'Utils'],
          ['scripts/helpers.js', 'helpers'],
        ]
      },
      nav: [
        {text: 'Home', link: '/'},
        {text: 'Samples', link: `/samples/`},
        {
          text: 'Ecosystem',
          ariaLabel: 'Community Menu',
          items: [
            { text: 'Awesome', link: 'https://github.com/chartjs/awesome' },
          ]
        }
      ],
      sidebar: {
        '/samples/': [
          'basic',
          'labels',
          'labelsFontsAndColors',
          'groups',
          'tree',
          'captions',
          'dividers',
          'rtl',
          'datalabels',
          'zoom'
        ],
        '/': [
          '',
          'integration',
          'usage'
        ],
      }
    }
  };
