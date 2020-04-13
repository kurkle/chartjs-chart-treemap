/*!
 * chartjs-chart-treemap v1.0.0-alpha
 * https://github.com/kurkle/chartjs-chart-treemap#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT license
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
(global = global || self, factory(global.Chart));
}(this, (function (Chart) { 'use strict';

Chart = Chart && Object.prototype.hasOwnProperty.call(Chart, 'default') ? Chart['default'] : Chart;

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(input) {
  var stack = _toConsumableArray(input);

  var res = [];

  while (stack.length) {
    // pop value from stack
    var next = stack.pop();

    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push.apply(stack, _toConsumableArray(next));
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

  Object.keys(tmp).forEach(function (k) {
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
  var type = _typeof(obj);

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
    values.sort(function (a, b) {
      return +b[key] - +a[key];
    });
  } else {
    values.sort(function (a, b) {
      return +b - +a;
    });
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
    d1: d1,
    d2: d2,
    w: w,
    h: h
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

var Rect = /*#__PURE__*/function () {
  function Rect(r) {
    _classCallCheck(this, Rect);

    var me = this;
    me.x = r.x || r.left || 0;
    me.y = r.y || r.top || 0;
    me._ix = 0;
    me._iy = 0;
    me.w = r.w || r.width || r.right - r.left;
    me.h = r.h || r.height || r.bottom - r.top;
  }

  _createClass(Rect, [{
    key: "map",
    value: function map(arr) {
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
  }, {
    key: "area",
    get: function get() {
      return this.w * this.h;
    }
  }, {
    key: "iw",
    get: function get() {
      return this.w - this._ix;
    }
  }, {
    key: "ih",
    get: function get() {
      return this.h - this._iy;
    }
  }, {
    key: "dir",
    get: function get() {
      var ih = this.ih;
      return ih <= this.iw && ih > 0 ? 'y' : 'x';
    }
  }, {
    key: "side",
    get: function get() {
      return this.dir === 'x' ? this.iw : this.ih;
    }
  }]);

  return Rect;
}();

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

function _push(sa, o, stat) {
  sa._arr.push(o);

  setStat(sa, stat);
}

var statArray = /*#__PURE__*/function () {
  function statArray(key, ratio) {
    _classCallCheck(this, statArray);

    var me = this;
    me.key = key;
    me.ratio = ratio;
    me.reset();
  }

  _createClass(statArray, [{
    key: "reset",
    value: function reset() {
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
  }, {
    key: "push",
    value: function push(o) {
      _push(this, o, getNewStat(this, o));
    }
  }, {
    key: "pushIf",
    value: function pushIf(o, fn) {
      var nstat = getNewStat(this, o);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (!fn(getStat(this), nstat, args)) {
        return o;
      }

      _push(this, o, nstat);
    }
  }, {
    key: "get",
    value: function get() {
      return this._arr;
    }
  }, {
    key: "length",
    get: function get() {
      return this._arr.length;
    }
  }]);

  return statArray;
}();

function compareAspectRatio(oldStat, newStat, args) {
  if (oldStat.sum === 0) {
    return true;
  }

  var _args = _slicedToArray(args, 1),
      length = _args[0];

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
  var _rect$getProps = rect.getProps(['x', 'y', 'width', 'height'], useFinalPosition),
      x = _rect$getProps.x,
      y = _rect$getProps.y,
      width = _rect$getProps.width,
      height = _rect$getProps.height;

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

function _inRange(rect, x, y, useFinalPosition) {
  var skipX = x === null;
  var skipY = y === null;
  var bounds = !rect || skipX && skipY ? false : getBounds(rect, useFinalPosition);
  return bounds && (skipX || x >= bounds.left && x <= bounds.right) && (skipY || y >= bounds.top && y <= bounds.bottom);
}

var Rectangle = /*#__PURE__*/function (_Chart$Element) {
  _inherits(Rectangle, _Chart$Element);

  var _super = _createSuper(Rectangle);

  function Rectangle(cfg) {
    var _this;

    _classCallCheck(this, Rectangle);

    _this = _super.call(this);
    _this.options = undefined;
    _this.width = undefined;
    _this.height = undefined;

    if (cfg) {
      _extends(_assertThisInitialized(_this), cfg);
    }

    return _this;
  }

  _createClass(Rectangle, [{
    key: "draw",
    value: function draw(ctx) {
      var options = this.options;

      var _boundingRects = boundingRects(this),
          inner = _boundingRects.inner,
          outer = _boundingRects.outer;

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
  }, {
    key: "inRange",
    value: function inRange(mouseX, mouseY, useFinalPosition) {
      return _inRange(this, mouseX, mouseY, useFinalPosition);
    }
  }, {
    key: "inXRange",
    value: function inXRange(mouseX, useFinalPosition) {
      return _inRange(this, mouseX, null, useFinalPosition);
    }
  }, {
    key: "inYRange",
    value: function inYRange(mouseY, useFinalPosition) {
      return _inRange(this, null, mouseY, useFinalPosition);
    }
  }, {
    key: "getCenterPoint",
    value: function getCenterPoint(useFinalPosition) {
      var _this$getProps = this.getProps(['x', 'y', 'width', 'height'], useFinalPosition),
          x = _this$getProps.x,
          y = _this$getProps.y,
          width = _this$getProps.width,
          height = _this$getProps.height;

      return {
        x: x + width / 2,
        y: y + height / 2
      };
    }
  }, {
    key: "tooltipPosition",
    value: function tooltipPosition() {
      return this.getCenterPoint();
    }
  }, {
    key: "getRange",
    value: function getRange(axis) {
      return axis === 'x' ? this.width / 2 : this.height / 2;
    }
  }]);

  return Rectangle;
}(Chart.Element);

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
      gsq.forEach(function (sq) {
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

        ret.push.apply(ret, _toConsumableArray(recur(gidx + 1, subRect, sq.g, sq.s)));
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

var TreemapController = /*#__PURE__*/function (_Chart$DatasetControl) {
  _inherits(TreemapController, _Chart$DatasetControl);

  var _super = _createSuper(TreemapController);

  function TreemapController() {
    _classCallCheck(this, TreemapController);

    return _super.apply(this, arguments);
  }

  _createClass(TreemapController, [{
    key: "update",
    value: function update(mode) {
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
  }, {
    key: "updateElements",
    value: function updateElements(rects, start, mode) {
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
          x: x,
          y: y,
          width: width,
          height: height,
          options: options
        };
        options.font = parseFont(options);
        me.updateElement(rects[i], index, properties, mode);
      }

      me.updateSharedOptions(sharedOptions, mode);
    }
  }, {
    key: "draw",
    value: function draw() {
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
  }]);

  return TreemapController;
}(Chart.DatasetController);
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
      title: function title(item, data) {
        return data.datasets[item[0].datasetIndex].key;
      },
      label: function label(item, data) {
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
var tooltipPlugin = Chart.plugins.getAll().find(function (p) {
  return p.id === 'tooltip';
});

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

})));
