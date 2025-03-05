const data = [
  {year: '2025', value: 10},
  {year: '2026', quarter: 'Q1', value: 2},
  {year: '2026', quarter: 'Q2', value: 6},
  {year: '2027', quarter: 'Q1', month: 'January', value: 2},
  {year: '2027', quarter: 'Q1', month: 'February', value: 2},
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['year', 'quarter', 'month'],
        spacing: 2,
        borderWidth: 1,
        backgroundColor: (ctx) => ctx.raw.isLeaf ? 'lightblue' : 'darkgray',
        captions: {display: true},
        labels: {display: true},
      }]
    },
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
