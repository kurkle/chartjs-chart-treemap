// Sprite text is not an option here: it blits fixed 16px glyphs and measures
// them regardless of the font size, so the 64px font would never need fitting.
// The real glyph rasterization differs between platforms; the differing
// pixels are all glyph edges. Against the reference image pixelmatch 8 counts
// 904px (0.69%) in Chromium and 883px (0.67%) in Firefox on macOS, and 1018px
// (0.78%) in Chromium on Linux CI.
export default {
  tolerance: 0.01,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 6, 4, 4, 2, 1, 1, 1, 1, 1, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          overflow: 'fit',
          font: {
            size: 64
          }
        }
      }]
    },
    options: {
      events: []
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
