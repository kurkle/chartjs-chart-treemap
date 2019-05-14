
export default {
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
