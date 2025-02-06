const arrayN = (n) => Array.from({length: n}).map((_, i) => i);

const groups = arrayN(4);
const tree = groups.reduce((acc, grp) => [
  ...acc,
  ...arrayN(grp * 4).map(i => ({grp: `group: ${grp}`, sub: `sub: ${i}`, value: (i % 4) * 4}))
], []);

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree,
        backgroundColor: (ctx) => ctx.raw.l ? 'lightblue' : 'dimgray',
        borderColor: 'dimgray',
        borderWidth: 1,
        spacing: 1,
        key: 'value',
        groups: ['grp', 'sub'],
        displayMode: 'headerBoxes'
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
