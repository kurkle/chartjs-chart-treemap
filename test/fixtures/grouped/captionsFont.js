const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'one', value: 6},
  {category: 'main', subcategory: 'one', value: 3},
  {category: 'main', subcategory: 'two', value: 5},
  {category: 'main', subcategory: 'two', value: 8},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'other', subcategory: 'one', value: 5},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'two', value: 3},
  {category: 'other', subcategory: 'two', value: 6},
];

export default {
  tolerance: 0.0075,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category', 'subcategory', 'value'],
        backgroundColor: 'lightGreen',
        captions: {
          display: true,
          align: 'center',
          font: {
            size: 20,
            family: 'Courier'
          }
        },
        labels: {
          display: true,
          formatter(ctx) {
            return ctx.type === 'data' ? ctx.raw.v : '';
          }
        }
      }]
    },
    options: {
      events: []
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
