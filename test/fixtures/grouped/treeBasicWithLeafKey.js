const data = {
  A: {
    C: {
      C1: {
        C1a: {
          value: 6.25
        },
        C1b: {
          value: 6.25
        },
      },
      C2: {
        value: 12.5
      }
    },
    D: {
      value: 25
    }
  },
  B: {
    value: 50,
  },
  G: {
    C: {
      value: 50
    }
  },
};

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        treeLeafKey: '_test',
        key: 'value',
        groups: ['0', '1', '2', '_test'],
        captions: {
          display: false
        },
        labels: {
          display: true
        }
      }]
    },
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    spriteText: true
  }
};
