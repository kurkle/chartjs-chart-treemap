import type {
  TreemapConfig,
  TreemapDataPoint,
  TreemapOptions,
  TreemapScriptableContext,
} from './types'

import { Element } from 'chart.js'
import { addRoundedRectPath } from 'chart.js/helpers'

import { addNormalRectPath, boundingRects, hasRadius, inRange } from './geometry'
import { drawDivider, drawText } from './text'

export default class TreemapElement extends Element<TreemapConfig, TreemapOptions> {
  static readonly id = 'treemap'

  static override readonly defaults = {
    borderRadius: 0,
    borderWidth: 0,
    captions: {
      align: undefined,
      color: 'black',
      display: true,
      font: {},
      formatter: (ctx: TreemapScriptableContext) => {
        const label = ctx.raw._data?.label
        return ctx.raw.g || (typeof label === 'string' ? label : '')
      },
      padding: 3,
    },
    displayMode: 'containerBoxes',
    dividers: {
      display: false,
      lineCapStyle: 'butt',
      lineColor: 'black',
      lineDash: [],
      lineDashOffset: 0,
      lineWidth: 1,
    },
    label: undefined,
    labels: {
      align: 'center',
      color: 'black',
      display: false,
      font: {},
      formatter(ctx: TreemapScriptableContext) {
        const label = ctx.raw._data?.label
        if (ctx.raw.g) {
          return [ctx.raw.g, `${ctx.raw.v}`]
        }
        return typeof label === 'string' ? [label, `${ctx.raw.v}`] : `${ctx.raw.v}`
      },
      overflow: 'cut',
      padding: 3,
      position: 'middle',
    },
    rtl: false,
    spacing: 0.5,
    unsorted: false,
  }

  static readonly descriptors = {
    _indexable: false,
    _scriptable: true,
    captions: {
      _fallback: true,
      _scriptable: (name: string) => name !== 'formatter',
    },
    labels: {
      _fallback: true,
      _scriptable: (name: string) => name !== 'formatter',
    },
  }

  static override readonly defaultRoutes = {
    backgroundColor: 'backgroundColor',
    borderColor: 'borderColor',
  }

  $context?: TreemapScriptableContext
  width: number | undefined
  height: number | undefined

  constructor(cfg?: Partial<TreemapConfig> & { options?: TreemapOptions }) {
    super()

    this.width = undefined
    this.height = undefined

    if (cfg) {
      Object.assign(this, cfg)
    }
  }

  draw(ctx: CanvasRenderingContext2D, data?: TreemapDataPoint) {
    if (!data) {
      return
    }
    const options = this.options
    const { inner, outer } = boundingRects(this)
    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath

    ctx.save()

    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath()
      addRectPath(ctx, outer)
      ctx.clip()
      addRectPath(ctx, inner)
      ctx.fillStyle = options.borderColor
      ctx.fill('evenodd')
    }

    ctx.beginPath()
    addRectPath(ctx, inner)
    ctx.fillStyle = options.backgroundColor
    ctx.fill()

    drawDivider(ctx, inner, options, data)
    drawText(ctx, inner, options, data, this)
    ctx.restore()
  }

  inRange(mouseX: number, mouseY: number, useFinalPosition?: boolean) {
    return inRange(this, mouseX, mouseY, useFinalPosition)
  }

  inXRange(mouseX: number, useFinalPosition?: boolean) {
    return inRange(this, mouseX, null, useFinalPosition)
  }

  inYRange(mouseY: number, useFinalPosition?: boolean) {
    return inRange(this, null, mouseY, useFinalPosition)
  }

  getCenterPoint(useFinalPosition?: boolean) {
    const { x, y, width, height } = this.getProps(['x', 'y', 'width', 'height'], useFinalPosition)
    return {
      x: x + width / 2,
      y: y + height / 2,
    }
  }

  override tooltipPosition() {
    return this.getCenterPoint()
  }
}
