import {Chart, DatasetController, registry} from 'chart.js';
import {toFont, valueOrDefault, isObject, clipArea, unclipArea} from 'chart.js/helpers';
import {group, requireVersion, normalizeTreeToArray, getGroupKey} from './utils';
import {shouldDrawCaption, parseBorderWidth, getCaptionHeight} from './element';
import squarify from './squarify';
import {version} from '../package.json';
import {arrayNotEqual, rectNotEqual, scaleRect} from './helpers/index';

function buildData(tree, dataset, keys, mainRect) {
  const treeLeafKey = dataset.treeLeafKey || '_leaf';
  if (isObject(tree)) {
    tree = normalizeTreeToArray(keys, treeLeafKey, tree);
  }
  const groups = dataset.groups || [];
  const glen = groups.length;
  const sp = dataset.displayMode === 'headerBoxes' ? 0 : valueOrDefault(dataset.spacing, 0);
  const captions = dataset.captions || {};
  const font = toFont(captions.font);
  const padding = valueOrDefault(captions.padding, 3);

  function recur(treeElements, gidx, rect, parent, gs) {
    const g = getGroupKey(groups[gidx]);
    const pg = (gidx > 0) && getGroupKey(groups[gidx - 1]);
    const gdata = group(treeElements, g, keys, treeLeafKey, pg, parent, groups.filter((item, index) => index <= gidx));
    const gsq = squarify(gdata, rect, keys, g, gidx, gs);
    const ret = gsq.slice();
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        const bw = dataset.displayMode === 'headerBoxes'
          ? {l: 0, r: 0, t: 0, b: 0}
          : parseBorderWidth(dataset.borderWidth, sq.w / 2, sq.h / 2);
        const subRect = {
          ...rect,
          x: sq.x + sp + bw.l,
          y: sq.y + sp + bw.t,
          w: sq.w - 2 * sp - bw.l - bw.r,
          h: sq.h - 2 * sp - bw.t - bw.b,
        };
        if (shouldDrawCaption(dataset.displayMode, subRect, captions)) {
          const captionHeight = getCaptionHeight(dataset.displayMode, subRect, font, padding);
          subRect.y += captionHeight;
          subRect.h -= captionHeight;
        }
        const children = [];
        gdata.forEach((gEl) => {
          children.push(...recur(gEl.children, gidx + 1, subRect, sq.g, sq.s));
        });
        ret.push(...children);
        sq.isLeaf = !children.length;
      });
    } else {
      gsq.forEach((sq) => {
        sq.isLeaf = true;
      });
    }
    return ret;
  }

  const result = glen
    ? recur(tree, 0, mainRect)
    : squarify(tree, mainRect, keys);
  return result.map((d) => {
    if (dataset.displayMode !== 'headerBoxes' || d.isLeaf) {
      return d;
    }
    if (!shouldDrawCaption(dataset.displayMode, d, captions)) {
      return undefined;
    }
    const captionHeight = getCaptionHeight(dataset.displayMode, d, font, padding);
    return {...d, h: captionHeight};
  }).filter((d) => d);

}

export default class TreemapController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._groups = undefined;
    this._keys = undefined;
    this._rect = undefined;
    this._rectChanged = true;
  }

  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  getMinMax(scale) {
    return {
      min: 0,
      max: scale.axis === 'x' ? scale.right - scale.left : scale.bottom - scale.top
    };
  }

  configure() {
    super.configure();
    const {xScale, yScale} = this.getMeta();
    if (!xScale || !yScale) {
      // configure is called once before `linkScales`, and at that call we don't have any scales linked yet
      return;
    }

    const w = xScale.right - xScale.left;
    const h = yScale.bottom - yScale.top;
    const rect = {x: 0, y: 0, w, h, rtl: !!this.options.rtl, unsorted: !!this.options.unsorted};

    if (rectNotEqual(this._rect, rect)) {
      this._rect = rect;
      this._rectChanged = true;
    }

    if (this._rectChanged) {
      xScale.max = w;
      xScale.configure();
      yScale.max = h;
      yScale.configure();
    }
  }

  update(mode) {
    const dataset = this.getDataset();
    const {data} = this.getMeta();
    const groups = dataset.groups || [];
    const keys = [dataset.key || ''].concat(dataset.sumKeys || []);
    const tree = dataset.tree = dataset.tree || dataset.data || [];

    if (mode === 'reset') {
      // reset is called before 2nd configure and is only called if animations are enabled. So wen need an extra configure call here.
      this.configure();
    }

    if (this._rectChanged || arrayNotEqual(this._keys, keys) || arrayNotEqual(this._groups, groups) || this._prevTree !== tree) {
      this._groups = groups.slice();
      this._keys = keys.slice();
      this._prevTree = tree;
      this._rectChanged = false;

      dataset.data = buildData(tree, dataset, this._keys, this._rect);
      // @ts-ignore using private stuff
      this._dataCheck();
      // @ts-ignore using private stuff
      this._resyncElements();
    }

    this.updateElements(data, 0, data.length, mode);
  }

  updateElements(rects, start, count, mode) {
    const reset = mode === 'reset';
    const dataset = this.getDataset();
    const firstOpts = this._rect.options = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const {xScale, yScale} = this.getMeta(this.index);

    for (let i = start; i < start + count; i++) {
      const options = sharedOptions || this.resolveDataElementOptions(i, mode);
      const properties = scaleRect(dataset.data[i], xScale, yScale, options.spacing);
      if (reset) {
        properties.width = 0;
        properties.height = 0;
      }

      if (includeOptions) {
        properties.options = options;
      }
      this.updateElement(rects[i], i, properties, mode);
    }

    this.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  draw() {
    const {ctx, chartArea} = this.chart;
    const metadata = this.getMeta().data || [];
    const dataset = this.getDataset();
    const data = dataset.data;

    clipArea(ctx, chartArea);
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i];
      if (!rect.hidden) {
        rect.draw(ctx, data[i]);
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
  requireVersion('chart.js', '3.8', Chart.version);
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
