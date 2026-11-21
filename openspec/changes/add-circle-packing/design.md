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

- Filling a non-square rectangle completely. Without P12 the cluster is roughly round and in a 2:1 area with many circles about half the area stays empty; P12 tries to shape the cluster like the area (D18). Corners stay empty either way.
- An anchor option for "an arbitrary point". `region` positions a cluster (D17).
- Group captions, text along an arc, wrapping to the chord width.
- Any change to the `treemap` chart type.

## Decisions

**D1. A controller subclass with three overridden methods.** `TreemapController` gains `_layoutNodes(nodes, rect, options)` (wrapping today's `layoutNodes` call) and `_resetProperties(properties)` (wrapping today's `width = height = 0`); `_layoutOptions()` exists. `CirclePackController extends TreemapController` overrides those three and the statics. Parse, fingerprint, region, element bookkeeping, tooltip callbacks and `draw()` are inherited.
*Alternatives:* a `layout: 'pack'` option on `treemap` — one chart type would then carry options that are meaningless in half its modes, and the element type would have to switch at runtime. A standalone controller — copies about 300 lines of update cycle that has had several live-update fixes.

**D2. A standalone element.** `CirclePackElement extends Element`, not `TreemapElement`, so it does not inherit `borderRadius` or `captions` defaults.

**D3. Node geometry is the circle's bounding box.** A parsed node keeps the treemap's shape: `x, y, w, h` with `w === h === 2r`. `s` is the sum of `v` over the node's sibling set and `gs` is the same total for a node inside a group (undefined at the top level), so `v / gs` is a node's share of its group, which is what the hierarchy colours sample documents. Both use the raw `v`, not the scaled weight. Element properties stay `x, y, width, height`. One shape then flows through `scaleRect`, the scales, the animation, zoom and the datalabels plugin. No `r`, `cx`, `cy` fields; they can be added later without breaking anything.
*Alternative:* centre and radius — needs a second scaling path and a second set of animated properties.

**D4. Spacing.** Between siblings it is the existing per-element pixel inset: each circle shrinks by `spacing`, so tangent circles end up `2 × spacing` apart, exactly and independent of zoom. Between a group and its members the layout adds a ring of `max(0, spacing + borderWidth)`. This is the treemap's rule. The circlepack controller reads the resolved `spacing` and `borderWidth` options (so `options.datasets.circlepack` works); the treemap's legacy of reading the raw dataset values in the layout is not inherited. `borderWidth` is a number and is not scriptable for circlepack: a function is not called and counts as no border, for the ring and for the drawing alike. A border set only in `options.elements.circlepack` is drawn but does not widen the ring; the usage page says so. Negative spacing makes neighbours overlap by `2 × |spacing|` and lets circles reach outside the dataset's area.
*Alternative from the release plan:* apply spacing before the fit — the fit's scale factor would then change what `spacing: 2` means.

**D5. Fit by bounding box, in the better of two orientations.** Pack once at unit scale, take the cluster's bounding box, use it as packed or transposed (x and y swapped), whichever scales larger into the rectangle, scale and centre it. For flat data this is exact and needs no enclosing circle. With groups and a non-zero ring the ring is in pixels, so the size is not linear in the scale: repeat pack-and-rescale until the scale changes by less than 0.1 %, at most four times, then apply one final uniform scale. The guarantee, and the number the tests use, is a ring within 1 % of the requested width.
*Alternative:* fit the root enclosing circle — never larger than the bounding-box fit.

**D6. Algorithms, written in-house from the published descriptions.** Sibling placement is front-chain packing (Wang, Wang, Dai, Wang 2006): circles in descending radius, each placed tangent to two neighbours on the outer chain, the chain shortened on overlap. A group's circle is the smallest circle enclosing its members' circles (Welzl's algorithm extended to circles), computed over the front chain only. No code is copied from a library.

**D7. Determinism.** The enclosing-circle step shuffles with a fixed-seed generator re-seeded on every call; no `Math.random`. Sorts are stable, ties use strict comparisons. Siblings are packed by radius descending inside the pack step; the node arrays, and so the parsed order and element indices, are not reordered. `unsorted` therefore has no meaning and is ignored: packing in data order gives visibly worse clusters.

**D8. Leaf radius from one scale; group radius derived.** Leaf radius is `k · √weight` with one `k` per dataset, so leaf areas are comparable across groups. A group's radius follows from its members and is not proportional to the group's value: a group of ten leaves of 1 is drawn larger than a group of one leaf of 10. The treemap's group rectangles are proportional, so the specs and the usage page state this difference.

**D9. Undrawable values.** A weight that is not finite or not positive gives radius 0: the node is not packed, sits at its parent's centre and is `hidden`. The element count never depends on geometry, as in the treemap.

**D10. Text.** Leaves only. The text engine receives the square inscribed in the circle inside the border (side `(r − borderWidth) · √2`). All `labels` options work as in the treemap; the default `overflow: 'cut'` clips at that square minus the padding, not at the arc, and `labels.display` defaults to `false` as in the treemap. Groups draw no text: the top of the inscribed square is where the members are. The element calls the text engine for leaves only and passes it the label options only, so a `captions` object a JavaScript user left on the dataset cannot draw. The label defaults and the label descriptors are shared with the treemap element from `src/options.ts`, not copied.

**D11. Interaction and animation.** `inRange` tests the drawn ellipse and, like `inXRange` and `inYRange`, is false whenever the element's width or height is not positive: a circle smaller than twice the spacing gets a negative size from the inset, Chart.js does not check `hidden` when `includeInvisible` is set, and an ellipse test with a negative radius would still hit; the centre is the tooltip position; the `treemap` positioner is reused. On reset a circle collapses to its own centre. The circlepack controller's `afterUnregister` does nothing, so unregistering it does not remove the positioner treemap charts use.

**D12. One-axis zoom draws ellipses.** The scales map the bounding box affinely, so tangency, containment, hit testing and the text rectangle stay consistent.
*Alternative:* keep circles of radius `min(w, h) / 2` — they drift apart and members leave their group.

**D13. Rectangle-only options are silently ignored.** `rtl`, `unsorted`, `displayMode`, `borderRadius`, `captions` are absent from the circlepack types; at runtime the layout and the element never read them. Only `unsorted` has to be pinned to `false`, because the shared hierarchy pass sorts on it. An object or function `borderWidth` counts as 0. No warning: sharing an options object between a treemap and a circlepack is legitimate.

**D14. Modules live in `src/pack/`**, as the text engine lives in `src/text/`: `siblings.ts`, `enclose.ts`, `tree.ts`, `layout.ts`, `element.ts`, `controller.ts`, `types.ts`. Until the publishing piece no entry point imports them, so the bundles do not change.

**D15. Groundwork is released as nothing.** Pieces P1–P9, P11 and P12 use `refactor:` or `test:`, which cut no release under the conventionalcommits preset. P8 registers the chart type in `test/setup.js` only. P10 is the single `feat:` and the only piece that changes what the package exports.

**D16. What the design review changed.** Four reviews (architecture, complexity, scope, rule-readers) were checked against the code; these were accepted:

- The ring reads the resolved `borderWidth` and is clamped at 0, and `borderWidth` is not scriptable for circlepack (D4). The first draft read the raw dataset value, so a border set through `options.datasets.circlepack` would have been painted over the members; simply reading the resolved option would have called a user's function with a dataset context during parsing.
- Zero or negative element sizes are never hit (D11), and `s`/`gs` are defined instead of left to the builder (D3).
- The element passes only the label options to the text engine, and its defaults, descriptors and default routes are part of the contract; the label defaults are shared from one place (D10, P2, P7).
- The context type parameter on the label option types was dropped: nothing would have instantiated it. The text engine instead accepts a rectangle without `radius`.
- The dataset option type moved from P7 to P8 and the benchmark case from P10 to P11, to keep both pieces clear of the size limit.
- The specs now state that a group's area is not proportional to its value, the `cut` overflow default, the overlap for negative spacing, one ring tolerance (1 %), and that registering circlepack registers the treemap controller. The fixture named after the issue became `fourValues`: the issue has no data list, and its last two values are invented.
- Kept as designed after being questioned: nested groups (about a third of the work, see Q3), the orientation choice, ellipses under one-axis zoom, and the fixed-seed shuffle. The orientation choice, the zoom behaviour and the determinism requirement go beyond what the issue asks; they are listed in the proposal as deliberate additions.

**D17. The maintainer's decisions (2026-11-21).**

- **This package**, not a new one, although a 2021 comment on the issue suggested its own package: nearly everything but the layout and the element is reused.
- **Names:** chart type `circlepack`, classes `CirclePackController` and `CirclePackElement`.
- **Nested groups are in the first release**, knowing they are about a third of the work (P4, the ring and its iteration in P5 and P6, half of P9).
- **No group captions.** Groups are identified by colour and tooltip.
- **Default `spacing` is 0**, so circles touch; the treemap's default stays 0.5.
- **No anchor option.** "Around an arbitrary point" from the issue is answered by `region`.
- **The script bundle registers `circlepack` on load**, next to `treemap`.
- **Filling a non-square area is tried before the chart type is published** (the recommendation was to publish the round cluster first). This adds piece P12, see D18.

**D18. Aspect-aware placement, as an experiment with an exit (P12).** Front-chain packing chooses where the next circle goes by the smallest distance from the cluster's centre, which makes the cluster round. P12 measures that distance with the horizontal axis compressed by the area's aspect ratio (width over height, the long side taken as horizontal; the orientation choice of D5 turns the result for a tall area), so the cluster grows as an ellipse shaped like the area. Tangency and the overlap rule are untouched, so circles still touch and never overlap. It applies to the top-level sibling set only: a group is a circle, so its members stay a round cluster.
This is unproven: there is no standard algorithm for value-proportional circles in a rectangle, and nothing here has been run. P12 therefore carries its own acceptance test and an exit. Accepted when, for seeded sets of 10, 50 and 200 circles in 2:1 and 3:1 areas, the share of the area covered by circles is at least 15 % higher (relative) than with the round cluster, and never lower for a square area; the pull request shows rendered comparisons, and merging it is the maintainer's verdict on how it looks. If the test cannot be met, P12 is closed unmerged, the "Wide area" scenario is removed from the spec, and P8 proceeds on the round cluster.
P12 sits before P8 so that fixture baselines are generated once. It stays invisible like the other groundwork.
*Alternatives:* true rectangle packing (no standard algorithm); publishing first and changing the arrangement later (every published chart would change shape in a minor release).

## Risks / Trade-offs

- **The issue's screenshot fills a box; this may not.** The cluster is round unless the P12 experiment succeeds, and P12 can fail (D18). The orientation choice helps with a handful of circles; with many circles in a wide area the sides stay empty. How close a four-circle chart comes to the maintainer's mock has not been measured. The usage page says so.
- **Numerical edge cases in the front chain** (radius ratios of 1e6, thousands of equal circles) are where circle packing implementations fail. P3's tests cover them with seeded inputs and a pairwise overlap check.
- **Cost is not measured.** A sibling set of n is about O(n√n); groups with a ring repeat the pack up to five times. P11 adds a benchmark case; if 10 000 circles is slow the iteration count is the first thing to lower.
- **Unreleased code on main.** P3–P9 add modules that only tests reach. They are covered by unit tests and fixtures, but a long gap before P10 leaves dead weight in the source.
- **Registering the subclass registers its parent.** In the module build, registering `CirclePackController` also registers the `treemap` controller, without the treemap element; a `treemap` chart then fails on the missing element instead of on the unknown type. The usage page says to register both pairs to use both. The reverse edge: unregistering `TreemapController` while circlepack charts exist removes the shared tooltip positioner.
- **The group ring is in layout units**, so it scales with zoom, as the treemap's group inset does; only sibling spacing and borders stay in pixels.
- **Datalabels** anchors `start` and `end` use the bounding box and land outside the circle; `center` is fine.
- **P10 is wide** (entries, types, four integration tests, docs). It cannot be split without publishing an undocumented or untyped chart type.
- **Bundle size** of the script build grows for users who only want treemaps; the module build tree-shakes.

## Pieces

Sizes are estimates of changed lines without image baselines. The limit is 400.

| Piece | Type | Builds | Files | Failing test | Size | Waits on | #15 |
|---|---|---|---|---|---|---|---|
| P1 | `refactor:` | Controller seams `_layoutNodes` and `_resetProperties` | `src/controller.ts`, new `test/specs/controllerSeams.spec.js` | A test-only subclass overriding each seam sees its override used on first render, on update and for added elements. All existing fixtures unchanged. | ~90 | — | advances |
| P2 | `refactor:` | Text engine seams: `drawText` accepts options without `captions`, a rectangle without `radius` and a minimal element; label defaults and label descriptors move from the treemap element to `src/options.ts` | `src/text/{index,draw,fit}.ts`, `src/options.ts`, `src/element.ts`, `src/controller.ts`, `src/text/index.test.ts` | Type check of a `drawText` call with options lacking `captions` and a rectangle lacking `radius`. All existing fixtures unchanged. | ~105 | — | advances |
| P3 | `refactor:` | Front-chain sibling packing | new `src/pack/siblings.ts`, `src/pack/siblings.test.ts` | No pairwise overlap for seeded inputs (n = 1, 2, 3, 50, 2000; equal radii; ratio 1e6); every circle touches another; same input, same output. | ~300 | — | advances |
| P4 | `refactor:` | Smallest enclosing circle of circles | new `src/pack/enclose.ts`, `src/pack/enclose.test.ts` | Encloses all inputs; minimal against brute force for n ≤ 8; single, concentric and collinear inputs; identical on repeat; does not call `Math.random`. | ~250 | P3 (`Circle` type) | advances |
| P5 | `refactor:` | Tree packing: radii and relative positions bottom-up, ring, zero handling | new `src/pack/tree.ts`, `src/pack/tree.test.ts` | Members inside the group minus the ring; equal leaves in different groups have equal radius; zero and NaN leaves excluded; single-member group concentric; node order untouched. | ~230 | P3, P4 | advances |
| P6 | `refactor:` | `packNodes`: fit, orientation, ring iteration, node geometry | new `src/pack/layout.ts`, `src/pack/layout.test.ts` | Bounding box centred in the rectangle and touching two opposite sides; `[1]` gives diameter `min(W, H)`; `[1, 1]` follows the long axis; ring within 1 % after the fit; negative spacing with groups keeps every radius ≥ its enclosure; `s` and `gs` as defined in D3; `hidden`; empty rectangle yields no NaN. | ~300 | P5 | advances |
| P7 | `refactor:` | `CirclePackElement` with its defaults, descriptors and default routes, and the element option types | new `src/pack/element.ts`, `src/pack/types.ts`, `src/pack/element.test.ts` | With a mock context: ellipse path and even-odd border; inscribed text rectangle; `inRange` false in the box corner and for zero or negative size; centre point; object or function `borderWidth` draws no border; a group draws no text even with `captions` present. | ~310 | P2 | advances |
| P12 | `refactor:` | Aspect-aware placement of the top-level cluster (experiment, D18) | `src/pack/siblings.ts`, `src/pack/layout.ts`, their tests | For seeded sets of 10, 50 and 200 circles in 2:1 and 3:1 rectangles the covered share of the rectangle is at least 15 % higher than with the round cluster; not lower in a square; still no overlap and every circle touches another. | ~150 | P6 | advances |
| P8 | `refactor:` | `CirclePackController`, the dataset option type, test-only registration, first fixtures | new `src/pack/controller.ts`; `src/pack/types.ts`; `test/setup.js`, `test/specs/fixtures.spec.js`; new `test/specs/circlepack.spec.js`; `test/fixtures/circlepack/{basic,single,fourValues,region,labels}` | The fixtures cannot render without the controller. Spec: rectangle-only options leave the nodes identical; `borderWidth` from `options.datasets.circlepack` widens the ring; a function `borderWidth` reading `ctx.raw` does not throw and gives no ring and no border; `update('none')` keeps node objects; reset starts at the centre; unregistering keeps the treemap positioner. | ~340 | P1, P6, P7, P12 (merged or closed) | advances |
| P9 | `test:` | Fixtures for nesting and interaction | `test/fixtures/circlepack/{grouped,grouped3,groupedBorderSpacing,others,valueScale,hover,tooltip,zoom,zoomX,zeroValues}` | The fixtures themselves: the pixel net for the hierarchy, interaction and zoom requirements. | ~260 | P8 | advances |
| P10 | `feat:` | Publish: exports, script-bundle registration, registry type, type tests, integration checks, usage page, sample, sidebar, docs runtime, README line; removes the test-only registration | `src/index.ts`, `src/index.esm.ts`, `src/types.ts`, `test/setup.js`, new `test/types/circlepack.ts`, `test/types/register.ts`, `test/integration/*`, new `src/content/docs/circlepack.md`, new `src/content/docs/samples/circlePack.md`, `astro.config.mjs`, `docs/chart-runtime.js`, `README.md` — **wide** | Type test `ChartData<'circlepack'>` with `rtl` as an expected error; integration tests import `CirclePackController` from the built package and unregister both chart types afterwards; the CommonJS test creates a `circlepack` chart from the self-registering bundle. | ~350 | P8, P9 | **completes** |
| P11 | `test:` | A circlepack case in the update benchmark | `bench/update.mjs` | `npm run test:bench` runs the circlepack case; the pull request records the 10 000-circle time. | ~25 | P10 (the benchmark imports the built package) | — (after the issue is closed) |

**Order.** P1, P2 and P3 can start at once. P4 follows P3 only for the shared `Circle` type. P7 can run beside P4–P6 once P2 is merged. P5 → P6 is serial. P12 follows P6 (both edit `src/pack/siblings.ts` and `src/pack/layout.ts` after P3 and P6). P8 joins P1, P6, P7 and the outcome of P12. Rows are numbered in the order they were designed, not built: P12 is built between P6 and P8. P9 and P10 share `test/setup.js`/fixture wiring with P8 and are serial after it. P1 and P2 both edit `src/controller.ts` by hand (P1 the update cycle, P2 the descriptors), so whichever merges second rebases on the first; P7 and P8 both edit `src/pack/types.ts`, and P8 and P10 both edit `test/setup.js`, which the order already covers. P11 follows P10. No piece waits on the open PR #515.

## Contracts

```ts
// P1 — src/controller.ts
class TreemapController extends DatasetController {
  _layoutOptions(): LayoutOptions // exists
  _layoutNodes(nodes: LayoutNode[], rect: any, options: LayoutOptions): void // treemap: layoutNodes(...)
  _resetProperties(properties: { x: number; y: number; width: number; height: number }): void // treemap: width = height = 0
}

// P2 — src/text/{index,draw,fit}.ts
export type TextRect = Omit<DrawRect, 'radius'> // { x, y, w, h, active? }
export type TextOptions = { labels: TreemapLabelsOptions; captions?: TreemapCaptionsOptions }
export type TextElement = { active: boolean; $context?: TreemapScriptableContext }
export function drawText(
  ctx: CanvasRenderingContext2D, rect: TextRect, options: TextOptions,
  item: TreemapDataPoint, element: TextElement, layout: TreemapLayoutOptions
): void
// P2 — src/options.ts (moved from src/element.ts, values unchanged)
export const labelDefaults: TreemapLabelsOptions
export const textDescriptors: { _fallback: true; _scriptable: (name: string) => boolean } // name !== 'formatter'
// TreemapElement and TreemapController use them for their labels/captions defaults and descriptors.

// P3 — src/pack/siblings.ts
export type Circle = { x: number; y: number; r: number }
/** Precondition: every r finite and > 0. Places in the given order, writes x and y
 *  (first circle at the origin), returns the front chain in chain order. */
export function packSiblings<T extends Circle>(circles: T[]): T[]
// P12 adds an optional second parameter, default 1 (round): the cluster's target width over height, >= 1.
// export function packSiblings<T extends Circle>(circles: T[], aspect?: number): T[]
// packNodes passes max(w, h) / min(w, h) of the rectangle for the top-level sibling set only.

// P4 — src/pack/enclose.ts
/** Smallest circle containing every input circle. Empty input gives { x: 0, y: 0, r: 0 }. Pure. */
export function encloseCircles(circles: readonly Circle[]): Circle

// P5 — src/pack/tree.ts
export type Packed = Circle & { node: LayoutNode; children: Packed[] } // x, y relative to the parent's centre
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }
/** Precondition: ring >= 0 (the caller clamps).
 *  Leaf r = k * sqrt(weight); weight is the node's layout weight, else v; not finite or <= 0 gives 0.
 *  Group r = enclose(children).r + ring, or 0 when no child has r > 0.
 *  Siblings are packed by r descending (stable); input arrays are not reordered.
 *  Items with r === 0 are returned at (0, 0) and not packed. */
export function packTree(nodes: LayoutNode[], k: number, ring: number): { items: Packed[]; bounds: Bounds }

// P6 — src/pack/layout.ts
export type PackRect = { x: number; y: number; w: number; h: number }
/** ring = max(0, layout.spacing + (typeof layout.borderWidth === 'number' ? layout.borderWidth : 0)).
 *  With groups and ring > 0: repeat pack(k, ring), k *= s until |s - 1| < 1e-3, at most 4 passes,
 *  then one uniform scale. Guarantee: ring within 1 % of the requested value.
 *  Writes on every node, descendants included:
 *    x, y, w, h — bounding box, w === h
 *    s          — sum of raw v over the node's sibling set
 *    gs         — the same total for nodes inside a group, undefined at the top level
 *    hidden     — true when w === 0 */
export function packNodes(nodes: LayoutNode[], rect: PackRect, layout: LayoutOptions): void

// P7 — src/pack/types.ts, src/pack/element.ts
export type CirclePackDataPoint = TreemapDataPoint
export interface CirclePackOptions {
  backgroundColor: Color; borderColor: Color; borderWidth: number; labels: TreemapLabelsOptions
}
export default class CirclePackElement extends Element<TreemapConfig, CirclePackOptions> {
  static readonly id = 'circlepack'
  static readonly defaults = { borderWidth: 0, labels: labelDefaults }
  static readonly descriptors = {
    _indexable: false,
    _scriptable: (name: string) => name !== 'borderWidth',
    labels: textDescriptors,
  }
  static readonly defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' }
  /** Draws nothing when width <= 0 || height <= 0.
   *  Calls drawText only for a leaf, passing { labels: options.labels }. */
  draw(ctx: CanvasRenderingContext2D, data?: CirclePackDataPoint, layout?: TreemapLayoutOptions): void
  /** All three are false when width <= 0 || height <= 0. inRange tests the ellipse, the others the box interval. */
  inRange(x: number, y: number, useFinalPosition?: boolean): boolean
  inXRange(x: number, useFinalPosition?: boolean): boolean
  inYRange(y: number, useFinalPosition?: boolean): boolean
  getCenterPoint(useFinalPosition?: boolean): { x: number; y: number }
  tooltipPosition(): { x: number; y: number }
}

// P8 — src/pack/types.ts
export interface CirclePackControllerDatasetOptions<DType> {
  data: number[] | DType[] | AnyObject
  key?: keyof DType; groups?: Array<keyof DType>; sumKeys?: Array<keyof DType>; leafKey?: keyof DType
  valueScale?: TreemapValueScale<DType>; others?: false | TreemapOthers; region?: TreemapRegion
  label?: string; spacing?: number
  backgroundColor?: Scriptable<Color, TreemapScriptableContext>
  borderColor?: Scriptable<Color, TreemapScriptableContext>
  borderWidth?: number
  hoverBackgroundColor?: Scriptable<Color, TreemapScriptableContext>
  hoverBorderColor?: Scriptable<Color, TreemapScriptableContext>
  hoverBorderWidth?: number
  labels?: TreemapControllerDatasetLabelsOptions
}
// P8 — src/pack/controller.ts
export default class CirclePackController extends TreemapController {} // id 'circlepack'
// defaults: { dataElementType: 'circlepack', spacing: 0 }
// descriptors: { _indexable: false, _scriptable: (name) => name !== 'borderWidth', labels: textDescriptors }
// afterUnregister does nothing
// _layoutNodes -> packNodes; _resetProperties -> collapse to the centre
// _layoutOptions -> { ...super._layoutOptions(),
//   borderWidth: typeof this.options.borderWidth === 'number' ? this.options.borderWidth : 0,
//   spacing: this.options.spacing, unsorted: false }

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
- A node with `w === 0` is `hidden`; an element whose width or height is not positive is never drawn or hit (P6 → P7).
- The flattened order puts parents before their members, so groups are drawn under them (existing; P8 relies on it).
- Scriptable options of a circlepack dataset are typed with `TreemapScriptableContext`; `raw` has the same shape. There is no separate circlepack context type.
- Whether `hoverBorderWidth` is checked for scriptability under its own name or as `borderWidth` is not verified; P8's spec pins the behaviour it finds.

## Open Questions

None. The maintainer answered all eight on 2026-11-21; the answers are D17 under Decisions.
