# Tree

```js chart-editor
// <block:options:1>
const options = {
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
};
// </block:options>

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
  options
};
// </block:config>

function toggle(chart) {
  const dataset = chart.data.datasets[0];
  if (dataset.groups.length) {
    dataset.groups = [];
  } else {
    dataset.groups = [0, 1];
    dataset.groups.push('name');
  }
  chart.update();
}

const actions = [
  {
    name: 'Toggle GroupBy',
    handler: (chart) => toggle(chart)
  }
];

module.exports = {
  actions,
  config,
};
```
