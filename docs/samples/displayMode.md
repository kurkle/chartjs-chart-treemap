# Display Mode

```js chart-editor
// <block:setup:3>
let DISPLAY_MODE = 'containerBoxes';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// </block:setup>

// <block:options:2>
const options = {
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
};
// </block:options>

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
        if (DISPLAY_MODE === 'containerBoxes') {
          return 'rgba(220,230,220,0.3)';
        }
        return ctx.raw.l ? 'rgb(220,230,220)' : 'lightgray';
      },
      displayMode: DISPLAY_MODE,
      captions: {
        padding: 6,
      },
    }]
  },
  options: options
};

// </block:config>
function toggle(chart, mode) {
  const dataset = {...config.data.datasets[0], displayMode: mode};
  DISPLAY_MODE = mode;
  chart.data.datasets = [dataset];
  chart.update();
}

const actions = [
  {
    name: 'Container Boxes',
    handler: (chart) => toggle(chart, 'containerBoxes')
  },
  {
    name: 'Header Boxes',
    handler: (chart) => toggle(chart, 'headerBoxes')
  },
];

module.exports = {
  actions,
  config,
};
```
