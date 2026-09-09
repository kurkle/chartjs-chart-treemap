---
title: Regions
---

```js chart-editor
// <block:setup:3>
const gainers = [
  {name: 'AAA', change: 12},
  {name: 'BBB', change: 8},
  {name: 'CCC', change: 5},
  {name: 'DDD', change: 3},
];
const losers = [
  {name: 'EEE', change: 10},
  {name: 'FFF', change: 7},
  {name: 'GGG', change: 4},
  {name: 'HHH', change: 2},
];
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Gainers and losers, meeting in the middle'
    },
    legend: {
      display: false
    },
  }
};
// </block:options>

// <block:config:0>
const label = {
  display: true,
  formatter: (ctx) => [ctx.raw._data.name, ctx.raw.v + '%']
};

const config = {
  type: 'treemap',
  data: {
    datasets: [
      {
        label: 'Gainers',
        data: gainers,
        key: 'change',
        region: {width: 0.5},
        rtl: true,
        spacing: 1,
        borderWidth: 1,
        borderColor: 'rgba(60,130,80,1)',
        backgroundColor: 'rgba(140,200,150,0.7)',
        labels: label
      },
      {
        label: 'Losers',
        data: losers,
        key: 'change',
        region: {left: 0.5, width: 0.5},
        spacing: 1,
        borderWidth: 1,
        borderColor: 'rgba(160,70,80,1)',
        backgroundColor: 'rgba(230,160,165,0.7)',
        labels: label
      }
    ]
  },
  options: options
};

// </block:config>

module.exports = {
  config,
};
```

Each dataset owns half the chart area. The gainers run right to left and the
losers left to right, so the largest of each meet in the middle.

Hovering finds only the dataset whose region you pointed at.
