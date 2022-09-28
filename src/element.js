import {Element} from 'chart.js';
import {toFont, isArray, toTRBL, toTRBLCorners, addRoundedRectPath, valueOrDefault} from 'chart.js/helpers';

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
  const o = toTRBL(value);

  return {
    t: limit(o.top, 0, maxH),
    r: limit(o.right, 0, maxW),
    b: limit(o.bottom, 0, maxH),
    l: limit(o.left, 0, maxW)
  };
}

function parseBorderRadius(value, maxW, maxH) {
  const o = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);

  return {
    topLeft: limit(o.topLeft, 0, maxR),
    topRight: limit(o.topRight, 0, maxR),
    bottomLeft: limit(o.bottomLeft, 0, maxR),
    bottomRight: limit(o.bottomRight, 0, maxR)
  };
}

function boundingRects(rect) {
  const bounds = getBounds(rect);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2);
  const radius = parseBorderRadius(rect.options.borderRadius, width / 2, height / 2);

  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)),
      }
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

function hasRadius(radius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}

/**
 * Add a path of a rectangle to the current sub-path
 * @param {CanvasRenderingContext2D} ctx Context
 * @param {*} rect Bounding rect
 */
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}

export function shouldDrawCaption(rect, options) {
  if (!options || !options.display) {
    return false;
  }
  const font = toFont(options.font);
  const w = rect.width || rect.w;
  const h = rect.height || rect.h;
  const padding = limit(valueOrDefault(options.padding, 3) * 2, 0, Math.min(w, h));
  const min = font.lineHeight;
  return (w - padding) > min && (h - padding) > min;
}

function drawText(ctx, rect, options, item, levels) {
  const {captions, labels} = options;
  ctx.save();
  ctx.beginPath();
  // TODO clip adding the padding and creating new rect with padding,
  // in order to remove the padding for further calculation
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const isLeaf = (!('l' in item) || item.l === levels);
  if (isLeaf && labels.display) {
    drawLabel(ctx, rect, options);
  } else if (!isLeaf && shouldDrawCaption(rect, captions)) {
    drawCaption(ctx, rect, options, item);
  }
  ctx.restore();
}

function drawCaption(ctx, rect, options, item) {
  const {captions, spacing, rtl} = options;
  const {color, hoverColor, font, hoverFont, padding, align, formatter} = captions;
  const textColor = (rect.active ? hoverColor : color) || color;
  const textAlign = align || (rtl ? 'right' : 'left');
  const optFont = (rect.active ? hoverFont : font) || font;
  const textFont = toFont(optFont);
  const lh = textFont.lineHeight / 2;
  const x = calculateX(rect, textAlign, padding);
  ctx.fillStyle = textColor;
  ctx.font = textFont.string;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'middle';
  ctx.fillText(formatter || item.g, x, rect.y + padding + spacing + lh);
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
    return !((labelSize.width + padding * 2) > rect.w || (labelSize.height + padding * 2) > rect.h);
  }
  return true;
}

function drawLabel(ctx, rect, options) {
  const labelsOpts = options.labels;
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
  const optColor = (rect.active ? labelsOpts.hoverColor : labelsOpts.color) || labelsOpts.color;
  const colors = isArray(optColor) ? optColor : [optColor];
  const xyPoint = calculateXYLabel(options, rect, labelSize);
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

function calculateXYLabel(options, rect, labelSize) {
  const labelsOpts = options.labels;
  const {align, position, padding} = labelsOpts;
  let x, y;
  x = calculateX(rect, align, padding);
  if (position === 'top') {
    y = rect.y + padding;
  } else if (position === 'bottom') {
    y = rect.y + rect.h - padding - labelSize.height;
  } else {
    y = rect.y + (rect.h - labelSize.height) / 2 + padding;
  }
  return {x, y};
}

function calculateX(rect, align, padding) {
  if (align === 'left') {
    return rect.x + padding;
  } else if (align === 'right') {
    return rect.x + rect.w - padding;
  }
  return rect.x + rect.w / 2;
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

    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;

    ctx.save();

    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      addRectPath(ctx, outer);
      ctx.clip();
      addRectPath(ctx, inner);
      ctx.fillStyle = options.borderColor;
      ctx.fill('evenodd');
    }

    ctx.beginPath();
    addRectPath(ctx, inner);
    ctx.fillStyle = options.backgroundColor;
    ctx.fill();

    drawDivider(ctx, inner, options, data);
    drawText(ctx, inner, options, data, levels);
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
