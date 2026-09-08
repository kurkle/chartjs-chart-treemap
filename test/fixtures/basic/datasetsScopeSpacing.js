// The same chart as spacing, with `spacing` moved from the dataset to
// `options.datasets.treemap`. It shares that fixture's reference image.
export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'spacing',
        data: [4, 3, 2, 1],
        backgroundColor: 'green'
      }]
    },
    options: {
      datasets: {
        treemap: {
          spacing: 10
        }
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
