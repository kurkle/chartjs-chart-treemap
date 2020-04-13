/*!
 * chartjs-chart-treemap v1.0.0-alpha
 * https://github.com/kurkle/chartjs-chart-treemap#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT license
 */
import Chart from 'chart.js';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(input) {
  var stack = [...input];
  var res = [];

  while (stack.length) {
    // pop value from stack
    var next = stack.pop();

    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next);
    } else {
      res.push(next);
    }
  } // reverse to restore input order


  return res.reverse();
}
function group(values, grp, key, mainGrp, mainValue) {
  var tmp = Object.create(null);
  var data = Object.create(null);
  var ret = [];
  var g, i, n, v;

  for (i = 0, n = values.length; i < n; ++i) {
    v = values[i];

    if (mainGrp && v[mainGrp] !== mainValue) {
      continue;
    }

    g = v[grp] || '';

    if (!(g in tmp)) {
      tmp[g] = 0;
      data[g] = [];
    }

    tmp[g] += +v[key];
    data[g].push(v);
  }

  Object.keys(tmp).forEach(k => {
    v = {
      children: data[k]
    };
    v[key] = +tmp[k];
    v[grp] = k;

    if (mainGrp) {
      v[mainGrp] = mainValue;
    }

    ret.push(v);
  });
  return ret;
}
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}
function index(values, key) {
  var n = values.length;
  var i;

  if (!n) {
    return key;
  }

  var obj = isObject(values[0]);
  key = obj ? key : 'v';

  for (i = 0, n = values.length; i < n; ++i) {
    if (obj) {
      values[i]._idx = i;
    } else {
      values[i] = {
        v: values[i],
        _idx: i
      };
    }
  }

  return key;
}
function sort(values, key) {
  if (key) {
    values.sort((a, b) => +b[key] - +a[key]);
  } else {
    values.sort((a, b) => +b - +a);
  }
}
function sum(values, key) {
  var s, i, n;

  for (s = 0, i = 0, n = values.length; i < n; ++i) {
    s += key ? +values[i][key] : +values[i];
  }

  return s;
}

function round(v, n) {
  return +(Math.round(v + 'e+' + n) + 'e-' + n);
}

function getDims(itm, w2, s2, key) {
  var a = itm._normalized;
  var ar = w2 * a / s2;
  var d1 = Math.sqrt(a * ar);
  var d2 = a / d1;
  var w = key === '_ix' ? d1 : d2;
  var h = key === '_ix' ? d2 : d1;
  return {
    d1,
    d2,
    w,
    h
  };
}

function buildRow(rect, itm, dims, sum) {
  var r = {
    x: round(rect.x + rect._ix, 4),
    y: round(rect.y + rect._iy, 4),
    w: round(dims.w, 4),
    h: round(dims.h, 4),
    a: itm._normalized,
    v: itm.value,
    s: sum,
    _data: itm._data
  };

  if (itm.group) {
    r.g = itm.group;
    r.l = itm.level;
    r.gs = itm.groupSum;
  }

  return r;
}

class Rect {
  constructor(r) {
    var me = this;
    me.x = r.x || r.left || 0;
    me.y = r.y || r.top || 0;
    me._ix = 0;
    me._iy = 0;
    me.w = r.w || r.width || r.right - r.left;
    me.h = r.h || r.height || r.bottom - r.top;
  }

  get area() {
    return this.w * this.h;
  }

  get iw() {
    return this.w - this._ix;
  }

  get ih() {
    return this.h - this._iy;
  }

  get dir() {
    var ih = this.ih;
    return ih <= this.iw && ih > 0 ? 'y' : 'x';
  }

  get side() {
    return this.dir === 'x' ? this.iw : this.ih;
  }

  map(arr) {
    var me = this;
    var ret = [];
    var sum = arr.nsum;
    var row = arr.get();
    var n = row.length;
    var dir = me.dir;
    var side = me.side;
    var w2 = side * side;
    var key = dir === 'x' ? '_ix' : '_iy';
    var s2 = sum * sum;
    var maxd2 = 0;
    var totd1 = 0;
    var i, itm, dims;

    for (i = 0; i < n; ++i) {
      itm = row[i];
      dims = getDims(itm, w2, s2, key);
      totd1 += dims.d1;

      if (dims.d2 > maxd2) {
        maxd2 = dims.d2;
      }

      ret.push(buildRow(me, itm, dims, arr.sum));
      me[key] += dims.d1;
    }

    me[dir === 'y' ? '_ix' : '_iy'] += maxd2;
    me[key] -= totd1;
    return ret;
  }

}

var min = Math.min;
var max = Math.max;

function getStat(sa) {
  return {
    min: sa.min,
    max: sa.max,
    sum: sa.sum,
    nmin: sa.nmin,
    nmax: sa.nmax,
    nsum: sa.nsum
  };
}

function getNewStat(sa, o) {
  var v = +o[sa.key];
  var n = v * sa.ratio;
  o._normalized = n;
  return {
    min: min(sa.min, v),
    max: max(sa.max, v),
    sum: sa.sum + v,
    nmin: min(sa.nmin, n),
    nmax: max(sa.nmax, n),
    nsum: sa.nsum + n
  };
}

function setStat(sa, stat) {
  _extends(sa, stat);
}

function push(sa, o, stat) {
  sa._arr.push(o);

  setStat(sa, stat);
}

class statArray {
  constructor(key, ratio) {
    var me = this;
    me.key = key;
    me.ratio = ratio;
    me.reset();
  }

  get length() {
    return this._arr.length;
  }

  reset() {
    var me = this;
    me._arr = [];
    me._hist = [];
    me.sum = 0;
    me.nsum = 0;
    me.min = Infinity;
    me.max = -Infinity;
    me.nmin = Infinity;
    me.nmax = -Infinity;
  }

  push(o) {
    push(this, o, getNewStat(this, o));
  }

  pushIf(o, fn) {
    var nstat = getNewStat(this, o);

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (!fn(getStat(this), nstat, args)) {
      return o;
    }

    push(this, o, nstat);
  }

  get() {
    return this._arr;
  }

}

function compareAspectRatio(oldStat, newStat, args) {
  if (oldStat.sum === 0) {
    return true;
  }

  var [length] = args;
  var os2 = oldStat.nsum * oldStat.nsum;
  var ns2 = newStat.nsum * newStat.nsum;
  var l2 = length * length;
  var or = Math.max(l2 * oldStat.nmax / os2, os2 / (l2 * oldStat.nmin));
  var nr = Math.max(l2 * newStat.nmax / ns2, ns2 / (l2 * newStat.nmin));
  return nr <= or;
}

function squarify(values, r, key, grp, lvl, gsum) {
  var rows = [];
  var rect = new Rect(r);
  var row = new statArray('value', rect.area / sum(values, key));
  var length = rect.side;
  var n = values.length;
  var i, o;

  if (!n) {
    return rows;
  }

  var tmp = values.slice();
  key = index(tmp, key);
  sort(tmp, key);

  function val(idx) {
    return key ? +tmp[idx][key] : +tmp[idx];
  }

  function gval(idx) {
    return grp && tmp[idx][grp];
  }

  for (i = 0; i < n; ++i) {
    o = {
      value: val(i),
      groupSum: gsum,
      _data: values[tmp[i]._idx]
    };

    if (grp) {
      o.level = lvl;
      o.group = gval(i);
    }

    o = row.pushIf(o, compareAspectRatio, length);

    if (o) {
      rows.push(rect.map(row));
      length = rect.side;
      row.reset();
      row.push(o);
    }
  }

  if (row.length) {
    rows.push(rect.map(row));
  }

  return flatten(rows);
}

/**
 * Helper function to get the bounds of the rect
 * @param {Rectangle} rect the rect
 * @param {boolean} [useFinalPosition]
 * @return {object} bounds of the rect
 * @private
 */

function getBounds(rect, useFinalPosition) {
  var {
    x,
    y,
    width,
    height
  } = rect.getProps(['x', 'y', 'width', 'height'], useFinalPosition);
  return {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height
  };
}

function limit(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

function parseBorderWidth(rect, maxW, maxH) {
  var value = rect.options.borderWidth;
  var t, r, b, l;

  if (Chart.helpers.isObject(value)) {
    t = +value.top || 0;
    r = +value.right || 0;
    b = +value.bottom || 0;
    l = +value.left || 0;
  } else {
    t = r = b = l = +value || 0;
  }

  return {
    t: limit(t, 0, maxH),
    r: limit(r, 0, maxW),
    b: limit(b, 0, maxH),
    l: limit(l, 0, maxW)
  };
}

function boundingRects(rect) {
  var bounds = getBounds(rect);
  var width = bounds.right - bounds.left;
  var height = bounds.bottom - bounds.top;
  var border = parseBorderWidth(rect, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b
    }
  };
}

function inRange(rect, x, y, useFinalPosition) {
  var skipX = x === null;
  var skipY = y === null;
  var bounds = !rect || skipX && skipY ? false : getBounds(rect, useFinalPosition);
  return bounds && (skipX || x >= bounds.left && x <= bounds.right) && (skipY || y >= bounds.top && y <= bounds.bottom);
}

class Rectangle extends Chart.Element {
  constructor(cfg) {
    super();
    this.options = undefined;
    this.width = undefined;
    this.height = undefined;

    if (cfg) {
      _extends(this, cfg);
    }
  }

  draw(ctx) {
    var options = this.options;
    var {
      inner,
      outer
    } = boundingRects(this);
    ctx.save();

    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      ctx.rect(outer.x, outer.y, outer.w, outer.h);
      ctx.clip();
      ctx.rect(inner.x, inner.y, inner.w, inner.h);
      ctx.fillStyle = options.backgroundColor;
      ctx.fill();
      ctx.fillStyle = options.borderColor;
      ctx.fill('evenodd');
    } else {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    }

    ctx.restore();
  }

  inRange(mouseX, mouseY, useFinalPosition) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }

  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, null, useFinalPosition);
  }

  inYRange(mouseY, useFinalPosition) {
    return inRange(this, null, mouseY, useFinalPosition);
  }

  getCenterPoint(useFinalPosition) {
    var {
      x,
      y,
      width,
      height
    } = this.getProps(['x', 'y', 'width', 'height'], useFinalPosition);
    return {
      x: x + width / 2,
      y: y + height / 2
    };
  }

  tooltipPosition() {
    return this.getCenterPoint();
  }

  getRange(axis) {
    return axis === 'x' ? this.width / 2 : this.height / 2;
  }

}

_defineProperty(Rectangle, "_type", 'rectangle');

var defaults = Chart.defaults;
var helpers = Chart.helpers;
var optionHelpers = helpers.options;
var parseFont = optionHelpers._parseFont;
var resolve = optionHelpers.resolve;
var valueOrDefault = helpers.valueOrDefault;

function rectNotEqual(r1, r2) {
  return !r1 || !r2 || r1.x !== r2.x || r1.y !== r2.y || r1.w !== r2.w || r1.h !== r2.h;
}

function arrayNotEqual(a1, a2) {
  var i, n;

  if (a1.lenght !== a2.length) {
    return true;
  }

  for (i = 0, n = a1.length; i < n; ++i) {
    if (a1[i] !== a2[i]) {
      return true;
    }
  }

  return false;
}

function drawCaption(rect, font) {
  var w = rect.width || rect.w;
  var h = rect.height || rect.h;
  var min = font.lineHeight * 2;
  return w > min && h > min;
}

function buildData(dataset, mainRect, font) {
  var key = dataset.key || '';
  var tree = dataset.tree || [];
  var groups = dataset.groups || [];
  var glen = groups.length;
  var sp = (dataset.spacing || 0) + (dataset.borderWidth || 0);

  function recur(gidx, rect, parent, gs) {
    var g = groups[gidx];
    var pg = gidx > 0 && groups[gidx - 1];
    var gdata = group(tree, g, key, pg, parent);
    var gsq = squarify(gdata, rect, key, g, gidx, gs);
    var ret = gsq.slice();
    var subRect;

    if (gidx < glen - 1) {
      gsq.forEach(sq => {
        subRect = {
          x: sq.x + sp,
          y: sq.y + sp,
          w: sq.w - 2 * sp,
          h: sq.h - 2 * sp
        };

        if (drawCaption(sq, font)) {
          subRect.y += font.lineHeight;
          subRect.h -= font.lineHeight;
        }

        ret.push(...recur(gidx + 1, subRect, sq.g, sq.s));
      });
    }

    return ret;
  }

  if (!tree.length && dataset.data.length) {
    tree = dataset.tree = dataset.data;
  }

  return glen ? recur(0, mainRect) : squarify(tree, mainRect, key);
}

function parseFontOptions(options) {
  return _extends(parseFont({
    fontFamily: valueOrDefault(options.fontFamily, defaults.fontFamily),
    fontSize: valueOrDefault(options.fontSize, defaults.fontSize),
    fontStyle: valueOrDefault(options.fontStyle, defaults.fontStyle),
    lineHeight: valueOrDefault(options.lineHeight, defaults.lineHeight)
  }), {
    color: resolve([options.fontColor, defaults.fontColor])
  });
}

class TreemapController extends Chart.DatasetController {
  update(mode) {
    var me = this;
    var meta = me.getMeta();
    var dataset = me.getDataset();
    var groups = dataset.groups || (dataset.groups = []);
    var font = parseFontOptions(dataset);
    var area = me.chart.chartArea;
    var key = dataset.key || '';
    var mainRect = {
      x: area.left,
      y: area.top,
      w: area.right - area.left,
      h: area.bottom - area.top
    };

    if (mode === 'reset' || rectNotEqual(me._rect, mainRect) || me._key !== key || arrayNotEqual(me._groups, groups)) {
      me._rect = mainRect;
      me._groups = groups.slice();
      me._key = key;
      dataset.data = buildData(dataset, mainRect, font);

      me._dataCheck();

      me._resyncElements();
    }

    me.updateElements(meta.data, 0, mode);
  }

  updateElements(rects, start, mode) {
    var me = this;
    var reset = mode === 'reset';
    var dataset = me.getDataset();
    var firstOpts = me.resolveDataElementOptions(start, mode);
    var sharedOptions = me.getSharedOptions(mode, rects[start], firstOpts);

    for (var i = 0; i < rects.length; i++) {
      var index = start + i;
      var sq = dataset.data[index];
      var options = me.resolveDataElementOptions(i, mode);
      var height = reset ? 0 : sq.h - options.spacing * 2;
      var width = reset ? 0 : sq.w - options.spacing * 2;
      var x = sq.x + options.spacing;
      var y = sq.y + options.spacing;
      var properties = {
        x,
        y,
        width,
        height,
        options
      };
      options.font = parseFont(options);
      me.updateElement(rects[i], index, properties, mode);
    }

    me.updateSharedOptions(sharedOptions, mode);
  }

  draw() {
    var me = this;
    var metadata = me.getMeta().data || [];
    var dataset = me.getDataset();
    var levels = (dataset.groups || []).length - 1;
    var data = dataset.data || [];
    var ctx = me.chart.ctx;
    var i, ilen, rect, item;

    for (i = 0, ilen = metadata.length; i < ilen; ++i) {
      rect = metadata[i];
      item = data[i];

      if (!rect.hidden) {
        rect.draw(ctx);
        var opts = rect.options;

        if (drawCaption(rect, opts.font) && item.g) {
          ctx.save();
          ctx.fillStyle = opts.fontColor;
          ctx.font = opts.font.string;
          ctx.beginPath();
          ctx.rect(rect.x, rect.y, rect.width, rect.height);
          ctx.clip();

          if (!('l' in item) || item.l === levels) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.g, rect.x + rect.width / 2, rect.y + rect.height / 2);
          } else {
            ctx.textAlign = 'start';
            ctx.textBaseline = 'top';
            ctx.fillText(item.g, rect.x + opts.borderWidth + 3, rect.y + opts.borderWidth + 3);
          }

          ctx.restore();
        }
      }
    }
  }

}
TreemapController.prototype.dataElementType = Rectangle;
TreemapController.prototype.dataElementOptions = ['backgroundColor', 'borderColor', 'borderSkipped', 'borderWidth', 'fontColor', 'fontFamily', 'fontSize', 'fontStyle', 'spacing'];

var defaults$1 = {
  hover: {
    mode: 'point',
    intersect: true
  },
  tooltips: {
    mode: 'point',
    position: 'treemap',
    intersect: true,
    callbacks: {
      title(item, data) {
        return data.datasets[item[0].datasetIndex].key;
      },

      label(item, data) {
        var dataset = data.datasets[item.datasetIndex];
        var dataItem = dataset.data[item.index];
        return dataset.label + ': ' + dataItem.v;
      }

    }
  },
  scales: {
    x: {
      type: 'linear',
      display: false
    },
    y: {
      type: 'linear',
      display: false
    }
  },
  elements: {
    rectangle: {
      borderWidth: 0,
      spacing: 0.5
    }
  }
};

Chart.controllers.treemap = TreemapController;
Chart.defaults.treemap = defaults$1;
var tooltipPlugin = Chart.plugins.getAll().find(p => p.id === 'tooltip');

tooltipPlugin.positioners.treemap = function (active) {
  if (!active.length) {
    return false;
  }

  var item = active[active.length - 1];
  var el = item.element;
  return {
    x: el.x + el.width / 2,
    y: el.y + el.height / 2
  };
};
