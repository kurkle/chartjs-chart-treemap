## Context

Issue #15 (2020) asks for circles packed into the chart area with areas proportional to the values, single level in the reporter's case, "clustered around either the center or an arbitrary point" and scaled "as large as they can to fit in the bounding box". The v5 release plan scoped it as a second layout and element in this package once the data pipeline had been split into a hierarchy pass and a geometry pass. That split shipped in 5.0.

What reads or decides the things this change touches (origin/main at `ce90ca0d`):

- **Layout selection.** `TreemapController.update()` calls `layoutNodes(this._nodes, this._rect, this._layoutOptions())` inline, between the dirty flags and the `_resetFrom` handling (`src/controller.ts`). `parse()` builds the tree with `buildNodes`/`flattenNodes` (`src/layout.ts`); that pass covers grouping, `valueScale` weights, `others` and sorting and needs no chart area.
- **Element type.** `dataElementType: 'treemap'` in the controller defaults; elements are created with `new this.dataElementType()`.
- **Geometry to element properties.** `scaleRect` (`src/helpers/index.ts`) maps a node's `x, y, w, h` through the two linear scales, insets every side by `spacing` pixels and hides an element smaller than twice the spacing. Layout space equals chart-area pixels when unzoomed.
- **Reset.** `updateElements` sets `width = height = 0` on reset, so rectangles grow from their top-left corner.
- **Region.** `_regionBounds` yields the dataset rectangle; `rtl` and `unsorted` ride on it.
- **Hit testing and tooltip.** `TreemapElement.inRange/inXRange/inYRange/getCenterPoint/tooltipPosition` and `src/geometry.ts`. The `treemap` tooltip positioner only calls `element.tooltipPosition()` of the last active element, so it is shape-agnostic. The controller's `afterUnregister` deletes it.
- **Text.** `drawText(ctx, rect, options, item, element, layout)` in `src/text/index.ts` takes a rectangle, but its parameter types are tied to `TreemapOptions` (which requires `captions`) and the treemap element. Room for a group caption is reserved by `getSubRect` in the rectangle layout; nothing equivalent exists for a circle.
- **Animation.** The controller animates the `numbers` properties `x, y, width, height`.
- **Types.** `src/types.ts` augments `ChartTypeRegistry.treemap`; every scriptable option type names `TreemapScriptableContext`.
- **Exports and registration.** `src/index.ts` (script bundle, registers on load) and `src/index.esm.ts`. `test/setup.js` imports `src/index`, which is how fixtures get their chart types. `bench/update.mjs`, `docs/chart-runtime.js`, the integration tests and `test/types/register.ts` import the classes from `dist`.
- **Fixtures.** `test/specs/fixtures.spec.js` has one `describe` line per fixture directory.
- **Chart.js registry.** Registering a class whose prototype is a registered component registers the parent first and merges the parent's defaults into the child's scope (`chart.js` 4.x, `TypedRegistry.register`); `overrides` and `descriptors` are inherited as statics. A controller subclass therefore gets the treemap's scales, interaction and tooltip settings.

Where the release plan's scoping no longer fits the code: the layout cannot be "selected in `update()`" without copying the dirty-flag logic; spacing is a pixel inset applied per element after zoom, not something to bake into the packing; nothing reserves room for group captions; and the issue contains no data list, only a screenshot with the values 65 and 46 visible.

## Goals / Non-Goals

**Goals**

- A `circlepack` chart type whose circles have areas proportional to value, do not overlap, and form one cluster centred in and fitted to the dataset's area.
- Nested groups as enclosing circles.
- Everything the treemap already does with data (grouping, `sumKeys`, `valueScale`, `others`, `region`, live updates, tooltips, labels, zoom) works without a second implementation.
- No runtime dependency. The main branch stays releasable after every piece.

**Non-Goals**

- Filling a non-square rectangle. The cluster is roughly round; in a 2:1 area with many circles about half the area stays empty. Rectangle-aware packing has no standard algorithm and is not attempted.
- An anchor option for "an arbitrary point". `region` positions a cluster; see Open Questions.
- Group captions, text along an arc, wrapping to the chord width.
- Any change to the `treemap` chart type.

## Decisions

**D1. A controller subclass with three overridden methods.** `TreemapController` gains `_layoutNodes(nodes, rect, options)` (wrapping today's `layoutNodes` call) and `_resetProperties(properties)` (wrapping today's `width = height = 0`); `_layoutOptions()` exists. `CirclePackController extends TreemapController` overrides those three and the statics. Parse, fingerprint, region, element bookkeeping, tooltip callbacks and `draw()` are inherited.
*Alternatives:* a `layout: 'pack'` option on `treemap` — one chart type would then carry options that are meaningless in half its modes, and the element type would have to switch at runtime. A standalone controller — copies about 300 lines of update cycle that has had several live-update fixes.

**D2. A standalone element.** `CirclePackElement extends Element`, not `TreemapElement`, so it does not inherit `borderRadius` or `captions` defaults.

**D3. Node geometry is the circle's bounding box.** A parsed node keeps the treemap's shape: `x, y, w, h` with `w === h === 2r`. Element properties stay `x, y, width, height`. One shape then flows through `scaleRect`, the scales, the animation, zoom and the datalabels plugin. No `r`, `cx`, `cy` fields; they can be added later without breaking anything.
*Alternative:* centre and radius — needs a second scaling path and a second set of animated properties.

**D4. Spacing.** Between siblings it is the existing per-element pixel inset: each circle shrinks by `spacing`, so tangent circles end up `2 × spacing` apart, exactly and independent of zoom. Between a group and its members the layout adds a ring of `spacing + borderWidth`. This is the treemap's rule. The circlepack controller reads the resolved `spacing` option; the treemap's legacy of reading the raw dataset value in the layout is not inherited.
*Alternative from the release plan:* apply spacing before the fit — the fit's scale factor would then change what `spacing: 2` means.

**D5. Fit by bounding box, in the better of two orientations.** Pack once at unit scale, take the cluster's bounding box, use it as packed or transposed (x and y swapped), whichever scales larger into the rectangle, scale and centre it. For flat data this is exact and needs no enclosing circle. With groups and a non-zero ring the ring is in pixels, so the size is not linear in the scale: repeat pack-and-rescale at most four times, then apply one final uniform scale (ring error under 0.1 % in normal cases).
*Alternative:* fit the root enclosing circle — never larger than the bounding-box fit.

**D6. Algorithms, written in-house from the published descriptions.** Sibling placement is front-chain packing (Wang, Wang, Dai, Wang 2006): circles in descending radius, each placed tangent to two neighbours on the outer chain, the chain shortened on overlap. A group's circle is the smallest circle enclosing its members' circles (Welzl's algorithm extended to circles), computed over the front chain only. No code is copied from a library.

**D7. Determinism.** The enclosing-circle step shuffles with a fixed-seed generator re-seeded on every call; no `Math.random`. Sorts are stable, ties use strict comparisons. Siblings are packed by radius descending inside the pack step; the node arrays, and so the parsed order and element indices, are not reordered. `unsorted` therefore has no meaning and is ignored: packing in data order gives visibly worse clusters.

**D8. Leaf radius from one scale; group radius derived.** Leaf radius is `k · √weight` with one `k` per dataset, so leaf areas are comparable across groups. A group's radius follows from its members and is not proportional to the group's value.

**D9. Undrawable values.** A weight that is not finite or not positive gives radius 0: the node is not packed, sits at its parent's centre and is `hidden`. The element count never depends on geometry, as in the treemap.

**D10. Text.** Leaves only. The text engine receives the square inscribed in the circle inside the border (side `(r − borderWidth) · √2`). All `labels` options work as in the treemap. Groups draw no text: the top of the inscribed square is where the members are.

**D11. Interaction and animation.** `inRange` tests the drawn ellipse; the centre is the tooltip position; the `treemap` positioner is reused. On reset a circle collapses to its own centre. The circlepack controller's `afterUnregister` does nothing, so unregistering it does not remove the positioner treemap charts use.

**D12. One-axis zoom draws ellipses.** The scales map the bounding box affinely, so tangency, containment, hit testing and the text rectangle stay consistent.
*Alternative:* keep circles of radius `min(w, h) / 2` — they drift apart and members leave their group.

**D13. Rectangle-only options are silently ignored.** `rtl`, `unsorted`, `displayMode`, `borderRadius`, `captions` are absent from the circlepack types; at runtime the controller pins them and the element never reads them. An object `borderWidth` counts as 0. No warning: sharing an options object between a treemap and a circlepack is legitimate.

**D14. Modules live in `src/pack/`**, as the text engine lives in `src/text/`: `siblings.ts`, `enclose.ts`, `tree.ts`, `layout.ts`, `element.ts`, `controller.ts`, `types.ts`. Until the publishing piece no entry point imports them, so the bundles do not change.

**D15. Groundwork is released as nothing.** Pieces P1–P9 use `refactor:` or `test:`, which cut no release under the conventionalcommits preset. P8 registers the chart type in `test/setup.js` only. P10 is the single `feat:` and the only piece that changes what the package exports.

## Risks / Trade-offs

- **The issue's screenshot fills a box; this does not.** The cluster is round. With two to four circles the bounding-box fit and orientation choice come close to the maintainer's mock; with many circles in a wide area the sides stay empty. The usage page says so.
- **Numerical edge cases in the front chain** (radius ratios of 1e6, thousands of equal circles) are where circle packing implementations fail. P3's tests cover them with seeded inputs and a pairwise overlap check.
- **Cost is not measured.** A sibling set of n is about O(n√n); groups with a ring repeat the pack up to five times. P10 adds a benchmark case; if 10 000 circles is slow the iteration count is the first thing to lower.
- **Unreleased code on main.** P3–P9 add modules that only tests reach. They are covered by unit tests and fixtures, but a long gap before P10 leaves dead weight in the source.
- **P10 is wide** (entries, types, four integration tests, docs, bench). It cannot be split without publishing an undocumented or untyped chart type.
- **Bundle size** of the script build grows for users who only want treemaps; the module build tree-shakes.

## Pieces

Sizes are estimates of changed lines without image baselines. The limit is 400.

| Piece | Type | Builds | Files | Failing test | Size | Waits on | #15 |
|---|---|---|---|---|---|---|---|
| P1 | `refactor:` | Controller seams `_layoutNodes` and `_resetProperties` | `src/controller.ts`, new `test/specs/controllerSeams.spec.js` | A test-only subclass overriding each seam sees its override used on first render, on update and for added elements. All existing fixtures unchanged. | ~90 | — | advances |
| P2 | `refactor:` | Type-only seams in the text engine: `drawText` accepts options without `captions` and a minimal element; label option types take a context type parameter | `src/text/index.ts`, `src/types.ts`, `src/text/index.test.ts`, `test/types/options.ts` | Type check of a `drawText` call with options lacking `captions`; type test instantiating the label options with another context type. | ~80 | — | advances |
| P3 | `refactor:` | Front-chain sibling packing | new `src/pack/siblings.ts`, `src/pack/siblings.test.ts` | No pairwise overlap for seeded inputs (n = 1, 2, 3, 50, 2000; equal radii; ratio 1e6); every circle touches another; same input, same output. | ~300 | — | advances |
| P4 | `refactor:` | Smallest enclosing circle of circles | new `src/pack/enclose.ts`, `src/pack/enclose.test.ts` | Encloses all inputs; minimal against brute force for n ≤ 8; single, concentric and collinear inputs; identical on repeat; does not call `Math.random`. | ~250 | P3 (`Circle` type) | advances |
| P5 | `refactor:` | Tree packing: radii and relative positions bottom-up, ring, zero handling | new `src/pack/tree.ts`, `src/pack/tree.test.ts` | Members inside the group minus the ring; equal leaves in different groups have equal radius; zero and NaN leaves excluded; single-member group concentric; node order untouched. | ~230 | P3, P4 | advances |
| P6 | `refactor:` | `packNodes`: fit, orientation, ring iteration, node geometry | new `src/pack/layout.ts`, `src/pack/layout.test.ts` | Bounding box centred in the rectangle and touching two opposite sides; `[1]` gives diameter `min(W, H)`; `[1, 1]` follows the long axis; ring within 1 % after the fit; `s`/`gs`; `hidden`; empty rectangle yields no NaN. | ~290 | P5 | advances |
| P7 | `refactor:` | `CirclePackElement` and the option types | new `src/pack/element.ts`, `src/pack/types.ts`, `src/pack/element.test.ts` | With a mock context: ellipse path and even-odd border; inscribed text rectangle; `inRange` false in the box corner and at zero radius; centre point; object `borderWidth` draws no border. | ~360 | P2 | advances |
| P8 | `refactor:` | `CirclePackController`, test-only registration, first fixtures | new `src/pack/controller.ts`; `test/setup.js`, `test/specs/fixtures.spec.js`; new `test/specs/circlepack.spec.js`; `test/fixtures/circlepack/{basic,single,issue15,region,labels}` | The fixtures cannot render without the controller. Spec: ignored options leave the nodes identical; `update('none')` keeps node objects; reset starts at the centre; unregistering keeps the treemap positioner. | ~300 | P1, P6, P7 | advances |
| P9 | `test:` | Fixtures for nesting and interaction | `test/fixtures/circlepack/{grouped,grouped3,groupedBorderSpacing,others,valueScale,hover,tooltip,zoom,zoomX,zeroValues}` | The fixtures themselves: the pixel net for the hierarchy, interaction and zoom requirements. | ~260 | P8 | advances |
| P10 | `feat:` | Publish: exports, script-bundle registration, registry type, type tests, integration checks, usage page, sample, sidebar, docs runtime, benchmark case, README line; removes the test-only registration | `src/index.ts`, `src/index.esm.ts`, `src/types.ts`, `test/setup.js`, new `test/types/circlepack.ts`, `test/types/register.ts`, `test/integration/*`, new `src/content/docs/circlepack.md`, new `src/content/docs/samples/circlePack.md`, `astro.config.mjs`, `docs/chart-runtime.js`, `bench/update.mjs`, `README.md` — **wide** | Type test `ChartData<'circlepack'>` with `rtl` as an expected error; integration tests import `CirclePackController` from the built package; the CommonJS test creates a `circlepack` chart from the self-registering bundle. | ~370 | P8, P9 | **completes** |

**Order.** P1, P2 and P3 can start at once. P4 follows P3 only for the shared `Circle` type. P7 can run beside P4–P6 once P2 is merged. P5 → P6 is serial. P8 joins P1, P6 and P7. P9 and P10 share `test/setup.js`/fixture wiring with P8 and are serial after it. P1 and P2 both touch treemap source but different files; P2 and P10 both edit `src/types.ts`, P8 and P10 both edit `test/setup.js`, which the order already covers. No piece waits on the open PR #515.

## Contracts

```ts
// P1 — src/controller.ts
class TreemapController extends DatasetController {
  _layoutOptions(): LayoutOptions // exists
  _layoutNodes(nodes: LayoutNode[], rect: any, options: LayoutOptions): void // treemap: layoutNodes(...)
  _resetProperties(properties: { x: number; y: number; width: number; height: number }): void // treemap: width = height = 0
}

// P2 — src/text/index.ts, src/types.ts
export type TextOptions = { labels: TreemapLabelsOptions; captions?: TreemapCaptionsOptions }
export type TextElement = { active: boolean; $context?: { active: boolean; raw: TreemapDataPoint } }
export function drawText(
  ctx: CanvasRenderingContext2D, rect: DrawRect, options: TextOptions,
  item: TreemapDataPoint, element: TextElement, layout: TreemapLayoutOptions
): void
export type TreemapControllerDatasetLabelsOptions<C = TreemapScriptableContext> = { /* as today, C as the context */ }

// P3 — src/pack/siblings.ts
export type Circle = { x: number; y: number; r: number }
/** Precondition: every r finite and > 0. Places in the given order, writes x and y
 *  (first circle at the origin), returns the front chain in chain order. */
export function packSiblings<T extends Circle>(circles: T[]): T[]

// P4 — src/pack/enclose.ts
/** Smallest circle containing every input circle. Empty input gives { x: 0, y: 0, r: 0 }. Pure. */
export function encloseCircles(circles: readonly Circle[]): Circle

// P5 — src/pack/tree.ts
export type Packed = Circle & { node: LayoutNode; children: Packed[] } // x, y relative to the parent's centre
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }
/** Leaf r = k * sqrt(weight); weight is the node's layout weight, else v; not finite or <= 0 gives 0.
 *  Group r = enclose(children).r + ring, or 0 when no child has r > 0.
 *  Siblings are packed by r descending (stable); input arrays are not reordered.
 *  Items with r === 0 are returned at (0, 0) and not packed. */
export function packTree(nodes: LayoutNode[], k: number, ring: number): { items: Packed[]; bounds: Bounds }

// P6 — src/pack/layout.ts
export type PackRect = { x: number; y: number; w: number; h: number }
/** Writes x, y, w, h (bounding box, w === h), s, gs and hidden on every node, descendants included.
 *  ring = layout.spacing + (typeof layout.borderWidth === 'number' ? layout.borderWidth : 0). */
export function packNodes(nodes: LayoutNode[], rect: PackRect, layout: LayoutOptions): void

// P7 — src/pack/types.ts, src/pack/element.ts
export type CirclePackDataPoint = TreemapDataPoint
export interface CirclePackOptions {
  backgroundColor: Color; borderColor: Color; borderWidth: number; labels: TreemapLabelsOptions
}
export interface CirclePackControllerDatasetOptions<DType> { /* data, key, groups, sumKeys, leafKey, valueScale,
  others, region, label, spacing, backgroundColor, borderColor, borderWidth: number, hover*, labels */ }
export default class CirclePackElement extends Element<TreemapConfig, CirclePackOptions> {
  static readonly id = 'circlepack'
  draw(ctx: CanvasRenderingContext2D, data?: CirclePackDataPoint, layout?: TreemapLayoutOptions): void
  inRange(x: number, y: number, useFinalPosition?: boolean): boolean
  inXRange(x: number, useFinalPosition?: boolean): boolean
  inYRange(y: number, useFinalPosition?: boolean): boolean
  getCenterPoint(useFinalPosition?: boolean): { x: number; y: number }
  tooltipPosition(): { x: number; y: number }
}

// P8 — src/pack/controller.ts
export default class CirclePackController extends TreemapController {} // id 'circlepack'
// defaults: { dataElementType: 'circlepack', spacing: 0 }; afterUnregister does nothing
// _layoutNodes -> packNodes; _resetProperties -> collapse to the centre;
// _layoutOptions -> { ...super, captions: { display: false }, displayMode: 'containerBoxes',
//                     spacing: this.options.spacing, unsorted: false }

// P10 — src/types.ts
declare module 'chart.js' {
  interface ChartTypeRegistry {
    circlepack: {
      chartOptions: CoreChartOptions<'circlepack'>
      datasetOptions: CirclePackControllerDatasetOptions<Record<string, unknown>>
      defaultDataPoint: number | AnyObject
      metaExtensions: AnyObject
      parsedDataType: CirclePackDataPoint
      scales: never
    }
  }
}
```

Rules that cross pieces:

- Node geometry is the bounding box (P6 → P7, P8).
- Gaps between siblings come only from the element inset; the layout adds only the group ring (P6 ↔ P8).
- A node with `w === 0` is `hidden` and never hit (P6 → P7).
- The flattened order puts parents before their members, so groups are drawn under them (existing; P8 relies on it).
- `CirclePackScriptableContext` is `ScriptableContext<'circlepack'> & { raw }` only from P10, when the registry entry exists; P7 uses a local context type with the same fields.

## Open Questions

Each is a product choice; the recommendation is what the pieces above assume.

| # | Question | Piece | Options | Recommendation |
|---|---|---|---|---|
| Q1 | Chart type id and class names | P7, P8, P10 | `circlepack` / `CirclePackController` / `CirclePackElement`; `circlePack`; `packedCircle` | `circlepack`: the name the release plan used, lower case like `treemap`. |
| Q2 | This package or a new one (the 2021 comment on the issue said "its own package") | all | here; a new package depending on this one; a standalone package | Here: nearly everything but the layout and the element is reused, and a second package would turn internal modules into public API. |
| Q3 | Nested groups in the first release | P4, P5, P9 | flat and nested; flat only | Flat and nested: the hierarchy pass already produces the tree; nesting costs P4 and P5. The issue itself only needs flat. |
| Q4 | Group captions | P7, P10 | none; reserve a caption-height ring around every group | None: groups are identified by colour and tooltip. |
| Q5 | Default `spacing` | P8 | 0 (circles touch); 0.5 (as treemap) | 0: the reporter asks that "the circles actually touch". |
| Q6 | How hard to fill a non-square area | P6 | bounding-box fit with orientation choice; an aspect-aware placement experiment first | Bounding-box fit now; aspect-aware placement as a separately budgeted follow-up with no promise. |
| Q7 | "An arbitrary point" from the issue | P6, P10 | `region` only; an `anchor` option | `region` only: an off-centre anchor only shrinks the circles. |
| Q8 | The script bundle registers `circlepack` on load | P10 | yes; no, module build only | Yes: the script build has always been complete on its own. Costs an estimated 2–3 kB minified. |
