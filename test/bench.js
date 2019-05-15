/* eslint-disable no-console */

const Suite = require('benchmark').Suite;
const utils = require('../build/utils');

var length = 1000000;
var arr = [];
for (let i = length; i > 0; i--) {
	arr.push(parseInt(Math.random() * 1000000000, 10));
}

var sorted = arr.slice().sort(function(a, b) {
	return a - b;
});

var rsorted = arr.slice().sort(function(a, b) {
	return b - a;
});

var suites = [];

suites.push(
	new Suite()
		.add('native', function() {
			arr.slice().sort(function(a, b) {
				return a - b;
			});
		})
		.add('qsort', function() {
			utils.qsort(arr.slice());
		})
);

suites.push(
	new Suite()
		.add('native - sorted', function() {
			sorted.slice().sort(function(a, b) {
				return a - b;
			});
		})
		.add('qsort - sorted', function() {
			utils.qsort(sorted.slice());
		})
);

suites.push(
	new Suite()
		.add('native - reverse-sorted', function() {
			rsorted.slice().sort(function(a, b) {
				return a - b;
			});
		})
		.add('qsort - reverse-sorted', function() {
			utils.qsort(rsorted.slice());
		})
);

suites.forEach(function(suite) {
	suite
		.on('cycle', function(event) {
			console.log(String(event.target));
		})
		.on('error', function(event) {
			console.log(event);
		})
		.on('complete', function() {
			console.log('Fastest is ' + this.filter('fastest').map('name'));
		})
		.run();
});