// Sprite text is not an option: it draws every glyph in one fixed colour, and
// the colours are what this fixture tests. The real glyph rasterization
// differs between platforms; the differing pixels are glyph edges. Against the
// reference image pixelmatch 8 counts 1068px (0.81%) in Chromium and 234px
// (0.18%) in Firefox on macOS, and 2394px (1.83%) in Chromium and 2336px
// (1.78%) in Firefox on Linux CI.
export default {
  tolerance: 0.0280,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Simple treemap',
        data: [16, 16, 14, 13, 12, 12],
        labels: {
          display: true,
          align: 'left',
          position: 'top',
          color: () => ['red', 'green'],
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
