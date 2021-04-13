# RTL

```js chart-editor
// <block:setup:3>
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
};
// </block:options>

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
  options: options
};

// </block:config>
function toggle(chart, group) {
  const idx = GROUPS.indexOf(group);
  if (idx === -1) {
    GROUPS.push(group);
  } else {
    GROUPS.splice(idx, 1);
  }
  chart.update();
}

const actions = [
  {
    name: 'Toggle RTL',
    handler: (chart) => {
      chart.data.datasets[0].rtl = !chart.data.datasets[0].rtl;
      chart.update();
    }
  },
];

module.exports = {
  actions,
  config,
};
```
