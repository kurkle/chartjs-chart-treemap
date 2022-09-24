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
          overflow: 'hidden',
          formatter: (ctx) => ('value is ' + ctx.raw.v).repeat(5)
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
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
