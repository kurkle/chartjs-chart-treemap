# Captions

```js chart-editor
// <block:setup:3>
const GROUPS = ['region', 'division', 'state'];
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 2, max: 40};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: (ctx) => 'US area by ' + GROUPS.join(' / ')
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
};
// </block:options>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: Data.statsByState,
      key: 'area',
      groups: GROUPS,
      spacing: 1,
      borderWidth: 0.5,
      borderColor: 'rgba(200,200,200,1)',
      backgroundColor: 'rgba(220,230,220,0.3)',
      hoverBackgroundColor: 'rgba(220,230,220,0.5)',
      captions: {
        align: 'center',
        display: true,
        color: 'red',
        font: {
          size: 14,
        },
        hoverFont: {
          size: 16,
          weight: 'bold'
        },
        padding: 5
      },
      labels: {
        display: false,
        overflow: 'hidden'
      }
    }]
  },
  options: options
};
// </block:config>
function toggle(chart) {
  const labels = chart.data.datasets[0].labels;
  labels.display = !labels.display;
  chart.update();
}

const actions = [
  {
    name: 'Toggle labels',
    handler: (chart) => toggle(chart, 'region')
  }
];

module.exports = {
  config,
  actions
};
```
