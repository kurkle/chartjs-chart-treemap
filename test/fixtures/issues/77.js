const tree = [
  {
    p1: '/etc',
    p2: 'passwd',
    value: 1000
  },
  {
    p1: '/etc',
    p2: 'shadow',
    value: 5
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
        spacing: 20,
        borderWidth: 1,
        backgroundColor: (ctx) => ctx.index === 2 ? 'red' : 'rgba(0,0,0,0.5)',
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
