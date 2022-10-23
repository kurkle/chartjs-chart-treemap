import squarify from '../../src/squarify';
const round4 = (v) => +(Math.round(+`${v}e+4`) + 'e-4') || 0;
const roundsq4 = sq => ({...sq, x: round4(sq.x), y: round4(sq.y), w: round4(sq.w), h: round4(sq.h)});

describe('squarify', function() {

  it('should be a function', function() {
    expect(typeof squarify).toBe('function');
  });

  it('should squarify 4 equal areas equally 4x4', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 4, h: 4});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 0, y: 2, w: 2, h: 2}),
      jasmine.objectContaining({x: 2, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 2, y: 2, w: 2, h: 2})
    ]);
  });

  it('should squarify 4 equal areas equally 6x6', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 6});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 3, h: 3}),
      jasmine.objectContaining({x: 0, y: 3, w: 3, h: 3}),
      jasmine.objectContaining({x: 3, y: 0, w: 3, h: 3}),
      jasmine.objectContaining({x: 3, y: 3, w: 3, h: 3})
    ]);
  });

  it('should squarify 4 equal areas equally 8x6', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 6});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 4, h: 3}),
      jasmine.objectContaining({x: 0, y: 3, w: 4, h: 3}),
      jasmine.objectContaining({x: 4, y: 0, w: 4, h: 3}),
      jasmine.objectContaining({x: 4, y: 3, w: 4, h: 3})
    ]);
  });

  it('should squarify 4 equal areas equally 6x8', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 6, h: 8});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 3, h: 4}),
      jasmine.objectContaining({x: 3, y: 0, w: 3, h: 4}),
      jasmine.objectContaining({x: 0, y: 4, w: 3, h: 4}),
      jasmine.objectContaining({x: 3, y: 4, w: 3, h: 4})
    ]);
  });

  it('should squarify 4 equal areas equally 8x2', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 8, h: 2});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 2, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 4, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 6, y: 0, w: 2, h: 2})
    ]);
  });

  it('should squarify 4 equal areas equally 1x8', function() {
    let sq = squarify([4, 4, 4, 4], {x: 0, y: 0, w: 1, h: 8});
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 1, h: 2}),
      jasmine.objectContaining({x: 0, y: 2, w: 1, h: 2}),
      jasmine.objectContaining({x: 0, y: 4, w: 1, h: 2}),
      jasmine.objectContaining({x: 0, y: 6, w: 1, h: 2})
    ]);
  });

  it('should squarify correctly', function() {
    let sq = squarify([6, 6, 4, 3, 2, 2, 1], {x: 0, y: 0, w: 6, h: 4}).map(roundsq4);
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 3, h: 2}),
      jasmine.objectContaining({x: 0, y: 2, w: 3, h: 2}),
      jasmine.objectContaining({x: 3, y: 0, w: 1.7143, h: 2.3333}),
      jasmine.objectContaining({x: 4.7143, y: 0, w: 1.2857, h: 2.3333}),
      jasmine.objectContaining({x: 3, y: 2.3333, w: 1.2, h: 1.6667}),
      jasmine.objectContaining({x: 4.2, y: 2.3333, w: 1.2, h: 1.6667}),
      jasmine.objectContaining({x: 5.4, y: 2.3333, w: 0.6, h: 1.6667})
    ]);
  });

  it('should squarify unordered data correctly', function() {
    let sq = squarify([3, 2, 1, 6, 4, 6, 2], {x: 0, y: 0, w: 6, h: 4}).map(roundsq4);
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 3, h: 2}),
      jasmine.objectContaining({x: 0, y: 2, w: 3, h: 2}),
      jasmine.objectContaining({x: 3, y: 0, w: 1.7143, h: 2.3333}),
      jasmine.objectContaining({x: 4.7143, y: 0, w: 1.2857, h: 2.3333}),
      jasmine.objectContaining({x: 3, y: 2.3333, w: 1.2, h: 1.6667}),
      jasmine.objectContaining({x: 4.2, y: 2.3333, w: 1.2, h: 1.6667}),
      jasmine.objectContaining({x: 5.4, y: 2.3333, w: 0.6, h: 1.6667})
    ]);
  });

  it('should squarify by given key', function() {
    let data = [{v: 4}, {v: 4}, {v: 4}, {v: 4}];
    let rect = {x: 0, y: 0, w: 4, h: 4};
    let sq = squarify(data, rect, 'v');
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 0, y: 2, w: 2, h: 2}),
      jasmine.objectContaining({x: 2, y: 0, w: 2, h: 2}),
      jasmine.objectContaining({x: 2, y: 2, w: 2, h: 2})
    ]);
  });

  it('should squarify by given group', function() {
    let data = [{g: 'a', v: 1}, {g: 'a', v: 2}, {g: 'b', v: 3}, {g: 'c', v: 4}];
    let rect = {x: 0, y: 0, w: 4, h: 4};
    let sq = squarify(data, rect, 'v', 2, 'g', 0, 0).map(roundsq4);
    expect(sq).toEqual([
      jasmine.objectContaining({x: 0, y: 0, w: 2.8, h: 2.2857, a: 6.4, g: 'c', l: 0, gs: 0}),
      jasmine.objectContaining({x: 0, y: 2.2857, w: 2.8, h: 1.7143, a: 4.800000000000001, g: 'b', l: 0, gs: 0}),
      jasmine.objectContaining({x: 2.8, y: 0, w: 1.2, h: 2.6667, a: 3.2, v: 2, g: 'a', l: 0, gs: 0}),
      jasmine.objectContaining({x: 2.8, y: 2.6667, w: 1.2, h: 1.3333, a: 1.6, v: 1, g: 'a', l: 0, gs: 0}),
    ]);
  });

  it('should not fail with empty array', function() {
    let sq = squarify([], {x: 0, y: 0, w: 10, h: 10});
    expect(sq).toEqual([]);
  });

  it('should not fail with undefined input', function() {
    let sq = squarify(undefined, {x: 0, y: 0, w: 10, h: 10});
    expect(sq).toEqual([]);

    sq = squarify([]);
    expect(sq).toEqual([]);

    sq = squarify([1]);
    expect(sq).toEqual([jasmine.objectContaining({x: 0, y: 0, w: 1, h: 1, a: 1, v: 1, s: 1})]);

    sq = squarify();
    expect(sq).toEqual([]);
  });
});
