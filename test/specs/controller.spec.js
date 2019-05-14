import Chart from 'chart.js';

describe('auto', jasmine.fixture.specs('basic'));

describe('controller', function() {
	it('should be registered', function() {
		expect(Chart.controllers.treemap).toBeDefined();
	});
});
