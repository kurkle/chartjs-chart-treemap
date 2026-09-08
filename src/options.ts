import type {
  TreemapBorderRadius,
  TreemapBorderWidth,
  TreemapLayoutOptions,
  TreemapOptions,
} from './types'

import { toTRBL, toTRBLCorners } from 'chart.js/helpers'

/**
 * Options that shape the whole dataset's layout rather than a single element.
 * They live in the controller's defaults; the element receives the resolved
 * values as an argument to `draw`.
 */
export const layoutDefaults: TreemapLayoutOptions = {
  displayMode: 'containerBoxes',
  rtl: false,
  spacing: 0.5,
}

export type ParsedBorderWidth = {
  b: number
  l: number
  r: number
  t: number
}

function limit(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min)
}

export function parseBorderWidth(
  value: TreemapBorderWidth,
  maxW: number,
  maxH: number
): ParsedBorderWidth {
  const o = toTRBL(value as Parameters<typeof toTRBL>[0])

  return {
    b: limit(o.bottom, 0, maxH),
    l: limit(o.left, 0, maxW),
    r: limit(o.right, 0, maxW),
    t: limit(o.top, 0, maxH),
  }
}

export function parseBorderRadius(
  value: TreemapOptions['borderRadius'],
  maxW: number,
  maxH: number
): TreemapBorderRadius {
  const o = toTRBLCorners(value as Parameters<typeof toTRBLCorners>[0])
  const maxR = Math.min(maxW, maxH)

  return {
    bottomLeft: limit(o.bottomLeft, 0, maxR),
    bottomRight: limit(o.bottomRight, 0, maxR),
    topLeft: limit(o.topLeft, 0, maxR),
    topRight: limit(o.topRight, 0, maxR),
  }
}
