/* eslint-disable import/no-commonjs */
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const builds = require('./rollup.config');
const parseArgs = require('minimist');

module.exports = function(karma) {
	const args = parseArgs(process.argv.slice(3));
	const regex = karma.autoWatch ? /treemap\.js$/ : /treemap\.min\.js$/;
	const build = builds.filter((v) => v && v.output.file.match(regex))[0];

	if (karma.autoWatch) {
		build.output.sourcemap = 'inline';
	}

	karma.set({
		frameworks: ['jasmine'],
		reporters: ['spec', 'kjhtml'],
		browsers: (args.browsers || 'chrome,firefox').split(','),
		logLevel: karma.LOG_INFO,

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
			'node_modules/chart.js/dist/chart.js',
			{pattern: 'test/index.js', watched: false},
			{pattern: 'src/index.js', watched: false},
			{pattern: 'test/specs/**/*.js', watched: false}
		],

		preprocessors: {
			'test/fixtures/**/*.js': ['fixtures'],
			'test/specs/**/*.js': ['rollup'],
			'test/index.js': ['rollup'],
			'src/index.js': ['sources']
		},

		rollupPreprocessor: {
			plugins: [
				resolve(),
				commonjs({exclude: ['src/**', 'test/**']})
			],
			external: [
				'chart.js'
			],
			output: {
				name: 'test',
				format: 'umd',
				globals: {
					'chart.js': 'Chart'
				},
				sourcemap: karma.autoWatch ? 'inline' : false
			}
		},

		customPreprocessors: {
			fixtures: {
				base: 'rollup',
				options: {
					output: {
						format: 'iife',
						name: 'fixture'
					}
				}
			},
			sources: {
				base: 'rollup',
				options: build
			}
		},

		browserDisconnectTolerance: 3
	});

	if (args.coverage) {
		karma.reporters.push('coverage');
		karma.coverageReporter = {
			dir: 'coverage/',
			reporters: [
				{type: 'html', subdir: 'html'},
				{type: 'lcovonly', subdir: '.'}
			]
		};
	}
};
