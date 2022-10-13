import {flatten, group, sort, sum, normalizeTreeToArray} from '../../src/utils';

describe('utils', function() {

  describe('flatten', function() {
    it('should flatten array', function() {
      const a = [1, [2, 3, [4, 5, 6]], 7, [8, 9]];
      expect(flatten(a)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('group', function() {
    it('should group 1 level of data', function() {
      const a = [{k: 'a', v: 1}, {k: 'b', v: 2}, {k: 'a', v: 3}];
      const g1 = group(a, 'k', 'v', 'leaf', []);
      expect(g1).toEqual([
        jasmine.objectContaining({k: 'a', v: 4}),
        jasmine.objectContaining({k: 'b', v: 2})
      ]);
    });
    it('should group 2 levels of data', function() {
      const a = [{k: 'a', k2: 'z', v: 1}, {k: 'b', k2: 'z', v: 2}, {k: 'a', k2: 'x', v: 3}];
      const g1 = group(a, 'k2', 'v', 'leaf', [], 'k', 'a');
      expect(g1).toEqual([
        jasmine.objectContaining({k2: 'z', v: 1}),
        jasmine.objectContaining({k2: 'x', v: 3})
      ]);
    });
  });

  describe('normalize tree object to array', function() {
    it('should have 2 elements of data', function() {
      const a = {A: {C: {value: 0}}, B: {D: {value: 0}}};
      const g1 = normalizeTreeToArray('value', 'leaf', [], a);
      expect(g1).toEqual([
        jasmine.objectContaining({0: 'A', leaf: 'C', value: 0}),
        jasmine.objectContaining({0: 'B', leaf: 'D', value: 0})
      ]);
    });
    it('should have 1 element of data', function() {
      const a = {A: {C: {value: 0}}, B: {D: {none: 0}}};
      const g1 = normalizeTreeToArray('value', 'leaf', [], a);
      expect(g1).toEqual([
        jasmine.objectContaining({0: 'A', leaf: 'C', value: 0})
      ]);
    });
    it('should not have any elements of data', function() {
      const a = {A: {C: {value: 0}}, B: {D: {value: 0}}};
      const g1 = normalizeTreeToArray('none', 'leaf', [], a);
      expect(g1).toEqual([]);
    });
  });

  describe('sort', function() {
    it('should reverse sort array', function() {
      const a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
      sort(a);
      expect(a).toEqual([8, 7, 6, 5, 4, 3, 3, 2, 1]);
    });

    it('should reverse sort array by key', function() {
      const a = [{x: 8, y: 1}, {x: 3, y: 2}, {x: 5, y: 3}];
      sort(a, 'x');
      expect(a).toEqual([{x: 8, y: 1}, {x: 5, y: 3}, {x: 3, y: 2}]);
      sort(a, 'y');
      expect(a).toEqual([{x: 5, y: 3}, {x: 3, y: 2}, {x: 8, y: 1}]);
    });
  });

  describe('sum', function() {
    it('should compute sum of array', function() {
      const a = [8, 3, 5, 4, 1, 3, 6, 2, 7];
      expect(sum(a)).toEqual(39);
    });

    it('should compute sum of numeric string array', function() {
      const a = ['8', '3', '5', '4', '1', '3', '6', '2', '7'];
      expect(sum(a)).toEqual(39);
    });

    it('should compute sum of array by given key', function() {
      const a = [{x: 8, y: 1}, {x: 3, y: 2}, {x: 5, y: 3}];
      expect(sum(a, 'x')).toEqual(16);
      expect(sum(a, 'y')).toEqual(6);
    });
  });
});
