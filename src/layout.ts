import type { DrawRect } from './geometry'
import type { TreemapDataPoint, TreemapDisplayMode } from './types'

import { isObject, toFont, valueOrDefault } from 'chart.js/helpers'

import { parseBorderWidth } from './options'
import { packInto, sortNodes, toNodes } from './squarify'
import { getCaptionHeight, shouldDrawCaption } from './text'
import { getGroupKey, group, normalizeTreeToArray } from './utils'

export type LayoutOptions = {
  borderWidth: any
  captions: any
  displayMode: TreemapDisplayMode
  groups: any[]
  leafKey: string
  spacing: number
  unsorted: boolean
}

/** A node while the layout is being built; `_children` is dropped before use. */
export type LayoutNode = TreemapDataPoint & { _children?: LayoutNode[] }

/**
 * Pass one: the hierarchy.
 *
 * Groups the items level by level and orders each set of siblings. Nothing here
 * depends on the chart area, so the number of nodes and their order are known
 * before the layout has a rectangle to fill.
 */
function buildHierarchy(
  values: any[],
  gidx: number,
  keys: string[],
  layout: LayoutOptions,
  parentGroupValue?: string
): LayoutNode[] {
  const { groups, leafKey, unsorted } = layout
  const glen = groups.length
  const g = getGroupKey(groups[gidx])
  const gdata = group(
    values,
    g,
    keys,
    leafKey,
    undefined,
    parentGroupValue,
    groups.filter((_item: any, index: number) => index <= gidx),
    groups,
    gidx
  )
  const nodes = toNodes(gdata, keys, g, gidx) as LayoutNode[]
  if (!unsorted) {
    sortNodes(nodes)
  }

  for (const node of nodes) {
    const record = node._data as any
    const nextGroupIndex = record.groupIndex + 1
    const children =
      gidx < glen - 1 && nextGroupIndex < glen
        ? buildHierarchy(record.children, nextGroupIndex, keys, layout, node.g)
        : []
    node._children = children
    node.isLeaf = !children.length
  }
  return nodes
}

/** Draw order: a set of siblings, then the descendants of each in turn. */
export function flattenNodes(nodes: LayoutNode[]): LayoutNode[] {
  const flat = nodes.slice()
  for (const node of nodes) {
    if (node._children?.length) {
      flat.push(...flattenNodes(node._children))
    }
  }
  return flat
}

/**
 * Pass two: the geometry.
 *
 * Packs each set of siblings into its parent's rectangle, writing the
 * coordinates onto the nodes the first pass produced.
 */
export function layoutNodes(
  nodes: LayoutNode[],
  rect: any,
  layout: LayoutOptions,
  parentSum?: number
) {
  if (parentSum !== undefined) {
    for (const node of nodes) {
      node.gs = parentSum
    }
  }
  packInto(nodes, rect)

  for (const node of nodes) {
    if (node._children?.length) {
      layoutNodes(node._children, getSubRect(node, rect, layout), layout, node.s)
    }
  }
}

/** The rectangle left for a group's children once its border and caption are taken. */
function getSubRect(sq: any, rect: any, layout: LayoutOptions) {
  const { borderWidth, captions, displayMode } = layout
  const sp = displayMode === 'headerBoxes' ? 0 : layout.spacing
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
    const captionHeight = getCaptionHeight(
      displayMode,
      subRect,
      toFont(captions.font),
      valueOrDefault(captions.padding, 3)
    )
    subRect.y += captionHeight
    subRect.h -= captionHeight
  }
  return subRect
}

/**
 * The hierarchy pass on its own: the nested nodes, in draw order, with no
 * geometry. Takes no rectangle, which is the whole point - the controller needs
 * the node count before the chart area is known.
 */
export function buildNodes(tree: any, keys: string[], layout: LayoutOptions): LayoutNode[] {
  const { groups, leafKey, unsorted } = layout
  const input = isObject(tree) ? normalizeTreeToArray(keys, leafKey, tree) : tree

  if (groups.length) {
    return buildHierarchy(input, 0, keys, layout)
  }
  const nodes = toNodes(input || [], keys) as LayoutNode[]
  if (!unsorted) {
    sortNodes(nodes)
  }
  return nodes
}

/** Turns the user's input into the flat list of rectangles the chart draws. */
export function buildData(
  tree: any,
  keys: string[],
  mainRect: DrawRect,
  layout: LayoutOptions
): TreemapDataPoint[] {
  const { captions, displayMode } = layout
  const nodes = buildNodes(tree, keys, layout)
  layoutNodes(nodes, mainRect, layout)

  const font = toFont(captions.font)
  const padding = valueOrDefault(captions.padding, 3)
  return flattenNodes(nodes)
    .map((d) => {
      // The nested link is internal; it must not reach ctx.raw.
      delete d._children
      if (displayMode !== 'headerBoxes' || d.isLeaf) {
        return d
      }
      if (!shouldDrawCaption(displayMode, d, captions)) {
        return undefined
      }
      const captionHeight = getCaptionHeight(displayMode, d, font, padding)
      return { ...d, h: captionHeight }
    })
    .filter(Boolean) as TreemapDataPoint[]
}
