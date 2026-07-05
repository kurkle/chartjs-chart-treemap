import mdx from '@astrojs/mdx'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./docs/styles/starlight.css'],
      description: 'Chart.js module for creating treemap charts',
      favicon: '/favicon.ico',
      sidebar: [
        {
          items: [
            { label: 'Getting Started', link: '/' },
            { label: 'Integration', link: '/integration/' },
            { label: 'Usage', link: '/usage/' },
          ],
          label: 'Guide',
        },
        {
          items: [
            { label: 'Basic', link: '/samples/basic/' },
            { label: 'Labels', link: '/samples/labels/' },
            { label: 'Fonts and Colors', link: '/samples/labelsfontsandcolors/' },
            { label: 'Groups', link: '/samples/groups/' },
            { label: 'Missing Groups', link: '/samples/missinggroups/' },
            { label: 'Tree', link: '/samples/tree/' },
            { label: 'Captions', link: '/samples/captions/' },
            { label: 'Dividers', link: '/samples/dividers/' },
            { label: 'Display Mode', link: '/samples/displaymode/' },
            { label: 'RTL', link: '/samples/rtl/' },
            { label: 'Datalabels', link: '/samples/datalabels/' },
            { label: 'Zoom', link: '/samples/zoom/' },
          ],
          label: 'Samples',
        },
        {
          items: [
            {
              attrs: { rel: 'noopener noreferrer', target: '_blank' },
              label: 'Awesome Chart.js',
              link: 'https://github.com/chartjs/awesome',
            },
            {
              label: 'chartjs-chart-matrix',
              link: 'https://chartjs-chart-matrix.pages.dev/',
            },
            {
              label: 'chartjs-chart-sankey',
              link: 'https://chartjs-chart-sankey.pages.dev/',
            },
            {
              label: 'chartjs-plugin-autocolors',
              link: 'https://github.com/kurkle/chartjs-plugin-autocolors',
            },
            {
              label: 'chartjs-plugin-gradient',
              link: 'https://github.com/kurkle/chartjs-plugin-gradient',
            },
          ],
          label: 'Ecosystem',
        },
      ],
      social: [
        {
          href: 'https://github.com/kurkle/chartjs-chart-treemap',
          icon: 'github',
          label: 'GitHub',
        },
      ],
      title: 'chartjs-chart-treemap',
    }),
    mdx(),
  ],
  outDir: './dist/docs',
  publicDir: './docs/public',
  site: 'https://chartjs-chart-treemap.pages.dev',
})
