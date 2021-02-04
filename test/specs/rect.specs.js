import Rect from '../../src/rect';

describe('Rect', function() {

  it('should be a function', function() {
    expect(typeof Rect).toBe('function');
  });

  it('should construct with undefined input', function() {
    expect(new Rect()).toEqual(jasmine.objectContaining({x: 0, y: 0, w: 1, h: 1}));
    expect(new Rect(false)).toEqual(jasmine.objectContaining({x: 0, y: 0, w: 1, h: 1}));
  });

  it('should construct from different kinds of input', function() {
    expect(new Rect({x: 1, y: 2, w: 3, h: 4})).toEqual(jasmine.objectContaining({x: 1, y: 2, w: 3, h: 4}));
    expect(new Rect({x: 1, y: 2, width: 3, height: 4})).toEqual(jasmine.objectContaining({x: 1, y: 2, w: 3, h: 4}));
    expect(new Rect({left: 1, top: 2, right: 4, bottom: 6})).toEqual(jasmine.objectContaining({x: 1, y: 2, w: 3, h: 4}));
  });
});
