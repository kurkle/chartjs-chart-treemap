export default {
  tolerance: 0.0080,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {display: true, overflow: "ellipsis", formatter: (ctx) => ["a rather long first line " + ctx.raw.v, "second line", "third line", "fourth line"]}
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
