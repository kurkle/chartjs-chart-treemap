/** The layout nodes, which v5 exposes as the parsed data. */
function nodes(chart) {
  const meta = chart.getDatasetMeta(0)
  return meta.data.map((_element, index) => meta.controller.getParsed(index))
}

describe('controller', () => {
  it('should be registered', () => {
    expect(Chart.registry.controllers.items.treemap).toBeDefined()
  })

  it('never modifies the array the user passed', () => {
    const data = [1, 2, 3]
    const chart = acquireChart({
      data: { datasets: [{ data }] },
      type: 'treemap',
    })

    expect(chart.data.datasets[0].data).toBe(data)
    expect(data).toEqual([1, 2, 3])
    chart.update()
    expect(chart.data.datasets[0].data).toBe(data)
    expect(data).toEqual([1, 2, 3])
  })

  it('keeps the same node objects when nothing has changed', () => {
    const chart = acquireChart({
      data: { datasets: [{ data: [1, 2, 3] }] },
      type: 'treemap',
    })
    const before = nodes(chart)

    chart.update()

    expect(nodes(chart)[0]).toBe(before[0])
    expect(nodes(chart).map((node) => node.v)).toEqual([3, 2, 1])
  })

  it('picks up an in-place edit without a version stamp', () => {
    const data = [1, 2]
    const chart = acquireChart({
      data: { datasets: [{ data }] },
      type: 'treemap',
    })

    expect(nodes(chart).map((node) => node.v)).toEqual([2, 1])

    data[0] = 9
    chart.update()

    expect(nodes(chart).map((node) => node.v)).toEqual([9, 2])
  })

  it('picks up an in-place edit of an item without a version stamp', () => {
    const data = [
      { category: 'a', value: 1 },
      { category: 'b', value: 2 },
    ]
    const chart = acquireChart({
      data: { datasets: [{ data, groups: ['category'], key: 'value' }] },
      type: 'treemap',
    })

    data[0].value = 9
    chart.update()

    expect(nodes(chart).find((node) => node.g === 'a').v).toBe(9)
  })

  it('picks up a push without a version stamp', () => {
    const data = [1, 2]
    const chart = acquireChart({
      data: { datasets: [{ data }] },
      type: 'treemap',
    })

    expect(chart.getDatasetMeta(0).data.length).toBe(2)

    data.push(5)
    chart.update()

    expect(chart.getDatasetMeta(0).data.length).toBe(3)
    expect(nodes(chart).map((node) => node.v)).toEqual([5, 2, 1])
  })

  it('throws a migration message when the removed tree option is used', () => {
    expect(() =>
      acquireChart({
        data: { datasets: [{ tree: [1, 2, 3] }] },
        type: 'treemap',
      })
    ).toThrowError(/"tree" option was renamed to "data"/)
  })

  it('should group 3 levels of data', () => {
    const data = [
      { a: 'a1', b: 'b1', c: 'c1', key: 10 },
      { a: 'a1', b: 'b1', c: 'c1', key: 20 },
      { a: 'a2', b: 'b1', c: 'c1', key: 40 },
      { a: 'a2', b: 'b1', c: 'c1', key: 99 },
      { a: 'a3', b: 'b1', c: 'c1', key: 10 },
      { a: 'a3', b: 'b1', c: 'c2', key: 20 },
      { a: 'a3', b: 'b2', c: 'c3', key: 40 },
      { a: 'a3', b: 'b2', c: 'c4', key: 99 },
      { a: 'a3', b: 'b3', c: 'c4', key: 50 },
    ]
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data,
            groups: ['a', 'b', 'c'],
            key: 'key',
          },
        ],
      },
      type: 'treemap',
    })
    const buildData = nodes(chart)

    const a1b1 = buildData.find((o) => o._data.path === 'a1.b1')
    expect(a1b1.v).toBe(30)
    expect(a1b1._data.children.length).toBe(2)

    const a1b1c1 = buildData.find((o) => o._data.path === 'a1.b1.c1')
    expect(a1b1c1.v).toBe(30)
    expect(a1b1c1._data.children.length).toBe(2)

    const a2b1c1 = buildData.find((o) => o._data.path === 'a2.b1.c1')
    expect(a2b1c1.v).toBe(139)
    expect(a2b1c1._data.children.length).toBe(2)

    const a3 = buildData.find((o) => o._data.path === 'a3')
    expect(a3.v).toBe(10 + 20 + 40 + 99 + 50)
    expect(a3._data.children.length).toBe(5)

    const a3b1c1 = buildData.find((o) => o._data.path === 'a3.b1.c1')
    expect(a3b1c1.v).toBe(10)
    expect(a3b1c1._data.children.length).toBe(1)

    const a3b1 = buildData.find((o) => o._data.path === 'a3.b1')
    expect(a3b1.v).toBe(10 + 20)
    expect(a3b1._data.children.length).toBe(2)

    const a3b2 = buildData.find((o) => o._data.path === 'a3.b2')
    expect(a3b2.v).toBe(40 + 99)
    expect(a3b2._data.children.length).toBe(2)

    const a3b3 = buildData.find((o) => o._data.path === 'a3.b3')
    expect(a3b3.v).toBe(50)
    expect(a3b3._data.children.length).toBe(1)

    const a3b3c4 = buildData.find((o) => o._data.path === 'a3.b3.c4')
    expect(a3b3c4.v).toBe(50)
    expect(a3b3c4._data.children.length).toBe(1)
  })

  it('should skip missing group levels', () => {
    const data = [
      { component: null, file: 'index.js', folder: './src', key: 1, subFolder: null },
      { component: 'A', file: 'A.js', folder: './src', key: 2, subFolder: null },
      { component: 'A', file: 'B.js', folder: './src', key: 3, subFolder: 'nested' },
    ]
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data,
            groups: ['folder', 'component', 'subFolder', 'file'],
            key: 'key',
          },
        ],
      },
      type: 'treemap',
    })
    const buildData = nodes(chart)

    const root = buildData.find((o) => o._data.path === './src')
    expect(root.v).toBe(6)

    const index = buildData.find((o) => o._data.path === './src.index.js')
    expect(index.v).toBe(1)
    expect(index.isLeaf).toBe(true)

    const component = buildData.find((o) => o._data.path === './src.A')
    expect(component.v).toBe(5)

    const componentFile = buildData.find((o) => o._data.path === './src.A.A.js')
    expect(componentFile.v).toBe(2)
    expect(componentFile.isLeaf).toBe(true)

    const nestedFile = buildData.find((o) => o._data.path === './src.A.nested.B.js')
    expect(nestedFile.v).toBe(3)
    expect(nestedFile.isLeaf).toBe(true)

    expect(buildData.find((o) => o._data.path === './src.index.js.index.js')).toBeUndefined()
  })

  it('should update labels when data changes', () => {
    const labels = []
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data: [1],
            labels: {
              display: true,
              formatter: (ctx) => {
                labels.push(ctx.raw.v)
                return `${ctx.raw.v}`
              },
            },
          },
        ],
      },
      type: 'treemap',
    })

    chart.draw()
    expect(labels).toContain(1)

    labels.length = 0
    chart.data.datasets[0].data = [5]
    chart.update()

    expect(labels).toContain(5)
  })

  it('should update labels when display changes', () => {
    const labels = []
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data: [1],
            labels: {
              display: false,
              formatter: (ctx) => {
                labels.push(ctx.raw.v)
                return `${ctx.raw.v}`
              },
            },
          },
        ],
      },
      type: 'treemap',
    })

    chart.draw()
    expect(labels).toEqual([])

    chart.data.datasets[0].labels.display = true
    chart.update()

    expect(labels).toContain(1)
  })

  it('should update captions when formatter changes', () => {
    const captions = []
    const oldFormatter = (ctx) => {
      captions.push(`old:${ctx.raw.g}`)
      return `old:${ctx.raw.g}`
    }
    const newFormatter = (ctx) => {
      captions.push(`new:${ctx.raw.g}`)
      return `new:${ctx.raw.g}`
    }
    const chart = acquireChart({
      data: {
        datasets: [
          {
            captions: {
              display: true,
              formatter: oldFormatter,
            },
            data: [
              { division: 'b', region: 'a', state: 'c', value: 1 },
              { division: 'b', region: 'a', state: 'd', value: 2 },
            ],
            groups: ['region', 'division', 'state'],
            key: 'value',
            labels: {
              display: false,
            },
          },
        ],
      },
      type: 'treemap',
    })

    chart.draw()
    expect(captions).toContain('old:a')

    captions.length = 0
    chart.data.datasets[0].captions.formatter = newFormatter
    chart.update()

    expect(captions).toContain('new:a')
  })

  it('should update labels when formatter changes', () => {
    const labels = []
    const oldFormatter = (ctx) => {
      labels.push(`old:${ctx.raw.v}`)
      return `old:${ctx.raw.v}`
    }
    const newFormatter = (ctx) => {
      labels.push(`new:${ctx.raw.v}`)
      return `new:${ctx.raw.v}`
    }
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data: [1],
            labels: {
              display: true,
              formatter: oldFormatter,
            },
          },
        ],
      },
      type: 'treemap',
    })

    chart.draw()
    expect(labels).toContain('old:1')

    labels.length = 0
    chart.data.datasets[0].labels.formatter = newFormatter
    chart.update()

    expect(labels).toContain('new:1')
  })

  it('resolves layout options from the dataset scope and ignores the elements scope', () => {
    const widths = (options) => {
      const chart = acquireChart({
        data: { datasets: [{ data: [4, 3, 2, 1] }] },
        options,
        type: 'treemap',
      })
      return chart.getDatasetMeta(0).data.map((element) => Math.round(element.width))
    }

    const base = widths({})

    // v5 breaking change, asserted on purpose: spacing is a dataset option and
    // the elements scope no longer reaches it.
    expect(widths({ elements: { treemap: { spacing: 20 } } })).toEqual(base)

    // ...while the dataset scope does, which is what makes the assertion above
    // a statement about scopes rather than about spacing being ignored.
    expect(widths({ datasets: { treemap: { spacing: 20 } } })).not.toEqual(base)
  })

  it('labels tooltips from the layout node, not from the dataset array', () => {
    const chart = acquireChart({
      data: {
        datasets: [
          {
            data: [{ category: 'a', value: 3 }],
            groups: ['category'],
            key: 'value',
            label: 'dataset label',
          },
        ],
      },
      type: 'treemap',
    })
    const controller = chart.getDatasetMeta(0).controller

    expect(controller.getLabelAndValue(0)).toEqual({ label: 'a', value: '3' })
  })

  it('falls back to the dataset label when a node has no group', () => {
    const chart = acquireChart({
      data: { datasets: [{ data: [3], label: 'dataset label' }] },
      type: 'treemap',
    })
    const controller = chart.getDatasetMeta(0).controller

    expect(controller.getLabelAndValue(0)).toEqual({ label: 'dataset label', value: '3' })
  })

  it('gives scriptable options the layout node as ctx.raw', () => {
    const seen = []
    acquireChart({
      data: {
        datasets: [
          {
            backgroundColor: (ctx) => {
              if (ctx.raw) {
                seen.push(ctx.raw.v)
              }
              return 'red'
            },
            data: [4, 2],
          },
        ],
      },
      type: 'treemap',
    })

    expect(seen).toContain(4)
    expect(seen).toContain(2)
  })

  describe('region', () => {
    const bounds = (chart, datasetIndex) => {
      const elements = chart.getDatasetMeta(datasetIndex).data
      return {
        bottom: Math.max(...elements.map((e) => e.y + e.height)),
        left: Math.min(...elements.map((e) => e.x)),
        right: Math.max(...elements.map((e) => e.x + e.width)),
        top: Math.min(...elements.map((e) => e.y)),
      }
    }

    // spacing insets every element, so it is off here to make the edges exact.
    const chartWith = (region) =>
      acquireChart({
        data: { datasets: [{ data: [4, 3, 2, 1], region, spacing: 0 }] },
        options: { events: [] },
        type: 'treemap',
      })

    it('fills the chart area when there is no region', () => {
      const chart = chartWith(undefined)
      const { left, right } = bounds(chart, 0)
      const area = chart.chartArea

      expect(Math.round(left)).toBe(Math.round(area.left))
      expect(Math.round(right)).toBe(Math.round(area.right))
    })

    it('keeps a half-width dataset in its half', () => {
      const chart = chartWith({ width: 0.5 })
      const { left, right } = bounds(chart, 0)
      const area = chart.chartArea
      const middle = area.left + (area.right - area.left) / 2

      expect(Math.round(left)).toBe(Math.round(area.left))
      expect(right).toBeLessThanOrEqual(middle + 1)
    })

    it('offsets a dataset by left and top', () => {
      const chart = chartWith({ height: 0.5, left: 0.5, top: 0.5 })
      const { left, top } = bounds(chart, 0)
      const area = chart.chartArea

      expect(left).toBeGreaterThanOrEqual(area.left + (area.right - area.left) / 2 - 1)
      expect(top).toBeGreaterThanOrEqual(area.top + (area.bottom - area.top) / 2 - 1)
    })

    it('clamps a region that reaches outside the chart area', () => {
      const chart = chartWith({ left: 0.75, width: 2 })
      const { right } = bounds(chart, 0)

      expect(right).toBeLessThanOrEqual(chart.chartArea.right + 1)
    })

    it('hovers only the dataset whose region was pointed at', async () => {
      const chart = acquireChart({
        data: {
          datasets: [
            { data: [4, 3, 2, 1], region: { width: 0.5 }, spacing: 0 },
            { data: [4, 3, 2, 1], region: { left: 0.5, width: 0.5 }, spacing: 0 },
          ],
        },
        type: 'treemap',
      })
      const area = chart.chartArea
      const target = { x: area.left + (area.right - area.left) * 0.25, y: area.top + 10 }

      await triggerMouseEvent(chart, 'mousemove', target)

      expect(chart.getActiveElements().length).toBeGreaterThan(0)
      expect(chart.getActiveElements().every((item) => item.datasetIndex === 0)).toBe(true)
    })
  })
})
