import {triggerMouseEvent} from 'chartjs-test-utils';

export default {
  tolerance: 0.0015,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        hoverBackgroundColor: 'green',
        labels: {
          display: true,
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
