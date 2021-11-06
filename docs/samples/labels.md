# Labels

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 2, max: 40};

const INTL_NUM_FORMAT = new Intl.NumberFormat('us', {
  style: 'unit',
  unit: 'kilometer',
  unitDisplay: 'short',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1});

// </block:setup>

// <block:utils:2>
function colorFromRaw(ctx) {
  if (ctx.type !== 'data') {
    return 'transparent';
  }
  const value = ctx.raw.v;
  let alpha = (1 + Math.log(value)) / 5;
  const color = 'orange';
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
        borderColor: 'red',
        borderWidth: 0.5,
        spacing: 0,
        backgroundColor: (ctx) => colorFromRaw(ctx),
        labels: {
          align: 'left',
          display: true,
          formatter(ctx) {
            if (ctx.type !== 'data') {
              return;
            }
            return INTL_NUM_FORMAT.format(ctx.raw.v);
          },
          color: 'black',
          font: {
            size: 16,
          },
          hoverFont: {
            size: 24,
            weight: 'bold'
          },
          position: 'center'
        }
      }
    ],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Labelling data'
      },
      legend: {
        display: false
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
