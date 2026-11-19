---
title: Hierarchy Colors
---

```js chart-editor
// <block:setup:1>
const GROUPS = ['region', 'division', 'code'];

const regionColors = {
  Midwest: '#4363d8',
  Northeast: '#469990',
  South: '#9A6324',
  West: '#f58231',
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      data: Data.statsByState,
      key: 'population',
      groups: GROUPS,
      spacing: 2,
      borderWidth: 0.5,
      borderColor: 'rgba(160,160,160,0.5)',
      // `l` is the level of a node in `groups`. A node knows its own value `v` and
      // the total of the nodes it is laid out with, `gs`, so `v / gs` is its share of
      // its parent.
      backgroundColor(ctx) {
        if (ctx.type !== 'data') {
          return 'transparent';
        }
        const node = ctx.raw;
        if (node.l === 0) {
          return regionColors[node.g] || '#e6beff';
        }
        if (node.l === 1) {
          return helpers.color('white').alpha(0.3).rgbString();
        }
        const share = node.v / node.gs;
        return helpers.color('green').alpha(share / 2 + 0.5).rgbString();
      },
      hoverBackgroundColor: '#F0B90B',
      labels: {
        display: true,
        color: '#FFF',
        font: {size: 8, weight: 'bold'},
        formatter: (ctx) => ctx.raw.l === GROUPS.length - 1 ? ctx.raw.g : '',
      },
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'US population by region / division / state'
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label(item) {
            return item.parsed.g + ': ' + item.parsed.v.toLocaleString();
          }
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  config,
};
```

A scriptable `backgroundColor` can colour each level of the hierarchy by its own
rule: a category colour for the regions, a faint tint for the divisions, and for
the states an opacity that follows their share of the division.

`ctx.raw` is the node, with `l` its level, `g` its group, `v` its value and `gs`
the total of the nodes in its group.
