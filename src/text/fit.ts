import type { DrawRect } from '../geometry'
import type { TreemapLabelsOptions } from '../types'
import type { Font, LabelSize } from './measure'

import { fontFor, measureLabelSize } from './measure'

export function sliceTextToFitWidth(
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

export /**
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

export function labelToDraw(rect: DrawRect, options: TreemapLabelsOptions, labelSize: LabelSize) {
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
