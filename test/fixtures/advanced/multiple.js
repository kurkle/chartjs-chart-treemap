export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data: [1, 2, 3, 3],
        backgroundColor: 'red',
        yAxisID: 'y'
      }, {
        data: [2, 3, 4, 4],
        backgroundColor: 'green',
        yAxisID: 'y2',
      }, {
        data: [3, 4, 5, 5],
        backgroundColor: 'blue',
        yAxisID: 'y3',
      }]
    },
    options: {
      events: [],
      spacing: 4,
      scales: {
        x: {position: 'bottom'},
        y: {position: 'left', stack: 'y'},
        y2: {position: 'left', stack: 'y'},
        y3: {position: 'left', stack: 'y'},
      }
    }
  },
  options: {
    canvas: {
      height: 768,
      width: 512
    }
  }
};
