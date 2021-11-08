import {
  Chart,
  ChartComponent,
  DatasetController,
  Element,
  ScriptableContext, Color, Scriptable, FontSpec
} from 'chart.js';

type TreemapScriptableContext = ScriptableContext<'treemap'> & {
  raw: TreemapDataPoint
}

type TreemapControllerDatasetCaptionsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>,
  color?: Scriptable<Color, TreemapScriptableContext>,
  display?: boolean;
  formatter?: Scriptable<string, TreemapScriptableContext>,
  font?: FontSpec,
  hoverColor?: Scriptable<Color, TreemapScriptableContext>,
  hoverFont?: FontSpec,
  padding?: number,
}

type TreemapControllerDatasetLabelsOptions = {
  align?: Scriptable<LabelAlign, TreemapScriptableContext>,
  color?: Scriptable<Color, TreemapScriptableContext>,
  display?: boolean;
  formatter?: Scriptable<string | Array<string>, TreemapScriptableContext>,
  font?: FontSpec,
  hoverColor?: Scriptable<Color, TreemapScriptableContext>,
  hoverFont?: FontSpec,
  padding?: number,
  position?: Scriptable<LabelPosition, TreemapScriptableContext>
}

export type LabelPosition = 'top' | 'middle' | 'bottom';

export type LabelAlign = 'left' | 'center' | 'right';

export interface TreemapControllerDatasetOptions<DType> {
  dividerCapStyle?: string,
  dividerColor?: string,
  dividerDash?: number[],
  dividerDashOffset?: number,
  dividerWidth?: number,
  groupDividers?: boolean,
  spacing?: number,
  rtl?: boolean,

  backgroundColor?: Scriptable<Color, TreemapScriptableContext>;
  borderColor?: Scriptable<Color, TreemapScriptableContext>;
  borderWidth?: number;

  hoverBackgroundColor?: Scriptable<Color, TreemapScriptableContext>;
  hoverBorderColor?: Scriptable<Color, TreemapScriptableContext>;
  hoverBorderWidth?: number;

  captions?: TreemapControllerDatasetCaptionsOptions;
  labels?: TreemapControllerDatasetLabelsOptions;
  label?: string;

  data: TreemapDataPoint[]; // This will be auto-generated from `tree`
  groups?: Array<keyof DType>;
  tree: number[] | DType[];
  key?: keyof DType;
}

export interface TreemapDataPoint {
  x: number,
  y: number,
  w: number,
  h: number,
  /**
   * Value
   */
  v: number,
  /**
   * Sum
   */
  s: number,
  /**
   * Depth, only available if grouping
   */
  l?: number,
  /**
   * Group name, only available if grouping
   */
  g?: string,
  /**
   * Group Sum, only available if grouping
   */
  gs?: number,
}

/*
export interface TreemapInteractionOptions {
  position: Scriptable<"treemap", ScriptableTooltipContext<"treemap">>
}*/

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    treemap: {
      chartOptions: CoreChartOptions<'treemap'>;
      datasetOptions: TreemapControllerDatasetOptions<Record<string, unknown>>;
      defaultDataPoint: TreemapDataPoint;
      metaExtensions: {};
      parsedDataType: unknown,
      scales: never;
    }
  }

  // interface TooltipOptions<TType extends ChartType> extends CoreInteractionOptions, TreemapInteractionOptions {
  // }
}

type TreemapOptions = {
  backgroundColor: Color;
  borderColor: Color;
  borderWidth: number | { top?: number, right?: number, bottom?: number, left?: number }
}

type TreemapConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TreemapController = DatasetController;
export const TreemapController: ChartComponent & {
  prototype: TreemapController;
  new(chart: Chart, datasetIndex: number): TreemapController
};

export type TreemapElement = Element<TreemapConfig, TreemapOptions>;
export const TreemapElement: ChartComponent & {
  prototype: TreemapElement;
  new(cfg: TreemapConfig): TreemapElement
};
