---
title: Using Datalabels plugin
---

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
        data: Utils.numbers(NUMBER_CFG),
        borderColor: (ctx) => colorFromRaw(ctx, true),
        borderWidth: 1,
        spacing: 0,
        backgroundColor: (ctx) => colorFromRaw(ctx),
        datalabels: {
          display: 'auto',
          anchor: 'start',
          align: 45,
          // In v5 `dataset.data` holds the rows you passed, so the datalabels
          // formatter's first argument is no longer a layout node. Read the
          // node through the controller instead.
          formatter: (_value, ctx) =>
            Math.trunc(ctx.chart.getDatasetMeta(ctx.datasetIndex).controller.getParsed(ctx.dataIndex).v),
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
