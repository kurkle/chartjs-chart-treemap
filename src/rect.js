'use strict';

var Rect = function(r) {
	var me = this;
	me.x = me._ix = r.x || 0;
	me.y = me._iy = r.y || 0;
	me.w = r.w || r.width || (r.right - r.left) || 400;
	me.h = r.h || r.height || (r.bottom - r.top) || 300;
};

Object.defineProperties(Rect.prototype, {
	iw: {
		get() {
			return this.w - this._ix;
		}
	},
	ih: {
		get() {
			return this.h - this._iy;
		}
	},
	dir: {
		get() {
			var me = this;
			var iw = me.iw;
			var ih = me.ih;
			return ih <= iw && ih > 0 ? 'y' : 'x';
		}
	},
	side: {
		get() {
			var me = this;
			return me.dir === 'x' ? me.iw : me.ih;
		}
	}
});

function round(v, n) {
	return +(Math.round(v + 'e+' + n) + 'e-' + n);
}

Rect.prototype.map = function(row, sum) {
	var me = this;
	var ret = [];
	var n = row.length;
	var dir = me.dir;
	var side = me.side;
	var w2 = side * side;
	var key = dir === 'x' ? '_ix' : '_iy';
	var k2 = dir === 'y' ? '_ix' : '_iy';
	var s2 = sum * sum;
	var maxd2 = 0;
	var totd1 = 0;
	var i, v, a, ar, w, h, d1, d2;
	for (i = 0; i < n; ++i) {
		[v, a] = row[i];
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
};

export default Rect;
