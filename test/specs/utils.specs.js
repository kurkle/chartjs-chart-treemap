import utils from '../../src/utils';

describe('utils', function() {

	describe('flatten', function() {
		it('should flatten array', function() {
			var a = [1, [2, 3, [4, 5, 6]], 7, [8, 9]];
			expect(utils.flatten(a)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		});
	});

	describe('sort', function() {
		it('should reverse sort array', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			utils.sort(a);
			expect(a).toEqual([8, 7, 6, 5, 4, 3, 3, 2, 1]);
		});

		it('should reverse sort array by key', function() {
			var a = [{x: 8, y: 1}, {x: 3, y: 2}, {x: 5, y: 3}];
			utils.sort(a, 'x');
			expect(a).toEqual([{x: 8, y: 1}, {x: 5, y: 3}, {x: 3, y: 2}]);
			utils.sort(a, 'y');
			expect(a).toEqual([{x: 5, y: 3}, {x: 3, y: 2}, {x: 8, y: 1}]);
		});
	});

	describe('sum', function() {
		it('should compute sum of array', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			expect(utils.sum(a)).toEqual(39);
		});

		it('should compute sum of array by given key', function() {
			var a = [{x: 8, y: 1}, {x: 3, y: 2}, {x: 5, y: 3}];
			expect(utils.sum(a, 'x')).toEqual(16);
			expect(utils.sum(a, 'y')).toEqual(6);
		});
	});

});
