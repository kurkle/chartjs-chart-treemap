// Four datasets in a 2x2 grid of regions.
const cell = (n) => Array.from({length: 4}).map((_, i) => ({value: (i + 1) * n}));

export default {
  tolerance: 0.0080,
  config: {
    type: 'treemap',
    data: {
      datasets: [
        {data: cell(1), key: 'value', region: {height: 0.5, width: 0.5}, backgroundColor: 'lightBlue', borderColor: 'navy', borderWidth: 1},
        {data: cell(2), key: 'value', region: {height: 0.5, left: 0.5, width: 0.5}, backgroundColor: 'lightGreen', borderColor: 'green', borderWidth: 1},
        {data: cell(3), key: 'value', region: {height: 0.5, top: 0.5, width: 0.5}, backgroundColor: 'lightPink', borderColor: 'crimson', borderWidth: 1},
        {data: cell(4), key: 'value', region: {height: 0.5, left: 0.5, top: 0.5, width: 0.5}, backgroundColor: 'lightYellow', borderColor: 'goldenrod', borderWidth: 1}
      ]
    },
    options: {
      events: []
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
