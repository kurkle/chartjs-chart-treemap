const data = [
  { year: '2025', value: 10 },
  { year: '2026', quarter: 'Q1', value: 2 },
  { year: '2026', quarter: 'Q2', value: 6 },
  { year: '2027', quarter: 'Q1', month: 'January', value: 2 },
  { year: '2027', quarter: 'Q1', month: 'February', value: 2 },
];


// The text is sprite text, so the difference is not glyph rasterization: the
// sprite blits come out a pixel differently in Firefox than in Chromium, which
// the reference image matches. The counts are the same on macOS and Linux CI:
// 0px in Chromium and 105px (0.08%) in Firefox.
export default {
  tolerance: 0.0015,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        data: data,
        key: 'value',
        groups: ['year', 'quarter', 'month'],
        spacing: 2,
        backgroundColor: (ctx) => ctx.raw.isLeaf ? 'lightblue' : 'darkgray',
        captions: { display: true },
        labels: { display: true },
        displayMode: 'headerBoxes',
      }]
    },
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
