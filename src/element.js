import {Element} from 'chart.js';
import {toFont, isArray, isObject, toTRBLCorners, addRoundedRectPath} from 'chart.js/helpers';

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

export function isBoxesOverlapped(options) {
  return options && (!options.borderRadius || isObject(options.borderWidth));
}

function boundingRects(rect, overlapBoxes) {
  const bounds = getBounds(rect);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2);
  const borderDivider = overlapBoxes ? 1 : 2;

  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height
    },
    inner: {
      x: bounds.left + border.l / borderDivider,
      y: bounds.top + border.t / borderDivider,
      w: width - border.l / borderDivider - border.r / borderDivider,
      h: height - border.t / borderDivider - border.b / borderDivider
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

function measureLabelSize(ctx, lines, fonts) {
  const fontsKey = fonts.reduce(function(prev, item) {
    prev += item.string;
    return prev;
  }, '');
  const mapKey = lines.join() + fontsKey + (ctx._measureText ? '-spriting' : '');
  if (!widthCache.has(mapKey)) {
    ctx.save();
    const count = lines.length;
    let width = 0;
    let height = 0;
    for (let i = 0; i < count; i++) {
      const font = fonts[Math.min(i, fonts.length - 1)];
      ctx.font = font.string;
      const text = lines[i];
      width = Math.max(width, ctx.measureText(text).width);
      height += font.lineHeight;
    }
    ctx.restore();
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
  const fonts = isArray(optFont) ? optFont.map(font => toFont(font)) : [toFont(optFont)];
  const labelSize = measureLabelSize(ctx, labels, fonts);
  if (!labelToDraw(ctx, rect, labelsOpts, labelSize)) {
    return;
  }
  const borderWidth = parseBorderWidth(opts.borderWidth, rect.width / 2, rect.height / 2);
  const optColor = (rect.active ? labelsOpts.hoverColor : labelsOpts.color) || labelsOpts.color;
  const colors = isArray(optColor) ? optColor : [optColor];
  const xyPoint = calculateXYLabel(opts, rect, labelSize, borderWidth);
  ctx.textAlign = labelsOpts.align;
  ctx.textBaseline = 'middle';
  let lhs = 0;
  labels.forEach(function(l, i) {
    const color = colors[Math.min(i, colors.length - 1)];
    const font = fonts[Math.min(i, fonts.length - 1)];
    const lh = font.lineHeight;
    ctx.font = font.string;
    ctx.fillStyle = color;
    ctx.fillText(l, xyPoint.x, xyPoint.y + lh / 2 + lhs);
    lhs += lh;
  });
}

function drawDivider(ctx, rect, options, item) {
  const dividersOpts = options.dividers;
  if (!dividersOpts.display || !item._data.children.length) {
    return;
  }
  const {w, h} = rect;

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

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 * @returns {boolean|undefined}
 */
function setBorderStyle(ctx, options) {
  if (options && options.borderWidth && !isObject(options.borderWidth)) {
    ctx.lineWidth = options.borderWidth;
    ctx.strokeStyle = options.borderColor;
    return true;
  }
}

const clamp = (x, from, to) => Math.min(to, Math.max(from, x));

/**
 * @param {Object} obj
 * @param {number} from
 * @param {number} to
 * @returns {Object}
 */
function clampAll(obj, from, to) {
  for (const key of Object.keys(obj)) {
    obj[key] = clamp(obj[key], from, to);
  }
  return obj;
}


/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @param {Object} options
 */
function drawBox(ctx, rect, options) {
  const {x, y, w, h} = rect;
  ctx.save();
  const stroke = setBorderStyle(ctx, options);
  ctx.fillStyle = options.backgroundColor;
  ctx.beginPath();
  addRoundedRectPath(ctx, {
    x, y, w, h,
    radius: clampAll(toTRBLCorners(options.borderRadius), 0, Math.min(w, h) / 2)
  });
  ctx.closePath();
  ctx.fill();
  if (stroke) {
    ctx.stroke();
  }
  ctx.restore();
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
    const overlapBoxes = isBoxesOverlapped(options);
    const {inner, outer} = boundingRects(this, overlapBoxes);

    ctx.save();

    if (overlapBoxes) {
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
    } else {
      drawBox(ctx, inner, options);
    }
    drawDivider(ctx, inner, options, data);
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
  borderRadius: 0,
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
    formatter: (ctx) => ctx.raw.g ? [ctx.raw.g, ctx.raw.v + ''] : (ctx.raw._data.label ? [ctx.raw._data.label, ctx.raw.v + ''] : ctx.raw.v + ''),
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
