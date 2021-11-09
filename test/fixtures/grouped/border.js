const data = [
  {category: 'main', value: 1},
  {category: 'main', value: 2},
  {category: 'main', value: 3},
  {category: 'other', value: 4},
  {category: 'other', value: 5},
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category'],
        borderWidth: {top: 10, left: 5, right: 15, bottom: 20},
        captions: {
          color: 'transparent'
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
