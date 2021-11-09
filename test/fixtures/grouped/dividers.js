const data = [
  {category: 'main', value: 1},
  {category: 'main', value: 2},
  {category: 'other', value: 4},
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category'],
        borderWidth: 1,
        borderColor: '#777',
        dividers: {
          display: true,
          lineDash: [3, 5],
          lineWidth: 2,
        }
      }]
    },
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
