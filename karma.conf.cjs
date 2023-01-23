const istanbul = require('rollup-plugin-istanbul');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const json = require('@rollup/plugin-json');
const env = process.env.NODE_ENV;

module.exports = async function(karma) {
  const builds = (await import('./rollup.config.js')).default;
  const regex = karma.autoWatch ? /chartjs-chart-treemap\.js$/ : /chartjs-chart-treemap\.min\.js$/;
  const build = builds.filter(v => v.output.file && v.output.file.match(regex))[0];

  if (env === 'test') {
    build.plugins = [
      resolve(),
      json(),
      istanbul({exclude: ['node_modules/**/*.js', 'package.json']})
    ];
  }

  karma.set({
    browsers: ['chrome', 'firefox'],
    frameworks: ['jasmine'],
    reporters: ['progress', 'summary', 'kjhtml'],
    logLevel: karma.autoWatch ? karma.LOG_INFO : karma.LOG_WARN,

    summaryReporter: {
      show: 'failed',
      specLength: 50,
      overviewColumn: false
    },

    client: {
      clearContext: false,
      jasmine: {
        stopOnSpecFailure: false,
        timeoutInterval: 1000
      }
    },

    // Explicitly disable hardware acceleration to make image
    // diff more stable when ran on Travis and dev machine.
    // https://github.com/chartjs/Chart.js/pull/5629
    customLaunchers: {
      chrome: {
        base: 'Chrome',
        flags: [
          '--disable-accelerated-2d-canvas',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
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
      'node_modules/chart.js/dist/chart.umd.js',
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
        json(),
      ],
      output: {
        name: 'test',
        format: 'umd',
        sourcemap: karma.autoWatch ? 'inline' : false
      },
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

  if (env === 'test') {
    karma.reporters.push('coverage');
    karma.coverageReporter = {
      dir: 'coverage/',
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: (browser) => browser.toLowerCase().split(/[ /-]/)[0]}
      ]
    };
  }
};
