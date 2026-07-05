# Missing Groups

Treemap groups can include missing hierarchy levels. `null`, `undefined`, and empty group values are skipped so each branch continues at the next available group.

```js chart-editor
// <block:setup:2>
const data = [
  { folder: './src', component: null, subFolder: null, file: 'index.js', value: 6 },
  { folder: './src', component: 'A', subFolder: null, file: 'A.js', value: 8 },
  { folder: './src', component: 'A', subFolder: 'nested', file: 'B.js', value: 4 },
  { folder: './src', component: 'B', subFolder: null, file: 'B.js', value: 5 },
  { folder: './scripts', component: null, subFolder: null, file: 'config.js', value: 3 },
  { folder: './scripts', component: 'build', subFolder: null, file: 'rollup.js', value: 2 },
];

const colors = ['#9ca3af', '#2563eb', '#14b8a6', '#f59e0b'];
// </block:setup>

// <block:options:1>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Project coverage by folder path'
    },
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label(item) {
          const raw = item.raw;
          const source = raw._data;
          const label = raw.g || source.file || source.subFolder || source.component || source.folder;
          return label + ': ' + raw.v;
        }
      }
    }
  }
};
// </block:options>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: data,
      key: 'value',
      groups: ['folder', 'component', 'subFolder', 'file'],
      spacing: 2,
      borderWidth: 1,
      borderColor: '#ffffff',
      backgroundColor(ctx) {
        if (ctx.type !== 'data') {
          return 'transparent';
        }
        return colors[ctx.raw.l ?? 0];
      },
      captions: {
        display: true,
        padding: 6
      },
      labels: {
        display: true,
        formatter(ctx) {
          return ctx.raw._data.file || ctx.raw.g;
        }
      }
    }]
  },
  options
};
// </block:config>

module.exports = {
  config,
};
```
