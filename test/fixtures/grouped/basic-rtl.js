const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'main', subcategory: 'free', value: 3},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'two', value: 5},
];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category', 'subcategory'],
        rtl: true,
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
