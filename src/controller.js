import {Chart, DatasetController, registry} from 'chart.js';
import {toFont, isObject, clipArea, unclipArea, createContext} from 'chart.js/helpers';
import {group, requireVersion, normalizeTreeToArray, getGroupKey} from './utils';
import squarify from './squarify';
import {version} from '../package.json';
import {arrayNotEqual, rectNotEqual, scaleRect, parseBorderWidth, shouldDrawCaption} from './helpers/index';

function createDataContext(parent, index, raw, mode) {
  return createContext(parent, {
    active: false,
    dataIndex: index,
    index,
    raw,
    parsed: {x: raw.x, y: raw.y},
    mode,
    type: 'data'
  });
}

function buildData(tree, controller, mode) {
  const {options, _rect: mainRect, $context} = controller;
  const key = options.key;
  const treeLeafKey = options.treeLeafKey;
  if (isObject(tree)) {
    tree = normalizeTreeToArray(key, treeLeafKey, tree);
  }
  const groups = options.groups;
  const glen = groups.length;
  const sp = options.spacing;
  const data = [];

  function recur(gidx, rect, parent, gs) {
    const g = getGroupKey(groups[gidx]);
    const pg = (gidx > 0) && getGroupKey(groups[gidx - 1]);
    const gdata = group(tree, g, key, treeLeafKey, pg, parent, groups.filter((item, index) => index <= gidx));
    const gsq = squarify(gdata, rect, key, g, gidx, gs);
    data.push(...gsq.slice());
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        const dIdx = data.indexOf(sq);
        const dataContext = createDataContext($context, dIdx, sq, mode);
        const dOptions = options.setContext(dataContext);
        const captions = dOptions.captions;
        const font = toFont(captions.font);
        const padding = captions.padding;
        const bw = parseBorderWidth(dOptions.borderWidth, sq.w / 2, sq.h / 2);
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
        recur(gidx + 1, subRect, sq.g, sq.s);
      });
    }
  }

  if (glen) {
    recur(0, mainRect);
    return data;
  }
  return squarify(tree, mainRect, key);
}

export default class TreemapController extends DatasetController {
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this._groups = undefined;
    this._key = undefined;
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
    const config = this.chart.config;
    const scopeKeys = config.datasetScopeKeys(this._type);
    if (!scopeKeys[0].includes('elements.treemap')) {
      scopeKeys[0].splice(1, 0, 'elements.treemap');
    }
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
    this.options = config.createResolver(scopes, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};

    const {xScale, yScale} = this.getMeta();
    if (!xScale || !yScale) {
      // configure is called once before `linkScales`, and at that call we don't have any scales linked yet
      return;
    }

    const w = xScale.right - xScale.left;
    const h = yScale.bottom - yScale.top;
    const rect = {x: 0, y: 0, w, h, rtl: !!this.options.rtl};

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
    const options = this.options;
    const groups = options.groups;
    const key = options.key;
    const tree = dataset.tree = dataset.tree || dataset.data || [];

    if (mode === 'reset') {
      // reset is called before 2nd configure and is only called if animations are enabled. So wen need an extra configure call here.
      this.configure();
    }

    if (this._rectChanged || this._key !== key || arrayNotEqual(this._groups, groups) || this._prevTree !== tree) {
      this._groups = groups.slice();
      this._key = key;
      this._prevTree = tree;
      this._rectChanged = false;

      dataset.data = buildData(tree, this, mode);
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

  key: '',
  groups: [],
  treeLeafKey: '_leaf',

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
