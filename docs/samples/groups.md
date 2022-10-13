# Groups

```js chart-editor
// <block:setup:3>
const GROUPS = ['region'];

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
    name: 'Toggle Region',
    handler: (chart) => toggle(chart, 'region')
  },
  {
    name: 'Toggle Division',
    handler: (chart) => toggle(chart, 'division')
  },
  {
    name: 'Toggle State',
    handler: (chart) => toggle(chart, 'state')
  },
];

module.exports = {
  actions,
  config,
};
```
