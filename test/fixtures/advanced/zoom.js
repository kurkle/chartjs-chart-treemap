export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'green',
        borderColor: 'black',
        borderWidth: 8
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
      chart.scales.x.options.min = 100;
      chart.scales.x.options.max = 400;
      chart.scales.y.options.min = 50;
      chart.scales.y.options.max = 200;
      chart.update();
    }
  }
};
