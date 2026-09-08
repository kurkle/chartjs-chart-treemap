/**
 * Issue #182: bundling this package with Webpack 5 failed because Chart.js 3
 * did not expose `chart.js/helpers` in a way Webpack's resolver accepts. Every
 * reporter who moved to Chart.js 4 was fixed. This build asserts that, rather
 * than assuming it: Webpack has its own resolver, so neither the Node nor the
 * Vite integration tests cover the case.
 */

import webpack from 'webpack'

import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outputPath = mkdtempSync(join(tmpdir(), 'treemap-webpack-'))

const stats = await new Promise((resolve, reject) => {
  webpack(
    {
      entry: join(here, 'entry.js'),
      mode: 'production',
      output: { filename: 'bundle.js', path: outputPath },
      target: 'web',
    },
    (err, result) => (err ? reject(err) : resolve(result))
  )
})

const info = stats.toJson({ errors: true, modules: true, warnings: true })
rmSync(outputPath, { force: true, recursive: true })

assert.deepEqual(
  info.errors.map((e) => e.message),
  [],
  'Webpack reported build errors'
)
assert.deepEqual(
  info.warnings.map((w) => w.message),
  [],
  'Webpack reported build warnings'
)

const modules = info.modules.map((m) => m.name || m.identifier || '')
assert.ok(
  modules.some((name) => /chart\.js[\\/]dist[\\/]helpers/.test(name)),
  `Webpack did not resolve chart.js/helpers into the bundle. Modules:\n${modules.join('\n')}`
)
assert.ok(
  modules.some((name) => /chartjs-chart-treemap\.esm\.js$/.test(name)),
  `Webpack did not resolve this package into the bundle. Modules:\n${modules.join('\n')}`
)

console.log(`webpack ${webpack.version}: bundled ${info.modules.length} modules, no errors`)
