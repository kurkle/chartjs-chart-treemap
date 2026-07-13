import { Chart, DatasetController, registry } from 'chart.js'
import { clipArea, isObject, toFont, unclipArea, valueOrDefault } from 'chart.js/helpers'

import { version } from '../package.json'
import { arrayNotEqual, rectNotEqual, scaleRect } from './helpers/index'
import { parseBorderWidth } from './options'
import squarify from './squarify'
import { getCaptionHeight, shouldDrawCaption } from './text'
import { getGroupKey, group, normalizeTreeToArray, requireVersion } from './utils'

function buildData(tree: any, dataset: any, keys: any[], mainRect: any) {
  const treeLeafKey = dataset.treeLeafKey || '_leaf'
  if (isObject(tree)) {
    tree = normalizeTreeToArray(keys, treeLeafKey, tree)
  }
  const groups = dataset.groups || []
  const glen = groups.length
  const sp = dataset.displayMode === 'headerBoxes' ? 0 : valueOrDefault(dataset.spacing, 0)
  const captions = dataset.captions || {}
  const font = toFont(captions.font)
  const padding = valueOrDefault(captions.padding, 3)

  function getSubRect(sq: any, rect: any) {
    const bw =
      dataset.displayMode === 'headerBoxes'
        ? { b: 0, l: 0, r: 0, t: 0 }
        : parseBorderWidth(dataset.borderWidth, sq.w / 2, sq.h / 2)
    const subRect = {
      ...rect,
      h: sq.h - 2 * sp - bw.t - bw.b,
      w: sq.w - 2 * sp - bw.l - bw.r,
      x: sq.x + sp + bw.l,
      y: sq.y + sp + bw.t,
    }
    if (shouldDrawCaption(dataset.displayMode, subRect, captions)) {
      const captionHeight = getCaptionHeight(dataset.displayMode, subRect, font, padding)
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
      treeLeafKey,
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
      if (dataset.displayMode !== 'headerBoxes' || d.isLeaf) {
        return d
      }
      if (!shouldDrawCaption(dataset.displayMode, d, captions)) {
        return undefined
      }
      const captionHeight = getCaptionHeight(dataset.displayMode, d, font, padding)
      return { ...d, h: captionHeight }
    })
    .filter(Boolean)
}

function registerTooltipPositioner() {
  const tooltipPlugin = registry.plugins.get('tooltip') as any
  if (!tooltipPlugin || tooltipPlugin.positioners.treemap) {
    return
  }
  tooltipPlugin.positioners.treemap = (active: any[]) => {
    if (!active.length) {
      return false
    }

    const item = active.at(-1)
    return item.element.tooltipPosition()
  }
}

export default class TreemapController extends DatasetController {
  declare static readonly id: string
  declare static readonly defaults: Record<string, unknown>
  declare static readonly descriptors: Record<string, unknown>
  declare static readonly overrides: Record<string, unknown>
  declare static readonly beforeRegister: () => void
  declare static readonly afterRegister: () => void
  declare static readonly afterUnregister: () => void

  options: any
  _groups: any[] | undefined
  _keys: any[] | undefined
  _rect: any
  _rectChanged: boolean
  _prevTree: any

  constructor(chart: any, datasetIndex: number) {
    super(chart, datasetIndex)

    this._groups = undefined
    this._keys = undefined
    this._rect = undefined
    this._rectChanged = true
  }

  override initialize() {
    // The tooltip can be registered after the treemap controller. At chart creation time all
    // components are available, so retry here to make registration order irrelevant.
    registerTooltipPositioner()
    this.enableOptionSharing = true
    super.initialize()
  }

  override getMinMax(scale: any) {
    return {
      max: scale.axis === 'x' ? scale.right - scale.left : scale.bottom - scale.top,
      min: 0,
    }
  }

  override configure() {
    super.configure()
    const { xScale, yScale } = this.getMeta() as any
    if (!xScale || !yScale) {
      // configure is called once before `linkScales`, and at that call we don't have any scales linked yet
      return
    }

    const w = xScale.right - xScale.left
    const h = yScale.bottom - yScale.top
    const rect = { h, rtl: !!this.options.rtl, unsorted: !!this.options.unsorted, w, x: 0, y: 0 }

    if (rectNotEqual(this._rect, rect)) {
      this._rect = rect
      this._rectChanged = true
    }

    if (this._rectChanged) {
      xScale.max = w
      xScale.configure()
      yScale.max = h
      yScale.configure()
    }
  }

  override update(mode: any) {
    const dataset = this.getDataset() as any
    const { data } = this.getMeta()
    const groups = dataset.groups || []
    const keys = [dataset.key || ''].concat(dataset.sumKeys || [])
    dataset.tree = dataset.tree || dataset.data || []
    const tree = dataset.tree

    if (mode === 'reset') {
      // reset is called before 2nd configure and is only called if animations are enabled. So wen need an extra configure call here.
      this.configure()
    }

    if (
      this._rectChanged ||
      arrayNotEqual(this._keys || [], keys) ||
      arrayNotEqual(this._groups || [], groups) ||
      this._prevTree !== tree
    ) {
      this._groups = groups.slice()
      this._keys = keys.slice()
      this._prevTree = tree
      this._rectChanged = false

      dataset.data = buildData(tree, dataset, this._keys, this._rect)
      // @ts-expect-error using private stuff
      this._dataCheck()
      // @ts-expect-error using private stuff
      this._resyncElements()
    }

    this.updateElements(data, 0, data.length, mode)
  }

  override updateElements(rects: any[], start: number, count: number, mode: any) {
    const reset = mode === 'reset'
    const dataset = this.getDataset() as any
    const firstOpts = this.resolveDataElementOptions(start, mode)
    this._rect.options = firstOpts
    const sharedOptions = this.getSharedOptions(firstOpts)
    const includeOptions = this.includeOptions(mode, sharedOptions || {})
    const { xScale, yScale } = this.getMeta() as any

    for (let i = start; i < start + count; i++) {
      const options = sharedOptions || this.resolveDataElementOptions(i, mode)
      const properties: any = scaleRect(dataset.data[i], xScale, yScale, options.spacing)
      if (reset) {
        properties.width = 0
        properties.height = 0
      }

      if (includeOptions) {
        properties.options = options
      }
      this.updateElement(rects[i], i, properties, mode)
    }

    this.updateSharedOptions(sharedOptions || {}, mode, firstOpts)
  }

  override draw() {
    const { ctx, chartArea } = this.chart
    const metadata = ((this.getMeta() as any).data || []) as any[]
    const dataset = this.getDataset() as any
    const data = dataset.data

    clipArea(ctx, chartArea)
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i]
      if (!rect.hidden) {
        rect.draw(ctx, data[i])
      }
    }
    unclipArea(ctx)
  }
}

;(TreemapController as any).id = 'treemap'

;(TreemapController as any).version = version

;(TreemapController as any).defaults = {
  animations: {
    numbers: {
      properties: ['x', 'y', 'width', 'height'],
      type: 'number',
    },
  },
  dataElementType: 'treemap',
}

;(TreemapController as any).descriptors = {
  _indexable: false,
  _scriptable: true,
  captions: {
    _fallback: true,
    _scriptable: (name: string) => name !== 'formatter',
  },
  labels: {
    _fallback: true,
    _scriptable: (name: string) => name !== 'formatter',
  },
}

;(TreemapController as any).overrides = {
  hover: {},
  interaction: {
    includeInvisible: true,
    intersect: true,
    mode: 'point',
  },

  plugins: {
    tooltip: {
      callbacks: {
        label(item: any) {
          const dataset = item.dataset
          const dataItem = dataset.data[item.dataIndex]
          const label = dataItem.g || dataItem._data.label || dataset.label
          return (label ? `${label}: ` : '') + dataItem.v
        },
        title(items: any[]) {
          if (items.length) {
            const item = items[0]
            return item.dataset.key || ''
          }
          return ''
        },
      },
      intersect: true,
      position: 'treemap',
    },
  },
  scales: {
    x: {
      alignToPixels: true,
      bounds: 'data',
      display: false,
      type: 'linear',
    },
    y: {
      alignToPixels: true,
      bounds: 'data',
      display: false,
      reverse: true,
      type: 'linear',
    },
  },
}

;(TreemapController as any).beforeRegister = () => {
  requireVersion('chart.js', '3.8', Chart.version)
}

;(TreemapController as any).afterRegister = () => {
  registerTooltipPositioner()
}

;(TreemapController as any).afterUnregister = () => {
  const tooltipPlugin = registry.plugins.get('tooltip') as any
  if (tooltipPlugin) {
    delete tooltipPlugin.positioners.treemap
  }
}
