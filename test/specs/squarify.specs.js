import squarify from '../../src/squarify';

describe('squarify', function() {

	it('should be a function', function() {
		expect(typeof squarify).toBe('function');
	});

	it('should squarify 4 equal areas equally 4x4', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 4, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 2, h: 2, a: 4, v: 4},
			{x: 0, y: 2, w: 2, h: 2, a: 4, v: 4},
			{x: 2, y: 0, w: 2, h: 2, a: 4, v: 4},
			{x: 2, y: 2, w: 2, h: 2, a: 4, v: 4}
		]);
	});

	it('should squarify 4 equal areas equally 6x6', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 6});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 3, a: 9, v: 4},
			{x: 0, y: 3, w: 3, h: 3, a: 9, v: 4},
			{x: 3, y: 0, w: 3, h: 3, a: 9, v: 4},
			{x: 3, y: 3, w: 3, h: 3, a: 9, v: 4}
		]);
	});

	it('should squarify 4 equal areas equally 8x6', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 6});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 4, h: 3, a: 12, v: 4},
			{x: 0, y: 3, w: 4, h: 3, a: 12, v: 4},
			{x: 4, y: 0, w: 4, h: 3, a: 12, v: 4},
			{x: 4, y: 3, w: 4, h: 3, a: 12, v: 4}
		]);
	});

	it('should squarify 4 equal areas equally 6x8', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 8});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 4, a: 12, v: 4},
			{x: 3, y: 0, w: 3, h: 4, a: 12, v: 4},
			{x: 0, y: 4, w: 3, h: 4, a: 12, v: 4},
			{x: 3, y: 4, w: 3, h: 4, a: 12, v: 4}
		]);
	});

	it('should squarify 4 equal areas equally 8x2', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 2});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 2, h: 2, a: 4, v: 4},
			{x: 2, y: 0, w: 2, h: 2, a: 4, v: 4},
			{x: 4, y: 0, w: 2, h: 2, a: 4, v: 4},
			{x: 6, y: 0, w: 2, h: 2, a: 4, v: 4}
		]);
	});

	it('should squarify 4 equal areas equally 1x8', function() {
		let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 1, h: 8});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 1, h: 2, a: 2, v: 4},
			{x: 0, y: 2, w: 1, h: 2, a: 2, v: 4},
			{x: 0, y: 4, w: 1, h: 2, a: 2, v: 4},
			{x: 0, y: 6, w: 1, h: 2, a: 2, v: 4}
		]);
	});

	it('should squarify correctly', function() {
		let sq = squarify([6, 6, 4, 3, 2, 2, 1], {x: 0, y: 0, w: 6, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 2, a: 6, v: 6},
			{x: 0, y: 2, w: 3, h: 2, a: 6, v: 6},
			{x: 3, y: 0, w: 1.7143, h: 2.3333, a: 4, v: 4},
			{x: 4.7143, y: 0, w: 1.2857, h: 2.3333, a: 3, v: 3},
			{x: 3, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2},
			{x: 4.2, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2},
			{x: 5.4, y: 2.3333, w: 0.6, h: 1.6667, a: 1, v: 1}
		]);
	});

	it('should squarify unordered data correctly', function() {
		let sq = squarify([3, 2, 1, 6, 4, 6, 2], {x: 0, y: 0, w: 6, h: 4});
		expect(sq).toEqual([
			{x: 0, y: 0, w: 3, h: 2, a: 6, v: 6},
			{x: 0, y: 2, w: 3, h: 2, a: 6, v: 6},
			{x: 3, y: 0, w: 1.7143, h: 2.3333, a: 4, v: 4},
			{x: 4.7143, y: 0, w: 1.2857, h: 2.3333, a: 3, v: 3},
			{x: 3, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2},
			{x: 4.2, y: 2.3333, w: 1.2, h: 1.6667, a: 2, v: 2},
			{x: 5.4, y: 2.3333, w: 0.6, h: 1.6667, a: 1, v: 1}
		]);
	});
	/*
	it('should squarify single element', function() {
		let sq = squarify([6], {x: 0, y: 0, w: 4, h: 3});
		expect(sq.length).toEqual(1);
		expect(sq[0]).toEqual([{x: 0, y: 0, v: 6, w: 4, h: 3}]);
	});

	it('should squarify correctly', function() {
		let sq = squarify([6, 6, 4, 3, 2, 2, 1], {x: 0, y: 0, w: 6, h: 4});

		expect(sq.length).toEqual(3);

		expect(sq[0].length).toEqual(2);
		expect(sq[0][0]).toEqual({v: 6, x: 0, y: 0, h: 2, w: 4});
		expect(sq[0][1]).toEqual({v: 6, x: 0, y: 2, h: 2, w: 4});
		expect(sq[1].length).toEqual(1);
		expect(sq[1][0]).toEqual({v: 4, x: 4, y: 0, h: 4, w: 2});
		// expect(sq[1]).toEqual({x: 4, y: 0, items: [4], dir: 'y', stat: {min: 4, max: 4, sum: 4}});
		// expect(sq[2]).toEqual({x: 4, y: 4, dir: 'x', items: [3, 2, 2, 1], stat: {min: 1, max: 3, sum: 8}});
		// expect(sq[3]).toEqual({x: 5, y: 3.0625000000000004, items: [1], stat: {min: 1, max: 1, sum: 1}});
	});
	*/
});
