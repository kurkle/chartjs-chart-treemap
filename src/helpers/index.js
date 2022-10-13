export const rasterize = (v, dpr) => Math.round(v * dpr) / dpr;

export function rasterizeRect(rect, dpr) {
  return {
    ...rect,
    x: rasterize(rect.x, dpr),
    y: rasterize(rect.y, dpr),
    w: rasterize(rect.w, dpr),
    h: rasterize(rect.h, dpr),
  };
}

