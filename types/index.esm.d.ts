import {
  Chart,
  ChartComponent,
  ChartType,
  CoreChartOptions,
  DatasetController,
  Element,
  ScriptableContext, Color, Scriptable
} from 'chart.js';
import {AnyObject} from 'chart.js/types/basic';

export interface TreemapControllerDatasetOptions<TType extends ChartType> {
  color?: Scriptable<Color, ScriptableContext<TType>>,
  dividerCapStyle?: string,
  dividerColor?: string,
  dividerDash?: number[],
  dividerDashOffset?: number,
  dividerWidth?: number,
  groupDividers?: boolean,
  groupLabels?: boolean,
  spacing?: number,
  rtl?: boolean,

  backgroundColor?: Scriptable<Color, ScriptableContext<TType>>;
  borderColor?: Scriptable<Color, ScriptableContext<TType>>;
  borderWidth?: number;

  label?: Scriptable<string, ScriptableContext<TType>>;

  data: any[], // Unknown makes tsc complain
  groups?: string[],
  tree: number[] | AnyObject[],
  key?: string
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
      datasetOptions: TreemapControllerDatasetOptions<'treemap'>;
      defaultDataPoint: TreemapDataPoint;
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
}

