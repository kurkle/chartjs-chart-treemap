import { toFont } from 'chart.js/helpers'

export type Font = ReturnType<typeof toFont>

export type LabelSize = {
  height: number
  width: number
}

// Capped so a chart with many distinct labels cannot grow it without bound.
const WIDTH_CACHE_LIMIT = 4096
const widthCache = new Map<string, LabelSize>()

export const fontFor = (fonts: Font[], index: number) => fonts[Math.min(index, fonts.length - 1)]

export function measureLabelSize(
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

export /** Measures a set of lines whose fonts are indexed by paragraph. */
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

export function toFonts(fonts: Font[], fitRatio: number) {
  return fonts.map((f) => {
    const { lineHeight: _lineHeight, ...font } = f
    return toFont({ ...font, size: Math.floor(f.size * fitRatio) })
  })
}
