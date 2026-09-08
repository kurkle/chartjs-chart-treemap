import { Chart, DatasetController, registry } from 'chart.js'
import { clipArea, isObject, toFont, unclipArea, valueOrDefault } from 'chart.js/helpers'

import { version } from '../package.json'
import { arrayNotEqual, rectNotEqual, scaleRect } from './helpers/index'
import { layoutDefaults, parseBorderWidth } from './options'
import squarify from './squarify'
import { getCaptionHeight, shouldDrawCaption } from './text'
import { getGroupKey, group, normalizeTreeToArray, requireVersion } from './utils'

type LayoutOptions = {
  borderWidth: any
  captions: any
  displayMode: string
  groups: any[]
  leafKey: string
  spacing: number
}

function buildData(tree: any, keys: any[], mainRect: any, layout: LayoutOptions) {
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
    if (shouldDrawCaption(displayMode as any, subRect, captions)) {
      const captionHeight = getCaptionHeight(displayMode as any, subRect, font, padding)
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
      if (!shouldDrawCaption(displayMode as any, d, captions)) {
        return undefined
      }
      const captionHeight = getCaptionHeight(displayMode as any, d, font, padding)
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
  _prevTreeVersion: unknown

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

  /**
   * Options that shape the layout rather than a single rectangle, resolved once
   * per dataset. Reading them from `this.options` rather than from the raw
   * dataset is what makes `options.datasets.treemap` work for all of them.
   */
  _layoutOptions(): LayoutOptions {
    const dataset = this.getDataset() as any
    const options = this.options
    return {
      // Still raw: resolving these with the dataset context is feature 2's
      // change, and doing it here would move pixels in this refactor.
      borderWidth: dataset.borderWidth,
      captions: dataset.captions || {},
      displayMode: options.displayMode,
      groups: options.groups || [],
      leafKey: options.leafKey,
      // Deliberately NOT options.spacing. The child rectangle calculation has
      // always defaulted spacing to 0 while the drawn rectangle defaults it to
      // 0.5, so reading the resolved value here would inset every nested group
      // by an extra 0.5 and move 11 fixtures. Unifying the two is a visual
      // change that deserves its own pull request.
      spacing: valueOrDefault(dataset.spacing, 0),
    }
  }

  override update(mode: any) {
    const dataset = this.getDataset() as any
    const { data } = this.getMeta()
    const options = this.options
    const groups = options.groups || []
    const keys = [options.key || ''].concat(options.sumKeys || [])
    dataset.tree = dataset.tree || dataset.data || []
    const tree = dataset.tree
    const treeVersion = dataset.treeVersion

    if (mode === 'reset') {
      // reset is called before 2nd configure and is only called if animations are enabled. So wen need an extra configure call here.
      this.configure()
    }

    if (
      this._rectChanged ||
      arrayNotEqual(this._keys || [], keys) ||
      arrayNotEqual(this._groups || [], groups) ||
      this._prevTree !== tree ||
      this._prevTreeVersion !== treeVersion
    ) {
      this._groups = groups.slice()
      this._keys = keys.slice()
      this._prevTree = tree
      this._prevTreeVersion = treeVersion
      this._rectChanged = false

      dataset.data = buildData(tree, this._keys, this._rect, this._layoutOptions())
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
    const spacing = this.options.spacing

    for (let i = start; i < start + count; i++) {
      const options = sharedOptions || this.resolveDataElementOptions(i, mode)
      const properties: any = scaleRect(dataset.data[i], xScale, yScale, spacing)
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
    const { displayMode, rtl, spacing } = this.options
    const layout = { displayMode, rtl, spacing }

    clipArea(ctx, chartArea)
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i]
      if (!rect.hidden) {
        rect.draw(ctx, data[i], layout)
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
  displayMode: layoutDefaults.displayMode,
  groups: [],
  key: '',
  leafKey: '_leaf',
  rtl: layoutDefaults.rtl,
  spacing: layoutDefaults.spacing,
  sumKeys: [],
  unsorted: false,
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
  requireVersion('chart.js', '4.0', Chart.version)
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
