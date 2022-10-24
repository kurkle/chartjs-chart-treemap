export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        borderWidth: 10,
        borderColor: 'black'
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
    },
    run(chart) {
      chart.data.datasets[0].tree = [1, 2, 3];
      chart.update();
    }
  }
};
