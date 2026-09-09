---
title: Wrapping and Ellipsis
---

```js chart-editor
// <block:setup:3>
const data = [
  {name: 'North America', value: 24},
  {name: 'South America', value: 18},
  {name: 'Europe', value: 10},
  {name: 'Africa', value: 30},
  {name: 'Asia', value: 44},
  {name: 'Oceania', value: 8},
];
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Labels wrapped to the box, and cut with an ellipsis when they still do not fit'
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
    datasets: [{
      data,
      key: 'value',
      spacing: 1,
      borderWidth: 1,
      borderColor: 'rgba(80,110,140,1)',
      backgroundColor: 'rgba(150,190,220,0.55)',
      labels: {
        display: true,
        wrap: true,
        overflow: 'ellipsis',
        align: 'center',
        formatter: (ctx) => [ctx.raw._data.name, ctx.raw.v + ' units']
      }
    }]
  },
  options: options
};

// </block:config>

module.exports = {
  config,
};
```

`wrap` breaks each line to the width of the box. `overflow: 'ellipsis'` keeps
the lines that fit and marks the cut, both on a line too wide and on the last
line kept when there were more below it.

`textAlign` is a separate option from `align`: `align` places the block of text
in the box, `textAlign` places each line within the block.
