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

function squarify(values, r) {
	var rows = [];
	var rect = new Rect(r);
	var row = new statArray('value', rect.area / utils.sum(values));
	var length = rect.side;
	var i, n, o;

	values = values.slice();
	utils.qrsort(values);

	for (i = 0, n = values.length; i < n; ++i) {
		o = row.pushIf({value: values[i]}, compareAspectRatio, length);
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
