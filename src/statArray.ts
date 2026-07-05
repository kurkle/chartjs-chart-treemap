const min = Math.min
const max = Math.max

function getStat(sa: StatArray) {
  return {
    max: sa.max,
    min: sa.min,
    nmax: sa.nmax,
    nmin: sa.nmin,
    nsum: sa.nsum,
    sum: sa.sum,
  }
}

function getNewStat(sa: StatArray, o: any) {
  const v = +o[sa.key]
  const n = v * sa.ratio
  o._normalized = n

  return {
    max: max(sa.max, v),
    min: min(sa.min, v),
    nmax: max(sa.nmax, n),
    nmin: min(sa.nmin, n),
    nsum: sa.nsum + n,
    sum: sa.sum + v,
  }
}

function setStat(sa: StatArray, stat: any) {
  Object.assign(sa, stat)
}

function push(sa: StatArray, o: any, stat: any) {
  sa._arr.push(o)
  setStat(sa, stat)
}

export default class StatArray {
  key: string
  ratio: number
  _arr: any[]
  _hist: any[]
  sum: number
  nsum: number
  min: number
  max: number
  nmin: number
  nmax: number

  constructor(key: string, ratio: number) {
    this.key = key
    this.ratio = ratio
    this.reset()
  }

  get length() {
    return this._arr.length
  }

  reset() {
    this._arr = []
    this._hist = []
    this.sum = 0
    this.nsum = 0
    this.min = Infinity
    this.max = -Infinity
    this.nmin = Infinity
    this.nmax = -Infinity
  }

  push(o: any) {
    push(this, o, getNewStat(this, o))
  }

  pushIf(o: any, fn: any, ...args: any[]) {
    const nstat = getNewStat(this, o)
    if (!fn(getStat(this), nstat, args)) {
      return o
    }
    push(this, o, nstat)
  }

  get() {
    return this._arr
  }
}
