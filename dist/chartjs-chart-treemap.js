/*!
 * chartjs-chart-treemap v0.1.0
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

function swap(arr, i1, i2) {
	let tmp = arr[i1];
	arr[i1] = arr[i2];
	arr[i2] = tmp;
}

function part(arr, pivot, left, right) {
	var value = arr[pivot];
	var start = left;

	for (; left < right; left++) {
		if (arr[left] < value) {
			swap(arr, left, start);
			start++;
		}
	}
	swap(arr, right, start);
	return start;
}

function rpart(arr, pivot, left, right) {
	var value = arr[pivot];
	var start = left;

	for (; left < right; left++) {
		if (arr[left] > value) {
			swap(arr, left, start);
			start++;
		}
	}
	swap(arr, start, right);
	return start;
}


function qsort(arr, left, right) {
	var index;
	left = left === undefined ? 0 : left;
	right = right === undefined ? arr.length - 1 : right;

	if (left < right) {
		index = part(arr, right, left, right);

		qsort(arr, left, index - 1);
		qsort(arr, index + 1, right);
	}
}

function qrsort(arr, left, right) {
	var index;
	left = left === undefined ? 0 : left;
	right = right === undefined ? arr.length - 1 : right;

	if (left < right) {
		index = rpart(arr, right, left, right);

		qrsort(arr, left, index - 1);
		qrsort(arr, index + 1, right);
	}
}

function sum(values) {
	var s = 0;
	var i, n;

	for (i = 0, n = values.length; i < n; ++i) {
		s += values[i];
	}

	return s;
}

var utils = {
	qsort: qsort,
	qrsort: qrsort,
	sum: sum
};

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
	return flatten(rows);
}

var resolve = Chart.helpers.options.resolve;

var Controller = Chart.DatasetController.extend({

	dataElementType: Chart.elements.Rectangle,

	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var dataset = me.getDataset();
		var data = meta.data || [];
		var i, ilen;

		me._sqdata = squarify(dataset.data, me.chart.chartArea);

		for (i = 0, ilen = data.length; i < ilen; ++i) {
			me.updateElement(data[i], i, reset);
		}
	},

	updateElement: function(item, index, reset) {
		var me = this;
		var datasetIndex = me.index;
		var sq = me._sqdata[index];
		var options = me._resolveElementOptions(item, index);
		var area = me.chart.chartArea;
		var x = sq.x + area.left + sq.w / 2;
		var y = area.top + sq.y + sq.h / 2;
		var h = reset ? 0 : sq.h - options.borderWidth * 2;
		var w = reset ? 0 : sq.w - options.borderWidth * 2;
		var halfH = h / 2;

		item._options = options;
		item._datasetIndex = datasetIndex;
		item._index = index;

		item._model = {
			x: x,
			base: y - halfH,
			y: y + halfH,
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
		var data = me.getMeta().data || [];
		var i, ilen;

		for (i = 0, ilen = data.length; i < ilen; ++i) {
			data[i].draw();
		}
	},

	/**
	 * @private
	 */
	_resolveElementOptions: function(rectangle, index) {
		var me = this;
		var chart = me.chart;
		var datasets = chart.data.datasets;
		var dataset = datasets[me.index];
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
			'borderWidth'
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

Chart.controllers.treemap = Controller;
Chart.defaults.treemap = {
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
			borderWidth: 0.5
		}
	}
};

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
