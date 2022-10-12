
export function rasterizeRect(rect, dpr) {
  if (dpr === 1) {
    return rect;
  }
  const rasterize = v => Math.round(v * dpr) / dpr;
  const x = rasterize(rect.x);
  const y = rasterize(rect.y);
  return {
    ...rect,
    x,
    y,
    w: rasterize(x + rect.w) - x,
    h: rasterize(y + rect.h) - y,
  };
}
