# chartjs-chart-treemap

[Chart.js](https://www.chartjs.org/) **v3.0.0-beta.10** module for creating treemap charts. Implementation for Chart.js v2 is in [2.x branch](https://github.com/kurkle/chartjs-chart-treemap/tree/2.x)

[![npm](https://img.shields.io/npm/v/chartjs-chart-treemap.svg)](https://www.npmjs.com/package/chartjs-chart-matrix)
[![release](https://img.shields.io/github/release/kurkle/chartjs-chart-treemap.svg?style=flat-square)](https://github.com/kurkle/chartjs-chart-treemap/releases/latest)
![npm bundle size](https://img.shields.io/bundlephobia/min/chartjs-chart-treemap.svg)
![GitHub](https://img.shields.io/github/license/kurkle/chartjs-chart-treemap.svg)

## Documentation

To create a treemap chart, include chartjs-chart-treemap.js after chart.js and then create the chart by setting the `type` attribute to `'treemap'`

```js
new Chart(ctx, {
    type: 'treemap',
    tree: dataObject,
    key: 'value',
    groups: ['main', 'sub']
});
```

## Configuration

Tree data should be provided in `tree` property of dataset. `data` is then automatically build. `key` defines the key name in data objects to use for value. `groups` array can be provided to display multiple levels of hierarchy.
Data is summarized to groups internally.

```js
new Chart(ctx, {
    type: 'treemap',
    data: {
        datasets: [{
            label: 'Basic treemap',
            tree: [6,6,5,4,3,2,2,1],
            font: {
                color: '#000',
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

### Note about chartjs-plugin-datalabels

Treemap is not using any scales currently and thats why [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) plugin does not work with it.
When other charts are using datalables on the same page, you'll need to disable the plugin for treemap charts:

```js
new Chart(ctx, {
    type: 'treemap',
    data: (...),
    options: {
        plugins: {
            datalabels: false
        }
    }
});
```

## Example

[Live examples @codepen.io](https://codepen.io/kurkle/full/oNjXJwe)

![TreeMap Example Image](treemap.png)

## Development

You first need to install node dependencies  (requires [Node.js](https://nodejs.org/)):

```bash
> npm install
```

The following commands will then be available from the repository root:

```bash
> npm run build         // build dist files
> npm run dev           // build and watch for changes
> npm test              // run all tests
> npm run lint          // perform code linting
> npm package           // create an archive with dist files and samples
```

## License

chartjs-chart-treemap is available under the [MIT license](https://opensource.org/licenses/MIT).
