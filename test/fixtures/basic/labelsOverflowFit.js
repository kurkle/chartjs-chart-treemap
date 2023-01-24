export default {
  tolerance: 0.0060,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 6, 4, 4, 2, 1, 1, 1, 1, 1, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          overflow: 'fit',
          font: {
            size: 64
          }
        }
      }]
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
