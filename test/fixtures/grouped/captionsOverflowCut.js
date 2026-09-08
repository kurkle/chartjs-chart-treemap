// Captions gained `overflow`. With 'cut' they are no longer truncated with an
// ellipsis; the clip at the padding is what stops them.
const data = [
  {category: 'a long category name', value: 1},
  {category: 'a long category name', value: 2},
  {category: 'another long one', value: 3},
];

export default {
  tolerance: 0.0060,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data,
        key: 'value',
        groups: ['category'],
        backgroundColor: 'lightGreen',
        captions: {
          display: true,
          overflow: 'cut'
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
