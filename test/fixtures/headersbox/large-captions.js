const arrayN = (n) => Array.from({length: n}).map((_, i) => i);

const groups = arrayN(10);
const tree = groups.reduce((acc, grp) => [
  ...acc,
  ...arrayN(grp * 10).map(i => ({grp: `group: ${grp}`, sub: `sub: ${i}`, value: (i % 10) * 10}))
], []);

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree,
        backgroundColor: (ctx) => ctx.raw.l ? 'dimgray' : 'silver',
        borderColor: (ctx) => ctx.raw.l ? 'white' : 'black',
        borderWidth: 0,
        spacing: 1,
        key: 'value',
        groups: ['grp', 'sub'],
        displayMode: 'headerBoxes',
        captions: {
          padding: 20,
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
      height: 200,
      width: 800
    }
  }
};
