import { animator } from 'chart.js'

// Applications and the docs editor change an option on the live config in
// place and call `chart.update()`. These specs hold the controller to that
// contract: the change lands on the first update, every element is fully
// formed, and nothing throws while the change animates in.

const rows = [
  { area: 30, division: 'Pacific', region: 'West', state: 'California' },
  { area: 20, division: 'Pacific', region: 'West', state: 'Oregon' },
  { area: 25, division: 'Mountain', region: 'West', state: 'Utah' },
  { area: 15, division: 'Mountain', region: 'West', state: 'Idaho' },
  { area: 40, division: 'New England', region: 'Northeast', state: 'Maine' },
  { area: 10, division: 'New England', region: 'Northeast', state: 'Vermont' },
  { area: 35, division: 'Mid-Atlantic', region: 'Northeast', state: 'New York' },
  { area: 12, division: 'Mid-Atlantic', region: 'Northeast', state: 'New Jersey' },
]

const FLAT = []
const REGION = ['region']
const ALL = ['region', 'division', 'state']

function datasetFor(overrides) {
  return {
    borderWidth: 0.5,
    data: rows,
    groups: REGION,
    key: 'area',
    spacing: 1,
    ...overrides,
  }
}

function create(dataset, options) {
  return acquireChart(
    {
      data: { datasets: [dataset] },
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

const elements = (chart) => chart.getDatasetMeta(0).data

function geometry(chart) {
  return elements(chart).map((el) => {
    const { x, y, width, height } = el.getProps(['x', 'y', 'width', 'height'], true)
    return [x, y, width, height].map((v) => Math.round(v * 1000) / 1000)
  })
}

function settled(chart) {
  // Resolves when the running animations have finished. An animation only
  // registers on the first frame, so look again after two.
  return new Promise((resolve) => {
    const check = () => (animator.running(chart) ? requestAnimationFrame(check) : resolve())
    requestAnimationFrame(() => requestAnimationFrame(check))
  })
}

function expectWellFormed(chart) {
  for (const el of elements(chart)) {
    expect(el.options).toBeDefined()
  }
  expect(() => chart.draw()).not.toThrow()
}

const animationModes = {
  'animations off': { animation: false },
  'animations on': { animation: { duration: 50 } },
}

const optionKinds = {
  'scriptable options': { backgroundColor: (ctx) => (ctx.raw?.l ? 'tan' : 'lightgray') },
  'shared options': { backgroundColor: 'rgba(220,230,220,0.3)' },
}

describe('in-place option changes', () => {
  describe('changing the number of elements', () => {
    for (const [animName, animation] of Object.entries(animationModes)) {
      for (const [kindName, kind] of Object.entries(optionKinds)) {
        for (const [from, to] of [
          [REGION, ALL],
          [ALL, REGION],
          [ALL, FLAT],
          [FLAT, ALL],
        ]) {
          it(`${from.length} -> ${to.length} groups, ${animName}, ${kindName}`, async () => {
            const chart = create(datasetFor({ ...kind, groups: [...from] }), animation)
            const before = elements(chart).length

            chart.data.datasets[0].groups = [...to]
            chart.update()

            const fresh = create(datasetFor({ ...kind, groups: [...to] }), animation)
            expect(elements(chart).length).toBe(elements(fresh).length)
            expect(elements(chart).length).not.toBe(before)
            expectWellFormed(chart)

            // The animation is still running; draw while it does.
            if (animName === 'animations on') {
              await new Promise((resolve) => requestAnimationFrame(resolve))
              expect(() => chart.draw()).not.toThrow()
              await settled(chart)
            }
            expectWellFormed(chart)
            expect(geometry(chart)).toEqual(geometry(fresh))
          })
        }
      }
    }
  })

  describe('changing an option that shapes the layout', () => {
    const cases = [
      ['groups', { groups: ALL }, (ds) => (ds.groups = [...ALL]), { groups: REGION }],
      [
        'displayMode',
        { displayMode: 'headerBoxes' },
        (ds) => (ds.displayMode = 'headerBoxes'),
        { displayMode: 'containerBoxes', groups: ALL },
      ],
      ['rtl', { rtl: true }, (ds) => (ds.rtl = true), { rtl: false }],
      ['spacing', { spacing: 8 }, (ds) => (ds.spacing = 8), { groups: ALL, spacing: 0 }],
      [
        'captions.display',
        { captions: { display: false } },
        (ds) => (ds.captions = { ...ds.captions, display: false }),
        { captions: { display: true }, groups: ALL, spacing: 4 },
      ],
      [
        'captions.padding',
        { captions: { padding: 20 } },
        (ds) => (ds.captions = { ...ds.captions, padding: 20 }),
        { captions: { padding: 3 }, groups: ALL, spacing: 4 },
      ],
      ['borderWidth', { borderWidth: 6 }, (ds) => (ds.borderWidth = 6), { groups: ALL }],
      ['valueScale', { valueScale: 'log' }, (ds) => (ds.valueScale = 'log'), { groups: ALL }],
      ['unsorted', { unsorted: true }, (ds) => (ds.unsorted = true), { groups: ALL }],
      ['others', { others: 3 }, (ds) => (ds.others = 3), { groups: ALL, key: 'area' }],
      ['leafKey', { leafKey: 'state' }, (ds) => (ds.leafKey = 'state'), { groups: ALL }],
    ]
    for (const [name, change, apply, start] of cases) {
      it(`applies ${name} on the first update()`, () => {
        const chart = create(datasetFor(start))
        const initial = geometry(chart)

        apply(chart.data.datasets[0])
        chart.update()

        const fresh = create(datasetFor({ ...start, ...change }))
        expectWellFormed(chart)
        expect(geometry(chart)).toEqual(geometry(fresh))
        // Guard against a case that changes nothing, which would pass vacuously.
        if (
          [
            'groups',
            'displayMode',
            'rtl',
            'spacing',
            'captions.padding',
            'unsorted',
            'valueScale',
          ].includes(name)
        ) {
          expect(geometry(fresh)).not.toEqual(initial)
        }
      })

      it(`applies ${name} on the first update('none')`, () => {
        const chart = create(datasetFor(start))
        apply(chart.data.datasets[0])
        chart.update('none')
        const fresh = create(datasetFor({ ...start, ...change }))
        expect(geometry(chart)).toEqual(geometry(fresh))
      })
    }
  })

  describe('changing an option of the rectangles', () => {
    const cases = [
      ['backgroundColor', (ds) => (ds.backgroundColor = 'rgb(200,30,30)')],
      ['borderColor', (ds) => (ds.borderColor = 'rgb(0,0,200)')],
      ['borderWidth', (ds) => (ds.borderWidth = 4)],
      ['labels.display', (ds) => (ds.labels.display = true)],
      ['captions.color', (ds) => (ds.captions.color = 'rgb(0,160,0)')],
    ]
    const base = () =>
      datasetFor({
        backgroundColor: 'rgba(220,230,220,0.3)',
        borderColor: 'rgba(200,200,200,1)',
        captions: { color: 'red', display: true },
        groups: ALL,
        labels: { display: false, overflow: 'hidden' },
      })
    const pixels = (chart) => chart.canvas.getContext('2d').getImageData(0, 0, 400, 300).data.join()

    for (const [animName, animation] of Object.entries(animationModes)) {
      for (const [name, apply] of cases) {
        it(`draws ${name} after an in-place change, ${animName}`, async () => {
          const chart = create(base(), animation)
          await settled(chart)
          const initial = pixels(chart)

          apply(chart.data.datasets[0])
          chart.update()
          await settled(chart)

          const changed = base()
          apply(changed)
          const fresh = create(changed, animation)
          await settled(fresh)
          expect(pixels(fresh)).not.toBe(initial)
          expect(pixels(chart)).toBe(pixels(fresh))
        })
      }
    }
  })

  describe('an animation in flight', () => {
    it('can be drawn every frame while growing and shrinking', async () => {
      const chart = create(datasetFor({ groups: REGION }), { animation: { duration: 80 } })
      for (const groups of [ALL, FLAT, REGION, ALL]) {
        chart.data.datasets[0].groups = [...groups]
        chart.update()
        for (let frame = 0; frame < 3; frame++) {
          expectWellFormed(chart)
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
      }
      await settled(chart)
      expectWellFormed(chart)
    })
  })

  describe('an update with nothing changed', () => {
    it("does not rebuild the nodes or re-run the layout on update('none')", () => {
      const chart = create(datasetFor({ groups: ALL }))
      const meta = chart.getDatasetMeta(0)
      const nodes = meta.controller._nodes
      const parsed = meta._parsed

      // A layout pass would overwrite this.
      nodes[0].x = -999

      chart.update('none')
      chart.update('none')

      expect(meta.controller._nodes).toBe(nodes)
      expect(meta._parsed).toBe(parsed)
      expect(nodes[0].x).toBe(-999)
    })

    it('does re-run the layout when a layout option changed', () => {
      const chart = create(datasetFor({ groups: ALL }))
      const meta = chart.getDatasetMeta(0)
      const nodes = meta.controller._nodes
      nodes[0].x = -999

      chart.data.datasets[0].spacing = 5
      chart.update('none')

      expect(nodes[0].x).not.toBe(-999)
    })
  })
})
