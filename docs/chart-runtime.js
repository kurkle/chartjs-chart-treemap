import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'

import { TreemapController, TreemapElement } from '../dist/chartjs-chart-treemap.esm.js'
import { docsVersion } from './src/generated/version.js'
import * as Data from './scripts/data.js'
import * as helpers from './scripts/helpers.js'
import * as Utils from './scripts/utils.js'

Chart.register(...registerables, TreemapController, TreemapElement, ChartDataLabels, zoomPlugin)
Chart.defaults.plugins.datalabels.display = false

Chart.register({
  id: 'version',
  afterDraw(chart) {
    const ctx = chart.ctx
    const versionLabel = docsVersion
      ? `Chart.js v${Chart.version} + chartjs-chart-treemap v${docsVersion}`
      : `Chart.js v${Chart.version}`
    ctx.save()
    ctx.font = '9px monospace'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(versionLabel, chart.chartArea.right - 8, 2)
    ctx.restore()
  },
})

export const globals = { Chart, Data, Utils, helpers }

export function createChart(canvas, config) {
  return new Chart(canvas, config)
}
