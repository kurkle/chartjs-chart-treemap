'use strict';

import utils from './utils';
import Rect from './rect';
import statArray from './statArray';

function compareAspectRatio(oldStat, newStat, args) {
	if (oldStat.sum === 0) {
		return true;
	}

	var [length] = args;
	var os2 = oldStat.nsum * oldStat.nsum;
	var ns2 = newStat.nsum * newStat.nsum;
	var l2 = length * length;
	var or = Math.max(l2 * oldStat.nmax / os2, os2 / (l2 * oldStat.nmin));
	var nr = Math.max(l2 * newStat.nmax / ns2, ns2 / (l2 * newStat.nmin));
	return nr <= or;
}

function squarify(values, r, key, grp, lvl, gsum) {
	var sum = utils.sum(values, key);
	var rows = [];
	var rect = new Rect(r);
	var row = new statArray('value', rect.area / sum);
	var length = rect.side;
	var n = values.length;
	var i, o, tmp;

	if (!n) {
		return rows;
	}

	tmp = values.slice();
	key = utils.index(tmp, key);
	utils.sort(tmp, key);

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
	return utils.flatten(rows);
}

export default squarify;
