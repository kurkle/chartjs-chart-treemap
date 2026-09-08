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

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderRadius`](#styling) | `number` \| `object` | Yes | `0`
| [`borderWidth`](#styling) | `number`\|`object` | - | `0`
| [`captions`](#captions) | `object` | - |
| [`data`](#general) | `number[]` \| `object[]` \| `object` | - |  **required**
| [`groups`](#general) | `string[]` | - | `undefined` |
| [`hoverBackgroundColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | `undefined`
| [`key`](#general) | `string` | - | `undefined` |
| [`label`](#general) | `string` | - | `undefined`
| [`labels`](#labels) | `object` | - |
| [`rtl`](#general) | `boolean` | - | `false`
| [`spacing`](#styling) | `number` | - | `0.5`
| [`sumKeys`](#general) | `string[]` | - | `undefined` |
| [`leafKey`](#general) | `string` | - | `_leaf` |
| [`unsorted`](#general) | `boolean` | - | `false`
| [`valueScale`](#general) | `string` \| `function` | - | `'linear'`
| [`displayMode`](#styling) | `string` | - | `'containerBoxes'`

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### General

| Name | Description
| ---- | ----
| `data` | Numbers, objects, or a nested object addressed through `leafKey`. The array is read, never written.
| `groups` | Define how to display multiple levels of hierarchy. Data is summarized to groups internally.
| `key` | Define the key name in data objects to use for value.
| `label` | The label for the dataset which appears in the legend and tooltips.
| `rtl` | If `true`, the treemap elements are rendering from right to left.
| `sumKeys` | Define multiple keys to add additional sums, on top of the `key` one, for scriptable options use.
| `leafKey` | The name of the key where the object key of a leaf node is stored. Used only when `data` is a nested `object`.
| `unsorted` | If `true`, treemap elements are rendered unsorted.
| `valueScale` | How a value becomes an area. See [Value scaling](#value-scaling).

`data`, `displayMode`, `groups`, `key`, `leafKey`, `rtl`, `spacing`, `sumKeys`,
`unsorted` and `valueScale` are dataset options: set them on the dataset or in `options.datasets.treemap`.
Setting them in `options.elements.treemap` has no effect.

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
