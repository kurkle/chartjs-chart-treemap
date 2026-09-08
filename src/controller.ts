import type { LayoutNode, LayoutOptions } from './layout'

import { Chart, DatasetController, registry } from 'chart.js'
import { clipArea, unclipArea, valueOrDefault } from 'chart.js/helpers'

import { version } from '../package.json'
import { rectNotEqual, scaleRect } from './helpers/index'
import { buildNodes, flattenNodes, layoutNodes } from './layout'
import { layoutDefaults } from './options'
import { requireVersion } from './utils'

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

  // Chart.js assigns this on the class when the controller is registered; its
  // type definitions do not describe it.
  declare dataElementType: new () => any

  options: any
  _rect: any
  _rectChanged: boolean
  _nodes: LayoutNode[]
  _layoutDirty: boolean
  _fingerprint: string | undefined

  constructor(chart: any, datasetIndex: number) {
    super(chart, datasetIndex)

    this._rect = undefined
    this._rectChanged = true
    this._nodes = []
    this._layoutDirty = true
    this._fingerprint = undefined
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
      unsorted: !!options.unsorted,
      valueScale: options.valueScale || 'linear',
    }
  }

  /**
   * Chart.js calls this before `configure()`, so the chart area is not
   * available here - see the hierarchy pass in `./layout`, which does not need
   * one. Elements are created from the parsed nodes rather than from
   * `dataset.data`, because a treemap with groups has more rectangles than the
   * user supplied rows.
   */
  override buildOrUpdateElements(_resetNewElements?: boolean) {
    this.parse(0, 0)

    const meta = this.getMeta() as any
    const count = (meta._parsed as unknown[]).length
    const elements = meta.data as unknown[]
    if (elements.length > count) {
      elements.splice(count, elements.length - count)
    }
    while (elements.length < count) {
      elements.push(new this.dataElementType())
    }
  }

  override parse(_start: number, _count: number) {
    const dataset = this.getDataset() as any
    if (dataset.tree !== undefined) {
      throw new Error(
        'chartjs-chart-treemap v5: the "tree" option was renamed to "data". ' +
          'See https://chartjs-chart-treemap.pages.dev/usage/'
      )
    }

    const options = this.options
    const keys = [options.key || ''].concat(options.sumKeys || [])
    const nodes = buildNodes(dataset.data || [], keys, this._layoutOptions())
    const flat = flattenNodes(nodes)

    // A `chart.update('none')` per wheel event must not re-run the layout when
    // nothing about the data changed, so keep the previous nodes - and with
    // them their geometry - when the hierarchy is identical.
    const fingerprint = flat.map((node) => `${node.v}\u0000${node.g}\u0000${node.l}`).join('\u0001')
    if (this._fingerprint === fingerprint) {
      return
    }

    this._fingerprint = fingerprint
    this._nodes = nodes
    ;(this.getMeta() as any)._parsed = flat
    this._layoutDirty = true
  }

  // `getContext` exists on DatasetController at runtime but not in its type
  // definitions, so this cannot be declared as an override.
  getContext(index: number, active?: boolean, mode?: string) {
    const base = (DatasetController.prototype as any).getContext
    const context = base.call(this, index, active, mode)
    const parsed = typeof index === 'number' ? this.getParsed(index) : undefined
    if (parsed) {
      context.raw = parsed
      context.parsed = parsed
    }
    return context
  }

  override getLabelAndValue(index: number) {
    const node = this.getParsed(index) as any
    if (!node) {
      return { label: '', value: '' }
    }
    const dataset = this.getDataset() as any
    const label = node.g ?? node._data?.label ?? dataset.label
    return { label: label === undefined ? '' : `${label}`, value: `${node.v}` }
  }

  override update(mode: any) {
    const { data } = this.getMeta()

    if (mode === 'reset') {
      // reset is called before 2nd configure and is only called if animations are enabled. So wen need an extra configure call here.
      this.configure()
    }

    if (this._layoutDirty || this._rectChanged) {
      layoutNodes(this._nodes, this._rect, this._layoutOptions())
      this._layoutDirty = false
      this._rectChanged = false
    }

    this.updateElements(data, 0, data.length, mode)
  }

  override updateElements(rects: any[], start: number, count: number, mode: any) {
    const reset = mode === 'reset'
    const firstOpts = this.resolveDataElementOptions(start, mode)
    this._rect.options = firstOpts
    const sharedOptions = this.getSharedOptions(firstOpts)
    const includeOptions = this.includeOptions(mode, sharedOptions || {})
    const { xScale, yScale } = this.getMeta() as any
    const spacing = this.options.spacing

    for (let i = start; i < start + count; i++) {
      const options = sharedOptions || this.resolveDataElementOptions(i, mode)
      const node = this.getParsed(i) as any
      const properties: any = scaleRect(node, xScale, yScale, spacing)
      properties.hidden = properties.hidden || !!node.hidden
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
    const { displayMode, rtl, spacing } = this.options
    const layout = { displayMode, rtl, spacing }

    clipArea(ctx, chartArea)
    for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
      const rect = metadata[i]
      if (!rect.hidden) {
        rect.draw(ctx, this.getParsed(i) as any, layout)
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
  valueScale: 'linear',
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
          const node = item.parsed
          const label = node.g || node._data?.label || item.dataset.label
          return (label ? `${label}: ` : '') + node.v
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
