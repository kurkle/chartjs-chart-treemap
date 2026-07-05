import squarify from './squarify'

type SquarifyRect = {
  h: number
  w: number
  x: number
  y: number
}

const round4 = (v: number) => Math.round(v * 10000) / 10000 || 0
const roundsq4 = <T extends SquarifyRect>(sq: T) => ({
  ...sq,
  h: round4(sq.h),
  w: round4(sq.w),
  x: round4(sq.x),
  y: round4(sq.y),
})

describe('squarify', () => {
  it('should be a function', () => {
    expect(typeof squarify).toBe('function')
  })

  it('should squarify 4 equal areas equally 4x4', () => {
    const sq = squarify([4, 4, 4, 4], { h: 4, w: 4, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 2, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 0, y: 2 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 2, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 2, y: 2 }),
    ])
  })

  it('should squarify 4 equal areas equally 6x6', () => {
    const sq = squarify([4, 4, 4, 4], { h: 6, w: 6, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 3, w: 3, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 3, w: 3, x: 0, y: 3 }),
      jasmine.objectContaining({ h: 3, w: 3, x: 3, y: 0 }),
      jasmine.objectContaining({ h: 3, w: 3, x: 3, y: 3 }),
    ])
  })

  it('should squarify 4 equal areas equally 8x6', () => {
    const sq = squarify([4, 4, 4, 4], { h: 6, w: 8, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 3, w: 4, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 3, w: 4, x: 0, y: 3 }),
      jasmine.objectContaining({ h: 3, w: 4, x: 4, y: 0 }),
      jasmine.objectContaining({ h: 3, w: 4, x: 4, y: 3 }),
    ])
  })

  it('should squarify 4 equal areas equally 6x8', () => {
    const sq = squarify([4, 4, 4, 4], { h: 8, w: 6, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 4, w: 3, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 4, w: 3, x: 3, y: 0 }),
      jasmine.objectContaining({ h: 4, w: 3, x: 0, y: 4 }),
      jasmine.objectContaining({ h: 4, w: 3, x: 3, y: 4 }),
    ])
  })

  it('should squarify 4 equal areas equally 8x2', () => {
    const sq = squarify([4, 4, 4, 4], { h: 2, w: 8, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 2, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 2, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 4, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 6, y: 0 }),
    ])
  })

  it('should squarify 4 equal areas equally 1x8', () => {
    const sq = squarify([4, 4, 4, 4], { h: 8, w: 1, x: 0, y: 0 })
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 1, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 1, x: 0, y: 2 }),
      jasmine.objectContaining({ h: 2, w: 1, x: 0, y: 4 }),
      jasmine.objectContaining({ h: 2, w: 1, x: 0, y: 6 }),
    ])
  })

  it('should squarify correctly', () => {
    const sq = squarify([6, 6, 4, 3, 2, 2, 1], { h: 4, w: 6, x: 0, y: 0 }).map(roundsq4)
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 3, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 3, x: 0, y: 2 }),
      jasmine.objectContaining({ h: 2.3333, w: 1.7143, x: 3, y: 0 }),
      jasmine.objectContaining({ h: 2.3333, w: 1.2857, x: 4.7143, y: 0 }),
      jasmine.objectContaining({ h: 1.6667, w: 1.2, x: 3, y: 2.3333 }),
      jasmine.objectContaining({ h: 1.6667, w: 1.2, x: 4.2, y: 2.3333 }),
      jasmine.objectContaining({ h: 1.6667, w: 0.6, x: 5.4, y: 2.3333 }),
    ])
  })

  it('should squarify unordered data correctly', () => {
    const sq = squarify([3, 2, 1, 6, 4, 6, 2], { h: 4, w: 6, x: 0, y: 0 }).map(roundsq4)
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 3, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 3, x: 0, y: 2 }),
      jasmine.objectContaining({ h: 2.3333, w: 1.7143, x: 3, y: 0 }),
      jasmine.objectContaining({ h: 2.3333, w: 1.2857, x: 4.7143, y: 0 }),
      jasmine.objectContaining({ h: 1.6667, w: 1.2, x: 3, y: 2.3333 }),
      jasmine.objectContaining({ h: 1.6667, w: 1.2, x: 4.2, y: 2.3333 }),
      jasmine.objectContaining({ h: 1.6667, w: 0.6, x: 5.4, y: 2.3333 }),
    ])
  })

  it('should squarify by given key', () => {
    const data = [{ v: 4 }, { v: 4 }, { v: 4 }, { v: 4 }]
    const rect = { h: 4, w: 4, x: 0, y: 0 }
    const sq = squarify(data, rect, ['v'])
    expect(sq).toEqual([
      jasmine.objectContaining({ h: 2, w: 2, x: 0, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 0, y: 2 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 2, y: 0 }),
      jasmine.objectContaining({ h: 2, w: 2, x: 2, y: 2 }),
    ])
  })

  it('should squarify by given group', () => {
    const data = [
      { g: 'a', v: 1 },
      { g: 'a', v: 2 },
      { g: 'b', v: 3 },
      { g: 'c', v: 4 },
    ]
    const rect = { h: 4, w: 4, x: 0, y: 0 }
    const sq = squarify(data, rect, ['v'], 'g', 0, 0).map(roundsq4)
    expect(sq).toEqual([
      jasmine.objectContaining({ a: 6.4, g: 'c', gs: 0, h: 2.2857, l: 0, w: 2.8, x: 0, y: 0 }),
      jasmine.objectContaining({
        a: 4.800000000000001,
        g: 'b',
        gs: 0,
        h: 1.7143,
        l: 0,
        w: 2.8,
        x: 0,
        y: 2.2857,
      }),
      jasmine.objectContaining({
        a: 3.2,
        g: 'a',
        gs: 0,
        h: 2.6667,
        l: 0,
        v: 2,
        w: 1.2,
        x: 2.8,
        y: 0,
      }),
      jasmine.objectContaining({
        a: 1.6,
        g: 'a',
        gs: 0,
        h: 1.3333,
        l: 0,
        v: 1,
        w: 1.2,
        x: 2.8,
        y: 2.6667,
      }),
    ])
  })

  it('should not fail with empty array', () => {
    const sq = squarify([], { h: 10, w: 10, x: 0, y: 0 })
    expect(sq).toEqual([])
  })

  it('should not fail with undefined input', () => {
    // @ts-expect-error test runtime fallback when values are omitted
    let sq = squarify(undefined, { h: 10, w: 10, x: 0, y: 0 })
    expect(sq).toEqual([])

    // @ts-expect-error test runtime fallback when rectangle is omitted
    sq = squarify([])
    expect(sq).toEqual([])

    // @ts-expect-error test runtime fallback when rectangle is omitted
    sq = squarify([1])
    expect(sq).toEqual([jasmine.objectContaining({ a: 1, h: 1, s: 1, v: 1, w: 1, x: 0, y: 0 })])

    // @ts-expect-error test runtime fallback when inputs are omitted
    sq = squarify()
    expect(sq).toEqual([])
  })
})
