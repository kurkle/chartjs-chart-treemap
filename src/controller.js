import {Chart, DatasetController, registry} from 'chart.js';
import {toFont, valueOrDefault, isObject, clipArea, unclipArea} from 'chart.js/helpers';
import {group, requireVersion, normalizeTreeToArray, getGroupKey} from './utils';
import {shouldDrawCaption, parseBorderWidth} from './element';
import squarify from './squarify';
import {version} from '../package.json';
import {arrayNotEqual, rectNotEqual, scaleRect} from './helpers/index';

function buildData(tree, dataset, mainRect, dpr) {
  const key = dataset.key || '';
  const treeLeafKey = dataset.treeLeafKey || '_leaf';
  if (isObject(tree)) {
    tree = normalizeTreeToArray(key, treeLeafKey, tree);
  }
  const groups = dataset.groups || [];
  const glen = groups.length;
  const sp = valueOrDefault(dataset.spacing, 0);
  const captions = dataset.captions || {};
  const font = toFont(captions.font);
  const padding = valueOrDefault(captions.padding, 3);

  function recur(gidx, rect, parent, gs) {
    const g = getGroupKey(groups[gidx]);
    const pg = (gidx > 0) && getGroupKey(groups[gidx - 1]);
    const gdata = group(tree, g, key, treeLeafKey, pg, parent, groups.filter((item, index) => index <= gidx));
    const gsq = squarify(gdata, rect, key, dpr, g, gidx, gs);
    const ret = gsq.slice();
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        const bw = parseBorderWidth(dataset.borderWidth, sq.w / 2, sq.h / 2);
        const subRect = {
          ...rect,
          x: sq.x + sp + bw.l,
          y: sq.y + sp + bw.t,
          w: sq.w - 2 * sp - bw.l - bw.r,
          h: sq.h - 2 * sp - bw.t - bw.b,
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

  return glen
    ? recur(0, mainRect)
    : squarify(tree, mainRect, key, dpr);
}

export default class TreemapController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._rect = undefined;
    this._key = undefined;
    this._groups = undefined;
  }

  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  // eslint-disable-next-line no-unused-vars
  getMinMax(scale, canStack) {
    return {
      min: 0,
      max: scale.axis === 'x' ? scale.width : scale.height
    };
  }

  configure() {
    super.configure();
    // console.log(this.getMeta());
  }

  update(mode) {
    const dataset = this.getDataset();
    const {data, xScale, yScale} = this.getMeta();

    const groups = dataset.groups || (dataset.groups = []);
    const key = dataset.key || '';
    const rtl = !!dataset.rtl;
    const tree = dataset.tree || dataset.data;

    const mainRect = {
      x: xScale.left,
      y: yScale.top,
      w: xScale.width,
      h: yScale.height,
      rtl
    };

    if (mode === 'reset' || rectNotEqual(this._rect, mainRect) || this._key !== key || arrayNotEqual(this._groups, groups) || this._prevTree !== tree) {
      this._rect = mainRect;
      this._groups = groups.slice();
      this._key = key;
      this._prevTree = tree;

      dataset.data = buildData(tree, dataset, mainRect);
      // @ts-ignore using private stuff
      this._dataCheck();
      // @ts-ignore using private stuff
      this._resyncElements();
    }

    this.updateElements(data, 0, data.length, mode);
  }

  updateElements(rects, start, count, mode) {
    const me = this;
    const reset = mode === 'reset';
    const dataset = me.getDataset();
    const firstOpts = me._rect.options = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);
    const {xScale, yScale} = this.getMeta(this.index);

    for (let i = start; i < start + count; i++) {
      const options = sharedOptions || me.resolveDataElementOptions(i, mode);
      const sp = options.spacing;
      const properties = scaleRect(dataset.data[i], xScale, yScale, sp);
      if (reset) {
        properties.width = 0;
        properties.height = 0;
      }

      if (includeOptions) {
        properties.options = options;
      }
      me.updateElement(rects[i], i, properties, mode);
    }

    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  draw() {
    const {ctx, chartArea} = this.chart;
    const metadata = this.getMeta().data || [];
    const dataset = this.getDataset();
    const levels = (dataset.groups || []).length - 1;
    const data = dataset.data;

    clipArea(ctx, chartArea);
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
    includeInvisible: true,
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
      alignToPixels: true,
      bounds: 'data',
      display: false
    },
    y: {
      type: 'linear',
      alignToPixels: true,
      bounds: 'data',
      display: false,
      reverse: true
    }
  },
};

TreemapController.beforeRegister = function() {
  requireVersion('3.8', Chart.version);
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
