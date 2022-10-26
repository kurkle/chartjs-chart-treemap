const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'one', value: 2},
  {category: 'main', subcategory: 'one', value: 3},
  {category: 'main', subcategory: 'two', value: 5},
  {category: 'main', subcategory: 'two', value: 1},
  {category: 'main', subcategory: 'two', value: 1},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'one', value: 5},
  {category: 'other', subcategory: 'two', value: 2},
  {category: 'other', subcategory: 'two', value: 6},
];

export default {
  tolerance: 0.0040,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['category', 'subcategory', 'value'],
        backgroundColor: 'lightGreen',
        borderWidth: 1,
        captions: {
          align: 'center'
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
      events: [],
      elements: {
        treemap: {
          captions: {
            display: false
          }
        }
      }
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
