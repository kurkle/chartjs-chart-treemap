const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'one', value: 5},
  {category: 'main', subcategory: 'one', value: 3},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'main', subcategory: 'two', value: 1},
  {category: 'main', subcategory: 'two', value: 8},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'one', value: 5},
  {category: 'other', subcategory: 'two', value: 4},
  {category: 'other', subcategory: 'two', value: 1},
];

export default {
  tolerance: 0.0050,
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
          padding: 10,
          formatter(ctx) {
            return ctx.type === 'data' ? 'G: ' + ctx.raw.g : '';
          }
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
