import { Element } from 'chart.js'
import {
  addRoundedRectPath,
  defined,
  isArray,
  isNumber,
  toFont,
  toTRBL,
  toTRBLCorners,
  valueOrDefault,
} from 'chart.js/helpers'

const widthCache = new Map()

/**
 * Helper function to get the bounds of the rect
 * @param {TreemapElement} rect the rect
 * @param {boolean} [useFinalPosition]
 * @return {object} bounds of the rect
 * @private
 */
function getBounds(rect: any, useFinalPosition?: boolean) {
  const { x, y, width, height } = rect.getProps(['x', 'y', 'width', 'height'], useFinalPosition)
  return { bottom: y + height, left: x, right: x + width, top: y }
}

function limit(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min)
}

export function parseBorderWidth(value: any, maxW: number, maxH: number) {
  const o = toTRBL(value)

  return {
    b: limit(o.bottom, 0, maxH),
    l: limit(o.left, 0, maxW),
    r: limit(o.right, 0, maxW),
    t: limit(o.top, 0, maxH),
  }
}

function parseBorderRadius(value: any, maxW: number, maxH: number) {
  const o = toTRBLCorners(value)
  const maxR = Math.min(maxW, maxH)

  return {
    bottomLeft: limit(o.bottomLeft, 0, maxR),
    bottomRight: limit(o.bottomRight, 0, maxR),
    topLeft: limit(o.topLeft, 0, maxR),
    topRight: limit(o.topRight, 0, maxR),
  }
}

function boundingRects(rect: any) {
  const bounds = getBounds(rect)
  const width = bounds.right - bounds.left
  const height = bounds.bottom - bounds.top
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2)
  const radius = parseBorderRadius(rect.options.borderRadius, width / 2, height / 2)
  const outer = {
    active: rect.active,
    h: height,
    radius,
    w: width,
    x: bounds.left,
    y: bounds.top,
  }

  return {
    inner: {
      active: rect.active,
      h: outer.h - border.t - border.b,
      radius: {
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)),
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
      },
      w: outer.w - border.l - border.r,
      x: outer.x + border.l,
      y: outer.y + border.t,
    },
    outer,
  }
}

function inRange(rect: any, x: number | null, y: number | null, useFinalPosition?: boolean) {
  const skipX = x === null
  const skipY = y === null
  const bounds = !rect || (skipX && skipY) ? false : getBounds(rect, useFinalPosition)

  return (
    bounds &&
    (skipX || (x >= bounds.left && x <= bounds.right)) &&
    (skipY || (y >= bounds.top && y <= bounds.bottom))
  )
}

function hasRadius(radius: any) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight
}

/**
 * Add a path of a rectangle to the current sub-path
 * @param {CanvasRenderingContext2D} ctx Context
 * @param {*} rect Bounding rect
 */
function addNormalRectPath(ctx: CanvasRenderingContext2D, rect: any) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
}

export function shouldDrawCaption(displayMode: any, rect: any, options: any) {
  if (!options || options.display === false) {
    return false
  }
  if (displayMode === 'headerBoxes') {
    return true
  }
  const { w, h } = rect
  const font = toFont(options.font)
  const min = font.lineHeight
  const padding = limit(valueOrDefault(options.padding, 3) * 2, 0, Math.min(w, h))
  return w - padding > min && h - padding > min
}

export function getCaptionHeight(displayMode: any, rect: any, font: any, padding: number) {
  if (displayMode !== 'headerBoxes') {
    return font.lineHeight + padding * 2
  }
  const captionHeight = font.lineHeight + padding * 2
  return rect.h < 2 * captionHeight ? rect.h / 3 : captionHeight
}

function drawText(ctx: CanvasRenderingContext2D, rect: any, options: any, item: any) {
  const { captions, labels, displayMode } = options
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.clip()
  const isLeaf = item && (!defined(item.l) || item.isLeaf)
  if (isLeaf && labels.display) {
    drawLabel(ctx, rect, options)
  } else if (!isLeaf && shouldDrawCaption(displayMode, rect, captions)) {
    drawCaption(ctx, rect, options, item)
  }
  ctx.restore()
}

function drawCaption(ctx: CanvasRenderingContext2D, rect: any, options: any, item: any) {
  const { captions, spacing, rtl, displayMode } = options
  const { color, hoverColor, font, hoverFont, padding, align, formatter } = captions
  const oColor = (rect.active ? hoverColor : color) || color
  const oAlign = align || (rtl ? 'right' : 'left')
  const optFont = (rect.active ? hoverFont : font) || font
  const oFont = toFont(optFont)
  const fonts = [oFont]
  if (oFont.lineHeight > rect.h) {
    return
  }
  let text = formatter || item.g
  const captionSize = measureLabelSize(ctx, [formatter], fonts)
  if (captionSize.width + 2 * padding > rect.w) {
    text = sliceTextToFitWidth(ctx, text, rect.w - 2 * padding, fonts)
  }

  const lh = oFont.lineHeight / 2
  const x = calculateX(rect, oAlign, padding)
  ctx.fillStyle = oColor
  ctx.font = oFont.string
  ctx.textAlign = oAlign
  ctx.textBaseline = 'middle'
  const y = displayMode === 'headerBoxes' ? rect.y + rect.h / 2 : rect.y + padding + spacing + lh
  ctx.fillText(text, x, y)
}

function sliceTextToFitWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  fonts: any[]
) {
  const ellipsis = '...'
  const ellipsisWidth = measureLabelSize(ctx, [ellipsis], fonts).width
  if (ellipsisWidth >= width) {
    return ''
  }
  let lowerBoundLen = 1
  let upperBoundLen = text.length
  let currentWidth: number
  while (lowerBoundLen <= upperBoundLen) {
    const currentLen = Math.floor((lowerBoundLen + upperBoundLen) / 2)
    const currentText = text.slice(0, currentLen)
    currentWidth = measureLabelSize(ctx, [currentText], fonts).width
    if (currentWidth + ellipsisWidth > width) {
      upperBoundLen = currentLen - 1
    } else {
      lowerBoundLen = currentLen + 1
    }
  }
  const slicedText = text.slice(0, Math.max(0, lowerBoundLen - 1))
  return slicedText ? slicedText + ellipsis : ''
}

function measureLabelSize(
  ctx: CanvasRenderingContext2D & { _measureText?: unknown },
  lines: string[],
  fonts: any[]
) {
  const fontsKey = fonts.reduce((prev, item) => {
    prev += item.string
    return prev
  }, '')
  const mapKey = lines.join() + fontsKey + (ctx._measureText ? '-spriting' : '')
  if (!widthCache.has(mapKey)) {
    ctx.save()
    const count = lines.length
    let width = 0
    let height = 0
    for (let i = 0; i < count; i++) {
      const font = fonts[Math.min(i, fonts.length - 1)]
      ctx.font = font.string
      const text = lines[i]
      width = Math.max(width, ctx.measureText(text).width)
      height += font.lineHeight
    }
    ctx.restore()
    widthCache.set(mapKey, { height, width })
  }
  return widthCache.get(mapKey)
}

function toFonts(fonts: any[], fitRatio: number) {
  return fonts.map((f) => {
    f.size = Math.floor(f.size * fitRatio)
    f.lineHeight = undefined
    return toFont(f)
  })
}

function labelToDraw(_ctx: CanvasRenderingContext2D, rect: any, options: any, labelSize: any) {
  const { overflow, padding } = options
  const { width, height } = labelSize
  if (overflow === 'hidden') {
    return !(width + padding * 2 > rect.w || height + padding * 2 > rect.h)
  } else if (overflow === 'fit') {
    const ratio = Math.min(rect.w / (width + padding * 2), rect.h / (height + padding * 2))
    if (ratio < 1) {
      return ratio
    }
  }
  return true
}

function getFontFromOptions(rect: any, labels: any) {
  const { font, hoverFont } = labels
  const optFont = (rect.active ? hoverFont : font) || font
  return isArray(optFont) ? optFont.map((f) => toFont(f)) : [toFont(optFont)]
}

function drawLabel(ctx: CanvasRenderingContext2D, rect: any, options: any) {
  const labels = options.labels
  const content = labels.formatter
  if (!content) {
    return
  }
  const contents = isArray(content) ? content : [content]
  let fonts = getFontFromOptions(rect, labels)
  let labelSize = measureLabelSize(ctx, contents, fonts)
  const lblToDraw = labelToDraw(ctx, rect, labels, labelSize)
  if (!lblToDraw) {
    return
  }
  if (isNumber(lblToDraw)) {
    labelSize = { height: labelSize.height * lblToDraw, width: labelSize.width * lblToDraw }
    fonts = toFonts(fonts, lblToDraw)
  }
  const { color, hoverColor, align } = labels
  const optColor = (rect.active ? hoverColor : color) || color
  const colors = isArray(optColor) ? optColor : [optColor]
  const xyPoint = calculateXYLabel(rect, labels, labelSize)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  let lhs = 0
  contents.forEach((l, i) => {
    const c = colors[Math.min(i, colors.length - 1)]
    const f = fonts[Math.min(i, fonts.length - 1)]
    const lh = f.lineHeight
    ctx.font = f.string
    ctx.fillStyle = c
    ctx.fillText(l, xyPoint.x, xyPoint.y + lh / 2 + lhs)
    lhs += lh
  })
}

function drawDivider(ctx: CanvasRenderingContext2D, rect: any, options: any, item: any) {
  const dividers = options.dividers
  if (!dividers.display || !item._data.children.length) {
    return
  }
  const { x, y, w, h } = rect
  const { lineColor, lineCapStyle, lineDash, lineDashOffset, lineWidth } = dividers
  ctx.save()
  ctx.strokeStyle = lineColor
  ctx.lineCap = lineCapStyle
  ctx.setLineDash(lineDash)
  ctx.lineDashOffset = lineDashOffset
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  if (w > h) {
    const w2 = w / 2
    ctx.moveTo(x + w2, y)
    ctx.lineTo(x + w2, y + h)
  } else {
    const h2 = h / 2
    ctx.moveTo(x, y + h2)
    ctx.lineTo(x + w, y + h2)
  }
  ctx.stroke()
  ctx.restore()
}

function calculateXYLabel(rect: any, options: any, labelSize: any) {
  const { align, position, padding } = options
  const x = calculateX(rect, align, padding)
  let y: number
  if (position === 'top') {
    y = rect.y + padding
  } else if (position === 'bottom') {
    y = rect.y + rect.h - padding - labelSize.height
  } else {
    y = rect.y + (rect.h - labelSize.height) / 2 + padding
  }
  return { x, y }
}

function calculateX(rect: any, align: CanvasTextAlign, padding: number) {
  if (align === 'left') {
    return rect.x + padding
  } else if (align === 'right') {
    return rect.x + rect.w - padding
  }
  return rect.x + rect.w / 2
}

export default class TreemapElement extends Element {
  declare options: any
  width: number
  height: number

  constructor(cfg?: any) {
    super()

    this.options = undefined
    this.width = undefined
    this.height = undefined

    if (cfg) {
      Object.assign(this, cfg)
    }
  }

  draw(ctx: CanvasRenderingContext2D, data: any) {
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
    drawText(ctx, inner, options, data)
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

  tooltipPosition() {
    return this.getCenterPoint()
  }
}

;(TreemapElement as any).id = 'treemap'

;(TreemapElement as any).defaults = {
  borderRadius: 0,
  borderWidth: 0,
  captions: {
    align: undefined,
    color: 'black',
    display: true,
    font: {},
    formatter: (ctx: any) => ctx.raw.g || ctx.raw._data.label || '',
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
    formatter(ctx: any) {
      if (ctx.raw.g) {
        return [ctx.raw.g, `${ctx.raw.v}`]
      }
      return ctx.raw._data.label ? [ctx.raw._data.label, `${ctx.raw.v}`] : `${ctx.raw.v}`
    },
    overflow: 'cut',
    padding: 3,
    position: 'middle',
  },
  rtl: false,
  spacing: 0.5,
  unsorted: false,
}

;(TreemapElement as any).descriptors = {
  _indexable: false,
  _scriptable: true,
  captions: {
    _fallback: true,
  },
  labels: {
    _fallback: true,
  },
}

;(TreemapElement as any).defaultRoutes = {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor',
}
