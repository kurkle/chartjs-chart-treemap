# Integration

`chartjs-chart-treemap` can be integrated with plain JavaScript or with different module loaders. The examples below show to load the plugin in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/chartjs-chart-treemap/dist/chartjs-chart-treemap.min.js"></script>
<script>
    let myChart = new Chart(ctx, {type: 'treemap', ...});
</script>
```

## Bundlers (Webpack, Rollup, etc.)

```javascript
import { Chart } from 'chart.js';
import {TreemapController, TreemapElement} from 'chartjs-chart-treemap';

Chart.register(TreemapController, TreemapElement);
```
