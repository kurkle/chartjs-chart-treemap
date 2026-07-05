import type {
  Chart,
  ChartComponent,
  Color,
  CoreChartOptions,
  DatasetController,
  Element,
  FontSpec,
  Scriptable,
  ScriptableContext,
  VisualElement,
} from 'chart.js'

export type AnyObject = Record<string, unknown>

export type LabelPosition = 'top' | 'middle' | 'bottom'

export type LabelAlign = 'left' | 'center' | 'right'

export type LabelOverflow = 'cut' | 'hidden' | 'fit'

type TreemapScriptableContext = ScriptableContext<'treemap'> & {
  raw: TreemapDataPoint
}

type TreemapControllerDatasetCaptionsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>
  color?: Scriptable<Color, TreemapScriptableContext>
  display?: boolean
  formatter?: Scriptable<string, TreemapScriptableContext>
  font?: FontSpec
  hoverColor?: Scriptable<Color, TreemapScriptableContext>
  hoverFont?: FontSpec
  padding?: number
}

type TreemapControllerDatasetLabelsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>
  color?: Scriptable<Color | Color[], TreemapScriptableContext>
  display?: boolean
  formatter?: Scriptable<string | Array<string>, TreemapScriptableContext>
  font?: Scriptable<FontSpec | FontSpec[], TreemapScriptableContext>
  hoverColor?: Scriptable<Color | Color[], TreemapScriptableContext>
  hoverFont?: Scriptable<FontSpec | FontSpec[], TreemapScriptableContext>
  overflow?: Scriptable<LabelOverflow, TreemapScriptableContext>
  padding?: number
  position?: Scriptable<LabelPosition, TreemapScriptableContext>
}

type TreemapControllerDatasetDividersOptions = {
  display?: boolean
  lineCapStyle?: string
  lineColor?: string
  lineDash?: number[]
  lineDashOffset?: number
  lineWidth?: number
}

export interface TreemapControllerDatasetOptions<DType> {
  spacing?: number
  rtl?: boolean
  displayType?: 'containerBoxes' | 'headerBoxes'

  backgroundColor?: Scriptable<Color, TreemapScriptableContext>
  borderColor?: Scriptable<Color, TreemapScriptableContext>
  borderWidth?: number

  hoverBackgroundColor?: Scriptable<Color, TreemapScriptableContext>
  hoverBorderColor?: Scriptable<Color, TreemapScriptableContext>
  hoverBorderWidth?: number

  captions?: TreemapControllerDatasetCaptionsOptions
  dividers?: TreemapControllerDatasetDividersOptions
  labels?: TreemapControllerDatasetLabelsOptions
  label?: string

  data: TreemapDataPoint[]
  groups?: Array<keyof DType>
  sumKeys?: Array<keyof DType>
  tree: number[] | DType[] | AnyObject
  treeLeafKey?: keyof DType
  key?: keyof DType
}

export interface TreemapDataPoint {
  x: number
  y: number
  w: number
  h: number
  v: number
  s: number
  l?: number
  g?: string
  gs?: number
  vs?: AnyObject
  _data?: AnyObject
  isLeaf?: boolean
}

declare module 'chart.js' {
  interface ChartTypeRegistry {
    treemap: {
      chartOptions: CoreChartOptions<'treemap'>
      datasetOptions: TreemapControllerDatasetOptions<Record<string, unknown>>
      defaultDataPoint: TreemapDataPoint
      metaExtensions: AnyObject
      parsedDataType: unknown
      scales: never
    }
  }
}

export interface TreemapOptions {
  backgroundColor: Color
  borderColor: Color
  borderWidth: number | { top?: number; right?: number; bottom?: number; left?: number }
}

export interface TreemapConfig {
  x: number
  y: number
  width: number
  height: number
}

export type TreemapController = DatasetController
export type TreemapControllerComponent = ChartComponent & {
  prototype: TreemapController
  new (chart: Chart, datasetIndex: number): TreemapController
}

export interface TreemapElement<
  T extends TreemapConfig = TreemapConfig,
  O extends TreemapOptions = TreemapOptions,
> extends Element<T, O>,
    VisualElement {}

export type TreemapElementComponent = ChartComponent & {
  prototype: TreemapElement
  new (cfg: TreemapConfig): TreemapElement
}
