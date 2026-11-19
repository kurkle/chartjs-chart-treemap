// Sprite text is not an option: the hover colour of the glyphs is what this
// fixture tests, and sprite glyphs have a fixed colour. The real glyph
// rasterization differs between platforms; the differing pixels are glyph
// edges. Against the reference image pixelmatch 8 counts 0px in Chromium and
// 26px in Firefox on macOS, and 195px (0.15%) in Chromium and 208px (0.16%) in
// Firefox on Linux CI.
export default {
  tolerance: 0.0025,
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
