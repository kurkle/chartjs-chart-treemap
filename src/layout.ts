import type { DrawRect } from './geometry'
import type { TreemapDataPoint, TreemapDisplayMode } from './types'

import { isObject, toFont, valueOrDefault } from 'chart.js/helpers'

import { parseBorderWidth } from './options'
import squarify from './squarify'
import { getCaptionHeight, shouldDrawCaption } from './text'
import { getGroupKey, group, normalizeTreeToArray } from './utils'

/**
 * Turns the user's input into the flat list of rectangles the chart draws.
 *
 * Extracted from the controller unchanged: the recursion, the sub-rect
 * calculation and the headerBoxes filtering are the same code, now behind a
 * typed signature so the controller passes options in rather than the layout
 * reaching into the dataset.
 */
export type LayoutOptions = {
  borderWidth: any
  captions: any
  displayMode: TreemapDisplayMode
  groups: any[]
  leafKey: string
  spacing: number
}

export function buildData(
  tree: any,
  keys: string[],
  mainRect: DrawRect,
  layout: LayoutOptions
): TreemapDataPoint[] {
  const { borderWidth, captions, displayMode, groups, leafKey } = layout
  if (isObject(tree)) {
    tree = normalizeTreeToArray(keys, leafKey, tree)
  }
  const glen = groups.length
  const sp = displayMode === 'headerBoxes' ? 0 : layout.spacing
  const font = toFont(captions.font)
  const padding = valueOrDefault(captions.padding, 3)

  function getSubRect(sq: any, rect: any) {
    const bw =
      displayMode === 'headerBoxes'
        ? { b: 0, l: 0, r: 0, t: 0 }
        : parseBorderWidth(borderWidth, sq.w / 2, sq.h / 2)
    const subRect = {
      ...rect,
      h: sq.h - 2 * sp - bw.t - bw.b,
      w: sq.w - 2 * sp - bw.l - bw.r,
      x: sq.x + sp + bw.l,
      y: sq.y + sp + bw.t,
    }
    if (shouldDrawCaption(displayMode, subRect, captions)) {
      const captionHeight = getCaptionHeight(displayMode, subRect, font, padding)
      subRect.y += captionHeight
      subRect.h -= captionHeight
    }
    return subRect
  }

  function recur(treeElements: any, gidx: number, rect: any, parent?: any, gs?: any) {
    const g = getGroupKey(groups[gidx])
    const gdata = group(
      treeElements,
      g,
      keys,
      leafKey,
      undefined,
      parent,
      groups.filter((_item: any, index: number) => index <= gidx),
      groups,
      gidx
    )
    const gsq = squarify(gdata, rect, keys, g, gidx, gs)
    const ret = gsq.slice()
    if (gidx < glen - 1) {
      gsq.forEach((sq) => {
        const subRect = getSubRect(sq, rect)
        const children: any[] = []
        const nextGroupIndex = sq._data.groupIndex + 1
        if (nextGroupIndex < glen) {
          children.push(...recur(sq._data.children, nextGroupIndex, subRect, sq.g, sq.s))
        }
        ret.push(...children)
        sq.isLeaf = !children.length
      })
    } else {
      gsq.forEach((sq) => {
        sq.isLeaf = true
      })
    }
    return ret
  }

  const result = glen ? recur(tree, 0, mainRect) : squarify(tree, mainRect, keys)
  return result
    .map((d) => {
      if (displayMode !== 'headerBoxes' || d.isLeaf) {
        return d
      }
      if (!shouldDrawCaption(displayMode, d, captions)) {
        return undefined
      }
      const captionHeight = getCaptionHeight(displayMode, d, font, padding)
      return { ...d, h: captionHeight }
    })
    .filter(Boolean)
}
