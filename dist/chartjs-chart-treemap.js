/*!
 * chartjs-chart-treemap v0.2.0
 * https://github.com/kurkle/chartjs-chart-treemap#readme
 * (c) 2019 Jukka Kurkela
 * Released under the MIT license
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
(global = global || self, factory(global.Chart));
}(this, function (Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(input) {
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

function group(values, grp, key, mainGrp, mainValue) {
	var tmp = Object.create(null);
	var ret = [];
	var g, i, n, v;
	for (i = 0, n = values.length; i < n; ++i) {
		v = values[i];
		if (mainGrp && v[mainGrp] !== mainValue) {
			continue;
		}
		g = v[grp] || '';
		if (!(g in tmp)) {
			tmp[g] = 0;
		}
		tmp[g] += +v[key];
	}

	Object.keys(tmp).forEach(function(k) {
		v = {};
		v[key] = +tmp[k];
		v[grp] = k;
		if (mainGrp) {
			v[mainGrp] = mainValue;
		}
		ret.push(v);
	});

	return ret;
}

function sort(values, key) {
	if (key) {
		values.sort(function(a, b) {
			return +b[key] - +a[key];
		});
	} else {
		values.sort(function(a, b) {
			return +b - +a;
		});
	}
}

function sum(values, key) {
	var s, i, n;

	for (s = 0, i = 0, n = values.length; i < n; ++i) {
		s += key ? +values[i][key] : +values[i];
	}

	return s;
}

var utils = {
	flatten: flatten,
	group: group,
	sort: sort,
	sum: sum
};

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

const min = Math.min;
const max = Math.max;

function getStat(sa) {
	return {
		min: sa.min,
		max: sa.max,
		sum: sa.sum,
		nmin: sa.nmin,
		nmax: sa.nmax,
		nsum: sa.nsum
	};
}

function getNewStat(sa, o) {
	var v = +o[sa.key];
	var n = v * sa.ratio;
	o._normalized = n;

	return {
		min: min(sa.min, v),
		max: max(sa.max, v),
		sum: sa.sum + v,
		nmin: min(sa.nmin, n),
		nmax: max(sa.nmax, n),
		nsum: sa.nsum + n
	};
}

function setStat(sa, stat) {
	Object.assign(sa, stat);
}

function push(sa, o, stat) {
	sa._arr.push(o);
	setStat(sa, stat);
}

class statArray {
	constructor(key, ratio) {
		var me = this;
		me.key = key;
		me.ratio = ratio;
		me.reset();
	}

	get length() {
		return this._arr.length;
	}

	reset() {
		var me = this;
		me._arr = [];
		me._hist = [];
		me.sum = 0;
		me.nsum = 0;
		me.min = Infinity;
		me.max = -Infinity;
		me.nmin = Infinity;
		me.nmax = -Infinity;
	}

	push(o) {
		push(this, o, getNewStat(this, o));
	}

	pushIf(o, fn, ...args) {
		var nstat = getNewStat(this, o);
		if (!fn(getStat(this), nstat, args)) {
			return o;
		}
		push(this, o, nstat);
	}

	get() {
		return this._arr;
	}
}

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
	var i, o;

	if (!n) {
		return rows;
	}

	values = values.slice();
	utils.sort(values, key);

	function val(idx) {
		return key ? +values[idx][key] : +values[idx];
	}
	function gval(idx) {
		return grp && values[idx][grp];
	}

	for (i = 0; i < n; ++i) {
		o = {value: val(i), groupSum: gsum};
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

var resolve = Chart.helpers.options.resolve;

function rectNotEqual(r1, r2) {
	return !r1 || !r2
		|| r1.x !== r2.x
		|| r1.y !== r2.y
		|| r1.w !== r2.w
		|| r1.h !== r2.h;
}

function buildData(dataset, mainRect) {
	var key = dataset.key || '';
	var tree = dataset.tree || [];
	var groups = dataset.groups || [];
	var glen = groups.length;
	var sp = (dataset.spacing || 0) + (dataset.borderWidth || 0);

	function recur(gidx, rect, parent, gs) {
		var g = groups[gidx];
		var pg = (gidx > 0) && groups[gidx - 1];
		var gdata = utils.group(tree, g, key, pg, parent);
		var gsq = squarify(gdata, rect, key, g, gidx, gs);
		var ret = gsq.slice();
		var subRect;
		if (gidx < glen - 1) {
			gsq.forEach(function(sq) {
				subRect = {x: sq.x + sp, y: sq.y + sp, w: sq.w - 2 * sp, h: sq.h - 2 * sp};
				if (sq.h > 25) {
					subRect.y += 15;
					subRect.h -= 15;
				}
				ret.push.apply(ret, recur(gidx + 1, subRect, sq.g, sq.s));
			});
		}
		return ret;
	}

	if (!tree.length && dataset.data.length) {
		tree = dataset.tree = dataset.data;
	}

	return glen
		? recur(0, mainRect)
		: squarify(tree, mainRect, key);
}

var Controller = Chart.DatasetController.extend({

	dataElementType: Chart.elements.Rectangle,

	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var dataset = me.getDataset();
		var data = meta.data || [];
		var area = me.chart.chartArea;
		var i, ilen, mainRect;

		mainRect = {x: area.left, y: area.top, w: area.right - area.left, h: area.bottom - area.top};

		if (reset || rectNotEqual(me._rect, mainRect)) {
			me._rect = mainRect;
			dataset.data = buildData(dataset, mainRect);
			me.resyncElements();
		}

		for (i = 0, ilen = data.length; i < ilen; ++i) {
			me.updateElement(data[i], i, reset);
		}
	},

	updateElement: function(item, index, reset) {
		var me = this;
		var datasetIndex = me.index;
		var dataset = me.getDataset();
		var sq = dataset.data[index];
		var options = me._resolveElementOptions(item, index);
		var h = reset ? 0 : sq.h - options.spacing * 2;
		var w = reset ? 0 : sq.w - options.spacing * 2;
		var x = sq.x + w / 2 + options.spacing;
		var y = sq.y + h / 2 + options.spacing;
		var halfH = h / 2;

		item._options = options;
		item._datasetIndex = datasetIndex;
		item._index = index;
		item.hidden = h <= options.spacing || w <= options.spacing;

		item._model = {
			x: x,
			base: y - halfH,
			y: y + halfH,
			top: sq.y,
			left: sq.x,
			width: w,
			height: h,
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderSkipped: options.borderSkipped,
			borderWidth: options.borderWidth
		};

		item.pivot();
	},

	draw: function() {
		var me = this;
		var metadata = me.getMeta().data || [];
		var dataset = me.getDataset();
		var levels = (dataset.groups || []).length - 1;
		var data = dataset.data || [];
		var ctx = me.chart.ctx;
		var i, ilen, rect, item, vm;

		for (i = 0, ilen = metadata.length; i < ilen; ++i) {
			rect = metadata[i];
			vm = rect._view;
			item = data[i];
			if (!rect.hidden) {
				rect.draw();
				if (vm.height > 25 && item.g) {
					ctx.save();
					ctx.fillStyle = '#000';
					ctx.font = '12px serif';
					ctx.beginPath();
					ctx.rect(vm.left, vm.top, vm.width, vm.height);
					ctx.clip();
					if (!('l' in item) || item.l === levels) {
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText(item.g, vm.left + vm.width / 2, vm.top + vm.height / 2);
					} else {
						ctx.textAlign = 'start';
						ctx.textBaseline = 'top';
						ctx.fillText(item.g, vm.left + vm.borderWidth + 3, vm.top + vm.borderWidth + 3);
					}
					ctx.restore();
				}
			}
		}
	},

	/**
	 * @private
	 */
	_resolveElementOptions: function(rectangle, index) {
		var me = this;
		var chart = me.chart;
		var dataset = me.getDataset();
		var options = chart.options.elements.rectangle;
		var values = {};
		var i, ilen, key;

		// Scriptable options
		var context = {
			chart: chart,
			dataIndex: index,
			dataset: dataset,
			datasetIndex: me.index
		};

		var keys = [
			'backgroundColor',
			'borderColor',
			'borderSkipped',
			'borderWidth',
			'spacing'
		];

		for (i = 0, ilen = keys.length; i < ilen; ++i) {
			key = keys[i];
			values[key] = resolve([
				dataset[key],
				options[key]
			], context, index);
		}

		return values;
	}

});

var defaults = {
	hover: {
		mode: 'nearest',
		intersect: true
	},
	tooltips: {
		mode: 'nearest',
		position: 'treemap',
		intersect: true
	},
	scales: {
		xAxes: [{
			type: 'linear',
			display: false
		}],
		yAxes: [{
			type: 'linear',
			display: false
		}]
	},
	elements: {
		rectangle: {
			borderSkipped: false,
			borderWidth: 0,
			spacing: 0.5
		}
	}
};

Chart.controllers.treemap = Controller;
Chart.defaults.treemap = defaults;

Chart.Tooltip.positioners.treemap = function(elements) {
	if (!elements.length) {
		return false;
	}

	var vm = elements[0]._view;

	return {
		x: vm.x,
		y: vm.y - vm.height / 2
	};
};

}));
