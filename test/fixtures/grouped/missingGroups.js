const data = [
  { component: null, file: 'index.js', folder: './src', value: 6 },
  { component: 'A', file: 'A.js', folder: './src', subFolder: null, value: 8 },
  { component: 'A', file: 'B.js', folder: './src', subFolder: 'nested', value: 4 },
  { component: 'B', file: 'B.js', folder: './src', value: 5 },
  { component: null, file: 'config.js', folder: './scripts', value: 3 },
  { component: 'build', file: 'rollup.js', folder: './scripts', value: 2 },
]

const colors = ['#9ca3af', '#2563eb', '#14b8a6', '#f59e0b']

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [
        {
          tree: data,
          key: 'value',
          groups: ['folder', 'component', 'subFolder', 'file'],
          spacing: 2,
          borderWidth: 1,
          backgroundColor: (ctx) => colors[ctx.raw.l ?? 0],
          borderColor: '#ffffff',
          captions: { display: true },
          labels: { display: true },
        },
      ],
    },
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512,
    },
  },
}
