# chartjs-chart-treemap

[Chart.js](https://www.chartjs.org/) module for creating treemap charts

![npm](https://img.shields.io/npm/v/chartjs-chart-treemap.svg) [![release](https://img.shields.io/github/release/kurkle/chartjs-chart-treemap.svg?style=flat-square)](https://github.com/kurkle/chartjs-chart-treemap/releases/latest) [![travis](https://img.shields.io/travis/kurkle/chartjs-chart-treemap.svg?style=flat-square&maxAge=60)](https://travis-ci.org/kurkle/chartjs-chart-treemap) ![npm bundle size](https://img.shields.io/bundlephobia/min/chartjs-chart-treemap.svg) ![GitHub](https://img.shields.io/github/license/kurkle/chartjs-chart-treemap.svg)

## Documentation

To create a treemap chart, include chartjs-chart-treemap.js after chart.js and then create the chart by setting the `type` attribute to `'treemap'`

```js
new Chart(ctx, {
    type: 'treemap',
    data: dataObject
});
```

## Configuration

TreeMap chart allows configuration of `width` and `height` of the data points in addition to standard Chart.js configuration.

```js
new Chart(ctx, {
    type: 'treemap',
    data: {
        datasets: [{
            label: 'Basic treemap',
            data: [6,6,5,4,3,2,2,1],
            backgroundColor: function(ctx) {
                var value = ctx.dataset.data[ctx.dataIndex];
                var alpha = (value + 3) / 10;
                return Color('blue').alpha(alpha).rgbString();
            }
        }]
    },
});
```

## Example

[Live examples @codepen.io](https://codepen.io/kurkle/full/JqbzgQ)

![TreeMap Example Image](treemap.png)

## Development

You first need to install node dependencies  (requires [Node.js](https://nodejs.org/)):

```bash
> npm install
```

The following commands will then be available from the repository root:

```bash
> gulp build            // build dist files
> gulp build --watch    // build and watch for changes
> gulp test             // run all tests
> gulp test --watch     // run all tests and watch for changes
> gulp test --coverage  // run all tests and generate code coverage
> gulp lint             // perform code linting
> gulp package          // create an archive with dist files and samples
```

## License

chartjs-chart-treemap is available under the [MIT license](https://opensource.org/licenses/MIT).