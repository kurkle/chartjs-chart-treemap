import {rasterize, rasterizeRect} from './helpers/index';

function getDims(itm, w2, s2, key, dpr, maxd2) {
  const a = itm._normalized;
  const ar = w2 * a / s2;
  const d1 = rasterize(Math.sqrt(a * ar), dpr);
  const d2 = Math.min(rasterize(a / d1, dpr), maxd2);
  const w = key === '_ix' ? d1 : d2;
  const h = key === '_ix' ? d2 : d1;

  return {d1, d2, w, h};
}

const getX = (rect, w) => rect.rtl ? rect.x + rect.iw - w : rect.x + rect._ix;

function buildRow(rect, itm, dims, sum, dpr) {
  const r = rasterizeRect({
    x: getX(rect, dims.w),
    y: rect.y + rect._iy,
    w: dims.w,
    h: dims.h,
    a: itm._normalized,
    v: itm.value,
    s: sum,
    _data: itm._data
  }, dpr);
  if (itm.group) {
    r.g = itm.group;
    r.l = itm.level;
    r.gs = itm.groupSum;
  }
  return r;
}

export default class Rect {
  constructor(r, dpr) {
    this.dpr = dpr;
    r = r || {w: 1, h: 1};
    this.rtl = !!r.rtl;
    this.x = r.x || r.left || 0;
    this.y = r.y || r.top || 0;
    this._ix = 0;
    this._iy = 0;
    this.w = r.w || r.width || (r.right - r.left);
    this.h = r.h || r.height || (r.bottom - r.top);
  }

  get area() {
    return this.w * this.h;
  }

  get iw() {
    return this.w - this._ix;
  }

  get ih() {
    return this.h - this._iy;
  }

  get dir() {
    const ih = this.ih;
    return ih <= this.iw && ih > 0 ? 'y' : 'x';
  }

  get side() {
    return rasterize(this.dir === 'x' ? this.iw : this.ih, this.dpr);
  }

  map(arr) {
    const {dir, side, dpr} = this;
    const {key, d2prop, id2prop, d2key} = getPropNames(dir);
    const sum = arr.nsum;
    const row = arr.get();
    const w2 = side * side;
    const availd2 = rasterize(this[id2prop], dpr);
    const s2 = sum * sum;
    const ret = [];
    let maxd2 = 0;
    let totd1 = 0;
    for (const itm of row) {
      const dims = getDims(itm, w2, s2, key, dpr, availd2);
      totd1 += dims.d1;
      maxd2 = Math.min(Math.max(maxd2, dims.d2), availd2);
      ret.push(buildRow(this, itm, dims, arr.sum, dpr));
      this[key] += dims.d1;
    }
    // make sure all rects are same size in d2 direction
    for (const r of ret) {
      const d2 = r[d2prop];
      if (d2 !== maxd2) {
        if (this.rtl && dir === 'y') {
          // for RTL, x-coordinate needs to be adjusted too
          r.x -= maxd2 - d2;
        }
        r[d2prop] = maxd2;
      }
    }
    this[d2key] += maxd2;
    this[key] -= totd1;
    return ret;
  }
}

function getPropNames(dir) {
  if (dir === 'x') {
    return {
      key: '_ix',
      d2prop: 'h',
      id2prop: 'ih',
      d2key: '_iy'
    };
  }
  return {
    key: '_iy',
    d2prop: 'w',
    id2prop: 'iw',
    d2key: '_ix'
  };
}
