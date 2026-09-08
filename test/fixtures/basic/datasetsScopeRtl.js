// The same chart as basic-rtl, with `rtl` moved from the dataset to
// `options.datasets.treemap`. It shares that fixture's reference image, so a
// difference between the two scopes fails this test.
export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red'
      }]
    },
    options: {
      datasets: {
        treemap: {
          rtl: true
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
