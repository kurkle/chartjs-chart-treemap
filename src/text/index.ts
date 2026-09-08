import type { Element } from 'chart.js'
import type { DrawRect } from '../geometry'
import type {
  TreemapCaptionsOptions,
  TreemapConfig,
  TreemapDataPoint,
  TreemapDisplayMode,
  TreemapLabelsOptions,
  TreemapLayoutOptions,
  TreemapOptions,
  TreemapScriptableContext,
} from '../types'
import type { TextBlock } from './draw'
import type { Font } from './measure'

import { defined, isArray, isNumber, toFont, valueOrDefault } from 'chart.js/helpers'

import { calculateBlockTop, clipToPadding, drawTextBlock } from './draw'
import { applyEllipsis, labelToDraw, sliceTextToFitWidth } from './fit'
import { measureLabelSize, measureLines, toFonts } from './measure'
import { toLines } from './wrap'

type RectSize = {
  h: number
  w: number
}

type RectHeight = {
  h: number
}

type TextElement = Element<TreemapConfig, TreemapOptions> & {
  $context?: TreemapScriptableContext
}

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

function getFontFromOptions(rect: DrawRect, labels: TreemapLabelsOptions) {
  const { font, hoverFont } = labels
  const optFont = (rect.active ? hoverFont : font) || font
  return Array.isArray(optFont) ? optFont.map((f) => toFont(f)) : [toFont(optFont)]
}
