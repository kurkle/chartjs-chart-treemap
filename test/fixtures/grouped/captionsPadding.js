const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'one', value: 4},
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'main', subcategory: 'two', value: 6},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'one', value: 5},
  {category: 'other', subcategory: 'two', value: 2},
  {category: 'other', subcategory: 'two', value: 7},
];

export default {
  tolerance: 0.0039,
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
          padding: 10
        },
        labels: {
          display: true,
          formatter(ctx) {
            return ctx.type === 'data' ? ctx.raw.v + '' : '';
          }
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
