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

/**
 * @param {[]} values
 * @param {string} grp
 * @param {string} key
 * @param {string} [mainGrp]
 * @param {*} [mainValue]
 */
export function group(values, grp, key, mainGrp, mainValue) {
  const tmp = Object.create(null);
  const data = Object.create(null);
  const ret = [];
  let g, i, n, v;
  for (i = 0, n = values.length; i < n; ++i) {
    v = values[i];
    if (mainGrp && v[mainGrp] !== mainValue) {
      continue;
    }
    g = v[grp] || '';
    if (!(g in tmp)) {
      tmp[g] = 0;
      data[g] = [];
    }
    tmp[g] += +v[key];
    data[g].push(v);
  }

  Object.keys(tmp).forEach((k) => {
    v = {children: data[k]};
    v[key] = +tmp[k];
    v[grp] = k;
    if (mainGrp) {
      v[mainGrp] = mainValue;
    }
    ret.push(v);
  });

  return ret;
}

export function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
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
