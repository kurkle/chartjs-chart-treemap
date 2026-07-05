import type { TreemapDataPoint, TreemapScriptableContext } from './types'

import TreemapElement from './element'

type MockCall = [string, ...unknown[]]
type ElementConfig = NonNullable<ConstructorParameters<typeof TreemapElement>[0]>
type TestTreemapOptions = NonNullable<ElementConfig['options']>

function createCtx() {
  const calls: MockCall[] = []
  const ctx = {
    arc: (x: number, y: number, radius: number) => calls.push(['arc', x, y, radius]),
    beginPath: () => calls.push(['beginPath']),
    clip: () => calls.push(['clip']),
    closePath: () => calls.push(['closePath']),
    fill: (rule?: string) => calls.push(['fill', rule]),
    fillText: (text: string, x: number, y: number) => calls.push(['fillText', text, x, y]),
    lineTo: (x: number, y: number) => calls.push(['lineTo', x, y]),
    measureText: (text: string) => ({ width: text.length * 10 }),
    moveTo: (x: number, y: number) => calls.push(['moveTo', x, y]),
    quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) =>
      calls.push(['quadraticCurveTo', cpx, cpy, x, y]),
    rect: (x: number, y: number, w: number, h: number) => calls.push(['rect', x, y, w, h]),
    restore: () => calls.push(['restore']),
    save: () => calls.push(['save']),
    setLineDash: (dash: number[]) => calls.push(['setLineDash', dash]),
    stroke: () => calls.push(['stroke']),
  } as unknown as CanvasRenderingContext2D
  return { calls, ctx }
}

function createElement(
  options: Partial<TestTreemapOptions> = {},
  config: Partial<ElementConfig> = {}
) {
  return new TreemapElement({
    height: config.height ?? 100,
    options: {
      backgroundColor: 'blue',
      borderColor: 'red',
      borderRadius: 0,
      borderWidth: 0,
      captions: {
        align: 'left',
        color: 'black',
        display: true,
        font: { size: 12 },
        formatter: (ctx: TreemapScriptableContext) => ctx.raw.g || '',
        padding: 3,
      },
      displayMode: 'containerBoxes',
      dividers: {
        display: false,
        lineCapStyle: 'butt',
        lineColor: 'black',
        lineDash: [],
        lineDashOffset: 0,
        lineWidth: 1,
      },
      labels: {
        align: 'center',
        color: 'black',
        display: false,
        font: { size: 12 },
        formatter: (ctx: TreemapScriptableContext) => `${ctx.raw.v}`,
        overflow: 'cut',
        padding: 3,
        position: 'middle',
      },
      rtl: false,
      spacing: 0.5,
      ...options,
    },
    width: config.width ?? 100,
    x: config.x ?? 0,
    y: config.y ?? 0,
  })
}

function createData(point: Partial<TreemapDataPoint>): TreemapDataPoint {
  return {
    h: 100,
    s: 0,
    v: 0,
    w: 100,
    x: 0,
    y: 0,
    ...point,
  }
}

describe('Rectangle', () => {
  describe('TreemapElement', () => {
    it('should expose range and center helpers', () => {
      const element = createElement()

      expect(element.inRange(50, 50)).toBeTrue()
      expect(element.inRange(120, 50)).toBeFalse()
      expect(element.inXRange(50)).toBeTrue()
      expect(element.inYRange(120)).toBeFalse()
      expect(element.getCenterPoint()).toEqual({ x: 50, y: 50 })
      expect(element.tooltipPosition()).toEqual({ x: 50, y: 50 })
    })

    it('should draw labels with formatter callback', () => {
      const { calls, ctx } = createCtx()
      const element = createElement({
        labels: {
          align: 'center',
          color: 'black',
          display: true,
          font: { size: 12 },
          formatter: (context: TreemapScriptableContext) => `live:${context.raw.v}`,
          overflow: 'cut',
          padding: 3,
          position: 'middle',
        },
      })

      element.draw(ctx, createData({ _data: {}, isLeaf: true, v: 7 }))

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'live:7']))
    })

    it('should draw captions with formatter callback', () => {
      const { calls, ctx } = createCtx()
      const element = createElement({
        captions: {
          align: 'left',
          color: 'black',
          display: true,
          font: { size: 12 },
          formatter: (context: TreemapScriptableContext) => `live:${context.raw.g}`,
          padding: 3,
        },
      })

      element.draw(ctx, createData({ _data: { children: [{}, {}] }, g: 'a', l: 0, v: 7 }))

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'live:a']))
    })

    it('should draw borders and dividers', () => {
      const { calls, ctx } = createCtx()
      const element = createElement({
        borderColor: 'red',
        borderRadius: 2,
        borderWidth: 2,
        dividers: {
          display: true,
          lineCapStyle: 'round',
          lineColor: 'green',
          lineDash: [2, 1],
          lineDashOffset: 1,
          lineWidth: 2,
        },
      })

      element.draw(ctx, createData({ _data: { children: [{}, {}] }, g: 'group', l: 0, v: 7 }))

      expect(calls).toContain(jasmine.arrayContaining(['fill', 'evenodd']))
      expect(calls).toContain(jasmine.arrayContaining(['setLineDash', [2, 1]]))
      expect(calls).toContain(jasmine.arrayContaining(['stroke']))
    })

    it('should skip drawing without data', () => {
      const { calls, ctx } = createCtx()
      const element = createElement()

      element.draw(ctx, undefined)

      expect(calls).toEqual([])
    })
  })
})
