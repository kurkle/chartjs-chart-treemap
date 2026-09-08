import { Chart, LinearScale, Tooltip } from 'chart.js'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'

Chart.register(LinearScale, Tooltip, TreemapController, TreemapElement)

export { Chart, TreemapController, TreemapElement }
