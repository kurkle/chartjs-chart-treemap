// The block is left-aligned in the rect, the lines are right-aligned inside the
// block. Ragged-left text hugging the left edge is only possible when the two
// alignments are separate options (#134).
export default {
  tolerance: 0.0030,
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
          textAlign: 'right',
          formatter: (ctx) => ['value', ctx.raw.v + '']
        }
      }]
    },
    options: {
      events: []
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
