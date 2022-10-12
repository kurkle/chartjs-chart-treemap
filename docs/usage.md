# Usage

The treemap chart provides a method for displaying hierarchical data using nested rectangles.

Treemaps display hierarchical (tree-structured) data as a set of nested rectangles. Each branch of the tree is given a rectangle, which is then tiled with smaller rectangles representing sub-branches. A leaf node's rectangle has an area proportional to a specified dimension of the data.

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
        tree: [15, 6, 6, 5, 4, 3, 2, 2],
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

## Dataset Options

Namespaces:

* `data.datasets[index]` - options for this dataset only
* `options.datasets.treemap` - options for all treemap datasets
* `options.elements.treemap` - options for all treemap elements
* `options` - options for the whole chart

The treemap chart allows a number of properties to be specified for each dataset.
These are used to set display properties for a specific dataset.

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderColor`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`borderRadius`](#styling) | `number` \| `object` | Yes | `0`
| [`borderWidth`](#styling) | `number`\|`object` | - | `0`
| [`captions`](#captions) | `object` | - | 
| [`dividers`](#dividers) | `object` | - | 
| [`groups`](#general) | `string[]` | - | `undefined` |
| [`hoverBackgroundColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | `undefined`
| [`key`](#general) | `string` | - | `undefined` |
| [`label`](#general) | `string` | - | `undefined`
| [`labels`](#labels) | `object` | - | 
| [`rtl`](#general) | `boolean` | - | `false`
| [`spacing`](#styling) | `number` | - | `0.5`
| [`tree`](#general) | `number[]` \| `object[]` \| `object` | - |  **required**
| [`treeLeafKey`](#general) | `string` | - | `_leaf` |

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### General

| Name | Description
| ---- | ----
| `groups` | Define how to display multiple levels of hierarchy. Data is summarized to groups internally.
| `key` | Define the key name in data objects to use for value.
| `label` | The label for the dataset which appears in the legend and tooltips.
| `rtl` | If `true`, the treemap elements are rendering from right to left.
| `tree` | Tree data should be provided in `tree` property of dataset. `data` is then automatically build.
| `treeLeafKey` | The name of the key where the object key of leaf node of tree object is stored. Used only when `tree` is an `object`, as hierarchical data.

Only the `tree`, `treeLeafKey`, `key` and `groups` options need to be specified in the dataset namespace.

```js
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

const data = [
  {category: 'main', value: 1},
  {category: 'main', value: 2},
  {category: 'main', value: 3},
  {category: 'other', value: 4},
  {category: 'other', value: 5},
];

const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: data,
      key: 'value',
      groups: ['category'],
      backgroundColor: (ctx) => colorFromRaw(ctx),
    }]
  },
};
```

### Styling

The style of the treemap element can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | The treemap element background color.
| `borderColor` | The treemap element border color.
| [`borderRadius`](#borderradius) | Radius of the rectangle of treemap element (in pixels).
| `borderWidth` | The treemap element border width (in pixels).
| `spacing` | Fixed distance (in pixels) between all treemap elements.

If the value is `undefined`, fallbacks to the associated `elements.treemap.*` options.

#### borderRadius

If this value is a number, it is applied to all corners of the rectangle (topLeft, topRight, bottomLeft, bottomRight). If this value is an object, the `topLeft` property defines the top-left corners border radius. Similarly, the `topRight`, `bottomLeft`, and `bottomRight` properties can also be specified. Omitted corners have radius of 0.

### Interactions

The interaction with each element can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | The treemap element background color when hovered.
| `hoverBorderColor` | The treemap element border color when hovered.
| `hoverBorderWidth` | The treemap element border width (in pixels) when hovered.

If the value is `undefined`, fallbacks to the associated `elements.treemap.*` options.

## Labels

Namespaces:

* `data.datasets[index].labels` - options for this dataset only
* `options.datasets.treemap.labels` - options for all treemap datasets
* `options.elements.treemap.labels` - options for all treemap elements
* `options` - options for the whole chart

The labels options can control if and how a label, to represent the data, can be shown in the rectangle, with the following properties:

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`align`](#align) | `string` | Yes | `center`
| [`color`](#fonts-and-colors) | `Color` \| `Color[]` | Yes | `'black'`
| `display` | `boolean` | - | `false`
| [`formatter`](#formatter) | `function` | Yes | 
| [`font`](#fonts-and-colors) | `Font` \| `Font[]` | Yes | `{}`
| [`hoverColor`](#fonts-and-colors) | `Color` \| `Color[]` | Yes | `undefined`
| [`hoverFont`](#fonts-and-colors) | `Font` \| `Font[]` | Yes | `{}`
| [`overflow`](#overflow) | `string` | Yes | `cut`
| `padding` | `number` | - | `3` 
| [`position`](#position) | `string` | Yes | `middle`

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

:::warning

Labels only apply if `display` is `true`.

:::

### Align

The align property specifies the text horizontal alignment used when drawing the label. The possible values are:

* `center`: the text is centered. It is the default.
* `left`: the text is left-aligned.
* `right`: the text is right-aligned.

### Overflow

The overflow property controls what happens to a label that is too big to fit into a rectangle. The possible values are:

* `cut`: if the label is too big, it will be cut to stay inside the rectangle. It is the default.
* `hidden`:  the label is removed altogether if the rectangle is too small for it.

### Position

The position property specifies the text vertical alignment used when drawing the label. The possible values are:

* `middle`: the text is in the middle of the rectangle. It is the default.
* `top`: the text is in the top of the rectangle.
* `bottom`: the text is in the bottom of the rectangle.

### Formatter

Data values are converted to string. If values are grouped, the value of the group and the value (as string) are shown.

This default behavior can be overridden by the `formatter` which is a [scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) option.

A `formatter` can return a string (for a single line) or an array of strings (for multiple lines, where each item represents a new line). 

In the following example, every label of the treemap would be displayed with the unit.

```js
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: [15, 6, 6, 5, 4, 3, 2, 2],
      labels: {
        display: false,
        formatter: (ctx) => 'Kmq ' + ctx.raw.v
      }
    }]
  },
};
```

### Fonts and colors

When the label to draw has multiple lines, you can use different font and color for each row of the label. This is enabled configuring an array of fonts or colors for those options. When the lines are more than the configured fonts of colors, the last configuration of those options is used for all remaining lines.

See on Chart.js documentation more details about [`font`](https://www.chartjs.org/docs/latest/general/fonts.html) and [`color`](https://www.chartjs.org/docs/latest/general/colors.html) options.

## Captions

Namespaces:

* `data.datasets[index].captions` - options for this dataset only
* `options.datasets.treemap.captions` - options for all treemap datasets
* `options.elements.treemap.captions` - options for all treemap elements
* `options` - options for the whole chart

The captions options can control if and how a captions, to represent the group of the chart, can be shown in the rectangle, with the following properties:

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`align`](#caption-align) | `string` | Yes | `undefined` but `left` is used because default `rtl` option is `false`.
| `color` | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `'black'`
| `display` | `boolean` | - | `true`
| [`font`](https://www.chartjs.org/docs/latest/general/fonts.html) | `Font` | Yes | `{}` 
| [`formatter`](#caption-formatter) | `function` | Yes | 
| `hoverColor` | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverFont`](https://www.chartjs.org/docs/latest/general/fonts.html) | `Font` | Yes | `{}` 
| `padding` | `number` | - | `3` 

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### Caption Align

The align property specifies the text horizontal alignment used when drawing the caption. The possible values are:

* `left`: the text is left-aligned.
* `center`: the text is centered. 
* `right`: the text is right-aligned.

If `undefined`, `right` is used if `rtl` option is set to `true`, otherwise `left`.

### Caption Formatter

If values are grouped, the value of the group is shown in the chart as caption for all elements belonging to the group.

This default behavior can be overridden by the `formatter` which is a [scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) option.

A `formatter` can return a string. 

In the following example, every caption of the treemap would be displayed with an additional label.

```js
const data = [
  {category: 'main', subcategory: 'one', value: 1},
  {category: 'main', subcategory: 'one', value: 5},
  {category: 'main', subcategory: 'one', value: 3},
  {category: 'main', subcategory: 'two', value: 2},
  {category: 'main', subcategory: 'two', value: 1},
  {category: 'main', subcategory: 'two', value: 8},
  {category: 'other', subcategory: 'one', value: 4},
  {category: 'other', subcategory: 'one', value: 5},
  {category: 'other', subcategory: 'two', value: 4},
  {category: 'other', subcategory: 'two', value: 1},
];
const config = {
  type: 'treemap',
  data: {
    datasets: [{
      tree: data,
      key: 'value',
      groups: ['category', 'subcategory', 'value'],
      captions: {
        display: true,
        formatter(ctx) {
          return ctx.type === 'data' ? 'G: ' + ctx.raw.g : '';
        }
      },
    }]
  },
};
```

## Dividers

Namespaces:

* `data.datasets[index].dividers` - options for this dataset only
* `options.datasets.treemap.dividers` - options for all treemap datasets
* `options.elements.treemap.dividers` - options for all treemap elements
* `options` - options for the whole chart

The divider is a line which splits a treemap elements in grouped elements and can be controlled with the following properties:

| Name | Type | [Scriptable](https://www.chartjs.org/docs/latest/general/options.html#scriptable-options) | Default
| ---- | ---- | :----: | ----
| `display` | `boolean` | - | `false` |
| [`lineCapStyle`](#line-styling) | `string` | - | `'butt'`
| [`lineColor`](#line-styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | - | `'black'`
| [`lineDash`](#line-styling) | `number[]` | - | `[]`
| [`lineDashOffset`](#line-styling) | `number` | - | `0`
| [`lineWidth`](#line-styling) | `number` | - | `1`

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### Line Styling

The style of the divider line can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `display` | If `true`, the dividers will be applied to the grouped treemap elements, only if grouping.
| `lineCapStyle` | Cap style of the divider line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `lineColor` | Color of the divider line.
| `lineDash` | Length and spacing of divider dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `lineDashOffset` | Offset for divider line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `lineWidth` | Divider line width (in pixels).

If the value is `undefined`, fallbacks to the associated `elements.treemap.dividers.*` options.
