// The data from #213: one price dominates and the rest render sub-pixel.
// The 'linear' fixture is the reported problem, 'log' is the fix.
const data = [
  {price: 134500, name: 'BTC'},
  {price: 20, name: 'ETX'},
  {price: 6, name: 'XRP'},
  {price: 6, name: 'DGE'},
  {price: 0.4, name: 'TRD'},
];

export default {
  tolerance: 0.0080,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data,
        key: 'price',
        valueScale: 'linear',
        backgroundColor: 'lightBlue',
        borderColor: 'darkBlue',
        borderWidth: 1,
        labels: {
          display: true,
          formatter: (ctx) => ctx.raw._data.name
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
