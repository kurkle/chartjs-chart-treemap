/**
 * Update cost against data size.
 *
 * v5 parses on every update instead of waiting for a `treeVersion` bump, so the
 * grouping recursion runs whether or not anything changed. This measures what
 * that costs, and where it overtakes what v4 did.
 *
 * The dominant cost at this size is not ours: about half of an update is
 * Chart.js resolving element options once per element, because option sharing
 * never engages for this element type. See the pull request for the analysis.
 *
 *   npm run bench
 */
import { createCanvas } from '@napi-rs/canvas'
import { Chart, LinearScale, Tooltip } from 'chart.js'

import { TreemapController, TreemapElement } from '../dist/chartjs-chart-treemap.esm.js'

Chart.register(LinearScale, Tooltip, TreemapController, TreemapElement)

const median = (values) => values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)]

function time(runs, fn) {
  const samples = []
  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    fn()
    samples.push(performance.now() - start)
  }
  return median(samples)
}

function rows(count, levels) {
  const out = []
  const width = Math.max(1, Math.round(Math.sqrt(count)))
  for (let i = 0; i < count; i++) {
    const row = { value: 1 + (i % 97) }
    if (levels > 0) {
      row.g1 = `g${i % width}`
    }
    if (levels > 1) {
      row.g2 = `s${i % 7}`
    }
    out.push(row)
  }
  return out
}

function measure(count, groups) {
  const data = rows(count, groups.length)
  const canvas = createCanvas(800, 600)
  const ctx = canvas.getContext('2d')
  ctx.canvas = canvas

  const start = performance.now()
  const chart = new Chart(ctx, {
    data: { datasets: [{ data, groups, key: 'value' }] },
    options: { animation: false, plugins: { legend: false, tooltip: false }, responsive: false },
    type: 'treemap',
  })
  const create = performance.now() - start
  const nodes = chart.getDatasetMeta(0)._parsed.length

  // The zoom plugin's case: an update per wheel event with nothing changed.
  const idle = time(9, () => chart.update('none'))

  let n = 0
  const edited = time(9, () => {
    data[0].value = 1 + (n++ % 90)
    chart.update('none')
  })

  chart.destroy()
  return { create, edited, idle, nodes }
}

const pad = (value, width) => String(value).padEnd(width)

console.log(
  pad('rows', 9) +
    pad('groups', 8) +
    pad('nodes', 9) +
    pad('create', 11) +
    pad('update, idle', 15) +
    'update, edited'
)
for (const count of [1000, 10000, 50000]) {
  for (const groups of [[], ['g1', 'g2']]) {
    const r = measure(count, groups)
    console.log(
      pad(count, 9) +
        pad(groups.length, 8) +
        pad(r.nodes, 9) +
        pad(`${r.create.toFixed(1)} ms`, 11) +
        pad(`${r.idle.toFixed(1)} ms`, 15) +
        `${r.edited.toFixed(1)} ms`
    )
  }
}
