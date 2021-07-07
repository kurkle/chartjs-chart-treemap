import {
  Chart,
  ChartComponent,
  CoreChartOptions,
  DatasetController,
  Element,
  ScriptableContext, Color, Scriptable
} from 'chart.js';

export interface TreemapControllerDatasetOptions<DType> {
  color?: Scriptable<Color, ScriptableContext<'treemap'>>,
  dividerCapStyle?: string,
  dividerColor?: string,
  dividerDash?: number[],
  dividerDashOffset?: number,
  dividerWidth?: number,
  groupDividers?: boolean,
  groupLabels?: boolean,
  spacing?: number,
  rtl?: boolean,

  backgroundColor?: Scriptable<Color, ScriptableContext<'treemap'>>;
  borderColor?: Scriptable<Color, ScriptableContext<'treemap'>>;
  borderWidth?: number;

  label?: Scriptable<string, ScriptableContext<'treemap'>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[], // Unknown makes tsc complain
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
      // Must be any, since we don't know what type will be used eventually
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasetOptions: TreemapControllerDatasetOptions<any>;
      defaultDataPoint: TreemapDataPoint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parsedDataType: any,
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
