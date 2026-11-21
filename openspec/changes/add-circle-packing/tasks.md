## 1. P1 — Controller seams (`refactor:`)

- [ ] 1.1 Write `test/specs/controllerSeams.spec.js`: a test-only subclass overriding `_layoutNodes` and `_resetProperties` sees each override used on first render, on update and for added elements (fails: the methods do not exist)
- [ ] 1.2 Move the `layoutNodes` call in `update()` into `_layoutNodes(nodes, rect, options)`
- [ ] 1.3 Move `width = height = 0` in `updateElements` into `_resetProperties(properties)`
- [ ] 1.4 Run the fixture suite in both browsers; every existing baseline passes unchanged

## 2. P2 — Text engine seams (`refactor:`)

- [ ] 2.1 Add a type-checked test: `drawText` called with options that have no `captions`, a rectangle without `radius` and a minimal element (fails to type-check)
- [ ] 2.2 Introduce `TextRect`, `TextOptions` and `TextElement` in `src/text/` and use them in `drawText` and below
- [ ] 2.3 Move the label defaults and the label/caption descriptors from `src/element.ts` to `src/options.ts` as `labelDefaults` and `textDescriptors`; use them in the treemap element and controller
- [ ] 2.4 Run `npm run typecheck`, the unit tests and the fixture suite; no runtime change

## 3. P3 — Sibling packing (`refactor:`)

- [ ] 3.1 Write `src/pack/siblings.test.ts` with a seeded generator: no pairwise overlap (n = 1, 2, 3, 50, 2000; equal radii; ratio 1e6), every circle touches another, the returned chain is a subset of the input, same input gives the same output
- [ ] 3.2 Implement `packSiblings` in `src/pack/siblings.ts` from the front-chain description; export the `Circle` type
- [ ] 3.3 Confirm no entry point imports the module and the bundles are byte-identical

## 4. P4 — Enclosing circle (`refactor:`)

- [ ] 4.1 Write `src/pack/enclose.test.ts`: encloses every input, minimal against brute force over pairs and triples for n ≤ 8, single/concentric/collinear inputs, identical on repeat calls, `Math.random` is never called
- [ ] 4.2 Implement `encloseCircles` in `src/pack/enclose.ts` with a fixed-seed shuffle

## 5. P5 — Tree packing (`refactor:`)

- [ ] 5.1 Write `src/pack/tree.test.ts`: members inside the group minus the ring, equal leaves in different groups have equal radius, zero and NaN leaves excluded and at (0, 0), single-member group concentric, node arrays not reordered
- [ ] 5.2 Implement `packTree(nodes, k, ring)` in `src/pack/tree.ts` on `packSiblings` and `encloseCircles`

## 6. P6 — Fit to the rectangle (`refactor:`)

- [ ] 6.1 Write `src/pack/layout.test.ts`: bounding box centred and touching two opposite sides, `[1]` gives diameter `min(W, H)`, `[1, 1]` follows the long axis, ring within 1 % after the fit, negative spacing with groups keeps every group at least as large as its enclosure, `s` is the sibling total of `v` and `gs` the same inside a group and undefined at the top level, `hidden` for zero radius, empty rectangle yields no NaN
- [ ] 6.2 Implement `packNodes(nodes, rect, layout)` in `src/pack/layout.ts`: unit pack, orientation choice, ring clamp at 0, ring iteration (until the scale changes by less than 0.1 %, at most four passes), final scale, translation, node geometry

## 7. P7 — Circle element and types (`refactor:`)

- [ ] 7.1 Write `src/pack/element.test.ts` with a mock context: ellipse path and even-odd border, inscribed text rectangle passed to the text engine, `inRange`, `inXRange` and `inYRange` false in the box corner and for zero or negative size, centre point, object or function `borderWidth` draws no border and the function is not called, a group draws no text even when `captions` is present
- [ ] 7.2 Add `src/pack/types.ts` with the data point and element option types
- [ ] 7.3 Implement `CirclePackElement` in `src/pack/element.ts` with its `defaults`, `descriptors` and `defaultRoutes`, using `labelDefaults` and `textDescriptors`

## 8. P8 — Controller and first fixtures (`refactor:`)

- [ ] 8.1 Add `test/fixtures/circlepack/{basic,single,fourValues,region,labels}` configs (`fourValues` is `[65, 46, 14, 11]` in a 2:1 canvas; the first two are the values visible in the issue's screenshot, the others are invented) and the `describe('circlepack', …)` line (fails: no such chart type)
- [ ] 8.2 Write `test/specs/circlepack.spec.js`: rectangle-only options leave the nodes identical, `borderWidth` from `options.datasets.circlepack` widens the group ring, a function `borderWidth` reading `ctx.raw` does not throw and gives no ring and no border (pin what `hoverBorderWidth` does), `update('none')` keeps node objects, reset starts at the centre, unregistering keeps the `treemap` tooltip positioner
- [ ] 8.3 Add `CirclePackControllerDatasetOptions` to `src/pack/types.ts` and implement `CirclePackController` in `src/pack/controller.ts`
- [ ] 8.4 Register the controller and element in `test/setup.js` only, with a comment that P10 removes it
- [ ] 8.5 Generate the baselines, inspect each image by eye, run both browsers

## 9. P9 — Fixtures for nesting and interaction (`test:`)

- [ ] 9.1 Add `test/fixtures/circlepack/{grouped,grouped3,groupedBorderSpacing,others,valueScale,hover,tooltip,zoom,zoomX,zeroValues}`
- [ ] 9.2 Generate the baselines, inspect each image by eye, run both browsers

## 10. P10 — Publish the chart type (`feat:`, closes #15)

- [ ] 10.1 Add `test/types/circlepack.ts` (`ChartData<'circlepack'>`, `rtl` as an expected error), extend `test/types/register.ts` and the four integration tests to import and use the new classes from the built package, unregistering both chart types after each test (fail: not exported)
- [ ] 10.2 Export the classes and types from `src/index.esm.ts` and `src/index.ts`; register both in the script bundle
- [ ] 10.3 Augment `ChartTypeRegistry` with `circlepack` in `src/types.ts`
- [ ] 10.4 Remove the test-only registration from `test/setup.js`
- [ ] 10.5 Write `src/content/docs/circlepack.md` (options; what is ignored; the round-cluster limitation; a group's area is not proportional to its value; `spacing` defaults to 0, not the treemap's 0.5; `borderWidth` is a number and one set only in `options.elements.circlepack` does not widen the group ring; register both pairs of classes to use both chart types; datalabels anchors other than `center` use the bounding box) and `src/content/docs/samples/circlePack.md`; add both to the sidebar in `astro.config.mjs`; register the classes in `docs/chart-runtime.js`
- [ ] 10.6 Add the chart type to `README.md`
- [ ] 10.7 Run `npm test`, `npm run typecheck`, `npm run docs`

## 11. P11 — Benchmark case (`test:`)

- [ ] 11.1 Add a circlepack case to `bench/update.mjs` (fails before: the case does not exist in `npm run test:bench`)
- [ ] 11.2 Record the 10 000-circle layout time in the pull request; if it is slow, lower the ring iteration cap first
