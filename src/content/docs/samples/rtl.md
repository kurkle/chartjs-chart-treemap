---
title: RTL
---

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 2, max: 40};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// </block:setup>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: Data.statsByState,
      key: 'area',
      groups: ['state'],
      spacing: -0.5,
      borderWidth: 0.5,
      borderColor: 'rgba(200,200,200,1)',
      hoverBackgroundColor: 'rgba(220,230,220,0.5)',
      rtl: false
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: (ctx) => 'RTL: ' + !!ctx.chart.data.datasets[0].rtl
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title(items) {
            return capitalizeFirstLetter(items[0].dataset.key);
          },
          label(item) {
            const dataItem = item.raw;
            const obj = dataItem._data;
            const label = obj.state || obj.division || obj.region;
            return label + ': ' + dataItem.v;
          }
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
      path: 'data.datasets.0.rtl',
      values: [false, true],
      control: 'checkbox',
      label: 'RTL'
    }
  ]
};
```
