const { createCanvas } = require('@napi-rs/canvas')
const { Chart, LinearScale, Tooltip } = require('chart.js')

Chart.register(LinearScale, Tooltip)

// side-effects
require('chartjs-chart-treemap')

const canvas = createCanvas(300, 320)
const ctx = canvas.getContext('2d')

// Chart.js assumes ctx contains the canvas
ctx.canvas = canvas

module.exports = new Chart(ctx, {
  data: {
    datasets: [
      {
        tree: [6, 6, 4, 3, 2, 2, 1],
      },
    ],
  },
  type: 'treemap',
})
