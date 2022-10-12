import {Chart, DatasetController, registry} from 'chart.js';
import {toFont, valueOrDefault, isObject, clipArea, unclipArea, defined} from 'chart.js/helpers';
import {group, requireVersion, normalizeTreeToArray, getGroupKey, minValue, maxValue} from './utils';
import {shouldDrawCaption, parseBorderWidth} from './element';
import squarify from './squarify';
import {version} from '../package.json';

function rectNotEqual(r1, r2) {
  return !r1 || !r2
		|| r1.x !== r2.x
		|| r1.y !== r2.y
		|| r1.w !== r2.w
		|| r1.h !== r2.h;
}

function arrayNotEqual(a1, a2) {
  let i, n;

  if (a1.lenght !== a2.length) {
    return true;
  }

  for (i = 0, n = a1.length; i < n; ++i) {
    if (a1[i] !== a2[i]) {
      return true;
    }
  }
  return false;
}

function buildData(dataset, mainRect) {
  const key = dataset.key || '';
  const treeLeafKey = dataset.treeLeafKey || '_leaf';
  let tree = dataset.tree || [];
  if (isObject(tree)) {
    tree = normalizeTreeToArray(key, treeLeafKey, tree);
  }
  const groups = dataset.groups || [];
  const glen = groups.length;
  const sp = valueOrDefault(dataset.spacing, 0);
  const captions = dataset.captions || {display: true};
  const font = toFont(captions.font);
  const padding = valueOrDefault(captions.padding, 3);

  function recur(gidx, rect, parent, gs) {
    const g = getGroupKey(groups[gidx]);
    const pg = (gidx > 0) && getGroupKey(groups[gidx - 1]);
    const gdata = group(tree, g, key, treeLeafKey, pg, parent, groups.filter((item, index) => index <= gidx));
    const gsq = squarify(gdata, rect, key, g, gidx, gs);
    const ret = gsq.slice();
    let subRect;
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        const bw = parseBorderWidth(dataset.borderWidth, sq.w / 2, sq.h / 2);
        subRect = {
          x: sq.x + sp + bw.l,
          y: sq.y + sp + bw.t,
          w: sq.w - 2 * sp - bw.l - bw.r,
          h: sq.h - 2 * sp - bw.t - bw.b,
          rtl: rect.rtl
        };
        if (shouldDrawCaption(subRect, captions)) {
          subRect.y += font.lineHeight + padding * 2;
          subRect.h -= font.lineHeight + padding * 2;
        }
        ret.push(...recur(gidx + 1, subRect, sq.g, sq.s));
      });
    }
    return ret;
  }

  if (!tree.length && dataset.data.length) {
    tree = dataset.tree = dataset.data;
  }

  return glen
    ? recur(0, mainRect)
    : squarify(tree, mainRect, key);
}

function getMinMax(data, useTree) {
  const vMax = useTree ? 1 : maxValue(data);
  const vMin = useTree ? 0 : minValue(data, vMax);
  return {vMin, vMax};
}

function getArea(chart, data, rtl, useTree) {
  const {vMin, vMax} = getMinMax(data, useTree);
  const {x, y} = chart.scales;
  const xMin = x.getPixelForValue(0);
  const xMax = x.getPixelForValue(1);
  const yMin = y.getPixelForValue(vMin);
  const yMax = y.getPixelForValue(vMax);
  return {x: xMin, y: yMax, w: xMax - xMin, h: yMin - yMax, rtl};
}

export default class TreemapController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._rect = undefined;
    this._key = undefined;
    this._groups = undefined;
    this._useTree = undefined;
  }

  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  /**
   * TODO: to be removed when https://github.com/kurkle/chartjs-chart-treemap/issues/137
   * will be implemented
   */
  updateRangeFromParsed(range, scale) {
    if (range.update) {
      return;
    }
    range.update = true;
    if (scale.id === 'x') {
      range.min = 0;
      range.max = 1;
      return;
    }
    const me = this;
    const dataset = me.getDataset();
    const {vMin, vMax} = getMinMax(dataset.data, me._useTree);
    range.min = vMin;
    range.max = vMax;
  }

  update(mode) {
    const me = this;
    const meta = me.getMeta();
    const dataset = me.getDataset();
    if (!defined(me._useTree)) {
      me._useTree = !!dataset.tree;
    }
    const groups = dataset.groups || (dataset.groups = []);
    const key = dataset.key || '';
    const rtl = !!dataset.rtl;

    const mainRect = getArea(me.chart, dataset.data, rtl, me._useTree);

    if (mode === 'reset' || rectNotEqual(me._rect, mainRect) || me._key !== key || arrayNotEqual(me._groups, groups)) {
      me._rect = mainRect;
      me._groups = groups.slice();
      me._key = key;

      dataset.data = buildData(dataset, mainRect);
      // @ts-ignore using private stuff
      me._dataCheck();
      // @ts-ignore using private stuff
      me._resyncElements();
    }

    me.updateElements(meta.data, 0, meta.data.length, mode);
  }

  updateElements(rects, start, count, mode) {
    const me = this;
    const reset = mode === 'reset';
    const dataset = me.getDataset();
    const firstOpts = me._rect.options = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);

    for (let i = start; i < start + count; i++) {
      const sq = dataset.data[i];
      const options = sharedOptions || me.resolveDataElementOptions(i, mode);
      const sp = options.spacing;
      const sp2 = sp * 2;
      const properties = {
        x: sq.x + sp,
        y: sq.y + sp,
        width: reset ? 0 : sq.w - sp2,
        height: reset ? 0 : sq.h - sp2,
        hidden: sp2 > sq.w || sp2 > sq.h,
      };

      if (includeOptions) {
        properties.options = options;
      }
      me.updateElement(rects[i], i, properties, mode);
    }

    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  draw() {
    const me = this;
    const ctx = me.chart.ctx;
    const area = me.chart.chartArea;
    const metadata = me.getMeta().data || [];
    const dataset = me.getDataset();
    const levels = (dataset.groups || []).length - 1;
    const data = dataset.data;

    clipArea(ctx, area);
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i];
      if (!rect.hidden) {
        rect.draw(ctx, data[i], levels);
      }
    }
    unclipArea(ctx);
  }
}

TreemapController.id = 'treemap';

TreemapController.version = version;

TreemapController.defaults = {
  dataElementType: 'treemap',

  animations: {
    numbers: {
      type: 'number',
      properties: ['x', 'y', 'width', 'height']
    },
  },

};

TreemapController.descriptors = {
  _scriptable: true,
  _indexable: false
};

TreemapController.overrides = {
  interaction: {
    mode: 'point',
    intersect: true
  },

  hover: {},

  plugins: {
    tooltip: {
      position: 'treemap',
      intersect: true,
      callbacks: {
        title(items) {
          if (items.length) {
            const item = items[0];
            return item.dataset.key || '';
          }
          return '';
        },
        label(item) {
          const dataset = item.dataset;
          const dataItem = dataset.data[item.dataIndex];
          const label = dataItem.g || dataItem._data.label || dataset.label;
          return (label ? label + ': ' : '') + dataItem.v;
        }
      }
    },
  },
  scales: {
    x: {
      type: 'linear',
      display: false
    },
    y: {
      type: 'linear',
      display: false
    }
  },
};

TreemapController.beforeRegister = function() {
  requireVersion('3.6', Chart.version);
};

TreemapController.afterRegister = function() {
  const tooltipPlugin = registry.plugins.get('tooltip');
  if (tooltipPlugin) {
    tooltipPlugin.positioners.treemap = function(active) {
      if (!active.length) {
        return false;
      }

      const item = active[active.length - 1];
      const el = item.element;

      return el.tooltipPosition();
    };
  } else {
    console.warn('Unable to register the treemap positioner because tooltip plugin is not registered');
  }
};

TreemapController.afterUnregister = function() {
  const tooltipPlugin = registry.plugins.get('tooltip');
  if (tooltipPlugin) {
    delete tooltipPlugin.positioners.treemap;
  }
};
