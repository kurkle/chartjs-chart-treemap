'use strict';

(function(Utils) {
	const localUrl = '../dist/chartjs-chart-treemap.js';
	const remoteUrl = 'https://cdn.jsdelivr.net/npm/chartjs-chart-treemap/dist/chartjs-chart-treemap.js';

	function addScript(url, done, error) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.onreadystatechange = function() {
			if (this.readyState === 'complete') {
				done();
			}
		};
		script.onload = done;
		script.onerror = error;
		script.src = url;
		head.appendChild(script);
		return true;
	}

	function loadError() {
		const msg = document.createTextNode('Error loading chartjs-chart-treemap');
		document.body.appendChild(msg);
		return true;
	}

	Utils.load = function(done) {
		addScript(localUrl, done, (event) => {
			event.preventDefault();
			event.stopPropagation();
			addScript(remoteUrl, done, loadError);
		});
	};
}(window.Utils = window.Utils || {}));
