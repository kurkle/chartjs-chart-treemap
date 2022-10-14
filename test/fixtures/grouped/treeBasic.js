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
  tolerance: 0.0012,
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        groups: ['0', '1', '2', '_leaf'],
        captions: {
          display: false
        },
        labels: {
          display: true,
        }
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
