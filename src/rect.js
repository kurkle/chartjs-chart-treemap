function getDims(itm, w2, s2, key) {
  const a = itm._normalized;
  const ar = w2 * a / s2;
  const d1 = Math.sqrt(a * ar);
  const d2 = a / d1;
  const w = key === '_ix' ? d1 : d2;
  const h = key === '_ix' ? d2 : d1;

  return {d1, d2, w, h};
}

const getX = (rect, w) => rect.rtl ? rect.x + rect.iw - w : rect.x + rect._ix;

function buildRow(rect, itm, dims, sum) {
  const r = {
    x: getX(rect, dims.w),
    y: rect.y + rect._iy,
    w: dims.w,
    h: dims.h,
    a: itm._normalized,
    v: itm.value,
    s: sum,
    _data: itm._data
  };
  if (itm.group) {
    r.g = itm.group;
    r.l = itm.level;
    r.gs = itm.groupSum;
  }
  return r;
}

export default class Rect {
  constructor(r) {
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
    return this.dir === 'x' ? this.iw : this.ih;
  }

  map(arr) {
    const {dir, side} = this;
    const key = dir === 'x' ? '_ix' : '_iy';
    const sum = arr.nsum;
    const row = arr.get();
    const w2 = side * side;
    const s2 = sum * sum;
    const ret = [];
    let maxd2 = 0;
    let totd1 = 0;
    for (const itm of row) {
      const dims = getDims(itm, w2, s2, key);
      totd1 += dims.d1;
      maxd2 = Math.max(maxd2, dims.d2);
      ret.push(buildRow(this, itm, dims, arr.sum));
      this[key] += dims.d1;
    }

    this[dir === 'x' ? '_iy' : '_ix'] += maxd2;
    this[key] -= totd1;
    return ret;
  }
}
