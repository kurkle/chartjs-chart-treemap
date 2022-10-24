export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        borderColor: 'black',
        borderWidth: 5,
        rtl: false
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
      chart.data.datasets[0].rtl = true;
      chart.update();
    }
  }
};
