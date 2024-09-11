import {Chart, registerables} from 'chart.js';
import {TreemapController, TreemapElement} from '../../dist/chartjs-chart-treemap.esm';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(...registerables);
Chart.register(TreemapController, TreemapElement, ChartDataLabels, zoomPlugin);
Chart.defaults.plugins.datalabels.display = false;

Chart.register({
  id: 'version',
  afterDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Chart.js v' + Chart.version + ' + chartjs-chart-treemap v' + TreemapController.version, chart.chartArea.right, 0);
    ctx.restore();
  }
});
