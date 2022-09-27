import {Element} from 'chart.js';
import {toFont, isArray, isObject} from 'chart.js/helpers';

const widthCache = new Map();

/**
 * Helper function to get the bounds of the rect
 * @param {TreemapElement} rect the rect
 * @param {boolean} [useFinalPosition]
 * @return {object} bounds of the rect
 * @private
 */
function getBounds(rect, useFinalPosition) {
  const {x, y, width, height} = rect.getProps(['x', 'y', 'width', 'height'], useFinalPosition);
  return {left: x, top: y, right: x + width, bottom: y + height};
}

function limit(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

export function parseBorderWidth(value, maxW, maxH) {
  let t, r, b, l;

  if (isObject(value)) {
    t = +value.top || 0;
    r = +value.right || 0;
    b = +value.bottom || 0;
    l = +value.left || 0;
  } else {
    t = r = b = l = +value || 0;
  }

  return {
    t: limit(t, 0, maxH),
    r: limit(r, 0, maxW),
    b: limit(b, 0, maxH),
    l: limit(l, 0, maxW)
  };
}

function boundingRects(rect) {
  const bounds = getBounds(rect);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2);

  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b
    }
  };
}

function inRange(rect, x, y, useFinalPosition) {
  const skipX = x === null;
  const skipY = y === null;
  const bounds = !rect || (skipX && skipY) ? false : getBounds(rect, useFinalPosition);

  return bounds
		&& (skipX || x >= bounds.left && x <= bounds.right)
		&& (skipY || y >= bounds.top && y <= bounds.bottom);
}

export function shouldDrawCaption(rect, options) {
  if (!options) {
    return false;
  }
  const font = toFont(options.font);
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;
  const min = font.lineHeight * 2;
  return w > min && h > min;
}

function drawText(ctx, rect, item, levels) {
  const opts = rect.options;
  const captions = opts.captions;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  const isLeaf = (!('l' in item) || item.l === levels);
  if (isLeaf && opts.labels.display) {
    drawLabel(ctx, rect);
  } else if (!isLeaf && captions.display && shouldDrawCaption(rect, captions)) {
    drawCaption(ctx, rect, item);
  }
  ctx.restore();
}

function drawCaption(ctx, rect, item) {
  const opts = rect.options;
  const captionsOpts = opts.captions;
  const borderWidth = parseBorderWidth(opts.borderWidth, rect.width / 2, rect.height / 2);
  const spacing = opts.spacing + borderWidth.t;
  const color = (rect.active ? captionsOpts.hoverColor : captionsOpts.color) || captionsOpts.color;
  const padding = captionsOpts.padding;
  const align = captionsOpts.align || (opts.rtl ? 'right' : 'left');
  const optFont = (rect.active ? captionsOpts.hoverFont : captionsOpts.font) || captionsOpts.font;
  const font = toFont(optFont);
  const x = calculateX(rect, align, padding, borderWidth);
  ctx.fillStyle = color;
  ctx.font = font.string;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(captionsOpts.formatter || item.g, x, rect.y + padding + spacing + (font.lineHeight / 2));
}

function measureLabelSize(ctx, lines, font) {
  const mapKey = lines.join() + font.string + (ctx._measureText ? '-spriting' : '');
  if (!widthCache.has(mapKey)) {
    ctx.save();
    ctx.font = font.string;
    const count = lines.length;
    let width = 0;
    for (let i = 0; i < count; i++) {
      const text = lines[i];
      width = Math.max(width, ctx.measureText(text).width);
    }
    ctx.restore();
    const height = count * font.lineHeight;
    widthCache.set(mapKey, {width, height});
  }
  return widthCache.get(mapKey);
}

function labelToDraw(ctx, rect, options, labelSize) {
  const overflow = options.overflow;
  if (overflow === 'hidden') {
    const padding = options.padding;
    return !((labelSize.width + padding * 2) > rect.width || (labelSize.height + padding * 2) > rect.height);
  }
  return true;
}

function drawLabel(ctx, rect) {
  const opts = rect.options;
  const labelsOpts = opts.labels;
  const label = labelsOpts.formatter;
  if (!label) {
    return;
  }
  const labels = isArray(label) ? label : [label];
  const optFont = (rect.active ? labelsOpts.hoverFont : labelsOpts.font) || labelsOpts.font;
  const font = toFont(optFont);
  const labelSize = measureLabelSize(ctx, labels, font);
  if (!labelToDraw(ctx, rect, labelsOpts, labelSize)) {
    return;
  }
  const borderWidth = parseBorderWidth(opts.borderWidth, rect.width / 2, rect.height / 2);
  const optColor = (rect.active ? labelsOpts.hoverColor : labelsOpts.color) || labelsOpts.color;
  const lh = font.lineHeight;
  const xyPoint = calculateXYLabel(opts, rect, labelSize, borderWidth);
  ctx.font = font.string;
  ctx.textAlign = labelsOpts.align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = optColor;
  labels.forEach((l, i) => ctx.fillText(l, xyPoint.x, xyPoint.y + lh / 2 + i * lh));
}

function drawDivider(ctx, rect, item) {
  const opts = rect.options;
  const dividersOpts = opts.dividers;
  if (!dividersOpts.display || !item._data.children.length) {
    return;
  }
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;

  ctx.save();
  ctx.strokeStyle = dividersOpts.lineColor;
  ctx.lineCap = dividersOpts.lineCapStyle;
  ctx.setLineDash(dividersOpts.lineDash);
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

function calculateXYLabel(options, rect, labelSize, borderWidth) {
  const labelsOpts = options.labels;
  const {align, position, padding} = labelsOpts;
  let x, y;
  x = calculateX(rect, align, padding, borderWidth);
  if (position === 'top') {
    y = rect.y + padding + borderWidth.t;
  } else if (position === 'bottom') {
    y = rect.y + rect.height - padding - borderWidth.b - labelSize.height;
  } else {
    y = rect.y + (rect.height - labelSize.height) / 2 + padding + borderWidth.t;
  }
  return {x, y};
}

function calculateX(rect, align, padding, borderWidth) {
  if (align === 'left') {
    return rect.x + padding + borderWidth.l;
  } else if (align === 'right') {
    return rect.x + rect.width - padding - borderWidth.r;
  }
  return rect.x + rect.width / 2;
}

export default class TreemapElement extends Element {

  constructor(cfg) {
    super();

    this.options = undefined;
    this.width = undefined;
    this.height = undefined;

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  draw(ctx, data, levels = 0) {
    if (!data) {
      return;
    }
    const options = this.options;
    const {inner, outer} = boundingRects(this);

    ctx.save();

    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      ctx.rect(outer.x, outer.y, outer.w, outer.h);
      ctx.clip();
      ctx.rect(inner.x, inner.y, inner.w, inner.h);
      ctx.fillStyle = options.backgroundColor;
      ctx.fill();
      ctx.fillStyle = options.borderColor;
      ctx.fill('evenodd');
    } else {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    }
    drawDivider(ctx, this, data);
    drawText(ctx, this, data, levels);
    ctx.restore();
  }

  inRange(mouseX, mouseY, useFinalPosition) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }

  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, null, useFinalPosition);
  }

  inYRange(mouseY, useFinalPosition) {
    return inRange(this, null, mouseY, useFinalPosition);
  }

  getCenterPoint(useFinalPosition) {
    const {x, y, width, height} = this.getProps(['x', 'y', 'width', 'height'], useFinalPosition);
    return {
      x: x + width / 2,
      y: y + height / 2
    };
  }

  tooltipPosition() {
    return this.getCenterPoint();
  }

  getRange(axis) {
    return axis === 'x' ? this.width / 2 : this.height / 2;
  }
}

TreemapElement.id = 'treemap';

TreemapElement.defaults = {
  borderWidth: 0,
  spacing: 0.5,
  label: undefined,
  rtl: false,
  dividers: {
    display: false,
    lineCapStyle: 'butt',
    lineColor: 'black',
    lineDash: [],
    lineDashOffset: 0,
    lineWidth: 1,
  },
  captions: {
    align: undefined,
    color: 'black',
    display: true,
    formatter: (ctx) => ctx.raw.g || ctx.raw._data.label || '',
    font: {},
    padding: 3
  },
  labels: {
    align: 'center',
    color: 'black',
    display: false,
    formatter: (ctx) => ctx.raw.g ? [ctx.raw.g, ctx.raw.v] : (ctx.raw._data.label ? [ctx.raw._data.label, ctx.raw.v] : ctx.raw.v),
    font: {},
    overflow: 'clip',
    position: 'middle',
    padding: 3
  }
};

TreemapElement.descriptors = {
  labels: {
    _fallback: true
  },
  captions: {
    _fallback: true
  },
  _scriptable: true,
  _indexable: false
};

TreemapElement.defaultRoutes = {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor'
};
