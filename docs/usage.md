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

:::tip

`chartjs-chart-treemap` is not using any scales currently and thats why [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) does not work with it.
When other charts are using datalables on the same page, you'll need to disable the plugin for treemap charts:

```js
const chart = new Chart(ctx, {
  type: 'treemap',
  data: [/* (...) */],
  options: {
    plugins: {
      datalabels: false
    }
  }
});
```

:::

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
| [`borderWidth`](#styling) | `number`\|`object` | Yes | `0`
| [`color`](#styling) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`dividerCapStyle`](#divider) | `string` | Yes | `'butt'`
| [`dividerColor`](#divider) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `'black'`
| [`dividerDash`](#divider) | `number[]` | Yes | `undefined`
| [`dividerDashOffset`](#divider) | `number` | Yes | `0`
| [`dividerWidth`](#divider) | `number` | Yes | `1`
| [`font`](#styling) | `Font` | Yes | `{}` 
| [`groupDividers`](#general) | `boolean` | Yes | `false` |
| [`groupLabels`](#general) | `boolean` | Yes | `true` |
| [`groups`](#general) | `string[]` | - | `undefined` |
| [`hoverBackgroundColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | Yes | `undefined`
| [`hoverColor`](#interactions) | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | Yes | `undefined`
| [`hoverFont`](#interactions) | `Font` | Yes | `{}` 
| [`key`](#general) | `string` | - | `undefined` |
| [`label`](#general) | `string` | - | `''`
| [`labels`](#labels) | `object` | Yes | 
| [`rtl`](#general) | `boolean` | Yes | `false`
| [`spacing`](#styling) | `number` | Yes | `0.5` |
| [`tree`](#general) | `number[]` \| `object[]` | - |  **required**

All these values, if `undefined`, fallback to the scopes described in [option resolution](https://www.chartjs.org/docs/latest/general/options.html).

### General

| Name | Description
| ---- | ----
| `groupLabels` | If `true`, the labels of the treemap elements group is shown, only if grouping.
| `groups` | Define how to display multiple levels of hierarchy. Data is summarized to groups internally.
| `key` | Define the key name in data objects to use for value.
| `label` | The label for the dataset which appears in the legend and tooltips.
| `rtl` | If `true`, the treemap elements are rendering from right to left.
| `tree` | Tree data should be provided in `tree` property of dataset. `data` is then automatically build.

Only the `tree`, `key` and `groups` options need to be specified in the dataset namespace.

```js
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
      color: 'black'
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
| `borderWidth` | The treemap element border width (in pixels).
| `color` | The font color, applicable to groups labels.
| [`font`](https://www.chartjs.org/docs/latest/general/fonts.html) | The font configuration, applicable to groups labels.
| `spacing` | Fixed distance (in pixels) between all treemap elements.

If the value is `undefined`, fallbacks to the associated `elements.treemap.*` options.

### Interactions

The interaction with each element can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | The treemap element background color when hovered.
| `hoverBorderColor` | The treemap element border color when hovered.
| `hoverBorderWidth` | The treemap element border width (in pixels) when hovered.
| `hoverColor` | The font color, applicable to groups labels when hovered.
| [`hoverFont`](https://www.chartjs.org/docs/latest/general/fonts.html) | The font configuration, applicable to groups labels. when hovered.

If the value is `undefined`, fallbacks to the associated `elements.treemap.*` options.

### Divider

The divider is a line which splits a treemap elements in inner subelements and can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `dividerCapStyle` | Cap style of the divider line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `dividerColor` | Color of the divider line.
| `dividerDash` | Length and spacing of divider dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `dividerDashOffset` | Offset for divider line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `dividerWidth` | Divider line width (in pixels).
| `groupDividers` | If `true`, the dividers will be applied to the grouped treemap elements, only if grouping.

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
| `color` | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| `display` | `boolean` | Yes | `false`
| [`formatter`](#divider) | `function` | Yes | 
| [`font`](https://www.chartjs.org/docs/latest/general/fonts.html) | `Font` | Yes | `{}` 
| `hoverColor` | [`Color`](https://www.chartjs.org/docs/latest/general/colors.html) | Yes | `undefined`
| [`hoverFont`](https://www.chartjs.org/docs/latest/general/fonts.html) | `Font` | Yes | `{}` 
| `padding` | `number` | Yes | `6` 
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
{
  type: 'treemap',
  data: {
    datasets: [{
      tree: [15, 6, 6, 5, 4, 3, 2, 2],
      labels: {
        display: false,
        formatter: (ctx) => 'Kmq' + ctx.raw.v
      }
    }]
  },
}
```
