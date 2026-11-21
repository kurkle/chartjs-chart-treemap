## Why

Issue #15 asks for circles instead of rectangles: values drawn as touching circles whose areas are proportional to the values, clustered in the chart area. Since v5 the controller separates the hierarchy pass from the geometry pass, so a second layout and a second element can reuse parsing, grouping, value scaling, the "other" bucket, regions, labels and tooltips instead of living in a separate package.

## What Changes

- A new chart type `circlepack` next to `treemap`, with its own controller and element, exported from both entry points and auto-registered by the script bundle.
- A circle-packing layout written in-house (front-chain sibling packing and a smallest-enclosing-circle step). No runtime dependency is added.
- The top-level cluster is shaped like the area it is drawn in, if an experiment with aspect-aware placement meets its acceptance test; otherwise the cluster is round and the documentation says so.
- With `groups`, each group is a circle enclosing its members, at every level.
- Labels of leaves are placed in the square inscribed in the circle; hit testing, hover and tooltips follow the round shape; circles animate from their own centre.
- Deliberate additions beyond the issue: the cluster is turned to the orientation that fits the area better, the layout is deterministic, and the chart works with the zoom plugin (circles become ellipses when only one axis is zoomed).
- Rectangle-only options (`rtl`, `unsorted`, `displayMode`, `borderRadius`, per-side `borderWidth`, `captions`) are not part of the `circlepack` types and have no effect when set.
- Two behaviour-neutral seams in the treemap controller, a type-only seam in the text engine and shared label defaults, so the new chart type overrides the layout instead of copying the update cycle.
- Documentation: a usage page, a sample, and a README line.
- Nothing about the `treemap` chart type changes. No breaking change.

## Capabilities

### New Capabilities

- `circle-packing-layout`: how values become non-overlapping circles that fill the dataset's area as one centred cluster.
- `circle-pack-hierarchy`: how grouped data nests as circles inside circles.
- `circle-elements`: how a circle is drawn, labelled, hovered and animated.
- `circle-pack-chart-type`: what the package provides as the `circlepack` chart type and how it relates to `treemap`, live updates and zoom.

### Modified Capabilities

None. The repository has no written specs yet, and the treemap's behaviour does not change.

## Impact

- New modules under `src/pack/`; small edits to `src/controller.ts`, `src/element.ts`, `src/options.ts`, `src/text/`, `src/types.ts`, `src/index.ts`, `src/index.esm.ts`.
- The published type definitions gain the `circlepack` entry in `ChartTypeRegistry` and the new option types.
- In the module build, registering the circlepack controller also registers the treemap controller, because it is its parent class.
- The script bundle grows by the new layout and element (estimated 2–3 kB minified; not measured).
- New fixture directory `test/fixtures/circlepack/`, new type and integration checks, a benchmark case.
- `package.json` and the lockfile are not edited, so the open dependabot PR #515 blocks nothing.
