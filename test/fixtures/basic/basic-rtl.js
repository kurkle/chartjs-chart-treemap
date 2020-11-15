export default {
	config: {
		type: 'treemap',
		data: {
			datasets: [{
				label: 'Simple treemap',
				data: [6, 6, 4, 3, 2, 2, 1],
				backgroundColor: 'red',
				rtl: true
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
