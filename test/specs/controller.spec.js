describe('auto', jasmine.fixtures('basic'));
describe('auto', jasmine.fixtures('grouped'));
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
      {key: 99, a: 'a2', b: 'b1', c: 'c1'}
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
    expect(a1b1c1.v).toBe(10);
    expect(a1b1c1._data.children.length).toBe(1);

    const a2b1c2 = buildData.find((o) => o._data.path === 'a2.b1.c1');
    expect(a2b1c2.v).toBe(139);
    expect(a2b1c2._data.children.length).toBe(2);
  });
});
