---
title: Other Bucket
---

```js chart-editor
// <block:setup:3>
const data = [
  {name: 'alpha', value: 100},
  {name: 'beta', value: 80},
  {name: 'gamma', value: 60},
  ...Array.from({length: 20}).map((_, i) => ({name: 'tail ' + (i + 1), value: 1})),
];
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Twenty items too small to read, as one tile'
    },
    legend: {
      display: false
    },
  }
};
// </block:options>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      data,
      key: 'value',
      others: {threshold: 0.01},
      spacing: 1,
      borderWidth: 1,
      borderColor: 'rgba(90,120,90,1)',
      backgroundColor: (ctx) => ctx.raw && ctx.raw.isOthers
        ? 'rgba(160,200,140,0.8)'
        : 'rgba(170,200,220,0.6)',
      labels: {
        display: true,
        formatter: (ctx) => ctx.raw.isOthers
          ? [ctx.raw._data.label, ctx.raw._data.others.length + ' items']
          : ctx.raw._data.name
      }
    }]
  },
  options: options
};

// </block:config>

module.exports = {
  config,
};
```

Each of the twenty tail items is below one percent of the total, so they are
replaced by a single tile. Its node carries `isOthers` and `_data.others`, the
items it absorbed, so a formatter or a tooltip can list them.

This and [Value Scales](/samples/valuescales/) are alternatives: the threshold
is measured against the scaled weight, so a compressing scale can leave nothing
to bucket.
