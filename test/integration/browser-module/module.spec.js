import { Chart, registerables } from 'chart.js'

import { TreemapController, TreemapElement } from '../../../dist/chartjs-chart-treemap.esm.js'

describe('browser esm integration', () => {
  const getRegisteredController = () => Chart.registry.controllers.items.treemap
  const getRegisteredElement = () => Chart.registry.elements.items.treemap
  let canvas

  afterEach(() => {
    canvas?.remove()
    canvas = null
    Chart.unregister(...registerables)
    Chart.unregister(TreemapController, TreemapElement)
  })

  it('requires explicit registration for the built esm bundle', () => {
    expect(getRegisteredController()).toBeUndefined()
    expect(getRegisteredElement()).toBeUndefined()
  })

  it('imports the built esm bundle and creates a treemap chart after registration', () => {
    Chart.register(...registerables, TreemapController, TreemapElement)

    expect(getRegisteredController()).toBe(TreemapController)
    expect(getRegisteredElement()).toBe(TreemapElement)

    canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 150
    document.body.appendChild(canvas)

    const chart = new Chart(canvas.getContext('2d'), {
      data: {
        datasets: [
          {
            tree: [6, 6, 4, 3, 2, 2, 1],
          },
        ],
      },
      type: 'treemap',
    })

    expect(chart.config.type).toBe('treemap')
    expect(chart.data.datasets.length).toBe(1)
    expect(chart.data.datasets[0].tree.length).toBe(7)
    expect(chart.getDatasetMeta(0).type).toBe('treemap')
    expect(chart.getDatasetMeta(0).controller).toBeTruthy()

    chart.destroy()
  })
})
