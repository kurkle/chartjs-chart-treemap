export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          overflow: 'cut',
          formatter: (ctx) => ('value is ' + ctx.raw.v + ',').repeat(8).split(',')
        }
      }]
    },
    options: {
      layout: {
        padding: {
          bottom: 10
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
