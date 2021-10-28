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
          formatter(ctx) {
            return ctx.type === 'data' ? ctx.raw.v : '';
          }
        }
      }]
    },
    options: {
      layout: {
        padding: 20
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
