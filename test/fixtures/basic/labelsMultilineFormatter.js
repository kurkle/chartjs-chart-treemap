export default {
  tolerance: 0.0060,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          align: 'left',
          position: 'top',
          formatter(ctx) {
            return ctx.type === 'data' ? ['The value is', ctx.raw.v + ''] : [];
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
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
