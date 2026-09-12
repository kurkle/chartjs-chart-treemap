---
title: Display Mode
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
      groups: ['division', 'state'],
      spacing: 2,
      borderWidth: 1,
      borderColor: 'rgba(200,200,200,1)',
      backgroundColor: (ctx) => {
        if (ctx.type !== 'data') {
          return 'transparent';
        }
        if (ctx.dataset.displayMode === 'containerBoxes') {
          return 'rgba(220,230,220,0.3)';
        }
        return ctx.raw.l ? 'rgb(220,230,220)' : 'lightgray';
      },
      displayMode: 'containerBoxes',
      captions: {
        padding: 6,
      },
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'US area by division / state'
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
      path: 'data.datasets.0.displayMode',
      values: ['containerBoxes', 'headerBoxes'],
      control: 'radio',
      label: 'Display mode'
    }
  ]
};
```
