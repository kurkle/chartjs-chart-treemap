---
title: Usage
---

```js chart-editor
// <block:utils:1>
function colorFromRaw(ctx) {
  if (ctx.type !== 'data') {
    return 'transparent';
  }
  const value = ctx.raw.v;
  let alpha = (1 + Math.log(value)) / 5;
  const color = 'green';
  return helpers.color(color)
    .alpha(alpha)
    .rgbString();
}
// </block:utils>

// <block:config:0>
const config = {
  type: 'treemap',
  data: {
    datasets: [
      {
        label: 'My treemap dataset',
        data: [15, 6, 6, 5, 4, 3, 2, 2],
        borderColor: 'green',
        borderWidth: 1,
        spacing: 0,
        backgroundColor: (ctx) => colorFromRaw(ctx),
      }
    ],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'My treemap chart'
      },
      legend: {
        display: false
      }
    }
  }
};

// </block:config>

module.exports = {
  config,
};
```

The treemap chart provides a method for displaying hierarchical data using nested rectangles.

Treemaps display hierarchical (tree-structured) data as a set of nested rectangles. Each branch of the tree is given a rectangle, which is then tiled with smaller rectangles representing sub-branches. A leaf node's rectangle has an area proportional to a specified dimension of the data.

## Dataset Options

Namespaces:

* `data.datasets[index]` - options for this dataset only
* `options.datasets.treemap` - options for all treemap datasets
* `options.elements.treemap` - options for all treemap elements
* `options` - options for the whole chart

The treemap chart allows a number of properties to be specified for each dataset.
These are used to set display properties for a specific dataset.

**Two scopes, on purpose.** Options that shape the whole layout - `displayMode`,
`groups`, `key`, `leafKey`, `rtl`, `spacing`, `sumKeys` and `unsorted` - are resolved
once per dataset and are **not** read from `options.elements.treemap`. Options that can
differ from one rectangle to the next - the colors, borders, `captions` and `labels` -
are element options and are resolved per element, so they can be
[scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options).

#### Data

What is charted, and how it is summarised. Dataset scope.

| Name | Type | Default
| ---- | ---- | ----
| [`data`](#general) | `number[]` \| `object[]` \| `object` | **required**
| [`key`](#general) | `string` | `undefined`
| [`sumKeys`](#general) | `string[]` | `undefined`
| [`groups`](#general) | `string[]` | `undefined`
| [`leafKey`](#general) | `string` | `'_leaf'`
| [`valueScale`](#value-scaling) | `string` \| `function` | `'linear'`
| [`others`](#an-other-tile-instead) | `object` \| `false` | `false`

#### Layout

How the rectangles are placed. Dataset scope: these are **not** read from
`options.elements.treemap`.

| Name | Type | Default
| ---- | ---- | ----
| [`displayMode`](#styling) | `string` | `'containerBoxes'`
| [`region`](#regions) | `object` | `undefined`
| [`rtl`](#general) | `boolean` | `false`
| [`spacing`](#styling) | `number` | `0.5`
| [`unsorted`](#general) | `boolean` | `false`
| [`label`](#general) | `string` | `undefined`

#### Elements

How each rectangle looks. Element scope, and scriptable per element.

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderRadius`](#styling) | `number` \| `object` | Yes | `0`
| [`borderWidth`](#styling) | `number` \| `object` | - | `0`
| [`captions`](#captions) | `object` | - |
| [`labels`](#labels) | `object` | - |
| [`hoverBackgroundColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | `undefined`

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### General

| Name | Description
| ---- | ----
| `data` | Numbers, objects, or a nested object addressed through `leafKey`. The array is read, never written.
| `groups` | Define how to display multiple levels of hierarchy. Data is summarized to groups internally.
| `key` | Define the key name in data objects to use for value.
| `label` | The label for the dataset which appears in the legend and tooltips.
| `region` | The part of the chart area this dataset lays out into. See [Regions](#regions).
| `rtl` | If `true`, the treemap elements are rendering from right to left.
| `sumKeys` | Define multiple keys to add additional sums, on top of the `key` one, for scriptable options use.
| `leafKey` | The name of the key where the object key of a leaf node is stored. Used only when `data` is a nested `object`.
| `others` | Replace the leaves too small to see with one tile. See [Value scaling](#value-scaling).
| `unsorted` | If `true`, treemap elements are rendered unsorted.
| `valueScale` | How a value becomes an area. See [Value scaling](#value-scaling).

Set a dataset option on the dataset itself or in `options.datasets.treemap`.
Setting one in `options.elements.treemap` has no effect.

#### Options resolved at layout time

`borderWidth`, `spacing` and the `captions` `font`, `padding` and `display` decide how much
room is left inside a group for its children, so they are read once while the layout is
built rather than per element. A scriptable `borderWidth` still draws per element, but the
space reserved for the children uses the dataset-level value.

### Value scaling

A treemap gives each item an area proportional to its value. When one value
dwarfs the rest, the small ones end up smaller than a pixel and disappear -
the chart is correct and useless. `valueScale` compresses the range instead.

| Value | Meaning |
| ---- | ---- |
| `'linear'` | Area is proportional to value. The default. |
| `'sqrt'` | `Math.sqrt(value)`. Halves the spread. |
| `'log'` | `Math.log1p(value)`, so zero and values below one stay finite and ordered. |
| `function` | `(value, item) => number`. A negative or non-finite result is treated as zero. |

**Area is no longer proportional to value** when the scale is not linear. Only the
layout changes: `v`, the tooltips, the labels and `sumKeys` stay in the units the
data came in, and a group covers exactly the area its contents do, because its
weight is the sum of theirs.

```js
datasets: [{
  data: prices,
  key: 'price',
  valueScale: 'log',
}]
```

#### An "Other" tile instead

`others` answers the same question a different way: rather than distorting the
areas, it admits the small items are too small and gives them one name.

```js
datasets: [{
  data: sales,
  key: 'amount',
  others: { threshold: 0.01, label: 'Other', minCount: 2 },
}]
```

| Name | Description |
| ---- | ---- |
| `threshold` | Bucket a leaf below this share of its siblings' total layout weight. |
| `label` | Name of the tile. `'Other'` by default. |
| `minCount` | Only bucket when at least this many leaves fall below the threshold. Two by default. |

Only leaves are bucketed; a group is already a summary. With `groups`, a bucket
appears inside each smallest group. The tile's node carries `isOthers: true` and
`_data.others`, the absorbed items, so a formatter can list them, and the default
tooltip reads `Other (20 items): 20`. Its `v` and `sumKeys` are the sums of what
it absorbed.

**The two are alternatives, not a pair.** The threshold is measured against the
*scaled* weight, so a compressing `valueScale` can lift every item above it and
leave nothing to bucket. Reach for the scale when the areas should still mean
something, and for the bucket when a long tail should collapse into one tile.

### Regions

Every dataset lays out into the whole chart area by default, so two datasets
simply paint over each other. `region` gives each one a part of it, as fractions
of the chart area:

| Name | Default | Meaning |
| ---- | ---- | ---- |
| `left` | `0` | left edge, as a share of the chart area's width |
| `top` | `0` | top edge, as a share of its height |
| `width` | `1` | width, as a share of its width |
| `height` | `1` | height, as a share of its height |

A gainers and losers view, where the largest of each meet in the middle:

```js
datasets: [
  { label: 'Gainers', data: up,   key: 'change', region: { width: 0.5 }, rtl: true },
  { label: 'Losers',  data: down, key: 'change', region: { left: 0.5, width: 0.5 } },
]
```

Fractions outside `0..1` are clamped, and a region reaching past the chart area
is clipped to it with one console warning. Interaction is unaffected: pointing
at one region finds only the dataset that owns it, because hit testing already
works per element. Hiding a dataset from the legend leaves its region empty -
regions are fixed, not shared out.

### The parsed data

`data` is read, never written. The rectangles the chart draws are the *parsed* data, one
node per rectangle - a grouped treemap has more rectangles than you supplied rows.

| To read a node | Use |
| ---- | ---- |
| in a scriptable option | `ctx.raw` (also `ctx.parsed`) |
| in a tooltip callback | `item.parsed` |
| anywhere else | `chart.getDatasetMeta(i).controller.getParsed(index)` |

A node carries the raw value `v`, the summed keys `vs`, the group `g` and its level `l`,
the original row or group record in `_data`, and its geometry.

Editing `data` in place is picked up by the next `chart.update()`; there is no version
stamp to bump.

#### Plugins that read `dataset.data`

A plugin that walks `dataset.data` alongside `chart.getDatasetMeta(i).data` will see
different lengths whenever the chart has groups. The datalabels plugin is the common case:
its formatter receives `dataset.data[index]` as the value, so read the node through the
controller instead.

```js
formatter: (_value, ctx) =>
  ctx.chart.getDatasetMeta(ctx.datasetIndex).controller.getParsed(ctx.dataIndex).v,
```

### TypeScript

A nested object needs the data type spelled out, either through the chart's generic or by
flattening it up front with the exported `flattenTree`:

```ts
new Chart<'treemap', MyRow[]>(ctx, { data: { datasets: [{ data: myTree }] } })

// or
import { flattenTree } from 'chartjs-chart-treemap'
const data = flattenTree<MyRow>(myTree, ['value'], 'name')
```
