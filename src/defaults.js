
export default {
	hover: {
		mode: 'point',
		intersect: true
	},
	tooltips: {
		mode: 'point',
		position: 'treemap',
		intersect: true,
		callbacks: {
			title(item, data) {
				return data.datasets[item[0].datasetIndex].key;
			},
			label(item, data) {
				const dataset = data.datasets[item.datasetIndex];
				const dataItem = dataset.data[item.index];
				return dataset.label + ': ' + dataItem.v;
			}
		}
	},
	datasets: {
		groupLabels: true,
		borderWidth: 0,
		spacing: 0.5,
		groupDividers: false,
		dividerCapStyle: 'butt',
		dividerColor: 'black',
		dividerDash: [],
		dividerDashOffset: 0,
		dividerWidth: 1
	},
	scales: {
		x: {
			type: 'linear',
			display: false
		},
		y: {
			type: 'linear',
			display: false
		}
	},
};
