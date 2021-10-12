import {DatasetController, registry} from 'chart.js';
import {toFont, valueOrDefault, callback as callCallback} from 'chart.js/helpers';
import {group} from './utils';
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

function shouldDrawCaption(rect, font) {
  if (!font) {
    return false;
  }
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;
  const min = font.lineHeight * 2;
  return w > min && h > min;
}

function drawCaption(ctx, rect, item, opts, levels) {
  ctx.save();
  ctx.fillStyle = opts.color;
  ctx.font = opts.font.string;
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  if (!('l' in item) || item.l === levels) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawLabels(ctx, item, rect);
  } else if (opts.groupLabels) {
    ctx.textAlign = opts.rtl ? 'end' : 'start';
    ctx.textBaseline = 'top';
    const x = opts.rtl ? rect.x + rect.width - opts.borderWidth - 3 : rect.x + opts.borderWidth + 3;
    ctx.fillText(item.g, x, rect.y + opts.borderWidth + 3);
  }
  ctx.restore();
}

function drawDivider(ctx, rect) {
  const opts = rect.options;
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;

  ctx.save();
  ctx.strokeStyle = opts.dividerColor || 'black';
  ctx.lineCap = opts.dividerCapStyle;
  ctx.setLineDash(opts.dividerDash || []);
  ctx.lineDashOffset = opts.dividerDashOffset;
  ctx.lineWidth = opts.dividerWidth;
  ctx.beginPath();
  if (w > h) {
    const w2 = w / 2;
    ctx.moveTo(rect.x + w2, rect.y);
    ctx.lineTo(rect.x + w2, rect.y + h);
  } else {
    const h2 = h / 2;
    ctx.moveTo(rect.x, rect.y + h2);
    ctx.lineTo(rect.x + w, rect.y + h2);
  }
  ctx.stroke();
  ctx.restore();
}

function buildData(dataset, mainRect, font) {
  const key = dataset.key || '';
  let tree = dataset.tree || [];
  const groups = dataset.groups || [];
  const glen = groups.length;
  const sp = (dataset.spacing || 0) + (dataset.borderWidth || 0);

  function recur(gidx, rect, parent, gs) {
    const g = groups[gidx];
    const pg = (gidx > 0) && groups[gidx - 1];
    const gdata = group(tree, g, key, pg, parent);
    const gsq = squarify(gdata, rect, key, g, gidx, gs);
    const ret = gsq.slice();
    let subRect;
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        subRect = {x: sq.x + sp, y: sq.y + sp, w: sq.w - 2 * sp, h: sq.h - 2 * sp};

        if (valueOrDefault(dataset.groupLabels, true) && shouldDrawCaption(sq, font)) {
          subRect.y += font.lineHeight;
          subRect.h -= font.lineHeight;
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

function drawLabels(ctx, item, rect) {
  const opts = rect.options;
  const lh = opts.font.lineHeight;
  if (opts.formatter || item.g) {
    const labels = ((opts.formatter || item.g + '\n' + item.v) + '').split('\n');
    const y = rect.y + rect.height / 2 - labels.length * lh / 4;
    labels.forEach((l, i) => ctx.fillText(l, rect.x + rect.width / 2, y + i * lh));
  }
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

  update(mode) {
    const me = this;
    const meta = me.getMeta();
    const dataset = me.getDataset();
    const groups = dataset.groups || (dataset.groups = []);
    const font = toFont(dataset.font);
    const area = me.chart.chartArea;
    const key = dataset.key || '';
    const rtl = !!dataset.rtl;

    const mainRect = {x: area.left, y: area.top, w: area.right - area.left, h: area.bottom - area.top, rtl};

    if (mode === 'reset' || rectNotEqual(me._rect, mainRect) || me._key !== key || arrayNotEqual(me._groups, groups)) {
      me._rect = mainRect;
      me._groups = groups.slice();
      me._key = key;
      dataset.data = buildData(dataset, mainRect, font);
      // @ts-ignore using private stuff
      me._dataCheck();
      // @ts-ignore using private stuff
      me._resyncElements();
    }

    me.updateElements(meta.data, 0, meta.data.length, mode);
  }

  resolveDataElementOptions(index, mode) {
    const options = super.resolveDataElementOptions(index, mode);
    const result = Object.isFrozen(options) ? Object.assign({}, options) : options;
    result.font = toFont(options.font);
    return result;
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
      const height = reset ? 0 : sq.h - options.spacing * 2;
      const width = reset ? 0 : sq.w - options.spacing * 2;
      const x = sq.x + options.spacing;
      const y = sq.y + options.spacing;
      const properties = {
        x,
        y,
        width,
        height
      };

      if (includeOptions) {
        properties.options = options;
      }
      me.updateElement(rects[i], i, properties, mode);
    }

    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  _drawDividers(ctx, data, metadata) {
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i];
      const item = data[i];
      if (rect.options.groupDividers && item._data.children.length > 1) {
        drawDivider(ctx, rect);
      }
    }
    if (this.getDataset().groupDividers) {
      drawDivider(ctx, this._rect);
    }
  }

  _drawRects(ctx, data, metadata, levels) {
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i];
      const item = data[i];
      if (!rect.hidden) {
        rect.draw(ctx);
        const opts = rect.options;
        if (shouldDrawCaption(rect, opts.font)) {
          drawCaption(ctx, rect, item, opts, levels);
        }
      }
    }
  }

  draw() {
    const me = this;
    const ctx = me.chart.ctx;
    const metadata = me.getMeta().data || [];
    const dataset = me.getDataset();
    const levels = (dataset.groups || []).length - 1;
    const data = dataset.data || [];

    me._drawRects(ctx, data, metadata, levels);
    me._drawDividers(ctx, data, metadata);
  }
}

TreemapController.id = 'treemap';

TreemapController.version = version;

TreemapController.defaults = {
  dataElementType: 'treemap',

  groupLabels: true,
  borderWidth: 0,
  spacing: 0.5,
  groupDividers: false,
  dividerWidth: 1

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
          if (dataItem.g) {
            return dataItem.g + ': ' + dataItem.v;
          }
          return callCallback(item.element.options.formatter, [item.element.$context]) || dataItem.v;
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
  }
};

TreemapController.afterUnregister = function() {
  const tooltipPlugin = registry.plugins.get('tooltip');
  if (tooltipPlugin) {
    delete tooltipPlugin.positioners.treemap;
  }
};
