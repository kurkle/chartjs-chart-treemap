'use strict';


function round(v, n) {
	return +(Math.round(v + 'e+' + n) + 'e-' + n);
}

function getDims(itm, w2, s2, key) {
	var a = itm._normalized;
	var ar = w2 * a / s2;
	var d1 = Math.sqrt(a * ar);
	var d2 = a / d1;
	var w = key === '_ix' ? d1 : d2;
	var h = key === '_ix' ? d2 : d1;

	return {d1: d1, d2: d2, w: w, h: h};
}

function buildRow(rect, itm, dims, sum) {
	var r = {
		x: round(rect.x + rect._ix, 4),
		y: round(rect.y + rect._iy, 4),
		w: round(dims.w, 4),
		h: round(dims.h, 4),
		a: itm._normalized,
		v: itm.value,
		s: sum
	};
	if (itm.group) {
		r.g = itm.group;
		r.l = itm.level;
		r.gs = itm.groupSum;
	}
	return r;
}
class Rect {
	constructor(r) {
		var me = this;
		me.x = r.x || r.left || 0;
		me.y = r.y || r.top || 0;
		me._ix = 0;
		me._iy = 0;
		me.w = r.w || r.width || (r.right - r.left);
		me.h = r.h || r.height || (r.bottom - r.top);
	}

	get area() {
		return this.w * this.h;
	}

	get iw() {
		return this.w - this._ix;
	}

	get ih() {
		return this.h - this._iy;
	}

	get dir() {
		var ih = this.ih;
		return ih <= this.iw && ih > 0 ? 'y' : 'x';
	}

	get side() {
		return this.dir === 'x' ? this.iw : this.ih;
	}

	map(arr) {
		var me = this;
		var ret = [];
		var sum = arr.nsum;
		var row = arr.get();
		var n = row.length;
		var dir = me.dir;
		var side = me.side;
		var w2 = side * side;
		var key = dir === 'x' ? '_ix' : '_iy';
		var s2 = sum * sum;
		var maxd2 = 0;
		var totd1 = 0;
		var i, itm, dims;
		for (i = 0; i < n; ++i) {
			itm = row[i];
			dims = getDims(itm, w2, s2, key);
			totd1 += dims.d1;
			if (dims.d2 > maxd2) {
				maxd2 = dims.d2;
			}
			ret.push(buildRow(me, itm, dims, arr.sum));
			me[key] += dims.d1;
		}
		me[dir === 'y' ? '_ix' : '_iy'] += maxd2;
		me[key] -= totd1;
		return ret;
	}
}

export default Rect;
