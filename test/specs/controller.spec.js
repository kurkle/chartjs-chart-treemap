import Chart from 'chart.js';

describe('auto', jasmine.fixture('basic'));
describe('auto', jasmine.fixture('grouped'));

describe('controller', function() {
	it('should be registered', function() {
		expect(Chart.controllers.treemap).toBeDefined();
	});
});
