import {Element} from 'chart.js';
import {toFont, isArray, toTRBL, toTRBLCorners, addRoundedRectPath, valueOrDefault} from 'chart.js/helpers';
import {rasterizeRect} from './helpers/index';

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

function boundingRects(rect, dpr) {
  const bounds = getBounds(rect);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2);
  const radius = parseBorderRadius(rect.options.borderRadius, width / 2, height / 2);

  return {
    outer: rasterizeRect({
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    }, dpr),
    inner: rasterizeRect({
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
    }, dpr)
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
  const {w, h} = rect;
  const font = toFont(options.font);
  const min = font.lineHeight;
  const padding = limit(valueOrDefault(options.padding, 3) * 2, 0, Math.min(w, h));
  return (w - padding) > min && (h - padding) > min;
}

function drawText(ctx, rect, options, item, levels) {
  const {captions, labels} = options;
  ctx.save();
  ctx.beginPath();
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
  const oColor = (rect.active ? hoverColor : color) || color;
  const oAlign = align || (rtl ? 'right' : 'left');
  const optFont = (rect.active ? hoverFont : font) || font;
  const oFont = toFont(optFont);
  const lh = oFont.lineHeight / 2;
  const x = calculateX(rect, oAlign, padding);
  ctx.fillStyle = oColor;
  ctx.font = oFont.string;
  ctx.textAlign = oAlign;
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
  const {overflow, padding} = options;
  const {width, height} = labelSize;
  if (overflow === 'hidden') {
    return !((width + padding * 2) > rect.w || (height + padding * 2) > rect.h);
  }
  return true;
}

function drawLabel(ctx, rect, options) {
  const labels = options.labels;
  const content = labels.formatter;
  if (!content) {
    return;
  }
  const contents = isArray(content) ? content : [content];
  const {font, hoverFont} = labels;
  const optFont = (rect.active ? hoverFont : font) || font;
  const fonts = isArray(optFont) ? optFont.map(f => toFont(f)) : [toFont(optFont)];
  const labelSize = measureLabelSize(ctx, contents, fonts);
  if (!labelToDraw(ctx, rect, labels, labelSize)) {
    return;
  }
  const {color, hoverColor, align} = labels;
  const optColor = (rect.active ? hoverColor : color) || color;
  const colors = isArray(optColor) ? optColor : [optColor];
  const xyPoint = calculateXYLabel(rect, labels, labelSize);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  let lhs = 0;
  contents.forEach(function(l, i) {
    const c = colors[Math.min(i, colors.length - 1)];
    const f = fonts[Math.min(i, fonts.length - 1)];
    const lh = f.lineHeight;
    ctx.font = f.string;
    ctx.fillStyle = c;
    ctx.fillText(l, xyPoint.x, xyPoint.y + lh / 2 + lhs);
    lhs += lh;
  });
}

function drawDivider(ctx, rect, options, item) {
  const dividers = options.dividers;
  if (!dividers.display || !item._data.children.length) {
    return;
  }
  const {x, y, w, h} = rect;
  const {lineColor, lineCapStyle, lineDash, lineDashOffset, lineWidth} = dividers;
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineCap = lineCapStyle;
  ctx.setLineDash(lineDash);
  ctx.lineDashOffset = lineDashOffset;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  if (w > h) {
    const w2 = w / 2;
    ctx.moveTo(x + w2, y);
    ctx.lineTo(x + w2, y + h);
  } else {
    const h2 = h / 2;
    ctx.moveTo(x, y + h2);
    ctx.lineTo(x + w, y + h2);
  }
  ctx.stroke();
  ctx.restore();
}

function calculateXYLabel(rect, options, labelSize) {
  const {align, position, padding} = options;
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

  draw(ctx, data, levels = 0, dpr) {
    if (!data) {
      return;
    }
    const options = this.options;
    const {inner, outer} = boundingRects(this, dpr);

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

  // TODO: remove this unused function in v3
  getRange(axis) {
    return axis === 'x' ? this.width / 2 : this.height / 2;
  }
}

TreemapElement.id = 'treemap';

TreemapElement.defaults = {
  label: undefined,
  borderRadius: 0,
  borderWidth: 0,
  captions: {
    align: undefined,
    color: 'black',
    display: true,
    font: {},
    formatter: (ctx) => ctx.raw.g || ctx.raw._data.label || '',
    padding: 3
  },
  dividers: {
    display: false,
    lineCapStyle: 'butt',
    lineColor: 'black',
    lineDash: [],
    lineDashOffset: 0,
    lineWidth: 1,
  },
  labels: {
    align: 'center',
    color: 'black',
    display: false,
    font: {},
    formatter(ctx) {
      if (ctx.raw.g) {
        return [ctx.raw.g, ctx.raw.v + ''];
      }
      return ctx.raw._data.label ? [ctx.raw._data.label, ctx.raw.v + ''] : ctx.raw.v + '';
    },
    overflow: 'cut',
    position: 'middle',
    padding: 3
  },
  rtl: false,
  spacing: 0.5
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
