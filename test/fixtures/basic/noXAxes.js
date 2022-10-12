export default {
  tolerance: 0.0320,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          formatter({chart, datasetIndex}) {
            const meta = chart.getDatasetMeta(datasetIndex);
            return 'x: ' + meta.xScale.id + ', y: ' + meta.yScale.id;
          }
        }
      }]
    },
    options: {
      events: [],
      scales: {
        a: {
          type: 'linear',
          display: false,
          axis: 'y'
        },
        b: {
          type: 'linear',
          display: false,
          axis: 'y'
        },
      }
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
