# Using Datalabels plugin

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
  const color = 'purple';
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
        borderColor: (ctx) => colorFromRaw(ctx, true),
        borderWidth: 1,
        spacing: 0,
        backgroundColor: (ctx) => colorFromRaw(ctx),
        datalabels: {
          display: 'auto',
          anchor: 'start',
          align: 45,
          formatter: (value) => Math.trunc(value.v),
          color: 'white',
          font: {
            size: 20
          }
        }
      }
    ],
  },
  options: {
    plugins: {
      datalabels: {
        display: true,
      }
    }
  }
};

// </block:config>

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.tree = Utils.numbers(NUMBER_CFG);
      });
      chart.update();
    }
  },
];

module.exports = {
  actions,
  config,
};
```
