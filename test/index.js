import {
  acquireChart,
  addMatchers,
  afterEvent,
  releaseCharts,
  specsFromFixtures,
  triggerMouseEvent,
} from 'chartjs-test-utils'

window.devicePixelRatio = 1
window.acquireChart = acquireChart
window.afterEvent = afterEvent
window.triggerMouseEvent = triggerMouseEvent

jasmine.fixtures = specsFromFixtures

beforeAll(() => {
  // Disable colors plugin for tests.
  window.Chart.defaults.plugins.colors.enabled = false
})

beforeEach(() => {
  addMatchers()
})

afterEach(() => {
  releaseCharts()
})

console.warn(`Testing with chart.js v${Chart.version}`)
