---
title: Outlining Groups
---

```js chart-editor
// <block:setup:3>
const GROUPS = ['region', 'division'];

// Group containers are the nodes with a level; leaves have none.
const isContainer = (ctx) => ctx.raw && ctx.raw.l < GROUPS.length - 1;
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'US area, group containers outlined'
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
      data: Data.statsByState,
      key: 'area',
      groups: GROUPS,
      spacing: 1,
      captions: {
        display: true,
      },
      borderWidth: (ctx) => isContainer(ctx) ? 3 : 0.5,
      borderColor: (ctx) => isContainer(ctx)
        ? 'rgba(60,80,110,1)'
        : 'rgba(200,200,200,1)',
      backgroundColor: 'rgba(220,230,220,0.3)',
      hoverBackgroundColor: 'rgba(220,230,220,0.5)',
    }]
  },
  options: options
};

// </block:config>

module.exports = {
  config,
};
```
