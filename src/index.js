import Chart from 'chart.js';
import controller from './controller';
import defaults from './defaults';

Chart.controllers.treemap = controller;
Chart.defaults.treemap = defaults;

const tooltipPlugin = Chart.plugins.getAll().find(p => p.id === 'tooltip');
tooltipPlugin.positioners.treemap = function(active) {
	if (!active.length) {
		return false;
	}

	const item = active[active.length - 1];
	const el = item.element;

	return {
		x: el.x + el.width / 2,
		y: el.y + el.height / 2
	};
};
