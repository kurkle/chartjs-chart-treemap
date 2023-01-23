import {isObject} from 'chart.js/helpers';

const isOlderPart = (act, req) => req > act || (act.length > req.length && act.slice(0, req.length) === req);

export const getGroupKey = (lvl) => '' + lvl;

function scanTreeObject(keys, treeLeafKey, obj, tree = [], lvl = 0, result = []) {
  const objIndex = lvl - 1;
  if (keys[0] in obj && lvl > 0) {
    const record = tree.reduce(function(reduced, item, i) {
      if (i !== objIndex) {
        reduced[getGroupKey(i)] = item;
      }
      return reduced;
    }, {});
    record[treeLeafKey] = tree[objIndex];
    keys.forEach(function(k) {
      record[k] = obj[k];
    });
    result.push(record);
  } else {
    for (const childKey of Object.keys(obj)) {
      const child = obj[childKey];
      if (isObject(child)) {
        tree.push(childKey);
        scanTreeObject(keys, treeLeafKey, child, tree, lvl + 1, result);
      }
    }
  }
  tree.splice(objIndex, 1);
  return result;
}

export function normalizeTreeToArray(keys, treeLeafKey, obj) {
  const data = scanTreeObject(keys, treeLeafKey, obj);
  if (!data.length) {
    return data;
  }
  const max = data.reduce(function(maxVal, element) {
    // minus 2 because _leaf and value properties are added
    // on top to groups ones
    const ikeys = Object.keys(element).length - 2;
    return maxVal > ikeys ? maxVal : ikeys;
  });
  data.forEach(function(element) {
    for (let i = 0; i < max; i++) {
      const groupKey = getGroupKey(i);
      if (!element[groupKey]) {
        element[groupKey] = '';
      }
    }
  });
  return data;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
export function flatten(input) {
  const stack = [...input];
  const res = [];
  while (stack.length) {
    // pop value from stack
    const next = stack.pop();
    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next);
    } else {
      res.push(next);
    }
  }
  // reverse to restore input order
  return res.reverse();
}

function getPath(groups, value, defaultValue) {
  if (!groups.length) {
    return;
  }
  const path = [];
  for (const grp of groups) {
    const item = value[grp];
    if (item === '') {
      path.push(defaultValue);
      break;
    }
    path.push(item);
  }
  return path.length ? path.join('.') : defaultValue;
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
export function group(values, grp, keys, treeLeafKey, mainGrp, mainValue, groups = []) {
  const key = keys[0];
  const addKeys = keys.slice(1)
  const tmp = Object.create(null);
  const data = Object.create(null);
  const ret = [];
  let g, i, n;
  for (i = 0, n = values.length; i < n; ++i) {
    const v = values[i];
    if (mainGrp && v[mainGrp] !== mainValue) {
      continue;
    }
    g = v[grp] || v[treeLeafKey] || '';
    if (!(g in tmp)) {
      const tmpRef = tmp[g] = {value: 0};
      addKeys.forEach(function(k) {
        tmpRef[k] = 0;
      });
      data[g] = [];
    }
    tmp[g].value += +v[key];
    tmp[g].label = v[grp] || '';
    const tmpRef = tmp[g];
    addKeys.forEach(function(k) {
      tmpRef[k] += v[k];
    });
    tmp[g].path = getPath(groups, v, g);
    data[g].push(v);
  }

  Object.keys(tmp).forEach((k) => {
    const v = {children: data[k]};
    v[key] = +tmp[k].value;
    addKeys.forEach(function(ak) {
      v[ak] = +tmp[k][ak];
    });
    v[grp] = tmp[k].label;
    v.label = k;
    v.path = tmp[k].path;

    if (mainGrp) {
      v[mainGrp] = mainValue;
    }
    ret.push(v);
  });

  return ret;
}

export function index(values, key) {
  let n = values.length;
  let i;

  if (!n) {
    return key;
  }

  const obj = isObject(values[0]);
  key = obj ? key : 'v';

  for (i = 0, n = values.length; i < n; ++i) {
    if (obj) {
      values[i]._idx = i;
    } else {
      values[i] = {v: values[i], _idx: i};
    }
  }
  return key;
}

export function sort(values, key) {
  if (key) {
    values.sort((a, b) => +b[key] - +a[key]);
  } else {
    values.sort((a, b) => +b - +a);
  }
}

export function sum(values, key) {
  let s, i, n;

  for (s = 0, i = 0, n = values.length; i < n; ++i) {
    s += key ? +values[i][key] : +values[i];
  }

  return s;
}

/**
 * @param {string} pkg
 * @param {string} min
 * @param {string} ver
 * @param {boolean} [strict=true]
 * @returns {boolean}
 */
export function requireVersion(pkg, min, ver, strict = true) {
  const parts = ver.split('.');
  let i = 0;
  for (const req of min.split('.')) {
    const act = parts[i++];
    if (parseInt(req, 10) < parseInt(act, 10)) {
      break;
    }
    if (isOlderPart(act, req)) {
      if (strict) {
        throw new Error(`${pkg} v${ver} is not supported. v${min} or newer is required.`);
      } else {
        return false;
      }
    }
  }
  return true;
}
