import {isObject} from 'chart.js/helpers';

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
  const max = data.reduce(function(maxValue, element) {
    // minus 2 because _leaf and value properties are added
    // on top to groups ones
    const keys = Object.keys(element).length - 2;
    return maxValue > keys ? maxValue : keys;
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
  let g, i, n;
  for (i = 0, n = values.length; i < n; ++i) {
    const v = values[i];
    if (mainGrp && v[mainGrp] !== mainValue) {
      continue;
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
  }

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
