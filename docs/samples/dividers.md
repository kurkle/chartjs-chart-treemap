# Dividers

```js chart-editor
// <block:setup:3>
const data = [
  {category: 'main', value: 1},
  {category: 'main', value: 2},
  {category: 'main', value: 3},
  {category: 'other', value: 4},
  {category: 'other', value: 5},
];
// </block:setup>

// <block:options:2>
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Using dividers'
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
      tree: data,
      key: 'value',
      groups: ['category'],
      borderWidth: 1,
      borderColor: 'rgba(200,200,200,1)',
      backgroundColor: 'rgba(220,230,220,0.3)',
      hoverBackgroundColor: 'rgba(220,230,220,0.5)',
      dividers: {
        display: true,
        lineDash: [3, 5],
        lineWidth: 2,
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
