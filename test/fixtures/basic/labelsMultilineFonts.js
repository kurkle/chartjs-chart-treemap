export default {
  tolerance: 0.0400,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [16, 16, 14, 13, 12, 12],
        backgroundColor: 'red',
        labels: {
          display: true,
          align: 'left',
          position: 'top',
          font: () => [{size: 24}, {size: 12}],
          formatter(ctx) {
            return ctx.type === 'data' ? ['The value is', ctx.raw.v + '', 'The value is', ctx.raw.v + ''] : [];
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
