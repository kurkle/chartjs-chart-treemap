import utils from '../../src/utils';

describe('utils', function() {
	describe('qsort', function() {
		it('should be a function', function() {
			expect(typeof utils.qsort).toBe('function');
		});

		it('should sort correctly', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			utils.qsort(a);
			expect(a).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8]);
		});

		it('should sort correctly already sorted array', function() {
			var a = [1, 2, 3, 3, 4, 5, 6, 7, 8];
			utils.qsort(a);
			expect(a).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8]);
		});

		it('should be able to sort large array', function() {
			var length = 1000000;
			var arr = [];
			for (var i = length; i > 0; i--) {
				arr.push(parseInt(Math.random() * 1000000000, 10));
			}

			expect(function() {
				utils.qsort(arr);
				utils.qsort(arr);
				utils.qrsort(arr);
				utils.qrsort(arr);
			}).not.toThrow();
		});
	});

	describe('qrsort', function() {
		it('should be a function', function() {
			expect(typeof utils.qrsort).toBe('function');
		});

		it('should sort correctly', function() {
			var a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
			utils.qrsort(a);
			expect(a).toEqual([8, 7, 6, 5, 4, 3, 3, 2, 1]);
		});

		it('should sort correctly already sorted array', function() {
			var a = [8, 7, 6, 5, 4, 3, 3, 2, 1];
			utils.qrsort(a);
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
