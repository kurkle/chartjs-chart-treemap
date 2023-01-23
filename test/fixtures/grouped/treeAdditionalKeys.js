const data = {
  A: {
    C: {
      C1: {
        C1a: {
          value: 6.25,
          another: 1
        },
        C1b: {
          value: 6.25,
          another: 2
        },
      },
      C2: {
        value: 12.5,
        another: 3
      }
    },
    D: {
      value: 25,
      another: 4
    }
  },
  B: {
    value: 50,
    another: 10
  },
  G: {
    C: {
      value: 50,
      another: 5
    }
  },
};

export default {
  config: {
    type: 'treemap',
    data: {
      datasets: [{
        tree: data,
        key: 'value',
        sumKeys: ['another'],
        groups: ['0', '1', '2', '_leaf'],
        backgroundColor: (ctx) => ctx.raw.vs.another % 2 === 1 ? 'red' : 'yellow',
        captions: {
          display: false
        },
        labels: {
          display: true,
          formatter: (ctx) => [ctx.raw._data.label, ctx.raw.vs.another + '']
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
