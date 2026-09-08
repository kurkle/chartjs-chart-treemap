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
  /** Where the block sits inside the padded rect. */
  align: CanvasTextAlign
  /** Vertical clip inset. Zero where the box was sized to hold the text. */
  clipY: number
  colors: Color[]
  fonts: Font[]
  lines: string[]
  padding: number
  /** Paragraph each line belongs to, which is what indexes fonts and colours. */
  styles: number[]
  /** How each line sits inside the block. Follows `align` when undefined. */
  textAlign: CanvasTextAlign | undefined
  top: number
  /** Width of the widest line, which is the block's own width. */
  width: number
}

// Capped so a chart with many distinct labels cannot grow it without bound.
const WIDTH_CACHE_LIMIT = 4096
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
  const { align, colors, fonts, lines, padding, styles, textAlign, top, width } = block
  // `align` places the block in the rect, `textAlign` places each line in the
  // block. When they agree, which is the default, this is the same arithmetic
  // v4 did with a single x.
  const lineAlign = textAlign || align
  const x = calculateLineX(rect, align, lineAlign, padding, width)
  ctx.textAlign = lineAlign
  ctx.textBaseline = 'middle'
  let offset = 0
  lines.forEach((line, i) => {
    const style = styles[i]
    const font = fontFor(fonts, style)
    ctx.font = font.string
    ctx.fillStyle = colors[Math.min(style, colors.length - 1)]
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
  if (measureLabelSize(ctx, [text], fonts).width + 2 * padding <= rect.w) {
    return text
  }
  // `ellipsis` is the default and is what v4 always did; the other modes leave
  // the clip to tell the whole story.
  const overflow = captions.overflow || 'ellipsis'
  if (overflow === 'hidden') {
    return undefined
  }
  if (overflow === 'cut') {
    return text
  }
  return sliceTextToFitWidth(ctx, text, rect.w - 2 * padding, fonts)
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
    styles: [0],
    textAlign: captions.textAlign,
    top,
    width: measureLabelSize(ctx, [text], fonts).width,
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
  const { align, color, hoverColor, overflow, padding, wrap } = labels
  const maxWidth = rect.w - padding * 2
  const maxHeight = rect.h - padding * 2

  let fonts = getFontFromOptions(rect, labels)
  let { lines, styles } = toLines(ctx, content, fonts, maxWidth, !!wrap)
  let labelSize = measureLines(ctx, lines, styles, fonts)

  const lblToDraw = labelToDraw(rect, labels, labelSize)
  if (!lblToDraw) {
    return
  }
  if (isNumber(lblToDraw)) {
    fonts = toFonts(fonts, lblToDraw)
    if (wrap) {
      // Shorter lines pack into fewer rows, so wrap once more at the smaller
      // size rather than iterating towards a fixed point.
      const rewrapped = toLines(ctx, content, fonts, maxWidth, true)
      lines = rewrapped.lines
      styles = rewrapped.styles
      labelSize = measureLines(ctx, lines, styles, fonts)
    } else {
      labelSize = { height: labelSize.height * lblToDraw, width: labelSize.width * lblToDraw }
    }
  }

  if (overflow === 'ellipsis') {
    const trimmed = applyEllipsis(ctx, lines, styles, fonts, maxWidth, maxHeight)
    lines = trimmed.lines
    styles = trimmed.styles
    labelSize = measureLines(ctx, lines, styles, fonts)
  }

  const optColor = (rect.active ? hoverColor : color) || color
  return {
    align,
    clipY: padding,
    colors: isArray(optColor) ? optColor : [optColor],
    fonts,
    lines,
    padding,
    styles,
    textAlign: labels.textAlign,
    top: calculateBlockTop(rect, labels, labelSize),
    width: labelSize.width,
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

const fontFor = (fonts: Font[], index: number) => fonts[Math.min(index, fonts.length - 1)]

/**
 * Breaks one piece of text to `width`, greedily on spaces. A single word wider
 * than the width is broken by character, because leaving it to overflow would
 * defeat the point of asking for wrapping.
 */
function wrapToWidth(ctx: CanvasRenderingContext2D, text: string, font: Font, width: number) {
  if (width <= 0) {
    return [text]
  }
  const fits = (value: string) => measureLabelSize(ctx, [value], [font]).width <= width
  const lines: string[] = []
  let line = ''

  const pushWord = (word: string) => {
    if (fits(word)) {
      line = word
      return
    }
    let chunk = ''
    for (const char of word) {
      if (chunk && !fits(chunk + char)) {
        lines.push(chunk)
        chunk = ''
      }
      chunk += char
    }
    line = chunk
  }

  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (fits(candidate)) {
      line = candidate
      continue
    }
    if (line) {
      lines.push(line)
      line = ''
    }
    pushWord(word)
  }
  if (line) {
    lines.push(line)
  }
  return lines.length ? lines : ['']
}

/**
 * Formatter output as drawable lines.
 *
 * An array is one paragraph per entry and a string breaks on newlines, which
 * canvas would otherwise draw as a stray glyph. Colours and fonts are indexed
 * by paragraph, so a wrapped paragraph keeps one style throughout.
 */
function toLines(
  ctx: CanvasRenderingContext2D,
  content: string | string[],
  fonts: Font[],
  width: number,
  wrap: boolean
) {
  const paragraphs = (isArray(content) ? content : [content]).map((entry) => `${entry}`)
  const lines: string[] = []
  const styles: number[] = []

  paragraphs.forEach((paragraph, index) => {
    const font = fontFor(fonts, index)
    for (const piece of paragraph.split('\n')) {
      for (const line of wrap ? wrapToWidth(ctx, piece, font, width) : [piece]) {
        lines.push(line)
        styles.push(index)
      }
    }
  })
  return { lines, styles }
}

/** Measures a set of lines whose fonts are indexed by paragraph. */
function measureLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  styles: number[],
  fonts: Font[]
): LabelSize {
  let width = 0
  let height = 0
  lines.forEach((line, i) => {
    const font = fontFor(fonts, styles[i])
    width = Math.max(width, measureLabelSize(ctx, [line], [font]).width)
    height += font.lineHeight
  })
  return { height, width }
}

/**
 * Keeps as many whole lines as fit, and marks the truncation with an ellipsis:
 * on any line too wide for the box, and on the last line kept when there were
 * more below it.
 */
function applyEllipsis(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  styles: number[],
  fonts: Font[],
  maxWidth: number,
  maxHeight: number
) {
  const keptLines: string[] = []
  const keptStyles: number[] = []
  let used = 0
  for (let i = 0; i < lines.length; i++) {
    const font = fontFor(fonts, styles[i])
    if (keptLines.length && used + font.lineHeight > maxHeight) {
      break
    }
    used += font.lineHeight
    keptLines.push(lines[i])
    keptStyles.push(styles[i])
  }

  const dropped = keptLines.length < lines.length
  const last = keptLines.length - 1
  for (let i = 0; i < keptLines.length; i++) {
    const font = fontFor(fonts, keptStyles[i])
    const tooWide = measureLabelSize(ctx, [keptLines[i]], [font]).width > maxWidth
    if (tooWide || (dropped && i === last)) {
      keptLines[i] = sliceTextToFitWidth(ctx, keptLines[i], maxWidth, [font])
    }
  }
  return { lines: keptLines, styles: keptStyles }
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
    if (widthCache.size >= WIDTH_CACHE_LIMIT) {
      widthCache.clear()
    }
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

/** The block's left edge inside the padded rect. */
function calculateBlockLeft(
  rect: DrawRect,
  align: CanvasTextAlign,
  padding: number,
  width: number
) {
  if (align === 'left') {
    return rect.x + padding
  }
  if (align === 'right') {
    return rect.x + rect.w - padding - width
  }
  return rect.x + (rect.w - width) / 2
}

/**
 * The x every line is drawn at, given the canvas `textAlign` that will be in
 * effect. When the two alignments agree this reduces to v4's single x, so the
 * default output is unchanged.
 */
function calculateLineX(
  rect: DrawRect,
  align: CanvasTextAlign,
  lineAlign: CanvasTextAlign,
  padding: number,
  width: number
) {
  if (align === lineAlign) {
    if (align === 'left') {
      return rect.x + padding
    }
    if (align === 'right') {
      return rect.x + rect.w - padding
    }
    return rect.x + rect.w / 2
  }
  const left = calculateBlockLeft(rect, align, padding, width)
  if (lineAlign === 'left') {
    return left
  }
  if (lineAlign === 'right') {
    return left + width
  }
  return left + width / 2
}
