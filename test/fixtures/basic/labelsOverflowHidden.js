// The text is sprite text, so the difference is not glyph rasterization: the
// sprite blits come out a pixel differently in Chromium and Firefox, and the
// reference image sits closer to Firefox. The counts are the same on macOS and
// Linux CI: 166px (0.13%) in Chromium and 9px in Firefox.
export default {
  tolerance: 0.0025,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {
          display: true,
          overflow: 'hidden',
          formatter: (ctx) => ('value is ' + ctx.raw.v).repeat(ctx.index)
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
