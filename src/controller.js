import {Chart, DatasetController, registry} from 'chart.js';
import {toFont, valueOrDefault, isArray} from 'chart.js/helpers';
import {group, requireVersion} from './utils';
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
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  if (!('l' in item) || item.l === levels) {
    drawLabels(ctx, item, rect);
  } else if (opts.captions && opts.captions.display) {
    drawCaptionLabel(ctx, item, rect);
  }
  ctx.restore();
}

function drawCaptionLabel(ctx, item, rect) {
  const opts = rect.options;
  const captionsOpts = opts.captions || {};
  const borderWidth = opts.borderWidth || 0;
  const color = (rect.active ? captionsOpts.hoverColor : captionsOpts.color) || captionsOpts.color;
  const padding = captionsOpts.padding;
  const align = captionsOpts.align || (opts.rtl ? 'right' : 'left');
  const optFont = (rect.active ? captionsOpts.hoverFont : captionsOpts.font) || captionsOpts.font;
  const font = toFont(optFont);
  const x = calculateX(rect, align, padding, borderWidth);
  ctx.fillStyle = color;
  ctx.font = font.string;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(captionsOpts.formatter || item.g, x, rect.y + padding + borderWidth + 1.5); // adds 1.5 because the baseline to top, add 3 pixels from the line for normal letters
}

function drawDivider(ctx, rect) {
  const opts = rect.options;
  const dividersOpts = opts.dividers || {};
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;

  ctx.save();
  ctx.strokeStyle = dividersOpts.lineColor || 'black';
  ctx.lineCap = dividersOpts.lineCapStyle;
  ctx.setLineDash(dividersOpts.lineDash || []);
  ctx.lineDashOffset = dividersOpts.lineDashOffset;
  ctx.lineWidth = dividersOpts.lineWidth;
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

function buildData(dataset, mainRect, captions) {
  const key = dataset.key || '';
  let tree = dataset.tree || [];
  const groups = dataset.groups || [];
  const glen = groups.length;
  const sp = valueOrDefault(dataset.spacing, 0) + valueOrDefault(dataset.borderWidth, 0);
  const captionsFont = captions.font || {};
  const font = toFont(captionsFont);
  const padding = valueOrDefault(captions.padding, 3);

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
        if (valueOrDefault(captions.display, true) && shouldDrawCaption(sq, font)) {
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

function drawLabels(ctx, item, rect) {
  const opts = rect.options;
  const labelsOpts = opts.labels;
  if (!labelsOpts || !labelsOpts.display) {
    return;
  }
  const optColor = (rect.active ? labelsOpts.hoverColor : labelsOpts.color) || labelsOpts.color;
  const optFont = (rect.active ? labelsOpts.hoverFont : labelsOpts.font) || labelsOpts.font;
  const font = toFont(optFont);
  const lh = font.lineHeight;
  const label = labelsOpts.formatter;
  if (label) {
    const labels = isArray(label) ? label : [label];
    const xyPoint = calculateXYLabel(opts, rect, labels, lh);
    ctx.font = font.string;
    ctx.textAlign = labelsOpts.align;
    ctx.textBaseline = labelsOpts.position;
    ctx.fillStyle = optColor;
    labels.forEach((l, i) => ctx.fillText(l, xyPoint.x, xyPoint.y + i * lh));
  }
}

function calculateXYLabel(options, rect, labels, lineHeight) {
  const labelsOpts = options.labels;
  const borderWidth = options.borderWidth || 0;
  const {align, position, padding} = labelsOpts;
  let x, y;
  x = calculateX(rect, align, padding, borderWidth);
  if (position === 'top') {
    y = rect.y + padding + borderWidth;
  } else if (position === 'bottom') {
    y = rect.y + rect.height - padding - borderWidth - (labels.length - 1) * lineHeight;
  } else {
    y = rect.y + rect.height / 2 - labels.length * lineHeight / 4;
  }
  return {x, y};
}

function calculateX(rect, align, padding, borderWidth) {
  if (align === 'left') {
    return rect.x + padding + borderWidth;
  } else if (align === 'right') {
    return rect.x + rect.width - padding - borderWidth;
  }
  return rect.x + rect.width / 2;
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
    const captions = dataset.captions ? dataset.captions : {};
    const area = me.chart.chartArea;
    const key = dataset.key || '';
    const rtl = !!dataset.rtl;

    const mainRect = {x: area.left, y: area.top, w: area.right - area.left, h: area.bottom - area.top, rtl};

    if (mode === 'reset' || rectNotEqual(me._rect, mainRect) || me._key !== key || arrayNotEqual(me._groups, groups)) {
      me._rect = mainRect;
      me._groups = groups.slice();
      me._key = key;

      dataset.data = buildData(dataset, mainRect, captions);
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
    result.font = toFont(options.captions.font);
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
      const dividersOpts = rect.options.dividers || {};
      if (dividersOpts.display && item._data.children.length > 1) {
        drawDivider(ctx, rect);
      }
    }
  }

  _drawRects(ctx, data, metadata, levels) {
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i];
      const item = data[i];
      if (!rect.hidden) {
        rect.draw(ctx);
        const opts = rect.options;
        if (shouldDrawCaption(rect, opts.captions.font)) {
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

  borderWidth: 0,
  spacing: 0.5,
  dividers: {
    display: false,
    lineWidth: 1,
  }

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
          const label = dataItem.g || dataset.label;
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
  }
};

TreemapController.afterUnregister = function() {
  const tooltipPlugin = registry.plugins.get('tooltip');
  if (tooltipPlugin) {
    delete tooltipPlugin.positioners.treemap;
  }
};
