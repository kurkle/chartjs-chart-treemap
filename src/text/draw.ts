import type { Color } from 'chart.js'
import type { DrawRect } from '../geometry'
import type { TreemapLabelsOptions } from '../types'
import type { Font, LabelSize } from './measure'

import { fontFor } from './measure'

/**
 * One block of text ready to draw: the lines, the styles they are drawn with,
 * and where the block's top edge sits. Captions and labels differ only in how
 * they arrive at this, which is why they can share the drawing code.
 */
export type TextBlock = {
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

export /**
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

export function drawTextBlock(ctx: CanvasRenderingContext2D, rect: DrawRect, block: TextBlock) {
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

export function calculateBlockTop(
  rect: DrawRect,
  options: TreemapLabelsOptions,
  labelSize: LabelSize
) {
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

export /**
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
