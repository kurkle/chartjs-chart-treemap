describe('auto', jasmine.fixtures('basic'));
describe('auto', jasmine.fixtures('grouped'));
describe('auto', jasmine.fixtures('headersbox'));
describe('auto', jasmine.fixtures('events'));
describe('auto', jasmine.fixtures('advanced'));
describe('auto', jasmine.fixtures('issues'));

describe('controller', function() {
  it('should be registered', function() {
    expect(Chart.controllers.treemap).toBeDefined();
  });

  it('should not rebuild data when nothing has changes', function() {
    const origData = [1, 2, 3];
    const chart = acquireChart({
      type: 'treemap',
      data: {
        datasets: [{
          tree: origData
        }]
      }
    });
    const buildData = chart.data.datasets[0].data;
    expect(buildData).not.toBe(origData);
    chart.update();
    expect(buildData).toBe(chart.data.datasets[0].data);
  });

  it('should group 3 levels of data', function() {
    const tree = [
      {key: 10, a: 'a1', b: 'b1', c: 'c1'},
      {key: 20, a: 'a1', b: 'b1', c: 'c1'},
      {key: 40, a: 'a2', b: 'b1', c: 'c1'},
      {key: 99, a: 'a2', b: 'b1', c: 'c1'},
      {key: 10, a: 'a3', b: 'b1', c: 'c1'},
      {key: 20, a: 'a3', b: 'b1', c: 'c2'},
      {key: 40, a: 'a3', b: 'b2', c: 'c3'},
      {key: 99, a: 'a3', b: 'b2', c: 'c4'},
      {key: 50, a: 'a3', b: 'b3', c: 'c4'}
    ];
    const chart = acquireChart({
      type: 'treemap',
      data: {
        datasets: [{
          key: 'key',
          groups: ['a', 'b', 'c'],
          tree: tree
        }]
      }
    });
    const buildData = chart.data.datasets[0].data;

    const a1b1 = buildData.find((o) => o._data.path === 'a1.b1');
    expect(a1b1.v).toBe(30);
    expect(a1b1._data.children.length).toBe(2);

    const a1b1c1 = buildData.find((o) => o._data.path === 'a1.b1.c1');
    expect(a1b1c1.v).toBe(30);
    expect(a1b1c1._data.children.length).toBe(2);

    const a2b1c1 = buildData.find((o) => o._data.path === 'a2.b1.c1');
    expect(a2b1c1.v).toBe(139);
    expect(a2b1c1._data.children.length).toBe(2);

    const a3 = buildData.find((o) => o._data.path === 'a3');
    expect(a3.v).toBe(10 + 20 + 40 + 99 + 50);
    expect(a3._data.children.length).toBe(5);

    const a3b1c1 = buildData.find((o) => o._data.path === 'a3.b1.c1');
    expect(a3b1c1.v).toBe(10);
    expect(a3b1c1._data.children.length).toBe(1);

    const a3b1 = buildData.find((o) => o._data.path === 'a3.b1');
    expect(a3b1.v).toBe(10 + 20);
    expect(a3b1._data.children.length).toBe(2);

    const a3b2 = buildData.find((o) => o._data.path === 'a3.b2');
    expect(a3b2.v).toBe(40 + 99);
    expect(a3b2._data.children.length).toBe(2);

    const a3b3 = buildData.find((o) => o._data.path === 'a3.b3');
    expect(a3b3.v).toBe(50);
    expect(a3b3._data.children.length).toBe(1);

    const a3b3c4 = buildData.find((o) => o._data.path === 'a3.b3.c4');
    expect(a3b3c4.v).toBe(50);
    expect(a3b3c4._data.children.length).toBe(1);
  });
});
