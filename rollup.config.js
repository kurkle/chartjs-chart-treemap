/* eslint-disable import/no-commonjs */

const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} license
 */`;

module.exports = [
	{
		input: 'src/index.js',
		output: {
			file: `dist/${pkg.name}.js`,
			banner,
			format: 'umd',
			indent: false,
			globals: {
				'chart.js': 'Chart',
				'chart.js/helpers': 'Chart.helpers'
			},
		},
		plugins: [
			resolve()
		],
		external: [
			'chart.js',
			'chart.js/helpers'
		]
	},
	{
		input: 'src/index.js',
		output: {
			file: `dist/${pkg.name}.min.js`,
			format: 'umd',
			indent: false,
			globals: {
				'chart.js': 'Chart',
				'chart.js/helpers': 'Chart.helpers'
			},
		},
		plugins: [
			resolve(),
			terser({
				output: {
					preamble: banner
				}
			}),
		],
		external: [
			'chart.js',
			'chart.js/helpers'
		]
	},
	{
		input: 'src/index.esm.js',
		output: {
			file: `dist/${pkg.name}.esm.js`,
			banner,
			format: 'esm',
			indent: false,
			globals: {
			}
		},
		external: (e) => e.startsWith('chart.js')
	},
];
