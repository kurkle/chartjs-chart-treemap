import { parseBorderRadius, parseBorderWidth } from './options'

describe('options', () => {
  describe('parseBorderWidth', () => {
    it('parses a number for all sides', () => {
      expect(parseBorderWidth(5, 20, 10)).toEqual({ b: 5, l: 5, r: 5, t: 5 })
    })

    it('parses partial side objects and defaults missing sides to zero', () => {
      expect(parseBorderWidth({ right: 5, top: 1 }, 20, 10)).toEqual({
        b: 0,
        l: 0,
        r: 5,
        t: 1,
      })
    })

    it('clamps horizontal and vertical sides independently', () => {
      expect(parseBorderWidth({ bottom: 25, left: 30, right: 40, top: 15 }, 12, 8)).toEqual({
        b: 8,
        l: 12,
        r: 12,
        t: 8,
      })
    })

    it('clamps negative side values to zero', () => {
      expect(parseBorderWidth({ bottom: -4, left: -3, right: 2, top: 1 }, 12, 8)).toEqual({
        b: 0,
        l: 0,
        r: 2,
        t: 1,
      })
    })
  })

  describe('parseBorderRadius', () => {
    it('parses a number for all corners', () => {
      expect(parseBorderRadius(4, 20, 10)).toEqual({
        bottomLeft: 4,
        bottomRight: 4,
        topLeft: 4,
        topRight: 4,
      })
    })

    it('parses partial corner objects and defaults missing corners to zero', () => {
      expect(parseBorderRadius({ bottomRight: 3, topLeft: 2 }, 20, 10)).toEqual({
        bottomLeft: 0,
        bottomRight: 3,
        topLeft: 2,
        topRight: 0,
      })
    })

    it('clamps all corners to the smaller maximum dimension', () => {
      expect(
        parseBorderRadius({ bottomLeft: 30, bottomRight: 12, topLeft: 9, topRight: 20 }, 15, 10)
      ).toEqual({
        bottomLeft: 10,
        bottomRight: 10,
        topLeft: 9,
        topRight: 10,
      })
    })

    it('clamps negative corner values to zero', () => {
      expect(parseBorderRadius({ bottomLeft: -2, topRight: -1 }, 15, 10)).toEqual({
        bottomLeft: 0,
        bottomRight: 0,
        topLeft: 0,
        topRight: 0,
      })
    })
  })
})
