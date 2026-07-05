import Rect from '../../src/rect'

describe('Rect', () => {
  it('should be a function', () => {
    expect(typeof Rect).toBe('function')
  })

  it('should construct with undefined input', () => {
    expect(new Rect()).toEqual(jasmine.objectContaining({ h: 1, w: 1, x: 0, y: 0 }))
    expect(new Rect(false)).toEqual(jasmine.objectContaining({ h: 1, w: 1, x: 0, y: 0 }))
  })

  it('should construct from different kinds of input', () => {
    expect(new Rect({ h: 4, w: 3, x: 1, y: 2 })).toEqual(
      jasmine.objectContaining({ h: 4, w: 3, x: 1, y: 2 })
    )
    expect(new Rect({ height: 4, width: 3, x: 1, y: 2 })).toEqual(
      jasmine.objectContaining({ h: 4, w: 3, x: 1, y: 2 })
    )
    expect(new Rect({ bottom: 6, left: 1, right: 4, top: 2 })).toEqual(
      jasmine.objectContaining({ h: 4, w: 3, x: 1, y: 2 })
    )
  })
})
