import type { Element } from 'chart.js'
import type { DrawRect } from './geometry'
import type {
  TreemapCaptionsOptions,
  TreemapConfig,
  TreemapDataPoint,
  TreemapDisplayMode,
  TreemapLabelsOptions,
  TreemapOptions,
  TreemapScriptableContext,
} from './types'

import { defined, isArray, isNumber, toFont, valueOrDefault } from 'chart.js/helpers'

type RectSize = {
  h: number
  w: number
}

type RectHeight = {
  h: number
}

type LabelSize = {
  height: number
  width: number
}

type Font = ReturnType<typeof toFont>

type TextElement = Element<TreemapConfig, TreemapOptions> & {
  $context?: TreemapScriptableContext
}

const widthCache = new Map<string, LabelSize>()

export function shouldDrawCaption(
  displayMode: TreemapDisplayMode,
  rect: RectSize,
  options?: Partial<TreemapCaptionsOptions>
) {
  if (!options || options.display === false) {
    return false
  }
  if (displayMode === 'headerBoxes') {
    return true
  }
  const { w, h } = rect
  const font = toFont(options.font || {})
  const min = font.lineHeight
  const padding = Math.max(Math.min(valueOrDefault(options.padding, 3) * 2, Math.min(w, h)), 0)
  return w - padding > min && h - padding > min
}

export function getCaptionHeight(
  displayMode: TreemapDisplayMode,
  rect: RectHeight,
  font: { lineHeight: number },
  padding: number
) {
  if (displayMode !== 'headerBoxes') {
    return font.lineHeight + padding * 2
  }
  const captionHeight = font.lineHeight + padding * 2
  return rect.h < 2 * captionHeight ? rect.h / 3 : captionHeight
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint,
  element: TextElement
) {
  const { captions, labels, displayMode } = options
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.clip()
  const isLeaf = item && (!defined(item.l) || item.isLeaf)
  if (isLeaf && labels.display) {
    drawLabel(ctx, rect, options, item, element)
  } else if (!isLeaf && shouldDrawCaption(displayMode, rect, captions)) {
    drawCaption(ctx, rect, options, item, element)
  }
  ctx.restore()
}

function callbackContext(element: TextElement, item: TreemapDataPoint): TreemapScriptableContext {
  const context =
    element.$context ||
    ({ active: !!element.active, raw: item, type: 'data' } as TreemapScriptableContext)
  context.active = !!element.active
  context.raw = item
  return context
}

function resolveOption<T>(
  option: T | ((context: TreemapScriptableContext) => T) | undefined,
  context: TreemapScriptableContext
) {
  return typeof option === 'function'
    ? (option as (context: TreemapScriptableContext) => T)(context)
    : option
}

function resolveCaptionText(
  captions: TreemapCaptionsOptions,
  element: TextElement,
  item: TreemapDataPoint
) {
  return resolveOption(captions.formatter, callbackContext(element, item)) || item.g || ''
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint,
  element: TextElement
) {
  const { captions, spacing, rtl, displayMode } = options
  const { color, hoverColor, font, hoverFont, padding, align } = captions
  const oColor = (rect.active ? hoverColor : color) || color
  const oAlign = align || (rtl ? 'right' : 'left')
  const optFont = (rect.active ? hoverFont : font) || font
  const oFont = toFont(optFont)
  const fonts = [oFont]
  if (oFont.lineHeight > rect.h) {
    return
  }
  let text = resolveCaptionText(captions, element, item)
  if (!text) {
    return
  }
  const captionSize = measureLabelSize(ctx, [text], fonts)
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
  fonts: Font[]
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
  fonts: Font[]
) {
  const fontsKey = fonts.reduce((prev, item) => {
    prev += item.string
    return prev
  }, '')
  const mapKey = lines.join() + fontsKey + (ctx._measureText ? '-spriting' : '')
  let size = widthCache.get(mapKey)
  if (!size) {
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
    size = { height, width }
    widthCache.set(mapKey, size)
  }
  return size
}

function toFonts(fonts: Font[], fitRatio: number) {
  return fonts.map((f) => {
    const { lineHeight: _lineHeight, ...font } = f
    return toFont({ ...font, size: Math.floor(f.size * fitRatio) })
  })
}

function labelToDraw(
  _ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapLabelsOptions,
  labelSize: LabelSize
) {
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

function getFontFromOptions(rect: DrawRect, labels: TreemapLabelsOptions) {
  const { font, hoverFont } = labels
  const optFont = (rect.active ? hoverFont : font) || font
  return Array.isArray(optFont) ? optFont.map((f) => toFont(f)) : [toFont(optFont)]
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint,
  element: TextElement
) {
  const labels = options.labels
  const content = resolveOption(labels.formatter, callbackContext(element, item))
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

export function drawDivider(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint
) {
  const dividers = options.dividers
  const children = item._data?.children
  if (!dividers.display || !Array.isArray(children) || !children.length) {
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

function calculateXYLabel(rect: DrawRect, options: TreemapLabelsOptions, labelSize: LabelSize) {
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

function calculateX(rect: DrawRect, align: CanvasTextAlign, padding: number) {
  if (align === 'left') {
    return rect.x + padding
  } else if (align === 'right') {
    return rect.x + rect.w - padding
  }
  return rect.x + rect.w / 2
}
