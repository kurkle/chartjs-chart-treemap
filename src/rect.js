function round(v, n) {
  return (+(Math.round(v + 'e+' + n) + 'e-' + n)) || 0;
}

function getDims(itm, w2, s2, key) {
  const a = itm._normalized;
  const ar = w2 * a / s2;
  const d1 = Math.sqrt(a * ar);
  const d2 = a / d1;
  const w = key === '_ix' ? d1 : d2;
  const h = key === '_ix' ? d2 : d1;

  return {d1, d2, w, h};
}

const getX = (rect, w) => round(rect.rtl ? rect.x + rect.w - rect._ix - w : rect.x + rect._ix, 4);

function buildRow(rect, itm, dims, sum) {
  const r = {
    x: getX(rect, dims.w),
    y: round(rect.y + rect._iy, 4),
    w: round(dims.w, 4),
    h: round(dims.h, 4),
    a: round(itm._normalized, 4),
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
    const me = this;
    r = r || {w: 1, h: 1};
    me.rtl = !!r.rtl;
    me.x = r.x || r.left || 0;
    me.y = r.y || r.top || 0;
    me._ix = 0;
    me._iy = 0;
    me.w = r.w || r.width || (r.right - r.left);
    me.h = r.h || r.height || (r.bottom - r.top);
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
    const me = this;
    const ret = [];
    const sum = arr.nsum;
    const row = arr.get();
    const dir = me.dir;
    const side = me.side;
    const w2 = side * side;
    const key = dir === 'x' ? '_ix' : '_iy';
    const s2 = sum * sum;
    let maxd2 = 0;
    let totd1 = 0;
    for (const itm of row) {
      const dims = getDims(itm, w2, s2, key);
      totd1 += dims.d1;
      maxd2 = Math.max(maxd2, dims.d2);
      ret.push(buildRow(me, itm, dims, arr.sum));
      me[key] += dims.d1;
    }
    me[dir === 'y' ? '_ix' : '_iy'] += maxd2;
    me[key] -= totd1;
    return ret;
  }
}
