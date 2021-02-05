import {Chart} from 'chart.js';
import TreemapController from './controller';
import TreemapElement from './element';

Chart.register(TreemapController, TreemapElement);

const tooltipPlugin = Chart.registry.plugins.get('tooltip');
tooltipPlugin.positioners.treemap = function(active) {
  if (!active.length) {
    return false;
  }

  const item = active[active.length - 1];
  const el = item.element;

  return el.tooltipPosition();
};

export * from './utils';
