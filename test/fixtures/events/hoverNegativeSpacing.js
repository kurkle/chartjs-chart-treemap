import {triggerMouseEvent} from 'chartjs-test-utils';

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        borderWidth: 1,
        backgroundColor: 'red',
        hoverBackgroundColor: 'green',
        spacing: -0.5
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
