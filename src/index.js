'use strict';

import Chart from 'chart.js';
import controller from './controller';

Chart.controllers.treemap = controller;
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
