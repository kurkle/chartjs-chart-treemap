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

export { default as TreemapController } from './controller.js'
export { default as TreemapElement } from './element.js'
export { flattenTree } from './utils.js'
