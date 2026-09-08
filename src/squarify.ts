import Rect from './rect'
import StatArray from './statArray'
import { index, sort, sum } from './utils'

/**
 * Where the layout weight lives when `valueScale` is not linear. Non-enumerable
 * on the node, so `ctx.raw` keeps the shape it has always had.
 */
export const WEIGHT_KEY = '_weight'

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

/**
 * Builds the nodes for one set of siblings, without any geometry.
 *
 * Everything here depends only on the data: which item a node came from, its
 * value, its group and level. The rectangle is not involved, which is what lets
 * the controller know how many elements it needs before the chart area is known.
 */
export function toNodes(values: any[], keys: string[], grp?: string, lvl?: number) {
  const items = values ? values.slice() : []
  const key = index(items, keys[0])

  return items.map((item: any) => {
    const node: any = {
      _data: values[item._idx],
      v: key ? +item[key] : +item,
      vs: undefined,
    }
    if (grp) {
      node.g = item[grp]
      node.gs = undefined
      node.l = item.groupIndex ?? lvl
      node.vs = keys.reduce<Record<string, number>>((obj, k) => {
        obj[k] = +item[k]
        return obj
      }, {})
    }
    return node
  })
}

/** Orders a set of siblings the way the layout draws them: largest first. */
export function sortNodes(nodes: any[], weighted = false) {
  sort(nodes, weighted ? WEIGHT_KEY : 'v')
}

/**
 * Packs already-ordered nodes into the rectangle, writing `x`, `y`, `w`, `h`,
 * the row sum `s` and the normalized area `a` onto them.
 */
export function packInto(nodes: any[], rectangle: any, weighted = false) {
  const n = nodes.length
  if (!n) {
    return
  }
  const key = weighted ? WEIGHT_KEY : 'v'
  const rect = new Rect(rectangle)
  const row = new StatArray(key, rect.area / sum(nodes, key))
  let length = rect.side
  let o: any

  for (let i = 0; i < n; ++i) {
    o = row.pushIf(nodes[i], compareAspectRatio, length)
    if (o) {
      rect.map(row)
      length = rect.side
      row.reset()
      row.push(o)
    }
  }
  if (row.length) {
    rect.map(row)
  }
}

export default function squarify(
  values: any[],
  rectangle: any,
  keys: string[] = [],
  grp?: string,
  lvl?: number,
  gsum?: number
) {
  const nodes = toNodes(values || [], keys, grp, lvl)
  if (grp) {
    for (const node of nodes) {
      node.gs = gsum
    }
  }
  if (!rectangle?.unsorted) {
    sortNodes(nodes)
  }
  packInto(nodes, rectangle)
  return nodes
}
