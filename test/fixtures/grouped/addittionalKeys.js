const data = [
  {category: 'main', value: 1, another: 5},
  {category: 'main', value: 2, another: 4},
  {category: 'main', value: 3, another: 0},
  {category: 'other', value: 4, another: 3},
  {category: 'other', value: 5, another: 8},
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category'],
        additionalKeys: ['another'],
        backgroundColor: (ctx) => ctx.raw.vs.another > 10 ? 'red' : 'yellow',
        labels: {
          display: true,
          formatter: (ctx) => [ctx.raw.g, ctx.raw.vs.another + '']
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
