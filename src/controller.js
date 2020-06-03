'use strict';

import Chart from 'chart.js';
import {group} from './utils';
import squarify from './squarify';
import Rectangle from './rectangle';

const defaults = Chart.defaults;
const helpers = Chart.helpers;
const optionHelpers = helpers.options;
const parseFont = optionHelpers._parseFont;
const resolve = optionHelpers.resolve;
const valueOrDefault = helpers.valueOrDefault;

function rectNotEqual(r1, r2) {
	return !r1 || !r2
		|| r1.x !== r2.x
		|| r1.y !== r2.y
		|| r1.w !== r2.w
		|| r1.h !== r2.h;
}

function arrayNotEqual(a1, a2) {
	let i, n;

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

function shouldDrawCaption(rect, font) {
	if (!font) {
		return false;
	}
	const w = rect.width || rect.w;
	const h = rect.height || rect.h;
	const min = font.lineHeight * 2;
	return w > min && h > min;
}

function drawCaption(ctx, rect, item, opts, levels) {
	ctx.save();
	ctx.fillStyle = opts.fontColor;
	ctx.font = opts.font.string;
	ctx.beginPath();
	ctx.rect(rect.x, rect.y, rect.width, rect.height);
	ctx.clip();
	if (!('l' in item) || item.l === levels) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		drawLabels(ctx, item, rect);
	} else if (opts.groupLabels) {
		ctx.textAlign = 'start';
		ctx.textBaseline = 'top';
		ctx.fillText(item.g, rect.x + opts.borderWidth + 3, rect.y + opts.borderWidth + 3);
	}
	ctx.restore();
}

function drawDivider(ctx, rect) {
	const opts = rect.options;
	const w = rect.width || rect.w;
	const h = rect.height || rect.h;

	ctx.save();
	ctx.strokeStyle = opts.dividerColor || 'black';
	ctx.lineCap = opts.dividerCapStyle;
	ctx.setLineDash(opts.dividerDash);
	ctx.lineDashOffset = opts.dividerDashOffset;
	ctx.lineWidth = opts.dividerWidth;
	ctx.beginPath();
	if (w > h) {
		const w2 = w / 2;
		ctx.moveTo(rect.x + w2, rect.y);
		ctx.lineTo(rect.x + w2, rect.y + h);
	} else {
		const h2 = h / 2;
		ctx.moveTo(rect.x, rect.y + h2);
		ctx.lineTo(rect.x + w, rect.y + h2);
	}
	ctx.stroke();
	ctx.restore();
}

function buildData(dataset, mainRect, font) {
	const key = dataset.key || '';
	let tree = dataset.tree || [];
	const groups = dataset.groups || [];
	const glen = groups.length;
	const sp = (dataset.spacing || 0) + (dataset.borderWidth || 0);

	function recur(gidx, rect, parent, gs) {
		const g = groups[gidx];
		const pg = (gidx > 0) && groups[gidx - 1];
		const gdata = group(tree, g, key, pg, parent);
		const gsq = squarify(gdata, rect, key, g, gidx, gs);
		const ret = gsq.slice();
		let subRect;
		if (gidx < glen - 1) {
			gsq.forEach((sq) => {
				subRect = {x: sq.x + sp, y: sq.y + sp, w: sq.w - 2 * sp, h: sq.h - 2 * sp};

				if (dataset.groupLabels && shouldDrawCaption(sq, font)) {
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

	return glen
		? recur(0, mainRect)
		: squarify(tree, mainRect, key);
}

function parseFontOptions(options) {
	return Object.assign(parseFont({
		fontFamily: valueOrDefault(options.fontFamily, defaults.fontFamily),
		fontSize: valueOrDefault(options.fontSize, defaults.fontSize),
		fontStyle: valueOrDefault(options.fontStyle, defaults.fontStyle),
		lineHeight: valueOrDefault(options.lineHeight, defaults.lineHeight)
	}), {
		color: resolve([options.fontColor, defaults.fontColor])
	});
}

function drawLabels(ctx, item, rect) {
	const opts = rect.options;
	const lh = opts.font.lineHeight;
	const labels = (opts.label || item.g + '\n' + item.v).split('\n');
	const y = rect.y + rect.height / 2 - labels.length * lh / 4;
	labels.forEach((l, i) => ctx.fillText(l, rect.x + rect.width / 2, y + i * lh));
}

export default class TreemapController extends Chart.DatasetController {

	update(mode) {
		const me = this;
		const meta = me.getMeta();
		const dataset = me.getDataset();
		const groups = dataset.groups || (dataset.groups = []);
		const font = parseFontOptions(dataset);
		const area = me.chart.chartArea;
		const key = dataset.key || '';

		const mainRect = {x: area.left, y: area.top, w: area.right - area.left, h: area.bottom - area.top};

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

	_updateOptionsWidthDefaults(options) {
		const me = this;
		const dataset = me.getDataset();
		const treemapDefaults = me.chart.options.treemap.datasets;

		options.dividerColor = dataset.dividerColor || treemapDefaults.dividerColor;
		options.dividerDash = dataset.dividerDash || treemapDefaults.dividerDash;
		options.dividerDashOffset = dataset.dividerDashOffset || treemapDefaults.dividerDashOffset;
		options.dividerWidth = dataset.dividerWidth || treemapDefaults.dividerWidth;
		options.font = parseFont(options);
	}

	updateElements(rects, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const dataset = me.getDataset();
		const firstOpts = me._rect.options = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(mode, rects[start], firstOpts);
		me._updateOptionsWidthDefaults(firstOpts);

		for (let i = 0; i < rects.length; i++) {
			const index = start + i;
			const sq = dataset.data[index];
			const options = me.resolveDataElementOptions(i, mode);
			const height = reset ? 0 : sq.h - options.spacing * 2;
			const width = reset ? 0 : sq.w - options.spacing * 2;
			const x = sq.x + options.spacing;
			const y = sq.y + options.spacing;
			const properties = {
				x,
				y,
				width,
				height,
				options
			};
			me._updateOptionsWidthDefaults(options);
			me.updateElement(rects[i], index, properties, mode);
		}

		me.updateSharedOptions(sharedOptions, mode);
	}

	_drawDividers(ctx, data, metadata) {
		for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
			const rect = metadata[i];
			const item = data[i];
			if (rect.options.groupDividers && item._data.children.length > 1) {
				drawDivider(ctx, rect);
			}
		}
		if (this.getDataset().groupDividers) {
			drawDivider(ctx, this._rect);
		}
	}

	_drawRects(ctx, data, metadata, levels) {
		for (let i = 0, ilen = metadata.length; i < ilen; ++i) {
			const rect = metadata[i];
			const item = data[i];
			if (!rect.hidden) {
				rect.draw(ctx);
				const opts = rect.options;
				if (shouldDrawCaption(rect, opts.font) && item.g) {
					drawCaption(ctx, rect, item, opts, levels);
				}
			}
		}
	}

	draw() {
		const me = this;
		const ctx = me.chart.ctx;
		const metadata = me.getMeta().data || [];
		const dataset = me.getDataset();
		const levels = (dataset.groups || []).length - 1;
		const data = dataset.data || [];

		me._drawRects(ctx, data, metadata, levels);
		me._drawDividers(ctx, data, metadata);
	}
}

TreemapController.prototype.dataElementType = Rectangle;

TreemapController.prototype.dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderSkipped',
	'borderWidth',
	'fontColor',
	'fontFamily',
	'fontSize',
	'fontStyle',
	'groupLabels',
	'groupDividers',
	'spacing',
	'label'
];
