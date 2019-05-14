import utils from '../../src/utils';

describe('utils', function() {
	describe('qsort', function() {
		it('should be a function', function() {
			expect(typeof utils.qsort).toBe('function');
		});

		it('should sort correctly', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			utils.qsort(a, 0, 8);
			expect(a).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8]);
		});
	});

	describe('qrsort', function() {
		it('should be a function', function() {
			expect(typeof utils.qrsort).toBe('function');
		});

		it('should sort correctly', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			utils.qrsort(a, 0, 8);
			expect(a).toEqual([8, 7, 6, 5, 4, 3, 3, 2, 1]);
		});
	});

	describe('sum', function() {
		it('should compute sum of array', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			expect(utils.sum(a)).toEqual(39);
		});
	});
});
