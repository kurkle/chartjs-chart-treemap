import { Chart } from 'chart.js'

import TreemapController from './controller.js'
import TreemapElement from './element.js'

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
} from './types.js'

export * from './utils.js'
export { TreemapController, TreemapElement }
