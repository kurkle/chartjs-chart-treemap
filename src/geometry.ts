import type { Element } from 'chart.js'
import type { TreemapBorderRadius, TreemapConfig, TreemapOptions } from './types'

import { parseBorderRadius, parseBorderWidth } from './options'

export type DrawRect = {
  active?: boolean
  h: number
  radius: TreemapBorderRadius
  w: number
  x: number
  y: number
}

type TreemapElementBase = Element<TreemapConfig, TreemapOptions>

function getBounds(rect: TreemapElementBase, useFinalPosition?: boolean) {
  const { x, y, width, height } = rect.getProps(['x', 'y', 'width', 'height'], useFinalPosition)
  return { bottom: y + height, left: x, right: x + width, top: y }
}

export function boundingRects(rect: TreemapElementBase) {
  const bounds = getBounds(rect)
  const width = bounds.right - bounds.left
  const height = bounds.bottom - bounds.top
  const border = parseBorderWidth(rect.options.borderWidth, width / 2, height / 2)
  const radius = parseBorderRadius(rect.options.borderRadius, width / 2, height / 2)
  const outer = {
    active: rect.active,
    h: height,
    radius,
    w: width,
    x: bounds.left,
    y: bounds.top,
  }

  return {
    inner: {
      active: rect.active,
      h: outer.h - border.t - border.b,
      radius: {
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)),
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
      },
      w: outer.w - border.l - border.r,
      x: outer.x + border.l,
      y: outer.y + border.t,
    },
    outer,
  }
}

export function inRange(
  rect: TreemapElementBase,
  x: number | null,
  y: number | null,
  useFinalPosition?: boolean
) {
  const skipX = x === null
  const skipY = y === null
  const bounds = !rect || (skipX && skipY) ? false : getBounds(rect, useFinalPosition)

  return (
    bounds &&
    (skipX || (x >= bounds.left && x <= bounds.right)) &&
    (skipY || (y >= bounds.top && y <= bounds.bottom))
  )
}

export function hasRadius(radius: TreemapBorderRadius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight
}

export function addNormalRectPath(ctx: CanvasRenderingContext2D, rect: DrawRect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
}
