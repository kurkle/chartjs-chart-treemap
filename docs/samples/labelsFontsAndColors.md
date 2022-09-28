# Fonts and colors

```js chart-editor
// <block:setup:1>
const DATA = [
  {
    what: 'Apples',
    value: 98,
    color: 'rgb(191, 77, 114)'
  },
  {
    what: 'Orange',
    value: 75,
    color: 'rgb(228, 148, 55)'
  },
  {
    what: 'Lime',
    value: 69,
    color: 'rgb(147, 119, 214)'
  },
  {
    what: 'Grapes',
    value: 55,
    color: 'rgb(80, 134, 55)'
  },
  {
    what: 'Apricots',
    value: 49,
    color: 'rgb(90, 97, 110)'
  },
  {
    what: 'Blackberries',
    value: 35,
    color: 'rgb(34, 38, 82)'
  }
];

// </block:setup>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [
      {
        label: 'Fruits',
        tree: DATA,
        key: 'value',
        borderWidth: 0,
        borderRadius: 6,
        spacing: 1,
        backgroundColor(ctx) {
          if (ctx.type !== 'data') {
            return 'transparent';
          }
          return ctx.raw._data.color;
        },
        labels: {
          align: 'left',
          display: true,
          formatter(ctx) {
            if (ctx.type !== 'data') {
              return;
            }
            return [ctx.raw._data.what, 'Value is ' + ctx.raw.v];
          },
          color: ['white', 'whiteSmoke'],
          font: [{size: 20, weight: 'bold'}, {size: 12}],
          position: 'top'
        }
      }
    ],
  },
  options: {
    events: [],
    plugins: {
      title: {
        display: true,
        text: 'Different fonts and colors on labels'
      },
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  }
};

// </block:config>

module.exports = {
  config
};
```
