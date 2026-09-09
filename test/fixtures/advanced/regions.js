// #186: a gainers and losers view. The gainers fill the left half right to
// left and the losers the right half left to right, so the largest of each
// meet in the middle. Without regions the two datasets paint over each other.
const gainers = [
  {name: 'AAA', change: 12},
  {name: 'BBB', change: 8},
  {name: 'CCC', change: 5},
  {name: 'DDD', change: 3},
];
const losers = [
  {name: 'EEE', change: 10},
  {name: 'FFF', change: 7},
  {name: 'GGG', change: 4},
];

export default {
  tolerance: 0.0080,
  config: {
    type: 'treemap',
    data: {
      datasets: [
        {
          label: 'Gainers',
          data: gainers,
          key: 'change',
          region: {width: 0.5},
          rtl: true,
          backgroundColor: 'lightGreen',
          borderColor: 'green',
          borderWidth: 1,
          labels: {display: true, formatter: (ctx) => ctx.raw._data.name}
        },
        {
          label: 'Losers',
          data: losers,
          key: 'change',
          region: {left: 0.5, width: 0.5},
          backgroundColor: 'lightPink',
          borderColor: 'crimson',
          borderWidth: 1,
          labels: {display: true, formatter: (ctx) => ctx.raw._data.name}
        }
      ]
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
