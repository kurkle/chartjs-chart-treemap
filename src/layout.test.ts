import type { DrawRect } from './geometry'
import type { LayoutOptions } from './layout'

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
  spacing: 0,
  unsorted: false,
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
})
