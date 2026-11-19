import { animator } from 'chart.js'

// Applications mutate the observed data array in place (push, splice, ...) and
// call `chart.update()`. Chart.js listens on that array and queues the changes
// on the controller, which this controller never consumes because it re-parses
// the whole dataset on every update. These specs hold the chart to the same
// result as a freshly created one, on the first update, and keep the queues
// Chart.js fills from growing.

const base = [
  { area: 30, division: 'Pacific', region: 'West', state: 'California' },
  { area: 20, division: 'Pacific', region: 'West', state: 'Oregon' },
  { area: 25, division: 'Mountain', region: 'West', state: 'Utah' },
  { area: 15, division: 'Mountain', region: 'West', state: 'Idaho' },
  { area: 40, division: 'New England', region: 'Northeast', state: 'Maine' },
  { area: 10, division: 'New England', region: 'Northeast', state: 'Vermont' },
  { area: 35, division: 'Mid-Atlantic', region: 'Northeast', state: 'New York' },
  { area: 12, division: 'Mid-Atlantic', region: 'Northeast', state: 'New Jersey' },
]
const extra = [
  { area: 50, division: 'Pacific', region: 'West', state: 'Washington' },
  { area: 5, division: 'Gulf', region: 'South', state: 'Texas' },
]

const ALL = ['region', 'division', 'state']
const weights = [3, 9, 1, 7, 2, 8, 4, 6, 5, 10]
const withWeights = (rows) => rows.map((row, i) => ({ ...row, pop: weights[i % weights.length] }))
const copy = (value) => JSON.parse(JSON.stringify(value))

function datasetFor(data, overrides) {
  return {
    borderWidth: 0.5,
    data,
    groups: ALL,
    key: 'area',
    leafKey: 'state',
    spacing: 1,
    ...overrides,
  }
}

function create(datasets, options) {
  return acquireChart(
    {
      data: { datasets },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: { legend: false, title: false, tooltip: false },
        responsive: false,
        ...options,
      },
      type: 'treemap',
    },
    { canvas: { height: 300, width: 400 } }
  )
}

const elements = (chart, i = 0) => chart.getDatasetMeta(i).data
const controller = (chart, i = 0) => chart.getDatasetMeta(i).controller

function geometry(chart, i = 0) {
  return elements(chart, i).map((el) => {
    const { x, y, width, height } = el.getProps(['x', 'y', 'width', 'height'], true)
    return [x, y, width, height].map((v) => Math.round(v * 1000) / 1000)
  })
}

// What a tooltip or a scriptable option sees for every rectangle.
const parsed = (chart, i = 0) =>
  chart.getDatasetMeta(i)._parsed.map((node) => [node.v, node.g, node.l, node.isLeaf])

function settled(chart) {
  return new Promise((resolve) => {
    const check = () => (animator.running(chart) ? requestAnimationFrame(check) : resolve())
    requestAnimationFrame(() => requestAnimationFrame(check))
  })
}

function expectWellFormed(chart) {
  for (let i = 0; i < chart.data.datasets.length; i++) {
    for (const el of elements(chart, i)) {
      expect(el.options).toBeDefined()
    }
  }
  expect(() => chart.draw()).not.toThrow()
}

function expectSameAsFresh(chart, animation) {
  const fresh = create(
    chart.data.datasets.map((ds) => ({ ...ds, data: copy(ds.data) })),
    animation
  )
  for (let i = 0; i < chart.data.datasets.length; i++) {
    expect(elements(chart, i).length).toBe(elements(fresh, i).length)
    expect(parsed(chart, i)).toEqual(parsed(fresh, i))
    expect(geometry(chart, i)).toEqual(geometry(fresh, i))
  }
  return fresh
}

const animationModes = {
  'animations off': { animation: false },
  'animations on': { animation: { duration: 50 } },
}

// Each mutation changes the data of the single dataset in place.
const mutations = {
  'index assignment of a row': (data) => {
    data[2] = { area: 99, division: 'Mountain', region: 'West', state: 'Nevada' }
  },
  'index assignment of an equal row': (data) => {
    data[2] = { ...data[2] }
  },
  pop: (data) => data.pop(),
  push: (data) => data.push(...extra),
  'replacing the array': (_data, ds) => {
    ds.data = [...copy(base).reverse(), copy(extra[0])]
  },
  'replacing the array with equal rows': (_data, ds) => {
    ds.data = copy(base)
  },
  'row value change': (data) => {
    data[0].area = 3
  },
  shift: (data) => data.shift(),
  'splice insert': (data) => data.splice(3, 0, extra[0], extra[1]),
  'splice remove': (data) => data.splice(1, 3),
  'splice replace': (data) => data.splice(1, 2, extra[1]),
  unshift: (data) => data.unshift(extra[0]),
}

describe('mutating the data in place', () => {
  for (const [animName, animation] of Object.entries(animationModes)) {
    for (const [name, mutate] of Object.entries(mutations)) {
      it(`${name} equals a fresh chart on the first update(), ${animName}`, async () => {
        const chart = create([datasetFor(copy(base))], animation)
        const ds = chart.data.datasets[0]
        mutate(ds.data, ds)
        chart.update()

        expectWellFormed(chart)
        const fresh = expectSameAsFresh(chart, animation)
        await settled(chart)
        await settled(fresh)
        expectWellFormed(chart)
        expect(geometry(chart)).toEqual(geometry(fresh))
        // The nodes must refer to the rows that are in the data now.
        for (const node of chart.getDatasetMeta(0)._parsed) {
          if (node.isLeaf) {
            const rows = chart.data.datasets[0].data
            expect(node._data.children.every((row) => rows.includes(row))).toBe(true)
          }
        }
      })
    }

    it(`survives every mutation in a row, ${animName}`, async () => {
      const chart = create([datasetFor(copy(base))], animation)
      const ds = chart.data.datasets[0]
      for (const mutate of Object.values(mutations)) {
        mutate(ds.data, ds)
        chart.update()
        expectWellFormed(chart)
        expectSameAsFresh(chart, animation)
      }
      await settled(chart)
      expectWellFormed(chart)
    })
  }

  it('mutates without an update in between, then updates once', () => {
    const chart = create([datasetFor(copy(base))])
    const data = chart.data.datasets[0].data
    data.push(extra[0])
    data.shift()
    data.splice(2, 1)
    data.unshift(extra[1])
    data.pop()
    chart.update()
    expectWellFormed(chart)
    expectSameAsFresh(chart)
  })

  describe('the parse fingerprint', () => {
    const lookingAlike = {
      'a label-only change': (data) => {
        data[0].state = 'Golden State'
      },
      'a row changing group': (data) => {
        data[0].division = 'Mountain'
      },
      'two rows swapping their groups': (data) => {
        const d = data[0].division
        data[0].division = data[2].division
        data[2].division = d
      },
      'two rows swapping values': (data) => {
        const a = data[0].area
        data[0].area = data[1].area
        data[1].area = a
      },
    }
    for (const [name, mutate] of Object.entries(lookingAlike)) {
      it(`does not hide ${name}`, () => {
        const chart = create([datasetFor(copy(base))])
        const before = parsed(chart)
        mutate(chart.data.datasets[0].data)
        chart.update('none')
        expectWellFormed(chart)
        expectSameAsFresh(chart)
        // A vacuous case would pass for the wrong reason.
        expect(parsed(chart)).not.toEqual(before)
      })
    }

    it('does not hide a change of a sumKeys value that leaves the key alone', () => {
      const chart = create([datasetFor(withWeights(copy(base)), { sumKeys: ['pop'] })])
      const before = JSON.stringify(chart.getDatasetMeta(0)._parsed.map((node) => node.vs))
      chart.data.datasets[0].data[0].pop += 5
      chart.update('none')
      const after = JSON.stringify(chart.getDatasetMeta(0)._parsed.map((node) => node.vs))
      expect(after).not.toBe(before)
      const fresh = create([datasetFor(copy(chart.data.datasets[0].data), { sumKeys: ['pop'] })])
      expect(after).toBe(JSON.stringify(fresh.getDatasetMeta(0)._parsed.map((node) => node.vs)))
    })

    it("still skips the layout on update('none') with untouched data", () => {
      const chart = create([datasetFor(copy(base))])
      const nodes = controller(chart)._nodes
      nodes[0].x = -999
      chart.update('none')
      expect(controller(chart)._nodes).toBe(nodes)
      expect(nodes[0].x).toBe(-999)
    })
  })

  describe('the queues Chart.js fills', () => {
    it('keep a bounded length over many mutations and updates', () => {
      const chart = create([datasetFor(copy(base))])
      const data = chart.data.datasets[0].data
      const lengths = []
      for (let n = 0; n < 200; n++) {
        data.push({ ...extra[0], area: n + 1 })
        data.shift()
        data.splice(1, 1, { ...extra[1], area: n + 1 })
        data.unshift({ ...extra[0] })
        data.pop()
        chart.update('none')
        lengths.push([controller(chart)._syncList.length, chart._dataChanges.length])
      }
      expect(Math.max(...lengths.map((l) => l[0]))).toBe(0)
      expect(Math.max(...lengths.map((l) => l[1]))).toBe(0)
      expectSameAsFresh(chart)
    })

    it('are empty after an update', () => {
      const chart = create([datasetFor(copy(base))])
      chart.data.datasets[0].data.push(extra[0])
      expect(controller(chart)._syncList.length).toBeGreaterThanOrEqual(0)
      chart.update()
      expect(controller(chart)._syncList).toEqual([])
      expect(chart._dataChanges).toEqual([])
    })
  })
})

describe('datasets of a live chart', () => {
  for (const [animName, animation] of Object.entries(animationModes)) {
    it(`a dataset added by push equals a fresh chart, ${animName}`, async () => {
      const chart = create([datasetFor(copy(base), { region: { height: 0.5 } })], animation)
      chart.data.datasets.push(
        datasetFor(copy(extra), { groups: ['region'], region: { height: 0.5, top: 0.5 } })
      )
      chart.update()
      expectWellFormed(chart)
      expectSameAsFresh(chart, animation)
      await settled(chart)
      expectWellFormed(chart)
      expectSameAsFresh(chart, animation)
    })

    it(`a dataset removed equals a fresh chart, ${animName}`, async () => {
      const chart = create(
        [
          datasetFor(copy(base), { region: { height: 0.5 } }),
          datasetFor(copy(extra), { groups: ['region'], region: { height: 0.5, top: 0.5 } }),
        ],
        animation
      )
      chart.data.datasets.shift()
      chart.update()
      expectWellFormed(chart)
      expect(chart.getDatasetMeta(0).controller.getDataset()).toBe(chart.data.datasets[0])
      expectSameAsFresh(chart, animation)
      await settled(chart)
      expectWellFormed(chart)
    })

    it(`two datasets sharing one data array stay equal after a mutation, ${animName}`, async () => {
      const shared = copy(base)
      const chart = create(
        [
          datasetFor(shared, { region: { height: 0.5 } }),
          datasetFor(shared, { groups: ['region'], region: { height: 0.5, top: 0.5 } }),
        ],
        animation
      )
      shared.push(copy(extra[0]))
      shared[0].area = 4
      shared.splice(1, 1)
      chart.update()
      expectWellFormed(chart)
      expectSameAsFresh(chart, animation)
      await settled(chart)
      expectWellFormed(chart)
    })
  }

  it('keeps the queues bounded with two datasets sharing one array', () => {
    const shared = copy(base)
    const chart = create([datasetFor(shared), datasetFor(shared, { groups: ['region'] })])
    for (let n = 0; n < 50; n++) {
      shared.push(copy(extra[0]))
      shared.shift()
      chart.update('none')
    }
    expect(controller(chart, 0)._syncList.length).toBe(0)
    expect(controller(chart, 1)._syncList.length).toBe(0)
    expect(chart._dataChanges.length).toBe(0)
  })
})

describe('a scriptable option reading a row', () => {
  it('sees the new row after the data is replaced by an equal-looking one', () => {
    const colorOf = (ctx) => (ctx.raw._data.children[0].mark ? 'rgb(200,0,0)' : 'rgb(0,0,200)')
    const rows = copy(base)
    const chart = create([datasetFor(rows, { backgroundColor: colorOf })])
    const leaf = () =>
      elements(chart).findIndex((_el, i) => chart.getDatasetMeta(0)._parsed[i].isLeaf)
    expect(elements(chart)[leaf()].options.backgroundColor).toBe('rgb(0,0,200)')

    chart.data.datasets[0].data = rows.map((row) => ({ ...row, mark: true }))
    chart.update()
    expect(elements(chart)[leaf()].options.backgroundColor).toBe('rgb(200,0,0)')
  })
})

describe('in-place option changes that were not covered', () => {
  const pixels = (chart) => chart.canvas.getContext('2d').getImageData(0, 0, 400, 300).data.join()
  const start = () => ({
    data: withWeights(copy(base)),
    groups: ALL,
    key: 'area',
    leafKey: 'state',
  })
  const nodes = (chart) => JSON.stringify(chart.getDatasetMeta(0)._parsed)

  // [name, change applied in place, starting dataset overrides, what moves]
  const cases = [
    ['key', (ds) => (ds.key = 'pop'), {}, 'geometry'],
    ['sumKeys', (ds) => (ds.sumKeys = ['pop']), {}, 'nodes'],
    ['sumKeys removed', (ds) => (ds.sumKeys = []), { sumKeys: ['pop'] }, 'nodes'],
    ['groups order', (ds) => (ds.groups = ['division', 'region', 'state']), {}, 'geometry'],
    ['groups element replaced', (ds) => (ds.groups[1] = 'region'), {}, 'geometry'],
    ['region added', (ds) => (ds.region = { width: 0.5 }), {}, 'geometry'],
    ['region removed', (ds) => (ds.region = undefined), { region: { width: 0.5 } }, 'geometry'],
    [
      'region.left',
      (ds) => (ds.region.left = 0.25),
      { region: { left: 0, width: 0.5 } },
      'geometry',
    ],
    ['region.top', (ds) => (ds.region.top = 0.25), { region: { height: 0.5, top: 0 } }, 'geometry'],
    ['region.width', (ds) => (ds.region.width = 0.75), { region: { width: 0.5 } }, 'geometry'],
    ['region.height', (ds) => (ds.region.height = 0.75), { region: { height: 0.5 } }, 'geometry'],
    [
      'others threshold',
      (ds) => (ds.others.threshold = 0.3),
      { groups: [], others: { threshold: 0.1 } },
      'geometry',
    ],
    ['others added', (ds) => (ds.others = { threshold: 0.2 }), { groups: [] }, 'geometry'],
    [
      'others removed',
      (ds) => (ds.others = false),
      { groups: [], others: { threshold: 0.2 } },
      'geometry',
    ],
    [
      'valueScale back to linear',
      (ds) => (ds.valueScale = 'linear'),
      { valueScale: 'log' },
      'geometry',
    ],
    // leafKey only names the leaves of object data, so nothing moves here.
    ['leafKey', (ds) => (ds.leafKey = 'division'), {}, undefined],
    [
      'captions.align',
      (ds) => (ds.captions.align = 'right'),
      { captions: { align: 'left' } },
      'pixels',
    ],
    [
      'captions.font',
      (ds) => (ds.captions.font = { size: 20 }),
      { captions: { font: { size: 8 } } },
      'geometry',
    ],
    [
      'captions.color',
      (ds) => (ds.captions.color = 'rgb(0,160,0)'),
      { captions: { color: 'red' } },
      'pixels',
    ],
    [
      'captions.padding',
      (ds) => (ds.captions.padding = 12),
      { captions: { padding: 2 } },
      'geometry',
    ],
    [
      'captions.display',
      (ds) => (ds.captions.display = false),
      { captions: { display: true } },
      'geometry',
    ],
    [
      'labels.display',
      (ds) => (ds.labels.display = true),
      { labels: { display: false } },
      'pixels',
    ],
    [
      'labels.align',
      (ds) => (ds.labels.align = 'right'),
      { labels: { align: 'left', display: true } },
      'pixels',
    ],
    [
      'labels.color',
      (ds) => (ds.labels.color = 'rgb(0,160,0)'),
      { labels: { color: 'red', display: true } },
      'pixels',
    ],
    [
      'labels.overflow',
      (ds) => (ds.labels.overflow = 'hidden'),
      { labels: { display: true, font: { size: 40 }, overflow: 'fit' } },
      'pixels',
    ],
    [
      'labels replaced',
      (ds) => (ds.labels = { color: 'blue', display: true }),
      { labels: { display: false } },
      'pixels',
    ],
  ]
  const clone = (value) => (value === undefined || value === false ? value : copy(value))

  for (const [animName, animation] of Object.entries(animationModes)) {
    for (const [name, apply, overrides, moves] of cases) {
      it(`${name} takes effect on the first update(), ${animName}`, async () => {
        const make = () => {
          const ds = { ...start(), ...overrides }
          return Object.fromEntries(
            Object.entries(ds).map(([k, v]) => [k, k === 'data' ? v : clone(v)])
          )
        }
        const chart = create([make()], animation)
        await settled(chart)
        const initial = { geometry: geometry(chart), nodes: nodes(chart), pixels: pixels(chart) }

        const expected = make()
        apply(expected)
        apply(chart.data.datasets[0])
        chart.update()
        expectWellFormed(chart)
        await settled(chart)

        const fresh = create([expected], animation)
        await settled(fresh)
        expect(elements(chart).length).toBe(elements(fresh).length)
        expect(nodes(chart)).toBe(nodes(fresh))
        expect(geometry(chart)).toEqual(geometry(fresh))
        expect(pixels(chart)).toBe(pixels(fresh))
        // A case that changes nothing would pass for the wrong reason.
        if (moves) {
          expect(
            { geometry: geometry(fresh), nodes: nodes(fresh), pixels: pixels(fresh) }[moves]
          ).not.toEqual(initial[moves])
        }
      })
    }
  }
})
