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
        color: 'transparent',
        groupDividers: true,
        dividerDash: [3, 5],
        dividerWidth: 2,
        borderWidth: 1,
        borderColor: '#777'
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
