/* eslint-disable no-console */

const Suite = require('benchmark').Suite;
const utils = require('../src/utils');

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

var suite = new Suite();

suite
	.add('native', function() {
		arr.slice().sort(function(a, b) {
			return a - b;
		});
	})
	.add('native-sorted', function() {
		sorted.slice().sort(function(a, b) {
			return a - b;
		});
	})
	.add('native-reverse-sorted', function() {
		rsorted.slice().sort(function(a, b) {
			return a - b;
		});
	})
	.add('qsort', function() {
		utils.qsort(arr.slice(), 0, 999999);
	})
	.add('qsort - sorted', function() {
		utils.qsort(sorted.slice(), 0, 999999);
	})
	.add('qsort', function() {
		utils.qsort(rsorted.slice(), 0, 999999);
	})
	.on('cycle', function(event) {
		console.log(String(event.target));
	})
	.on('complete', function() {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run();
