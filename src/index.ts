import { Chart } from 'chart.js'

import TreemapController from './controller'
import TreemapElement from './element'

Chart.register(TreemapController as any, TreemapElement as any)

export type {
  LabelAlign,
  LabelOverflow,
  LabelPosition,
  TreemapConfig,
  TreemapControllerDatasetOptions,
  TreemapDataPoint,
  TreemapElement as TreemapElementType,
  TreemapOptions,
} from './types'

export * from './utils'
export { TreemapController, TreemapElement }
