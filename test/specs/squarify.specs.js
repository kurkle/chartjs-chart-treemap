import squarify from '../../src/squarify';

describe('squarify', function() {

	it('should be a function', function() {
		expect(typeof squarify).toBe('function');
	});

	it('should squarify 4 equal areas equally 4x4', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 4, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 2, h: 2, a: 4, v: 4, s: 8},
			{x: 0, y: 2, w: 2, h: 2, a: 4, v: 4, s: 8},
			{x: 2, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4},
			{x: 2, y: 2, w: 2, h: 2, a: 4, v: 4, s: 4}
		]);
	});

	it('should squarify 4 equal areas equally 6x6', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 6});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 3, a: 9, v: 4, s: 8},
			{x: 0, y: 3, w: 3, h: 3, a: 9, v: 4, s: 8},
			{x: 3, y: 0, w: 3, h: 3, a: 9, v: 4, s: 4},
			{x: 3, y: 3, w: 3, h: 3, a: 9, v: 4, s: 4}
		]);
	});

	it('should squarify 4 equal areas equally 8x6', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 6});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 4, h: 3, a: 12, v: 4, s: 8},
			{x: 0, y: 3, w: 4, h: 3, a: 12, v: 4, s: 8},
			{x: 4, y: 0, w: 4, h: 3, a: 12, v: 4, s: 4},
			{x: 4, y: 3, w: 4, h: 3, a: 12, v: 4, s: 4}
		]);
	});

	it('should squarify 4 equal areas equally 6x8', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 8});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 4, a: 12, v: 4, s: 8},
			{x: 3, y: 0, w: 3, h: 4, a: 12, v: 4, s: 8},
			{x: 0, y: 4, w: 3, h: 4, a: 12, v: 4, s: 4},
			{x: 3, y: 4, w: 3, h: 4, a: 12, v: 4, s: 4}
		]);
	});

	it('should squarify 4 equal areas equally 8x2', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 2});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4},
			{x: 2, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4},
			{x: 4, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4},
			{x: 6, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4}
		]);
	});

	it('should squarify 4 equal areas equally 1x8', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 1, h: 8});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 1, h: 2, a: 2, v: 4, s: 4},
			{x: 0, y: 2, w: 1, h: 2, a: 2, v: 4, s: 4},
			{x: 0, y: 4, w: 1, h: 2, a: 2, v: 4, s: 4},
			{x: 0, y: 6, w: 1, h: 2, a: 2, v: 4, s: 4}
		]);
	});

	it('should squarify correctly', function() {
		let sq = squarify([6, 6, 4, 3, 2, 2, 1], {x: 0, y: 0, w: 6, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 2, a: 6, v: 6, s: 12},
			{x: 0, y: 2, w: 3, h: 2, a: 6, v: 6, s: 12},
			{x: 3, y: 0, w: 1.7143, h: 2.3333, a: 4, v: 4, s: 7},
			{x: 4.7143, y: 0, w: 1.2857, h: 2.3333, a: 3, v: 3, s: 7},
			{x: 3, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2, s: 2},
			{x: 4.2, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2, s: 2},
			{x: 5.4, y: 2.3333, w: 0.6, h: 1.6667, a: 1, v: 1, s: 1}
		]);
	});

	it('should squarify unordered data correctly', function() {
		let sq = squarify([3, 2, 1, 6, 4, 6, 2], {x: 0, y: 0, w: 6, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 2, a: 6, v: 6, s: 12},
			{x: 0, y: 2, w: 3, h: 2, a: 6, v: 6, s: 12},
			{x: 3, y: 0, w: 1.7143, h: 2.3333, a: 4, v: 4, s: 7},
			{x: 4.7143, y: 0, w: 1.2857, h: 2.3333, a: 3, v: 3, s: 7},
			{x: 3, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2, s: 2},
			{x: 4.2, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2, s: 2},
			{x: 5.4, y: 2.3333, w: 0.6, h: 1.6667, a: 1, v: 1, s: 1}
		]);
	});

	it('should squarify by given key', function() {
		let data = [{v: 4}, {v: 4}, {v: 4}, {v: 4}];
		let rect = {x: 0, y: 0, w: 4, h: 4};
		let sq = squarify(data, rect, 'v');
		expect(sq).toEqual([
			{x: 0, y: 0, w: 2, h: 2, a: 4, v: 4, s: 8},
			{x: 0, y: 2, w: 2, h: 2, a: 4, v: 4, s: 8},
			{x: 2, y: 0, w: 2, h: 2, a: 4, v: 4, s: 4},
			{x: 2, y: 2, w: 2, h: 2, a: 4, v: 4, s: 4}
		]);
	});

});
