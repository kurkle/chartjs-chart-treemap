function getDims(itm: any, w2: number, s2: number, key: string) {
  const a = itm._normalized
  if (!a) {
    // A zero-area item would divide by its own zero side and produce NaN
    // coordinates. It has nothing to draw, so give it nothing.
    return { d1: 0, d2: 0, h: 0, w: 0 }
  }
  const ar = (w2 * a) / s2
  const d1 = Math.sqrt(a * ar)
  const d2 = a / d1
  const w = key === '_ix' ? d1 : d2
  const h = key === '_ix' ? d2 : d1

  return { d1, d2, h, w }
}

const getX = (rect: Rect, w: number) => (rect.rtl ? rect.x + rect.iw - w : rect.x + rect._ix)

/** Writes the geometry of one packed row onto the nodes themselves. */
function assignRow(rect: Rect, itm: any, dims: any, sum: number) {
  itm.a = itm._normalized
  itm.h = dims.h
  itm.s = sum
  itm.w = dims.w
  itm.x = getX(rect, dims.w)
  itm.y = rect.y + rect._iy
  delete itm._normalized
}

export default class Rect {
  [key: string]: any
  rtl: boolean
  unsorted: boolean
  x: number
  y: number
  _ix: number
  _iy: number
  w: number
  h: number

  constructor(r?: any) {
    r = r || { h: 1, w: 1 }
    this.rtl = !!r.rtl
    this.unsorted = !!r.unsorted
    this.x = r.x || r.left || 0
    this.y = r.y || r.top || 0
    this._ix = 0
    this._iy = 0
    this.w = r.w || r.width || r.right - r.left
    this.h = r.h || r.height || r.bottom - r.top
  }

  get area() {
    return this.w * this.h
  }

  get iw() {
    return this.w - this._ix
  }

  get ih() {
    return this.h - this._iy
  }

  get dir() {
    const ih = this.ih
    return ih <= this.iw && ih > 0 ? 'y' : 'x'
  }

  get side() {
    return this.dir === 'x' ? this.iw : this.ih
  }

  map(arr: any) {
    const { dir, side } = this
    const key = dir === 'x' ? '_ix' : '_iy'
    const sum = arr.nsum
    const row = arr.get()
    const w2 = side * side
    const s2 = sum * sum
    let maxd2 = 0
    let totd1 = 0
    for (const itm of row) {
      const dims = getDims(itm, w2, s2, key)
      totd1 += dims.d1
      maxd2 = Math.max(maxd2, dims.d2)
      assignRow(this, itm, dims, arr.sum)
      this[key] += dims.d1
    }

    this[dir === 'x' ? '_iy' : '_ix'] += maxd2
    this[key] -= totd1
  }
}
