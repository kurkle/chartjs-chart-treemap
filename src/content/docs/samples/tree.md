---
title: Tree
---

```js chart-editor
// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: Data.objectsTree,
      treeLeafKey: 'name',
      key: 'value',
      groups: [],
      spacing: 1,
      borderWidth: 0.5,
      borderColor: '#FF8F00',
      backgroundColor: 'rgba(255,167,38,0.3)',
      hoverBackgroundColor: 'rgba(238,238,238,0.5)',
      captions: {
        align: 'center'
      },
      labels: {
        display: true,
        formatter: (ctx) => {
          return ctx.raw.v;
        }
      }
    }]
  },
  options: {
    plugins: {
      title: {
        display: true
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title(items) {
            const dataItem = items[0].raw;
            const obj = dataItem._data;
            return obj.name;
          },
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  config,
  choices: [
    {
      path: 'data.datasets.0.groups',
      control: 'radio',
      label: 'Group by',
      values: [
        {value: [], label: 'Flat'},
        {value: [0, 1, 'name'], label: 'Grouped'},
      ]
    }
  ]
};
```
