const istanbul = require('rollup-plugin-istanbul')

const env = process.env.NODE_ENV

module.exports = async (karma) => {
  const builds = (await import('./rollup.config.js')).default

  const build = builds[0]
  const buildPlugins = [...build.plugins]

  if (env === 'test') {
    build.plugins.push(istanbul({ exclude: ['node_modules/**/*.js', 'package.json'] }))
  }

  karma.set({
    browsers: ['chrome', 'firefox'],

    customLaunchers: {
      chrome: {
        base: 'Chrome',
        flags: [
          '--disable-accelerated-2d-canvas',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
      },
      firefox: {
        base: 'Firefox',
        prefs: {
          'gfx.canvas.accelerated': false,
          'layers.acceleration.disabled': true,
        },
      },
    },

    customPreprocessors: {
      fixtures: {
        base: 'rollup',
        options: {
          output: {
            dir: './build/karma/fixtures',
            format: 'iife',
            globals,
            name: 'fixture',
          },
        },
      },
      sources: {
        base: 'rollup',
        options: build,
      },
    },

    files: [
      { included: false, pattern: './test/fixtures/**/*.js' },
      { included: false, pattern: './test/fixtures/**/*.png' },
      'node_modules/chart.js/dist/chart.umd.js',
      { pattern: 'test/index.js', watched: false },
      { pattern: 'src/index.ts', type: 'js', watched: false },
      { pattern: 'test/specs/**/*.js', watched: false },
    ],
    frameworks: ['jasmine'],
    logLevel: karma.autoWatch ? karma.LOG_INFO : karma.LOG_WARN,

    preprocessors: {
      'src/index.ts': ['sources'],
      'test/fixtures/**/*.js': ['fixtures'],
      'test/index.js': ['rollup'],
      'test/specs/**/*.js': ['rollup'],
    },
    reporters: ['spec', 'kjhtml'],

    rollupPreprocessor: {
      external: ['chart.js'],
      output: {
        dir: './build/karma/tests',
        format: 'umd',
        globals: {
          'chart.js': 'Chart',
        },
        name: 'test',
        sourcemap: karma.autoWatch ? 'inline' : false,
      },
      plugins: buildPlugins,
    },
  })

  if (env === 'test') {
    karma.reporters.push('coverage')
    karma.coverageReporter = {
      dir: 'coverage/',
      reporters: [
        { subdir: 'html', type: 'html' },
        { subdir: (browser) => browser.toLowerCase().split(/[ /-]/)[0], type: 'lcovonly' },
      ],
    }
  }
}

const globals = {
  'chart.js': 'Chart',
  'chart.js/helpers': 'Chart.helpers',
}
