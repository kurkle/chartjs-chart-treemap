import type {
  BorderRadius,
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

export type TreemapDisplayMode = 'containerBoxes' | 'headerBoxes'

export type TreemapBorderWidth =
  | number
  | Partial<Record<'bottom' | 'left' | 'right' | 'top', number>>

export type TreemapBorderRadius = Required<BorderRadius>

export type TreemapFontSpec = Partial<FontSpec>

export type TreemapScriptableContext = ScriptableContext<'treemap'> & {
  raw: TreemapDataPoint
}

export type TreemapFormatter<T> = T | ((context: TreemapScriptableContext) => T)

export type TreemapControllerDatasetCaptionsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>
  color?: Scriptable<Color, TreemapScriptableContext>
  display?: boolean
  formatter?: TreemapFormatter<string>
  font?: TreemapFontSpec
  hoverColor?: Scriptable<Color, TreemapScriptableContext>
  hoverFont?: TreemapFontSpec
  padding?: number
}

export type TreemapControllerDatasetLabelsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>
  color?: Scriptable<Color | Color[], TreemapScriptableContext>
  display?: boolean
  formatter?: TreemapFormatter<string | string[]>
  font?: Scriptable<TreemapFontSpec | TreemapFontSpec[], TreemapScriptableContext>
  hoverColor?: Scriptable<Color | Color[], TreemapScriptableContext>
  hoverFont?: Scriptable<TreemapFontSpec | TreemapFontSpec[], TreemapScriptableContext>
  overflow?: Scriptable<LabelOverflow, TreemapScriptableContext>
  padding?: number
  position?: Scriptable<LabelPosition, TreemapScriptableContext>
}

export type TreemapControllerDatasetDividersOptions = {
  display?: boolean
  lineCapStyle?: CanvasLineCap
  lineColor?: Color
  lineDash?: number[]
  lineDashOffset?: number
  lineWidth?: number
}

export type TreemapCaptionsOptions = {
  align?: LabelAlign
  color: Color
  display?: boolean
  font: TreemapFontSpec
  formatter?: TreemapFormatter<string>
  hoverColor?: Color
  hoverFont?: TreemapFontSpec
  padding: number
}

export type TreemapLabelsOptions = {
  align: LabelAlign
  color: Color | Color[]
  display?: boolean
  font: TreemapFontSpec | TreemapFontSpec[]
  formatter?: TreemapFormatter<string | string[]>
  hoverColor?: Color | Color[]
  hoverFont?: TreemapFontSpec | TreemapFontSpec[]
  overflow: LabelOverflow
  padding: number
  position: LabelPosition
}

export type TreemapDividersOptions = {
  display?: boolean
  lineCapStyle: CanvasLineCap
  lineColor: Color
  lineDash: number[]
  lineDashOffset: number
  lineWidth: number
}

export interface TreemapControllerDatasetOptions<DType> {
  spacing?: number
  rtl?: boolean
  displayType?: TreemapDisplayMode

  backgroundColor?: Scriptable<Color, TreemapScriptableContext>
  borderColor?: Scriptable<Color, TreemapScriptableContext>
  borderRadius?: Scriptable<number | Partial<BorderRadius>, TreemapScriptableContext>
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
  borderRadius: number | Partial<BorderRadius>
  borderWidth: TreemapBorderWidth
  captions: TreemapCaptionsOptions
  displayMode: TreemapDisplayMode
  dividers: TreemapDividersOptions
  labels: TreemapLabelsOptions
  rtl: boolean
  spacing: number
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
