import {isObject, toFont} from 'chart.js/helpers';

function limit(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

export function toBorderWidth(value, maxW, maxH) {
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
