const arrayN = (n) => Array.from({length: n}).map((_, i) => i);

const groups = arrayN(5);
const tree = groups.reduce((acc, grp) => [
  ...acc,
  ...arrayN(grp * 5).map(i => ({grp: `group: ${grp}`, sub: `sub: ${i}`, value: (i % 5) * 5}))
], []);

const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree,
        backgroundColor: (ctx) => {
          if (ctx.raw.l === 0) {
            return 'dimgray';
          }
          const parentGrp = ctx.raw._data.grp;
          return colors[parentGrp[parentGrp.length - 1]];
        },
        borderWidth: 0,
        spacing: 1,
        key: 'value',
        groups: ['grp', 'sub'],
        displayMode: 'headerBoxes',
        captions: {
          display: false,
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
      height: 300,
      width: 800
    }
  }
};
