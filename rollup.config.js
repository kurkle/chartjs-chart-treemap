import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import {readFileSync} from 'fs';

const {author, name, module, jsdelivr, version, homepage, main, license} = JSON.parse(readFileSync('./package.json'));

const banner = `/*!
 * ${name} v${version}
 * ${homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} ${author}
 * Released under the ${license} license
 */`;

const input = 'src/index.js';
const inputESM = 'src/index.esm.js';
const external = [
  'chart.js',
  'chart.js/helpers'
];
const globals = {
  'chart.js': 'Chart',
  'chart.js/helpers': 'Chart.helpers'
};

export default [
  {
    input: inputESM,
    output: {
      file: module,
      banner,
      format: 'esm',
      indent: false
    },
    plugins: [
      resolve(),
      json(),
    ],
    external
  },
  {
    input,
    output: {
      name,
      banner,
      file: main,
      format: 'umd',
      indent: false,
      globals
    },
    plugins: [
      json()
    ],
    external
  },
  {
    input,
    output: {
      name: name,
      file: jsdelivr,
      format: 'umd',
      indent: false,
      sourcemap: true,
      globals
    },
    plugins: [
      resolve(),
      json(),
      terser({
        output: {
          preamble: banner
        }
      }),
    ],
    external
  },
];
