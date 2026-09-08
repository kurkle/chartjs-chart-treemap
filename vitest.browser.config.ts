import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// The same flags karma.conf.cjs used, so the canvas is rasterized by the CPU
// in both browsers and the pixel fixtures stay comparable.
const chromiumArgs = [
  '--disable-accelerated-2d-canvas',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
]

const firefoxPrefs = {
  'gfx.canvas.accelerated': false,
  'layers.acceleration.disabled': true,
}

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [
        { browser: 'chromium', launch: { args: chromiumArgs } },
        { browser: 'firefox', launch: { firefoxUserPrefs: firefoxPrefs } },
      ],
      provider: playwright(),
      screenshotFailures: false,
    },
    // Istanbul, not v8: v8 coverage is collected over the Chrome DevTools
    // Protocol and Vitest refuses it as soon as a non-Chromium instance is
    // configured. Instrumenting the source instead keeps both browsers in one
    // run and merges their results, as rollup-plugin-istanbul did under Karma.
    coverage: {
      exclude: ['**/*.test.ts', 'src/content.config.ts'],
      include: ['src/**/*.ts'],
      provider: 'istanbul',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'coverage/browser',
    },
    globals: true,
    include: ['test/specs/**/*.spec.js'],
    setupFiles: ['test/setup.js'],
  },
})
