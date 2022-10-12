
export function rasterizeRect(rect, dpr) {
  const floor = v => Math.floor(v * dpr) / dpr;
  const ceil = v => Math.ceil(v * dpr) / dpr;
  const x = floor(rect.x);
  const y = floor(rect.y);
  return {
    ...rect,
    x,
    y,
    w: ceil(x + rect.w) - x,
    h: ceil(y + rect.h) - y,
  };
}
