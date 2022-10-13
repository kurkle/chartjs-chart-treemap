import {sum, index, sort, flatten} from './utils';
import Rect from './rect';
import StatArray from './statArray';

function compareAspectRatio(oldStat, newStat, args) {
  if (oldStat.sum === 0) {
    return true;
  }

  const [length] = args;
  const os2 = oldStat.nsum * oldStat.nsum;
  const ns2 = newStat.nsum * newStat.nsum;
  const l2 = length * length;
  const or = Math.max(l2 * oldStat.nmax / os2, os2 / (l2 * oldStat.nmin));
  const nr = Math.max(l2 * newStat.nmax / ns2, ns2 / (l2 * newStat.nmin));
  return nr <= or;
}

/**
 *
 * @param {number[]|object[]} values
 * @param {object} rectangle
 * @param {string} key
 * @param {*} grp
 * @param {*} lvl
 * @param {*} gsum
 */
export default function squarify(values, rectangle, key, grp, lvl, gsum) {
  const rows = [];
  values = values || [];
  const n = values.length;
  if (!n) {
    return rows;
  }
  const rect = new Rect(rectangle);
  const row = new StatArray('value', rect.area / sum(values, key));

  const tmp = values.slice();
  key = index(tmp, key);
  sort(tmp, key);

  const val = (idx) => key ? +tmp[idx][key] : +tmp[idx];
  const gval = (idx) => grp && tmp[idx][grp];

  let length = rect.side;
  let o;
  for (let i = 0; i < n; ++i) {
    o = {value: val(i), groupSum: gsum, _data: values[tmp[i]._idx], level: undefined, group: undefined};
    if (grp) {
      o.level = lvl;
      o.group = gval(i);
    }
    o = row.pushIf(o, compareAspectRatio, length);
    if (o) {
      rows.push(rect.map(row));
      length = rect.side;
      row.reset();
      row.push(o);
    }
  }
  if (row.length) {
    rows.push(rect.map(row));
  }
  return flatten(rows);
}
