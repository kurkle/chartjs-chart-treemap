---
title: Value Scales
---

```js chart-editor
// <block:setup:3>
// One dominant value and a handful of small ones: the shape that makes a
// treemap useless without help.
const data = [
  {name: 'BTC', price: 134500},
  {name: 'ETX', price: 20},
  {name: 'XRP', price: 6},
  {name: 'DGE', price: 6},
  {name: 'TRD', price: 0.4},
];

const dataset = (scale, region, color) => ({
  label: scale,
  data,
  key: 'price',
  valueScale: scale,
  region,
  spacing: 1,
  borderWidth: 1,
  borderColor: color,
  backgroundColor: color + '55',
  labels: {
    display: true,
    formatter: (ctx) => ctx.raw._data.name
  }
});
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'The same data as linear, sqrt and log'
    },
    legend: {
      display: false
    },
  }
};
// </block:options>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [
      dataset('linear', {width: 1 / 3}, '#2a6f97'),
      dataset('sqrt', {left: 1 / 3, width: 1 / 3}, '#468faf'),
      dataset('log', {left: 2 / 3, width: 1 / 3}, '#61a5c2'),
    ]
  },
  options: options
};

// </block:config>

module.exports = {
  config,
};
```

Left to right: `linear`, `sqrt` and `log`, drawn side by side with `region`.
Only the first is proportional to value, and only the first hides four of the
five items.

`v`, the tooltips, the labels and `sumKeys` stay in the units the data came in
whatever the scale.
