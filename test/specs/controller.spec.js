describe('auto', jasmine.fixtures('basic'));
describe('auto', jasmine.fixtures('grouped'));
describe('auto', jasmine.fixtures('events'));

describe('controller', function() {
  it('should be registered', function() {
    expect(Chart.controllers.treemap).toBeDefined();
  });
});
