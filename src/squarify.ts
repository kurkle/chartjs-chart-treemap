import Rect from './rect'
import StatArray from './statArray'
import { flatten, index, sort, sum } from './utils'

function compareAspectRatio(oldStat: any, newStat: any, args: any[]) {
  if (oldStat.sum === 0) {
    return true
  }

  const [length] = args
  const os2 = oldStat.nsum * oldStat.nsum
  const ns2 = newStat.nsum * newStat.nsum
  const l2 = length * length
  const or = Math.max((l2 * oldStat.nmax) / os2, os2 / (l2 * oldStat.nmin))
  const nr = Math.max((l2 * newStat.nmax) / ns2, ns2 / (l2 * newStat.nmin))
  return nr <= or
}

export default function squarify(
  values: any[],
  rectangle: any,
  keys: string[] = [],
  grp?: string,
  lvl?: number,
  gsum?: number
) {
  values = values || []
  const rows: any[] = []
  const rect = new Rect(rectangle)
  const row = new StatArray('value', rect.area / sum(values, keys[0]))
  let length = rect.side
  const n = values.length
  let i: number
  let o: any

  if (!n) {
    return rows
  }

  const tmp = values.slice()
  const key = index(tmp, keys[0])

  if (!rectangle?.unsorted) {
    sort(tmp, key)
  }

  const val = (idx: number) => (key ? +tmp[idx][key] : +tmp[idx])
  const gval = (idx: number) => grp && tmp[idx][grp]

  for (i = 0; i < n; ++i) {
    o = {
      _data: values[tmp[i]._idx],
      group: undefined,
      groupSum: gsum,
      level: undefined,
      value: val(i),
    }
    if (grp) {
      o.level = lvl
      o.group = gval(i)
      const tmpRef = tmp[i]
      o.values = keys.reduce<Record<string, number>>((obj, k) => {
        obj[k] = +tmpRef[k]
        return obj
      }, {})
    }
    o = row.pushIf(o, compareAspectRatio, length)
    if (o) {
      rows.push(rect.map(row))
      length = rect.side
      row.reset()
      row.push(o)
    }
  }
  if (row.length) {
    rows.push(rect.map(row))
  }
  return flatten(rows)
}
