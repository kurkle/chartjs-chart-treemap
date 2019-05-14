'use strict';

import Chart from 'chart.js';
import squarify from './squarify.js';

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

export default Controller;
