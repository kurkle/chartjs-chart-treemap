import { flatten, group, index, normalizeTreeToArray, requireVersion, sort, sum } from './utils'

describe('utils', () => {
  describe('flatten', () => {
    it('should flatten array', () => {
      const a = [1, [2, 3, [4, 5, 6]], 7, [8, 9]]
      expect(flatten(a)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('group', () => {
    it('should group 1 level of data', () => {
      const a = [
        { k: 'a', v: 1 },
        { k: 'b', v: 2 },
        { k: 'a', v: 3 },
      ]
      const g1 = group(a, 'k', ['v'], 'leaf')
      expect(g1).toEqual([
        jasmine.objectContaining({ k: 'a', v: 4 }),
        jasmine.objectContaining({ k: 'b', v: 2 }),
      ])
    })
    it('should group 2 levels of data', () => {
      const a = [
        { k: 'a', k2: 'z', v: 1 },
        { k: 'b', k2: 'z', v: 2 },
        { k: 'a', k2: 'x', v: 3 },
      ]
      const g1 = group(a, 'k2', ['v'], 'leaf', 'k', 'a')
      expect(g1).toEqual([
        jasmine.objectContaining({ k2: 'z', v: 1 }),
        jasmine.objectContaining({ k2: 'x', v: 3 }),
      ])
    })
    it('should group 2 levels of data with additionl keys', () => {
      const a = [
        { k: 'a', k2: 'z', v: 1, v1: 2 },
        { k: 'b', k2: 'z', v: 2, v1: 1 },
        { k: 'a', k2: 'x', v: 3, v1: 10 },
      ]
      const g1 = group(a, 'k2', ['v', 'v1'], 'leaf', 'k', 'a')
      expect(g1).toEqual([
        jasmine.objectContaining({ k2: 'z', v: 1, v1: 2 }),
        jasmine.objectContaining({ k2: 'x', v: 3, v1: 10 }),
      ])
    })
    it('should skip missing group levels', () => {
      const a = [
        { component: null, file: 'index.js', folder: './src', subFolder: null, v: 1 },
        { component: 'A', file: 'A.js', folder: './src', subFolder: null, v: 2 },
        { component: 'A', file: 'B.js', folder: './src', subFolder: 'nested', v: 3 },
      ]
      const groups = ['folder', 'component', 'subFolder', 'file']
      const g1 = group(a, 'folder', ['v'], 'leaf', undefined, undefined, ['folder'], groups, 0)
      expect(g1).toEqual([jasmine.objectContaining({ folder: './src', groupIndex: 0, v: 6 })])

      const g2 = group(
        g1[0].children,
        'component',
        ['v'],
        'leaf',
        undefined,
        undefined,
        ['folder', 'component'],
        groups,
        1
      )
      expect(g2).toEqual([
        jasmine.objectContaining({
          component: 'index.js',
          groupIndex: 3,
          path: './src.index.js',
          v: 1,
        }),
        jasmine.objectContaining({ component: 'A', groupIndex: 1, path: './src.A', v: 5 }),
      ])
    })

    it('should use tree leaf key as group fallback', () => {
      const a = [{ leaf: 'index.js', v: 1 }]
      const g1 = group(a, 'folder', ['v'], 'leaf')
      expect(g1).toEqual([
        jasmine.objectContaining({
          folder: 'index.js',
          group: 'leaf',
          groupIndex: 0,
          path: 'index.js',
          v: 1,
        }),
      ])
    })

    it('should return empty array when no group can be resolved', () => {
      expect(group([{ v: 1 }], 'folder', ['v'], 'leaf')).toEqual([])
    })
  })

  describe('index', () => {
    it('should return key for empty data', () => {
      expect(index([], 'value')).toBe('value')
    })

    it('should add indexes to object values', () => {
      const values: Array<{ _idx?: number; value: number }> = [{ value: 2 }, { value: 4 }]
      expect(index(values, 'value')).toBe('value')
      expect(values).toEqual([
        { _idx: 0, value: 2 },
        { _idx: 1, value: 4 },
      ])
    })

    it('should normalize primitive values', () => {
      const values: Array<number | { _idx: number; v: number }> = [2, 4]
      expect(index(values, 'value')).toBe('v')
      expect(values).toEqual([
        { _idx: 0, v: 2 },
        { _idx: 1, v: 4 },
      ])
    })
  })

  describe('normalize tree object to array', () => {
    it('should have 2 elements of data', () => {
      const a = { A: { C: { value: 0 } }, B: { D: { value: 0 } } }
      const g1 = normalizeTreeToArray(['value'], 'leaf', a)
      expect(g1).toEqual([
        jasmine.objectContaining({ 0: 'A', leaf: 'C', value: 0 }),
        jasmine.objectContaining({ 0: 'B', leaf: 'D', value: 0 }),
      ])
    })
    it('should have 1 element of data', () => {
      const a = { A: { C: { value: 0 } }, B: { D: { none: 0 } } }
      const g1 = normalizeTreeToArray(['value'], 'leaf', a)
      expect(g1).toEqual([jasmine.objectContaining({ 0: 'A', leaf: 'C', value: 0 })])
    })
    it('should not have any elements of data', () => {
      const a = { A: { C: { value: 0 } }, B: { D: { value: 0 } } }
      const g1 = normalizeTreeToArray(['none'], 'leaf', a)
      expect(g1).toEqual([])
    })
    it('should have 2 elements of data with sum keys', () => {
      const a = { A: { C: { another: 3, value: 0 } }, B: { D: { another: 2, value: 0 } } }
      const g1 = normalizeTreeToArray(['value', 'another'], 'leaf', a)
      expect(g1).toEqual([
        jasmine.objectContaining({ 0: 'A', another: 3, leaf: 'C', value: 0 }),
        jasmine.objectContaining({ 0: 'B', another: 2, leaf: 'D', value: 0 }),
      ])
    })
  })

  describe('sort', () => {
    it('should reverse sort array', () => {
      const a = [8, 3, 5, 4, 1, 3, 6, 2, 7]
      sort(a)
      expect(a).toEqual([8, 7, 6, 5, 4, 3, 3, 2, 1])
    })

    it('should reverse sort array by key', () => {
      const a = [
        { x: 8, y: 1 },
        { x: 3, y: 2 },
        { x: 5, y: 3 },
      ]
      sort(a, 'x')
      expect(a).toEqual([
        { x: 8, y: 1 },
        { x: 5, y: 3 },
        { x: 3, y: 2 },
      ])
      sort(a, 'y')
      expect(a).toEqual([
        { x: 5, y: 3 },
        { x: 3, y: 2 },
        { x: 8, y: 1 },
      ])
    })
  })

  describe('sum', () => {
    it('should compute sum of array', () => {
      const a = [8, 3, 5, 4, 1, 3, 6, 2, 7]
      expect(sum(a)).toEqual(39)
    })

    it('should compute sum of numeric string array', () => {
      const a = ['8', '3', '5', '4', '1', '3', '6', '2', '7']
      expect(sum(a)).toEqual(39)
    })

    it('should compute sum of array by given key', () => {
      const a = [
        { x: 8, y: 1 },
        { x: 3, y: 2 },
        { x: 5, y: 3 },
      ]
      expect(sum(a, 'x')).toEqual(16)
      expect(sum(a, 'y')).toEqual(6)
    })
  })

  describe('requireVersion', () => {
    it('should throw error for too old version', () => {
      expect(() => requireVersion('test', '3.7', '2.9.3')).toThrowError()
      expect(() => requireVersion('test', '3.7', '3.6.99-alpha3')).toThrowError()
      expect(() => requireVersion('test', '16.13.2.8', '16.13.2.8-beta')).toThrowError()
    })

    it('should not throw error for new enough version', () => {
      expect(() => requireVersion('test', '3.7', '3.7.0-beta.1')).not.toThrowError()
      expect(() => requireVersion('test', '3.7.1', '3.7.19')).not.toThrowError()
      expect(() => requireVersion('test', '3.7', '4.0.0')).not.toThrowError()
      expect(() => requireVersion('test', '16.13.2', '16.13.3-rc')).not.toThrowError()
    })

    it('should return boolean when `strict` parameter is false', () => {
      expect(requireVersion('test', '3.7', '2.9.3', false)).toBeFalse()
      expect(requireVersion('test', '3.7', '3.8', false)).toBeTrue()
    })
  })
})
