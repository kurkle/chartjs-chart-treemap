import { isObject } from 'chart.js/helpers'

const isOlderPart = (act: string, req: string) =>
  req > act || (act.length > req.length && act.startsWith(req))

export const getGroupKey = (lvl: unknown) => String(lvl)

function scanTreeObject(
  keys: string[],
  treeLeafKey: string,
  obj: Record<string, any>,
  tree: string[] = [],
  lvl = 0,
  result: Record<string, any>[] = []
) {
  const objIndex = lvl - 1
  if (keys[0] in obj && lvl > 0) {
    const record = tree.reduce<Record<string, any>>((reduced, item, i) => {
      if (i !== objIndex) {
        reduced[getGroupKey(i)] = item
      }
      return reduced
    }, {})
    record[treeLeafKey] = tree[objIndex]
    keys.forEach((k) => {
      record[k] = obj[k]
    })
    result.push(record)
  } else {
    for (const childKey of Object.keys(obj)) {
      const child = obj[childKey]
      if (isObject(child)) {
        tree.push(childKey)
        scanTreeObject(keys, treeLeafKey, child, tree, lvl + 1, result)
      }
    }
  }
  tree.splice(objIndex, 1)
  return result
}

export function normalizeTreeToArray(
  keys: string[],
  treeLeafKey: string,
  obj: Record<string, any>
) {
  const data = scanTreeObject(keys, treeLeafKey, obj)
  if (!data.length) {
    return data
  }
  const max = data.reduce((maxVal, element) => {
    // minus 2 because _leaf and value properties are added
    // on top to groups ones
    const ikeys = Object.keys(element).length - 2
    return Math.max(maxVal, ikeys)
  }, 0)
  data.forEach((element) => {
    for (let i = 0; i < max; i++) {
      const groupKey = getGroupKey(i)
      if (!element[groupKey]) {
        element[groupKey] = ''
      }
    }
  })
  return data
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
export function flatten(input: any[]) {
  const stack = [...input]
  const res = []
  while (stack.length) {
    // pop value from stack
    const next = stack.pop()
    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next)
    } else {
      res.push(next)
    }
  }
  // reverse to restore input order
  return res.reverse()
}

function getPath(groups: string[], value: Record<string, any>, defaultValue: string) {
  if (!groups.length) {
    return undefined
  }
  const path = []
  for (const grp of groups) {
    const item = value[grp]
    if (item === '') {
      path.push(defaultValue)
      break
    }
    path.push(item)
  }
  return path.length ? path.join('.') : defaultValue
}

/**
 * @param {[]} values
 * @param {string} grp
 * @param {[string]} keys
 * @param {string} treeeLeafKey
 * @param {string} [mainGrp]
 * @param {*} [mainValue]
 * @param {[]} groups
 */
export function group(
  values: Record<string, any>[],
  grp: string,
  keys: string[],
  treeLeafKey: string,
  mainGrp?: string,
  mainValue?: any,
  groups: string[] = []
) {
  const key = keys[0]
  const addKeys = keys.slice(1)
  const tmp: Record<string, any> = Object.create(null)
  const data: Record<string, any[]> = Object.create(null)
  const ret: Record<string, any>[] = []
  let g: string
  let i: number
  let n: number
  for (i = 0, n = values.length; i < n; ++i) {
    const v = values[i]
    if (mainGrp && v[mainGrp] !== mainValue) {
      continue
    }
    g = v[grp] || v[treeLeafKey] || ''
    if (!g) {
      return []
    }
    if (!(g in tmp)) {
      tmp[g] = { value: 0 }
      const tmpRef = tmp[g]
      addKeys.forEach((k) => {
        tmpRef[k] = 0
      })
      data[g] = []
    }
    tmp[g].value += +v[key]
    tmp[g].label = v[grp] || ''
    const tmpRef = tmp[g]
    addKeys.forEach((k) => {
      tmpRef[k] += v[k]
    })
    tmp[g].path = getPath(groups, v, g)
    data[g].push(v)
  }

  Object.keys(tmp).forEach((k) => {
    const v: Record<string, any> = { children: data[k] }
    v[key] = +tmp[k].value
    addKeys.forEach((ak) => {
      v[ak] = +tmp[k][ak]
    })
    v[grp] = tmp[k].label
    v.label = k
    v.path = tmp[k].path

    if (mainGrp) {
      v[mainGrp] = mainValue
    }
    ret.push(v)
  })

  return ret
}

export function index(values: any[], key: string) {
  let n = values.length
  let i: number

  if (!n) {
    return key
  }

  const obj = isObject(values[0])
  key = obj ? key : 'v'

  for (i = 0, n = values.length; i < n; ++i) {
    if (obj) {
      values[i]._idx = i
    } else {
      values[i] = { _idx: i, v: values[i] }
    }
  }
  return key
}

export function sort(values: any[], key?: string) {
  if (key) {
    values.sort((a, b) => +b[key] - +a[key])
  } else {
    values.sort((a, b) => +b - +a)
  }
}

export function sum(values: any[], key?: string) {
  let s: number
  let i: number
  let n: number

  for (s = 0, i = 0, n = values.length; i < n; ++i) {
    s += key ? +values[i][key] : +values[i]
  }

  return s
}

/**
 * @param {string} pkg
 * @param {string} min
 * @param {string} ver
 * @param {boolean} [strict=true]
 * @returns {boolean}
 */
export function requireVersion(pkg: string, min: string, ver: string, strict = true) {
  const parts = ver.split('.')
  let i = 0
  for (const req of min.split('.')) {
    const act = parts[i++]
    if (Number.parseInt(req, 10) < Number.parseInt(act, 10)) {
      break
    }
    if (isOlderPart(act, req)) {
      if (strict) {
        throw new Error(`${pkg} v${ver} is not supported. v${min} or newer is required.`)
      } else {
        return false
      }
    }
  }
  return true
}
