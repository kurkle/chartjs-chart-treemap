---
title: Key
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
      data: Data.statsByState,
      key: 'area',
      groups: ['region', 'division', 'state'],
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
        text: (ctx) => 'US ' + ctx.chart.data.datasets[0].key + ' by state'
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
            const node = item.parsed;
            const obj = node._data;
            const label = obj.state || obj.division || obj.region;
            return label + ': ' + node.v.toLocaleString();
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
      path: 'data.datasets.0.key',
      control: 'radio',
      label: 'Key',
      values: [
        {value: 'area', label: 'Area (km²)'},
        {value: 'population', label: 'Population'},
      ]
    }
  ]
};
```

`key` names the property of each row that decides the size of its rectangle.
Changing it on the live dataset and calling `chart.update()` lays the same rows
out again by the new measure; the groups are summed from it, so the regions and
divisions resize with their states.
