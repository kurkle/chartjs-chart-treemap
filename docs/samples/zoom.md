# Using Zoom plugin

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 2, max: 40};
// </block:setup>

// <block:utils:2>
function colorFromRaw(ctx, border) {
  if (ctx.type !== 'data') {
    return 'transparent';
  }
  const value = ctx.raw.v;
  let alpha = (1 + Math.log(value)) / 5;
  const color = 'orange';
  if (border) {
    alpha += 0.01;
  }
  return helpers.color(color)
    .alpha(alpha)
    .rgbString();
}
// </block:utils>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [
      {
        label: 'My First dataset',
        tree: Utils.numbers(NUMBER_CFG),
        borderWidth: 0,
        backgroundColor: (ctx) => colorFromRaw(ctx),
        labels: {
          display: true,
          formatter: (ctx) => ctx.raw.v.toFixed(2),
          font: {
            size: 16
          },
          overflow: 'hidden'
        }
      }
    ],
  },
  options: {
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          }
        },
        pan: {
          enabled: true,
        }
      }
    }
  }
};

// </block:config>

const actions = [
  {
    name: 'Reset zoom',
    handler(chart) {
      chart.resetZoom();
    }
  },
];

module.exports = {
  actions,
  config,
};
```
