import { parseBorderWidth } from '../../src/element'

describe('Rectangle', () => {
  describe('parseBorderWidth', () => {
    it('should parse object', () => {
      expect(parseBorderWidth({ right: 5, top: 1 }, 5, 5)).toEqual({ b: 0, l: 0, r: 5, t: 1 })
    })
    it('should parse number', () => {
      expect(parseBorderWidth(5, 5, 5)).toEqual({ b: 5, l: 5, r: 5, t: 5 })
    })
  })
})
