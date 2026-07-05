import '../../dist/index.esm'
import { Chart } from 'chart.js'
import { color as colorLib } from 'chart.js/helpers'

function colorFromValue(value: number, border?: boolean) {
  let alpha = (1 + Math.log(value)) / 5
  const color = 'purple'
  if (border) {
    alpha += 0.01
  }
  return colorLib(color).alpha(alpha).rgbString()
}

const _chart = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(ctx) {
          const item = ctx.dataset.data[ctx.dataIndex]
          if (!item) {
            return 'transparent'
          }
          return colorFromValue(item.v)
        },
        borderColor: 'rgba(180,180,180, 0.15)',
        borderRadius: 4,
        borderWidth: 2,
        data: undefined,
        label: 'Basic treemap',
        labels: {
          display: true,
          formatter: (ctx) =>
            ctx.raw.g ? [ctx.raw.g, ctx.raw.v.toFixed(1)] : ctx.raw.v.toFixed(1),
        },
        spacing: 0.1,
        tree: [15, 6, 6, 5, 4, 3, 2, 2],
      },
    ],
  },
  type: 'treemap',
})

const _chart1 = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(_ctx) {
          return 'transparent'
        },
        borderColor: 'black',
        borderWidth: 2,
        data: undefined,
        label: 'Basic treemap',
        labels: {
          align: 'right',
          display: true,
          padding: 25,
          position: 'bottom',
        },
        spacing: 1,
        tree: [15, 6, 6, 5, 4, 3, 2, 2],
      },
    ],
  },
  type: 'treemap',
})

const statsByState = [
  {
    area: 135767,
    code: 'AL',
    division: 'East South Central',
    income: 48123,
    population: 4887871,
    region: 'South',
    state: 'Alabama',
  },
  {
    area: 1723337,
    code: 'AK',
    division: 'Pacific',
    income: 73181,
    population: 737438,
    region: 'West',
    state: 'Alaska',
  },
]

const _chart2 = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(ctx) {
          const item = ctx.dataset.data[ctx.dataIndex]
          if (!item) {
            return 'black'
          }
          const a = item.v / (item.gs || item.s) / 2 + 0.5
          switch (item.l) {
            case 0:
              switch (item.g) {
                case 'Midwest':
                  return '#4363d8'
                case 'Northeast':
                  return '#469990'
                case 'South':
                  return '#9A6324'
                case 'West':
                  return '#f58231'
                default:
                  return '#e6beff'
              }
            case 1:
              return colorLib('white').alpha(0.3).rgbString()
            default:
              return colorLib('green').alpha(a).rgbString()
          }
        },
        borderColor: 'rgba(160,160,160,0.5)',
        borderWidth: 0.5,
        captions: {
          color: '#FFF',
          font: {
            family: 'Tahoma',
            size: 8,
            weight: 'bold',
          },
          hoverColor: '#F0B90B',
          hoverFont: {
            family: 'Tahoma',
            size: 8,
            weight: 'bold',
          },
        },
        data: [],
        groups: ['region', 'division', 'code'],
        key: 'population',
        spacing: 2,
        tree: statsByState,
      },
    ],
  },
  type: 'treemap',
})

const _chart3 = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(ctx) {
          const item = ctx.dataset.data[ctx.dataIndex]
          if (!item) {
            return 'black'
          }
          const a = item.v / (item.gs || item.s) / 2 + 0.5
          switch (item.l) {
            case 0:
              return '#e6beff'
            case 1:
              return colorLib('white').alpha(0.3).rgbString()
            default:
              return colorLib('green').alpha(a).rgbString()
          }
        },
        borderColor: 'rgba(255,255,255)',
        borderWidth: 0.5,
        captions: {
          display: false,
        },
        data: [],
        groups: ['region', 'division', 'code'],
        key: 'population',
        labels: {
          color: '#FFF',
          display: false,
          font: {
            family: 'Tahoma',
            size: 8,
            weight: 'bold',
          },
          hoverColor: '#F0B90B',
          hoverFont: {
            family: 'Tahoma',
            size: 8,
            weight: 'bold',
          },
        },
        tree: statsByState,
      },
    ],
  },
  type: 'treemap',
})

const _chart4 = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(_ctx) {
          return '#e6beff'
        },
        data: [],
        dividers: {
          display: false,
          lineDash: [1, 3],
          lineWidth: 12,
        },
        groups: ['region', 'division', 'code'],
        key: 'population',
        labels: {
          display: false,
        },
        tree: statsByState,
      },
    ],
  },
  type: 'treemap',
})

const _chart5 = new Chart('test', {
  data: {
    datasets: [
      {
        backgroundColor(_ctx) {
          return '#e6beff'
        },
        data: [],
        groups: ['region', 'division', 'code'],
        key: 'population',
        labels: {
          color: ['red', 'green'],
          display: false,
          font: [{ size: 24 }, { size: 12 }],
        },
        tree: statsByState,
      },
    ],
  },
  type: 'treemap',
})
