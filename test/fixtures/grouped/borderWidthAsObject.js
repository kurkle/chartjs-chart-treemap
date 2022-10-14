const tree = [
  {
    p1: '/etc',
    p2: 'passwd',
    value: 1000
  },
  {
    p1: '/etc',
    p2: 'shadow',
    value: 15
  }
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree,
        groups: ['p1', 'p2'],
        key: 'value',
        borderColor: 'black',
        spacing: 2,
        borderWidth: {
          left: 2,
          right: 4,
          bottom: 6,
          top: 8
        },
        backgroundColor: (ctx) => ctx.index === 0 ? 'green' : 'rgba(255,255,255,0.8)',
      }]
    },
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    spriteText: true
  }
};
