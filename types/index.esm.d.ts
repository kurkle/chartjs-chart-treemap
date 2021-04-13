import { ControllerDatasetOptions, PointHoverOptions, PointOptions, ScriptableAndArrayOptions, ScriptableContext, ChartType } from 'chart.js';
import { AnyObject } from 'chart.js/types/basic';

export interface TreemapControllerDatasetOptions<TType extends ChartType>
extends ControllerDatasetOptions,
ScriptableAndArrayOptions<PointOptions, ScriptableContext<TType>>,
ScriptableAndArrayOptions<PointHoverOptions, ScriptableContext<TType>> {

  data?: unknown,
  font: AnyObject,
  groups: string[],
  groupDividers: boolean,
  rtl: boolean,
  spacing: number,
  tree: number[],
}

export interface TreemapDataPoint {
  x: number,
  y: number,
  w: number,
  h: number,
  v: number
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

