export function scaleRect(sq: any, xScale: any, yScale: any, sp: number) {
  const sp2 = sp * 2
  const x = xScale.getPixelForValue(sq.x)
  const y = yScale.getPixelForValue(sq.y)
  const w = xScale.getPixelForValue(sq.x + sq.w) - x
  const h = yScale.getPixelForValue(sq.y + sq.h) - y
  return {
    height: h - sp2,
    hidden: sp2 > w || sp2 > h,
    width: w - sp2,
    x: x + sp,
    y: y + sp,
  }
}

export function rectNotEqual(r1: any, r2: any) {
  return (
    !r1 ||
    !r2 ||
    r1.x !== r2.x ||
    r1.y !== r2.y ||
    r1.w !== r2.w ||
    r1.h !== r2.h ||
    r1.rtl !== r2.rtl ||
    r1.unsorted !== r2.unsorted
  )
}

export function arrayNotEqual(a: any[], b: any[]) {
  let i: number
  let n: number

  if (!a || !b) {
    return true
  }

  if (a === b) {
    return false
  }

  if (a.length !== b.length) {
    return true
  }

  for (i = 0, n = a.length; i < n; ++i) {
    if (a[i] !== b[i]) {
      return true
    }
  }
  return false
}
