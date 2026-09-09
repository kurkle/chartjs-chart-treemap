import type { DrawRect } from './geometry'
import type { LayoutOptions } from './layout'
import type { TreemapDataPoint } from './types'

import { buildData, buildNodes, flattenNodes } from './layout'

const rect = (w: number, h: number) =>
  ({
    h,
    radius: { bottomLeft: 0, bottomRight: 0, topLeft: 0, topRight: 0 },
    w,
    x: 0,
    y: 0,
  }) as DrawRect

const options = (over: Partial<LayoutOptions> = {}): LayoutOptions => ({
  borderWidth: 0,
  captions: {},
  displayMode: 'containerBoxes',
  groups: [],
  leafKey: '_leaf',
  others: false,
  spacing: 0,
  unsorted: false,
  valueScale: 'linear',
  ...over,
})

const grouped = () => [
  { grp: 'a', sub: 'p', value: 4 },
  { grp: 'a', sub: 'q', value: 3 },
  { grp: 'b', sub: 'p', value: 2 },
  { grp: 'b', sub: 'q', value: 1 },
]

describe('layout', () => {
  it('builds the hierarchy without a rectangle at all', () => {
    const nodes = flattenNodes(
      buildNodes(grouped(), ['value'], options({ groups: ['grp', 'sub'] }))
    )

    // No chart area was involved, yet the count, the order and the values are
    // final. This is what lets the controller create its elements before the
    // layout has anywhere to put them.
    expect(nodes.length).toBe(6)
    expect(nodes.map((n) => n.g)).toEqual(['a', 'b', 'p', 'q', 'p', 'q'])
    expect(nodes.map((n) => n.v)).toEqual([7, 3, 4, 3, 2, 1])
    expect(nodes.every((n) => n.x === undefined && n.w === undefined)).toBe(true)
  })

  it('produces the same nodes whatever the chart area', () => {
    const opts = options({ groups: ['grp', 'sub'] })
    const small = buildData(grouped(), ['value'], rect(10, 10), opts)
    const large = buildData(grouped(), ['value'], rect(2000, 1000), opts)

    expect(large.length).toBe(small.length)
    expect(large.map((n) => [n.g, n.l, n.v])).toEqual(small.map((n) => [n.g, n.l, n.v]))
  })

  it('orders nodes as siblings first, then each sibling’s descendants', () => {
    const opts = options({ groups: ['grp', 'sub'] })
    const nodes = buildData(grouped(), ['value'], rect(400, 300), opts)

    expect(nodes.map((n) => n.g)).toEqual(['a', 'b', 'p', 'q', 'p', 'q'])
    expect(nodes.map((n) => n.l)).toEqual([0, 0, 1, 1, 1, 1])
    expect(nodes.map((n) => n.isLeaf)).toEqual([false, false, true, true, true, true])
  })

  it('sizes groups by the sum of their children and children by their parent', () => {
    const opts = options({ groups: ['grp', 'sub'] })
    const nodes = buildData(grouped(), ['value'], rect(400, 300), opts)
    const [a, b] = nodes

    expect(a.v).toBe(7)
    expect(b.v).toBe(3)
    // every child fits inside the parent it was laid out into
    for (const child of nodes.slice(2, 4)) {
      expect(child.x).toBeGreaterThanOrEqual(a.x)
      expect(child.x + child.w).toBeLessThanOrEqual(a.x + a.w + 1e-9)
    }
  })

  it('leaves ungrouped values without group fields', () => {
    const nodes = buildData([3, 1, 2], [''], rect(300, 200), options())

    expect(nodes.map((n) => n.v)).toEqual([3, 2, 1])
    expect(nodes.every((n) => n.g === undefined && n.l === undefined)).toBe(true)
  })

  it('keeps the input order when unsorted', () => {
    const nodes = buildData([3, 1, 2], [''], rect(300, 200), options({ unsorted: true }))

    expect(nodes.map((n) => n.v)).toEqual([3, 1, 2])
  })

  describe('valueScale', () => {
    // The shape of issue #213: one huge value and four tiny ones.
    const skewed = () => [134500, 19, 12, 8, 3]
    const widths = (valueScale: LayoutOptions['valueScale']) =>
      buildData(skewed(), [''], rect(800, 400), options({ valueScale })).map((n) => Math.round(n.w))

    it('keeps area proportional to value when linear', () => {
      const [big, ...small] = widths('linear')

      expect(big).toBeGreaterThan(700)
      expect(small.every((w) => w < 2)).toBe(true)
    })

    it('compresses the range with sqrt and log, leaving the small items visible', () => {
      for (const scale of ['sqrt', 'log'] as const) {
        const [big, ...small] = widths(scale)

        expect(big).toBeGreaterThan(0)
        expect(small.every((w) => w >= 2)).toBe(true)
      }
    })

    it('leaves the raw values alone', () => {
      const nodes = buildData(skewed(), [''], rect(800, 400), options({ valueScale: 'log' }))

      expect(nodes.map((n) => n.v)).toEqual([134500, 19, 12, 8, 3])
    })

    it('accepts a function, and treats a negative or non-finite result as zero', () => {
      const nodes = buildData(
        [4, 1, 2],
        [''],
        rect(400, 200),
        options({ valueScale: (value) => (value === 1 ? -5 : value) })
      )
      const byValue = new Map(nodes.map((n) => [n.v, Math.round(n.w)]))

      expect(byValue.get(1)).toBe(0)
      expect(byValue.get(4)).toBeGreaterThan(0)
    })

    it('sizes a group by the sum of its scaled children', () => {
      const data = [
        { grp: 'a', value: 100 },
        { grp: 'a', value: 100 },
        { grp: 'b', value: 1 },
      ]
      const nodes = buildData(
        data,
        ['value'],
        rect(400, 200),
        options({ groups: ['grp'], valueScale: 'sqrt' })
      )
      const a = nodes.find((n) => n.g === 'a')
      const b = nodes.find((n) => n.g === 'b')
      if (!a || !b) {
        throw new Error('both groups must be laid out')
      }

      // sqrt(100) + sqrt(100) = 20 against sqrt(1) = 1, not 200 against 1.
      expect((a.w * a.h) / (b.w * b.h)).toBeLessThan(50)
      expect(a.v).toBe(200)
    })
  })

  describe('others', () => {
    const othersOf = (nodes: TreemapDataPoint[]) => {
      const bucket = nodes.find((node) => node.isOthers)
      if (!bucket?._data) {
        throw new Error('expected an "others" bucket')
      }
      return bucket as TreemapDataPoint & { _data: Record<string, any> }
    }

    const prices = () => [134500, 20, 6, 6, 0.4]

    it('does nothing unless asked', () => {
      const nodes = buildData(prices(), [''], rect(800, 400), options())

      expect(nodes.length).toBe(5)
      expect(nodes.some((n) => n.isOthers)).toBe(false)
    })

    it('replaces the leaves below the threshold with one tile', () => {
      const nodes = buildData(
        prices(),
        [''],
        rect(800, 400),
        options({ others: { threshold: 0.01 } })
      )
      const bucket = othersOf(nodes)

      expect(nodes.length).toBe(2)
      expect(bucket.v).toBe(32.4)
      expect(bucket._data.label).toBe('Other')
      expect(bucket._data.others.length).toBe(4)
    })

    it('takes a label', () => {
      const nodes = buildData(
        prices(),
        [''],
        rect(800, 400),
        options({ others: { label: 'The rest', threshold: 0.01 } })
      )

      expect(othersOf(nodes)._data.label).toBe('The rest')
    })

    it('leaves the data alone when too few items are small', () => {
      const nodes = buildData(
        prices(),
        [''],
        rect(800, 400),
        options({ others: { minCount: 5, threshold: 0.01 } })
      )

      expect(nodes.length).toBe(5)
    })

    it('buckets inside each group, and never buckets a group', () => {
      const data = [
        { grp: 'a', value: 1000 },
        { grp: 'a', value: 1 },
        { grp: 'a', value: 2 },
        { grp: 'a', value: 3 },
        { grp: 'b', value: 500 },
      ]
      const nodes = buildData(
        data,
        ['value'],
        rect(800, 400),
        options({ groups: ['grp', 'value'], others: { threshold: 0.01 } })
      )

      // The two groups survive; the three tiny leaves inside 'a' become one tile.
      expect(
        nodes
          .filter((n) => n.l === 0)
          .map((n) => n.g)
          .sort()
      ).toEqual(['a', 'b'])
      expect(nodes.filter((n) => n.isOthers).length).toBe(1)
    })

    it('sums the sumKeys of what it absorbed', () => {
      const data = [
        { extra: 100, grp: 'x', value: 1000 },
        { extra: 2, grp: 'x', value: 1 },
        { extra: 3, grp: 'x', value: 2 },
      ]
      const nodes = buildData(
        data,
        ['value', 'extra'],
        rect(800, 400),
        options({ groups: ['grp', 'value'], others: { threshold: 0.01 } })
      )
      const bucket = othersOf(nodes)

      expect(bucket.v).toBe(3)
      expect(bucket.vs?.extra).toBe(5)
    })
  })
})
