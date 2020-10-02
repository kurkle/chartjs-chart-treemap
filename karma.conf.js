/* eslint-disable import/no-nodejs-modules, import/no-commonjs */
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const builds = require('./rollup.config');
const parseArgs = require('minimist');
const path = require('path');

module.exports = function(karma) {
	const args = parseArgs(process.argv.slice(3));
	const build = builds[0];
	build.output.sourcemap = 'inline';

	karma.set({
		frameworks: ['jasmine'],
		reporters: ['progress', 'summary', 'kjhtml'],
		browsers: (args.browsers || 'chrome,firefox').split(','),
		logLevel: karma.autoWatch ? karma.LOG_INFO : karma.LOG_WARN,

		summaryReporter: {
			show: 'failed',
			specLength: 50,
			overviewColumn: false
		},

		client: {
			jasmine: {
				failFast: !!karma.autoWatch
			}
		},

		// Explicitly disable hardware acceleration to make image
		// diff more stable when ran on Travis and dev machine.
		// https://github.com/chartjs/Chart.js/pull/5629
		customLaunchers: {
			chrome: {
				base: 'Chrome',
				flags: [
					'--disable-accelerated-2d-canvas'
				]
			},
			firefox: {
				base: 'Firefox',
				prefs: {
					'layers.acceleration.disabled': true
				}
			}
		},

		files: [
			{pattern: './test/fixtures/**/*.js', included: false},
			{pattern: './test/fixtures/**/*.png', included: false},
			'node_modules/chart.js/dist/Chart.js',
			{pattern: 'test/index.js', watched: false},
			{pattern: 'src/index.js', watched: false},
			{pattern: 'test/specs/**/*.js', watched: false}
		],

		preprocessors: {
			'test/fixtures/**/*.js': ['fixtures'],
			'test/specs/**/*.js': ['rollup'],
			'test/index.js': ['rollup'],
			'src/index.js': ['sources', 'karma-coverage-istanbul-instrumenter']
		},

		rollupPreprocessor: {
			plugins: [
				resolve({dedupe: ['chart.js']}),
				commonjs()
			],
			output: {
				name: 'test',
				format: 'umd',
				globals: {
					'chart.js': 'Chart',
					'chart.js/helpers': 'Chart.helpers'
				},
				sourcemap: false
			},
			external: [
				'chart.js'
			],
		},

		customPreprocessors: {
			fixtures: {
				base: 'rollup',
				options: {
					output: {
						format: 'iife',
						name: 'fixture',
						globals: {
							'chart.js': 'Chart',
							'chart.js/helpers': 'Chart.helpers'
						},
					}
				}
			},
			sources: {
				base: 'rollup',
				options: build
			}
		},
	});

	if (args.coverage) {
		karma.reporters.push('coverage-istanbul');
		karma.coverageIstanbulReporter = {
			reports: ['html', 'lcovonly'],
			dir: path.join(__dirname, 'coverage'),
		};
	}
};
