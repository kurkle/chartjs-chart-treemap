describe('controller', () => {
  it('should be registered', () => {
    expect(Chart.controllers.treemap).toBeDefined()
  })

  it('should not rebuild data when nothing has changed', () => {
    const origData = [1, 2, 3]
    const chart = acquireChart({
      data: {
        datasets: [
          {
            tree: origData,
          },
        ],
      },
      type: 'treemap',
    })
    const buildData = chart.data.datasets[0].data
    expect(buildData).not.toBe(origData)
    chart.update()
    expect(buildData).toBe(chart.data.datasets[0].data)
  })

  it('should rebuild data when the tree is mutated in place', () => {
    const tree = [1, 2]
    const dataset = { tree, treeVersion: 0 }
    const chart = acquireChart({
      data: {
        datasets: [dataset],
      },
      type: 'treemap',
    })

    expect(chart.data.datasets[0].data.map((item) => item.v)).toEqual([2, 1])

    tree[0] = 9
    dataset.treeVersion++
    chart.update()

    expect(chart.data.datasets[0].data.map((item) => item.v)).toEqual([9, 2])
  })

  it('should rebuild data when a tree item is mutated in place', () => {
    const tree = [
      { category: 'a', value: 1 },
      { category: 'b', value: 2 },
    ]
    const dataset = { groups: ['category'], key: 'value', tree, treeVersion: 'initial' }
    const chart = acquireChart({
      data: {
        datasets: [dataset],
      },
      type: 'treemap',
    })

    tree[0].value = 9
    dataset.treeVersion = 'updated'
    chart.update()

    const category = chart.data.datasets[0].data.find((item) => item.g === 'a')
    expect(category.v).toBe(9)
  })

  it('should group 3 levels of data', () => {
    const tree = [
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
            groups: ['a', 'b', 'c'],
            key: 'key',
            tree,
          },
        ],
      },
      type: 'treemap',
    })
    const buildData = chart.data.datasets[0].data

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
    const tree = [
      { component: null, file: 'index.js', folder: './src', key: 1, subFolder: null },
      { component: 'A', file: 'A.js', folder: './src', key: 2, subFolder: null },
      { component: 'A', file: 'B.js', folder: './src', key: 3, subFolder: 'nested' },
    ]
    const chart = acquireChart({
      data: {
        datasets: [
          {
            groups: ['folder', 'component', 'subFolder', 'file'],
            key: 'key',
            tree,
          },
        ],
      },
      type: 'treemap',
    })
    const buildData = chart.data.datasets[0].data

    const root = buildData.find((o) => o._data.path === './src')
    expect(root.v).toBe(6)

    const index = buildData.find((o) => o._data.path === './src.index.js')
    expect(index.v).toBe(1)
    expect(index.isLeaf).toBeTrue()

    const component = buildData.find((o) => o._data.path === './src.A')
    expect(component.v).toBe(5)

    const componentFile = buildData.find((o) => o._data.path === './src.A.A.js')
    expect(componentFile.v).toBe(2)
    expect(componentFile.isLeaf).toBeTrue()

    const nestedFile = buildData.find((o) => o._data.path === './src.A.nested.B.js')
    expect(nestedFile.v).toBe(3)
    expect(nestedFile.isLeaf).toBeTrue()

    expect(buildData.find((o) => o._data.path === './src.index.js.index.js')).toBeUndefined()
  })

  it('should update labels when tree changes', () => {
    const labels = []
    const chart = acquireChart({
      data: {
        datasets: [
          {
            labels: {
              display: true,
              formatter: (ctx) => {
                labels.push(ctx.raw.v)
                return `${ctx.raw.v}`
              },
            },
            tree: [1],
          },
        ],
      },
      type: 'treemap',
    })

    chart.draw()
    expect(labels).toContain(1)

    labels.length = 0
    chart.data.datasets[0].tree = [5]
    chart.update()

    expect(labels).toContain(5)
  })

  it('should update labels when display changes', () => {
    const labels = []
    const chart = acquireChart({
      data: {
        datasets: [
          {
            labels: {
              display: false,
              formatter: (ctx) => {
                labels.push(ctx.raw.v)
                return `${ctx.raw.v}`
              },
            },
            tree: [1],
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
            groups: ['region', 'division', 'state'],
            key: 'value',
            labels: {
              display: false,
            },
            tree: [
              { division: 'b', region: 'a', state: 'c', value: 1 },
              { division: 'b', region: 'a', state: 'd', value: 2 },
            ],
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
            labels: {
              display: true,
              formatter: oldFormatter,
            },
            tree: [1],
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
})
