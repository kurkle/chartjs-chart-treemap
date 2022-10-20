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
});
