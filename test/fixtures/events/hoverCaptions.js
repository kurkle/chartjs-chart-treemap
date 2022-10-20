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
  tolerance: 0.0040,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        tree: data,
        key: 'value',
        groups: ['category', 'subcategory', 'value'],
        backgroundColor: 'red',
        hoverBackgroundColor: 'green',
        captions: {
          hoverColor: 'white',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }]
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    run: (chart) => {
      const elem = chart.getDatasetMeta(0).data[0];
      return triggerMouseEvent(chart, 'mousemove', elem.tooltipPosition());
    }
  }
};
