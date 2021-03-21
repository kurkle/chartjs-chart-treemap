import {triggerMouseEvent} from 'chartjs-test-utils';

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        hoverBackgroundColor: 'green'
      }]
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    run: (chart) => {
      var elem = chart.getDatasetMeta(0).data[0];
      return triggerMouseEvent(chart, 'mousemove', elem.tooltipPosition());
    }
  }
};
