import { createCanvas } from '@napi-rs/canvas'
import { Chart, LinearScale, Tooltip } from 'chart.js'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'

Chart.register(LinearScale, Tooltip, TreemapController, TreemapElement)

const canvas = createCanvas(300, 320)
const ctx = canvas.getContext('2d')

// Chart.js assumes ctx contains the canvas
ctx.canvas = canvas

export const chart = new Chart(ctx, {
  data: {
    datasets: [
      {
        tree: [6, 6, 4, 3, 2, 2, 1],
      },
    ],
  },
  type: 'treemap',
})
