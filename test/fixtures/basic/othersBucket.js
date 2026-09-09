// The bucket's own case: a few large items and a long tail of small ones. The
// tail is 20 items of 1 against a total of 260, so each is below 1% and none
// would be readable on its own.
const data = [
  {name: 'alpha', value: 100},
  {name: 'beta', value: 80},
  {name: 'gamma', value: 60},
  ...Array.from({length: 20}).map((_, i) => ({name: 'tail ' + i, value: 1})),
];

export default {
  tolerance: 0.0080,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data,
        key: 'value',
        others: {threshold: 0.01},
        backgroundColor: (ctx) => ctx.raw && ctx.raw.isOthers ? 'lightGreen' : 'lightBlue',
        borderColor: 'darkBlue',
        borderWidth: 1,
        labels: {
          display: true,
          formatter: (ctx) => ctx.raw.isOthers
            ? [ctx.raw._data.label, ctx.raw._data.others.length + ' items']
            : ctx.raw._data.name
        }
      }]
    },
    options: {
      events: []
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
