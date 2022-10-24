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
