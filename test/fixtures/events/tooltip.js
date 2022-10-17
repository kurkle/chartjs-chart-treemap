export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        hoverBackgroundColor: 'red'
      }]
    },
    options: {
      plugins: {
        legend: false,
        tooltip: {
          enabled: true,
          callbacks: {
            title: () => '',
            label: () => '',
          }
        }
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    run: (chart) => {
      const elem = chart.getDatasetMeta(0).data[2];
      return triggerMouseEvent(chart, 'mousemove', elem.tooltipPosition());
    }
  }
};
