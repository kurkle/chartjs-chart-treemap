# Usage

Tree data should be provided in `tree` property of dataset. `data` is then automatically build. `key` defines the key name in data objects to use for value. `groups` array can be provided to display multiple levels of hierarchy.
Data is summarized to groups internally.

```js
const chart = new Chart(ctx, {
  type: 'treemap',
  data: {
    datasets: [{
      label: 'Basic treemap',
      tree: [6, 6, 5, 4, 3, 2, 2, 1],
      color: '#000',
      font: {
        family: 'serif',
        size: 12,
        style: 'normal',
      },
      backgroundColor: function(ctx) {
        var value = ctx.dataset.data[ctx.dataIndex];
        var alpha = (value + 3) / 10;
        return Color('blue').alpha(alpha).rgbString();
      },
      rtl: false // control in which direction the squares are positioned
    }]
  },
});
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
