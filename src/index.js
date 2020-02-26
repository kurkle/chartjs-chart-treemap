'use strict';

import Chart from 'chart.js';
import controller from './controller';
import defaults from './defaults';

Chart.controllers.treemap = controller;
Chart.defaults.treemap = defaults;

Chart.Tooltip.positioners.treemap = function(elements) {
	if (!elements.length) {
		return false;
	}

	var vm = elements[elements.length - 1]._view;

	return {
		x: vm.x,
		y: vm.y - vm.height / 2
	};
};
