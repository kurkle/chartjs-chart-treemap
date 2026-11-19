// The text is sprite text, so the difference is not glyph rasterization: the
// sprite blits of the wrapped lines come out differently in Firefox than in
// Chromium, which the reference image matches. The counts are the same on
// macOS and Linux CI: 0px in Chromium and 1517px (1.16%) in Firefox.
export default {
  tolerance: 0.0200,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [6, 6, 4, 3, 2, 2, 1],
        backgroundColor: 'red',
        labels: {display: true, wrap: true, formatter: (ctx) => "the measured value is " + ctx.raw.v + " arbitrary units"}
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
