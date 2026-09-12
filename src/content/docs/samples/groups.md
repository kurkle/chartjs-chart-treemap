---
title: Groups
---

```js chart-editor
// <block:setup:1>
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
      groups: ['region'],
      spacing: 1,
      borderWidth: 0.5,
      borderColor: 'rgba(200,200,200,1)',
      backgroundColor: 'rgba(220,230,220,0.3)',
      hoverBackgroundColor: 'rgba(220,230,220,0.5)',
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: (ctx) => 'US area by ' + ctx.chart.data.datasets[0].groups.join(' / ')
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
      path: 'data.datasets.0.groups',
      control: 'radio',
      label: 'Group by',
      values: [
        {value: [], label: 'None'},
        {value: ['region'], label: 'Region'},
        {value: ['region', 'division'], label: 'Region / Division'},
        {value: ['region', 'division', 'state'], label: 'Region / Division / State'},
      ]
    }
  ]
};
```
