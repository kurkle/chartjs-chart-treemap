'use strict';

import utils from './utils';
import Rect from './rect';

class sqrow {
	constructor(ratio) {
		this._ratio = ratio;
		this.reset();
	}
	push(v) {
		var me = this;
		var a = v * me._ratio;
		me._row.push([v, a]);
		me.__sum = me._sum;
		me._sum += a;

		if (me._min === null || me._min > a) {
			me.__min = me._min;
			me._min = a;
		} else {
			me.__min = me._min;
		}

		if (me._max === null || me._max < a) {
			me.__max = me._max;
			me._max = a;
		} else {
			me.__max = me._max;
		}
	}
	pop() {
		var me = this;
		var [v, a] = me._row.pop();
		me._sum -= a;
		me._min = me.__min;
		me._max = me.__max;
		return v;
	}
	reset(w) {
		var me = this;
		me._row = [];
		me._sum = 0;
		me._min = me.__min = null;
		me._max = me.__max = null;
		me._w = w;
	}
	ok() {
		var me = this;
		var s2 = me._sum * me._sum;
		var ps2 = me.__sum * me.__sum;
		var w2 = me._w * me._w;
		var n = Math.max(w2 * me._max / s2, s2 / (w2 * me._min));
		var p = Math.max(w2 * me.__max / ps2, ps2 / (w2 * me.__min));
		return n <= p;
	}
	get() {
		return this._row;
	}
}

Object.defineProperties(sqrow.prototype, {
	length: {
		get() {
			return this._row.length;
		}
	},
	sum: {
		get() {
			return this._sum;
		}
	}
});

function squarify(values, r) {
	var rect = new Rect(r);
	var area = rect.h * rect.w;
	var sum = utils.sum(values);
	var ratio = area / sum;
	var n = values.length;
	var row = new sqrow(ratio);
	var rows = [];
	var i, v;

	values = values.slice();
	utils.qrsort(values);

	row.reset(rect.side);
	for (i = 0; i < n; ++i) {
		row.push(values[i]);
		if (row.length > 1 && !row.ok()) {
			v = row.pop();
			rows.push(rect.map(row.get(), row.sum));
			row.reset(rect.side);
			row.push(v);
		}
	}
	if (row.length) {
		rows.push(rect.map(row.get(), row.sum));
	}
	return rows.flat();
}

export default squarify;
