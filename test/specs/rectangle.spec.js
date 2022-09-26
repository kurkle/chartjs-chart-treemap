import {toBorderWidth} from '../../src/helpers';

describe('Rectangle', function() {
  describe('parseBorderWidth', function() {
    it('should parse object', function() {
      expect(toBorderWidth({top: 1, right: 5}, 5, 5)).toEqual({t: 1, r: 5, b: 0, l: 0});
    });
    it('should parse number', function() {
      expect(toBorderWidth(5, 5, 5)).toEqual({t: 5, r: 5, b: 5, l: 5});
    });
  });
});
