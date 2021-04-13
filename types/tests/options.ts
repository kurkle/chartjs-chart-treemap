import '../index.esm';
import { Chart } from 'chart.js';
import { color as colorLib } from 'chart.js/helpers';

function colorFromValue(value: number, border?: boolean) {
  let alpha = (1 + Math.log(value)) / 5;
  const color = 'purple';
  if (border) {
    alpha += 0.01;
  }
  return colorLib(color)
    .alpha(alpha)
    .rgbString();
}

const chart = new Chart('test', {
  type: 'treemap',
  data: {
    labels: ['a'],
    datasets: [{
      label: 'Basic treemap',
      data: undefined,
      tree: [15, 6, 6, 5, 4, 3, 2, 2],
      backgroundColor(ctx) {
        const item = ctx.dataset.data[ctx.dataIndex];
        if (!item) {
          return 'transparent';
        }
        return colorFromValue(item.v);
      },
      spacing: 0.1,
      borderWidth: 2,
      borderColor: 'rgba(180,180,180, 0.15)'
    }]
  },
});
