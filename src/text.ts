import type { Color, Element } from 'chart.js'
import type { DrawRect } from './geometry'
import type {
  TreemapCaptionsOptions,
  TreemapConfig,
  TreemapDataPoint,
  TreemapDisplayMode,
  TreemapLabelsOptions,
  TreemapLayoutOptions,
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

/**
 * One block of text ready to draw: the lines, the styles they are drawn with,
 * and where the block's top edge sits. Captions and labels differ only in how
 * they arrive at this, which is why they can share the drawing code.
 */
type TextBlock = {
  align: CanvasTextAlign
  /** Vertical clip inset. Zero where the box was sized to hold the text. */
  clipY: number
  colors: Color[]
  fonts: Font[]
  lines: string[]
  padding: number
  top: number
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
  element: TextElement,
  layout: TreemapLayoutOptions
) {
  const { captions, labels } = options
  const { displayMode } = layout
  const isLeaf = item && (!defined(item.l) || item.isLeaf)

  // Resolve the text before touching the canvas. Most elements in a large
  // treemap draw no text at all, and clipping is not free: this is the
  // difference between five canvas calls per element and none.
  let block: TextBlock | undefined
  if (isLeaf) {
    if (labels.display) {
      block = labelBlock(ctx, rect, options, item, element)
    }
  } else if (shouldDrawCaption(displayMode, rect, captions)) {
    block = captionBlock(ctx, rect, options, item, element, layout)
  }
  if (!block) {
    return
  }

  ctx.save()
  clipToPadding(ctx, rect, block.padding, block.clipY)
  drawTextBlock(ctx, rect, block)
  ctx.restore()
}

/**
 * Text is clipped at the padding, not at the element's border (#135).
 * `overflow: 'cut'` used to run into the padding region, which made the padding
 * mean one thing for placement and nothing for clipping.
 *
 * The vertical inset is separate because a headerBoxes caption sits in a strip
 * whose height was derived from that caption's own line height. There is no
 * vertical overflow to prevent there, and insetting would slice the glyphs of
 * any font whose ascender and descender exceed its line height.
 */
function clipToPadding(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  padding: number,
  clipY: number
) {
  const x = Math.max(0, padding)
  const y = Math.max(0, clipY)
  ctx.beginPath()
  ctx.rect(rect.x + x, rect.y + y, Math.max(0, rect.w - 2 * x), Math.max(0, rect.h - 2 * y))
  ctx.clip()
}

function drawTextBlock(ctx: CanvasRenderingContext2D, rect: DrawRect, block: TextBlock) {
  const { align, colors, fonts, lines, padding, top } = block
  const x = calculateX(rect, align, padding)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  let offset = 0
  lines.forEach((line, i) => {
    const font = fonts[Math.min(i, fonts.length - 1)]
    ctx.font = font.string
    ctx.fillStyle = colors[Math.min(i, colors.length - 1)]
    ctx.fillText(line, x, top + offset + font.lineHeight / 2)
    offset += font.lineHeight
  })
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

/** The caption's text, truncated with an ellipsis when it does not fit. */
function captionText(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  captions: TreemapCaptionsOptions,
  element: TextElement,
  item: TreemapDataPoint,
  fonts: Font[]
) {
  const text = resolveCaptionText(captions, element, item)
  if (!text) {
    return undefined
  }
  const padding = captions.padding
  if (measureLabelSize(ctx, [text], fonts).width + 2 * padding > rect.w) {
    return sliceTextToFitWidth(ctx, text, rect.w - 2 * padding, fonts)
  }
  return text
}

function captionBlock(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint,
  element: TextElement,
  layout: TreemapLayoutOptions
): TextBlock | undefined {
  const { displayMode, rtl, spacing } = layout
  const { captions } = options
  const { color, hoverColor, font, hoverFont, padding, align } = captions
  const optFont = (rect.active ? hoverFont : font) || font
  const oFont = toFont(optFont)
  if (oFont.lineHeight > rect.h) {
    return
  }
  const text = captionText(ctx, rect, captions, element, item, [oFont])
  if (text === undefined) {
    return
  }
  const fonts = [oFont]
  // A caption is a single line, centred in the header strip in headerBoxes mode
  // and sitting under the top padding otherwise.
  const top =
    displayMode === 'headerBoxes'
      ? rect.y + (rect.h - oFont.lineHeight) / 2
      : rect.y + padding + spacing
  return {
    align: align || (rtl ? 'right' : 'left'),
    clipY: displayMode === 'headerBoxes' ? 0 : padding,
    colors: [(rect.active ? hoverColor : color) || color],
    fonts,
    lines: [text],
    padding,
    top,
  }
}

function labelBlock(
  ctx: CanvasRenderingContext2D,
  rect: DrawRect,
  options: TreemapOptions,
  item: TreemapDataPoint,
  element: TextElement
): TextBlock | undefined {
  const labels = options.labels
  const content = resolveOption(labels.formatter, callbackContext(element, item))
  if (!content) {
    return
  }
  const lines = isArray(content) ? content : [content]
  let fonts = getFontFromOptions(rect, labels)
  let labelSize = measureLabelSize(ctx, lines, fonts)
  const lblToDraw = labelToDraw(rect, labels, labelSize)
  if (!lblToDraw) {
    return
  }
  if (isNumber(lblToDraw)) {
    labelSize = { height: labelSize.height * lblToDraw, width: labelSize.width * lblToDraw }
    fonts = toFonts(fonts, lblToDraw)
  }
  const { color, hoverColor, align, padding } = labels
  const optColor = (rect.active ? hoverColor : color) || color
  return {
    align,
    clipY: padding,
    colors: isArray(optColor) ? optColor : [optColor],
    fonts,
    lines,
    padding,
    top: calculateBlockTop(rect, labels, labelSize),
  }
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

function labelToDraw(rect: DrawRect, options: TreemapLabelsOptions, labelSize: LabelSize) {
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

function calculateBlockTop(rect: DrawRect, options: TreemapLabelsOptions, labelSize: LabelSize) {
  const { position, padding } = options
  if (position === 'top') {
    return rect.y + padding
  }
  if (position === 'bottom') {
    return rect.y + rect.h - padding - labelSize.height
  }
  return rect.y + (rect.h - labelSize.height) / 2 + padding
}

function calculateX(rect: DrawRect, align: CanvasTextAlign, padding: number) {
  if (align === 'left') {
    return rect.x + padding
  } else if (align === 'right') {
    return rect.x + rect.w - padding
  }
  return rect.x + rect.w / 2
}
