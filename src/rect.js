'use strict';


function round(v, n) {
	return +(Math.round(v + 'e+' + n) + 'e-' + n);
}

class Rect {
	constructor(r) {
		var me = this;
		me.x = me._ix = r.x || 0;
		me.y = me._iy = r.y || 0;
		me.w = r.w || r.width || (r.right - r.left) || 400;
		me.h = r.h || r.height || (r.bottom - r.top) || 300;
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
		var k2 = dir === 'y' ? '_ix' : '_iy';
		var s2 = sum * sum;
		var maxd2 = 0;
		var totd1 = 0;
		var i, ar, w, h, d1, d2;
		for (i = 0; i < n; ++i) {
			var {value: v, _normalized: a} = row[i];
			ar = w2 * a / s2;
			d1 = Math.sqrt(a * ar);
			d2 = a / d1;
			totd1 += d1;
			if (d2 > maxd2) {
				maxd2 = d2;
			}
			w = key === '_ix' ? d1 : d2;
			h = key === '_ix' ? d2 : d1;
			ret.push({x: round(me._ix, 4), y: round(me._iy, 4), w: round(w, 4), h: round(h, 4), a: a, v: v});
			me[key] += d1;
		}
		me[k2] += maxd2;
		me[key] -= totd1;
		return ret;
	}
}

export default Rect;
