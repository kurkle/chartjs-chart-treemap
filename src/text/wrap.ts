import type { Font } from './measure'

import { isArray } from 'chart.js/helpers'

import { fontFor, measureLabelSize } from './measure'

export /**
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

export /**
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
