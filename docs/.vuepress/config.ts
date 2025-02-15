import * as path from 'path';
import { DefaultThemeConfig, defineConfig, PluginTuple } from 'vuepress/config';

export default defineConfig({
    title: 'chartjs-chart-treemap',
    description: 'Chart.js module for creating treemap charts',
    theme: 'chartjs',
    //base: '',
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
    ] as PluginTuple[],
    chainWebpack: (config) => {
      config.module
        .rule('chart.js')
        .include.add(path.resolve('node_modules/chart.js')).end()
        .use('babel-loader')
        .loader('babel-loader')
        .options({
          presets: ['@babel/preset-env']
        })
        .end();
      config.merge({
        resolve: {
          alias: {
            // Hammerjs requires window, using ng-hammerjs instead
            'hammerjs': 'ng-hammerjs',
          }
        }
      });
    },
    themeConfig: {
      repo: 'kurkle/chartjs-chart-treemap',
      logo: '/favicon.ico',
      lastUpdated: 'Last Updated',
      searchPlaceholder: 'Search...',
      editLinks: false,
      docsDir: 'docs',
      chart: {
        imports: [
          ['scripts/register.js', 'Register'],
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
          'displayMode',
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
    } as DefaultThemeConfig
  });
