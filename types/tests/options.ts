import '../index.esm';
import { Chart } from 'chart.js';
import { color as colorLib } from 'chart.js/helpers';

function colorFromValue(value: number, border?: boolean) {
  let alpha = (1 + Math.log(value)) / 5;
  const color = 'purple';
  if (border) {
    alpha += 0.01;
  }
  return colorLib(color)
    .alpha(alpha)
    .rgbString();
}

const chart = new Chart('test', {
  type: 'treemap',
  data: {
    datasets: [{
      label: 'Basic treemap',
      data: undefined,
      tree: [15, 6, 6, 5, 4, 3, 2, 2],
      backgroundColor(ctx) {
        const item = ctx.dataset.data[ctx.dataIndex];
        if (!item) {
          return 'transparent';
        }
        return colorFromValue(item.v);
      },
      labels: {
        display: true,
        formatter: (ctx) => ctx.raw.g ? [ctx.raw.g, ctx.raw.v.toFixed(1)] : ctx.raw.v.toFixed(1),
      },
      spacing: 0.1,
      borderWidth: 2,
      borderColor: 'rgba(180,180,180, 0.15)'
    }]
  },
});

const chart1 = new Chart('test', {
  type: 'treemap',
  data: {
    datasets: [{
      label: 'Basic treemap',
      data: undefined,
      tree: [15, 6, 6, 5, 4, 3, 2, 2],
      backgroundColor(ctx) {
        return 'transparent';
      },
      labels: {
        display: true,
        padding: 25,
        position: 'bottom',
        align: 'right'
      },
      spacing: 1,
      borderWidth: 2,
      borderColor: 'black'
    }]
  },
});

const statsByState = [
  {
    state: 'Alabama',
    code: 'AL',
    region: 'South',
    division: 'East South Central',
    income: 48123,
    population: 4887871,
    area: 135767
  },
  {
    state: 'Alaska',
    code: 'AK',
    region: 'West',
    division: 'Pacific',
    income: 73181,
    population: 737438,
    area: 1723337
  },
];

const chart2 = new Chart('test', {
  type: 'treemap',
  data: {
    datasets: [{
      data: [],
      tree: statsByState,
      key: 'population',
      groups: ['region', 'division', 'code'],
      backgroundColor(ctx) {
        const item = ctx.dataset.data[ctx.dataIndex];
        if (!item) {
          return 'black';
        }
        const a = item.v / (item.gs || item.s) / 2 + 0.5;
        switch (item.l) {
        case 0:
          switch (item.g) {
          case 'Midwest': return '#4363d8';
          case 'Northeast': return '#469990';
          case 'South': return '#9A6324';
          case 'West': return '#f58231';
          default: return '#e6beff';
          }
        case 1:
          return colorLib('white').alpha(0.3).rgbString();
        default:
          return colorLib('green').alpha(a).rgbString();
        }
      },
      spacing: 2,
      borderWidth: 0.5,
      borderColor: 'rgba(160,160,160,0.5)',
      captions: {
        color: '#FFF',
        hoverColor: '#F0B90B',
        font: {
          family: 'Tahoma',
          size: 8,
          weight: 'bold'
        },
        hoverFont: {
          family: 'Tahoma',
          size: 8,
          weight: 'bold'
        }
      }
    }]
  },
});

const chart3 = new Chart('test', {
  type: 'treemap',
  data: {
    datasets: [{
      data: [],
      tree: statsByState,
      key: 'population',
      groups: ['region', 'division', 'code'],
      backgroundColor(ctx) {
        const item = ctx.dataset.data[ctx.dataIndex];
        if (!item) {
          return 'black';
        }
        const a = item.v / (item.gs || item.s) / 2 + 0.5;
        switch (item.l) {
        case 0:
          switch (item.g) {
          case 'Midwest': return '#4363d8';
          case 'Northeast': return '#469990';
          case 'South': return '#9A6324';
          case 'West': return '#f58231';
          default: return '#e6beff';
          }
        case 1:
          return colorLib('white').alpha(0.3).rgbString();
        default:
          return colorLib('green').alpha(a).rgbString();
        }
      },
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255)',
      captions: {
        display: false,
      },
      labels: {
        display: false,
        color: '#FFF',
        hoverColor: '#F0B90B',
        font: {
          family: 'Tahoma',
          size: 8,
          weight: 'bold'
        },
        hoverFont: {
          family: 'Tahoma',
          size: 8,
          weight: 'bold'
        }
      }
    }]
  },
});
