const longCategory1 = 'This is a long category name that should be truncated';
const longCategory2 = 'This is another long category name that should be truncated';
const longSubcategory1 = 'This is a long subcategory name that should be truncated';
const longSubcategory2 = 'This is another long subcategory name that should be truncated';

const data = [
  {category: longCategory1, subcategory: longSubcategory1, value: 1},
  {category: longCategory1, subcategory: longSubcategory1, value: 5},
  {category: longCategory1, subcategory: longSubcategory1, value: 3},
  {category: longCategory1, subcategory: longSubcategory2, value: 2},
  {category: longCategory1, subcategory: longSubcategory2, value: 1},
  {category: longCategory1, subcategory: longSubcategory2, value: 8},
  {category: longCategory2, subcategory: longSubcategory1, value: 4},
  {category: longCategory2, subcategory: longSubcategory1, value: 5},
  {category: longCategory2, subcategory: longSubcategory2, value: 4},
  {category: longCategory2, subcategory: longSubcategory2, value: 1},
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
        },
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
