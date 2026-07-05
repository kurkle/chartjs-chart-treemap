import type { DrawRect } from './geometry'
import type { TreemapDataPoint, TreemapOptions, TreemapScriptableContext } from './types'

import TreemapElement from './element'
import { drawDivider, drawText, getCaptionHeight, shouldDrawCaption } from './text'

type MockCall = [string, ...unknown[]]

function createCtx() {
  const calls: MockCall[] = []
  const ctx = {
    beginPath: () => calls.push(['beginPath']),
    clip: () => calls.push(['clip']),
    fillText: (text: string, x: number, y: number) => calls.push(['fillText', text, x, y]),
    lineTo: (x: number, y: number) => calls.push(['lineTo', x, y]),
    measureText: (text: string) => ({ width: text.length * 10 }),
    moveTo: (x: number, y: number) => calls.push(['moveTo', x, y]),
    rect: (x: number, y: number, w: number, h: number) => calls.push(['rect', x, y, w, h]),
    restore: () => calls.push(['restore']),
    save: () => calls.push(['save']),
    setLineDash: (dash: number[]) => calls.push(['setLineDash', dash]),
    stroke: () => calls.push(['stroke']),
  } as unknown as CanvasRenderingContext2D
  return { calls, ctx }
}

function createRect(rect: Partial<DrawRect> = {}): DrawRect {
  return {
    h: 100,
    radius: { bottomLeft: 0, bottomRight: 0, topLeft: 0, topRight: 0 },
    w: 100,
    x: 0,
    y: 0,
    ...rect,
  }
}

function createData(point: Partial<TreemapDataPoint> = {}): TreemapDataPoint {
  return {
    h: 100,
    s: 0,
    v: 7,
    w: 100,
    x: 0,
    y: 0,
    ...point,
  }
}

function createOptions(options: Partial<TreemapOptions> = {}): TreemapOptions {
  return {
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
      display: true,
      font: { size: 12 },
      formatter: (ctx: TreemapScriptableContext) => `${ctx.raw.v}`,
      overflow: 'cut',
      padding: 3,
      position: 'middle',
    },
    rtl: false,
    spacing: 0.5,
    ...options,
  }
}

function createElement() {
  return new TreemapElement({ height: 100, width: 100, x: 0, y: 0 })
}

describe('text', () => {
  describe('caption helpers', () => {
    it('determines if captions fit', () => {
      expect(
        shouldDrawCaption('containerBoxes', { h: 100, w: 100 }, { display: false })
      ).toBeFalse()
      expect(shouldDrawCaption('headerBoxes', { h: 1, w: 1 }, { display: true })).toBeTrue()
      expect(
        shouldDrawCaption('containerBoxes', { h: 8, w: 8 }, { display: true, font: { size: 12 } })
      ).toBeFalse()
      expect(
        shouldDrawCaption(
          'containerBoxes',
          { h: 100, w: 100 },
          { display: true, font: { size: 12 } }
        )
      ).toBeTrue()
    })

    it('calculates caption height', () => {
      expect(getCaptionHeight('containerBoxes', { h: 100 }, { lineHeight: 10 }, 2)).toBe(14)
      expect(getCaptionHeight('headerBoxes', { h: 15 }, { lineHeight: 10 }, 2)).toBe(5)
      expect(getCaptionHeight('headerBoxes', { h: 100 }, { lineHeight: 10 }, 2)).toBe(14)
    })
  })

  describe('drawText', () => {
    it('skips empty labels', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: { ...createOptions().labels, formatter: () => '' },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls.find((call) => call[0] === 'fillText')).toBeUndefined()
    })

    it('hides labels that do not fit hidden overflow', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: {
          ...createOptions().labels,
          formatter: () => 'this label is too long',
          overflow: 'hidden',
        },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls.find((call) => call[0] === 'fillText')).toBeUndefined()
    })

    it('fits labels when overflow is fit', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: {
          ...createOptions().labels,
          formatter: () => 'this label is too long',
          overflow: 'fit',
        },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'this label is too long']))
    })

    it('draws static label formatter values', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: {
          ...createOptions().labels,
          formatter: 'static',
        },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'static']))
    })

    it('positions labels at top and right', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: {
          ...createOptions().labels,
          align: 'right',
          formatter: () => 'top',
          position: 'top',
        },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls.find((item) => item[0] === 'fillText')).toEqual(
        jasmine.arrayContaining(['fillText', 'top', 97])
      )
    })

    it('positions labels at bottom', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        labels: {
          ...createOptions().labels,
          formatter: () => 'bottom',
          position: 'bottom',
        },
      })

      drawText(ctx, createRect(), options, createData({ _data: {}, isLeaf: true }), createElement())

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'bottom']))
    })

    it('truncates captions to fit available width', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        captions: {
          ...createOptions().captions,
          formatter: 'long caption text',
        },
      })

      drawText(
        ctx,
        createRect({ w: 60 }),
        options,
        createData({ _data: { children: [{}] }, g: 'group', l: 0 }),
        createElement()
      )

      expect(calls).toContain(jasmine.arrayContaining(['fillText', 'lo...']))
    })

    it('skips captions when font is taller than the rect', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        captions: {
          ...createOptions().captions,
          font: { size: 30 },
          formatter: 'caption',
        },
        displayMode: 'headerBoxes',
      })

      drawText(
        ctx,
        createRect({ h: 10 }),
        options,
        createData({ _data: { children: [{}] }, g: 'group', l: 0 }),
        createElement()
      )

      expect(calls.find((call) => call[0] === 'fillText')).toBeUndefined()
    })

    it('skips captions without text', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        captions: {
          ...createOptions().captions,
          formatter: '',
        },
        displayMode: 'headerBoxes',
      })

      drawText(
        ctx,
        createRect(),
        options,
        createData({ _data: { children: [{}] }, l: 0 }),
        createElement()
      )

      expect(calls.find((call) => call[0] === 'fillText')).toBeUndefined()
    })

    it('returns empty caption text when an ellipsis does not fit', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        captions: {
          ...createOptions().captions,
          formatter: 'caption',
        },
        displayMode: 'headerBoxes',
      })

      drawText(
        ctx,
        createRect({ w: 20 }),
        options,
        createData({ _data: { children: [{}] }, g: 'group', l: 0 }),
        createElement()
      )

      expect(calls).toContain(jasmine.arrayContaining(['fillText', '']))
    })
  })

  describe('drawDivider', () => {
    it('draws vertical dividers for wide rectangles', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        dividers: {
          display: true,
          lineCapStyle: 'round',
          lineColor: 'green',
          lineDash: [2, 1],
          lineDashOffset: 1,
          lineWidth: 2,
        },
      })

      drawDivider(
        ctx,
        createRect({ h: 60, w: 120 }),
        options,
        createData({ _data: { children: [{}, {}] }, g: 'group', l: 0 })
      )

      expect(calls).toContain(jasmine.arrayContaining(['moveTo', 60, 0]))
      expect(calls).toContain(jasmine.arrayContaining(['lineTo', 60, 60]))
    })

    it('skips dividers without child data', () => {
      const { calls, ctx } = createCtx()
      const options = createOptions({
        dividers: { ...createOptions().dividers, display: true },
      })

      drawDivider(ctx, createRect(), options, createData({ _data: {} }))

      expect(calls.find((call) => call[0] === 'stroke')).toBeUndefined()
    })
  })
})
