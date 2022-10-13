import {isObject} from 'chart.js/helpers';

const getValue = (item) => isObject(item) ? item.v : item;

export const maxValue = (data) => data.reduce(function(m, v) {
  return (m > getValue(v) ? m : getValue(v));
}, 0);

export const minValue = (data, mx) => data.reduce(function(m, v) {
  return (m < getValue(v) ? m : getValue(v));
}, mx);

export const sum = (values, key) => values.reduce(function(s, v) {
  s += key ? +v[key] : +v;
  return s;
}, 0);

export const getGroupKey = (lvl) => '' + lvl;

function scanTreeObject(key, treeLeafKey, obj, tree = [], lvl = 0, result = []) {
  const objIndex = lvl - 1;
  if (key in obj && lvl > 0) {
    const record = tree.reduce(function(reduced, item, i) {
      if (i !== objIndex) {
        reduced[getGroupKey(i)] = item;
      }
      return reduced;
    }, {});
    record[treeLeafKey] = tree[objIndex];
    record[key] = obj[key];
    result.push(record);
  } else {
    for (const childKey of Object.keys(obj)) {
      const child = obj[childKey];
      if (isObject(child)) {
        tree.push(childKey);
        scanTreeObject(key, treeLeafKey, child, tree, lvl + 1, result);
      }
    }
  }
  tree.splice(objIndex, 1);
  return result;
}

export function normalizeTreeToArray(key, treeLeafKey, obj) {
  const data = scanTreeObject(key, treeLeafKey, obj);
  if (!data.length) {
    return data;
  }
  const max = data.reduce(function(maxVal, element) {
    // minus 2 because _leaf and value properties are added
    // on top to groups ones
    const keys = Object.keys(element).length - 2;
    return maxVal > keys ? maxVal : keys;
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
 * @param {string} key
 * @param {string} treeeLeafKey
 * @param {string} [mainGrp]
 * @param {*} [mainValue]
 * @param {[]} groups
 */
export function group(values, grp, key, treeLeafKey, mainGrp, mainValue, groups = []) {
  const tmp = Object.create(null);
  const data = Object.create(null);
  const ret = [];
  let g;
  values.forEach(function(v) {
    if (mainGrp && v[mainGrp] !== mainValue) {
      return;
    }
    g = v[grp] || v[treeLeafKey] || '';
    if (!(g in tmp)) {
      tmp[g] = {value: 0};
      data[g] = [];
    }
    tmp[g].value += +v[key];
    tmp[g].label = v[grp] || '';
    tmp[g].path = getPath(groups, v, g);
    data[g].push(v);
  });

  Object.keys(tmp).forEach((k) => {
    const v = {children: data[k]};
    v[key] = +tmp[k].value;
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
  if (!n) {
    return key;
  }

  const obj = isObject(values[0]);
  key = obj ? key : 'v';

  for (let i = 0; i < n; ++i) {
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

export function requireVersion(min, ver) {
  const parts = ver.split('.');
  if (!min.split('.').reduce((a, c, i) => a && c <= parts[i], true)) {
    throw new Error(`Chart.js v${ver} is not supported. v${min} or newer is required.`);
  }
}
