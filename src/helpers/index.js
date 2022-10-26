import {toTRBL, toFont, valueOrDefault} from 'chart.js/helpers';

export function scaleRect(sq, xScale, yScale, sp) {
  const sp2 = sp * 2;
  const x = xScale.getPixelForValue(sq.x);
  const y = yScale.getPixelForValue(sq.y);
  const w = xScale.getPixelForValue(sq.x + sq.w) - x;
  const h = yScale.getPixelForValue(sq.y + sq.h) - y;
  return {
    x: x + sp,
    y: y + sp,
    width: w - sp2,
    height: h - sp2,
    hidden: sp2 > w || sp2 > h,
  };
}

export function rectNotEqual(r1, r2) {
  return !r1 || !r2
		|| r1.x !== r2.x
		|| r1.y !== r2.y
		|| r1.w !== r2.w
		|| r1.h !== r2.h
    || r1.rtl !== r2.rtl;
}

export function arrayNotEqual(a, b) {
  let i, n;

  if (!a || !b) {
    return true;
  }

  if (a === b) {
    return false;
  }

  if (a.length !== b.length) {
    return true;
  }

  for (i = 0, n = a.length; i < n; ++i) {
    if (a[i] !== b[i]) {
      return true;
    }
  }
  return false;
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

export function shouldDrawCaption(rect, options) {
  if (!options.display) {
    return false;
  }
  const {w, h} = rect;
  const font = toFont(options.font);
  const min = font.lineHeight;
  const padding = limit(valueOrDefault(options.padding, 3) * 2, 0, Math.min(w, h));
  return (w - padding) > min && (h - padding) > min;
}

export function limit(value, min, max) {
  return Math.max(Math.min(value, max), min);
}
