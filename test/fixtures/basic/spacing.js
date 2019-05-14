export default {
	config: {
		type: 'treemap',
		data: {
			datasets: [{
				label: 'spacing',
				data: [4, 3, 2, 1],
				backgroundColor: 'green',
				spacing: 10
			}]
		},
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};
