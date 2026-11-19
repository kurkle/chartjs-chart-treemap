// Sprite text is not an option: it ignores the font size, which is what this
// fixture varies. The real glyph rasterization differs between platforms and
// browsers; the differing pixels are glyph edges. Against the reference image
// pixelmatch 8 counts 2567px (1.96%) in Chromium and 3131px (2.39%) in Firefox
// on macOS, and 4945px (3.77%) in Chromium and 5111px (3.90%) in Firefox on
// Linux CI.
export default {
  tolerance: 0.0600,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [16, 16, 14, 13, 12, 12],
        backgroundColor: 'red',
        labels: {
          display: true,
          align: 'left',
          position: 'top',
          font: () => [{size: 24}, {size: 12}],
          formatter(ctx) {
            return ctx.type === 'data' ? ['The value is', ctx.raw.v + '', 'The value is', ctx.raw.v + ''] : [];
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
