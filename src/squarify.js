import {sum, index, sort, flatten} from './utils';
import Rect from './rect';
import statArray from './statArray';

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

function squarify(values, r, key, grp, lvl, gsum) {
	const rows = [];
	const rect = new Rect(r);
	const row = new statArray('value', rect.area / sum(values, key));
	let length = rect.side;
	const n = values.length;
	let i, o;

	if (!n) {
		return rows;
	}

	const tmp = values.slice();
	key = index(tmp, key);
	sort(tmp, key);

	function val(idx) {
		return key ? +tmp[idx][key] : +tmp[idx];
	}
	function gval(idx) {
		return grp && tmp[idx][grp];
	}

	for (i = 0; i < n; ++i) {
		o = {value: val(i), groupSum: gsum, _data: values[tmp[i]._idx]};
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

export default squarify;
