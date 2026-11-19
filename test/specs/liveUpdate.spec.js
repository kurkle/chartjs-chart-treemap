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
  // Resolves when the running animations have finished.
  return new Promise((resolve) => {
    const check = () => (chart.animating ? requestAnimationFrame(check) : resolve())
    check()
  })
}

function expectWellFormed(chart) {
  for (const el of elements(chart)) {
    expect(el.options).toBeDefined()
  }
  expect(() => chart.draw()).not.toThrow()
}

const animationModes = {
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
})
