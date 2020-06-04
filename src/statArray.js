const min = Math.min;
const max = Math.max;

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
	const v = +o[sa.key];
	const n = v * sa.ratio;
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
	Object.assign(sa, stat);
}

function push(sa, o, stat) {
	sa._arr.push(o);
	setStat(sa, stat);
}

export default class StatArray {
	constructor(key, ratio) {
		const me = this;
		me.key = key;
		me.ratio = ratio;
		me.reset();
	}

	get length() {
		return this._arr.length;
	}

	reset() {
		const me = this;
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

	pushIf(o, fn, ...args) {
		const nstat = getNewStat(this, o);
		if (!fn(getStat(this), nstat, args)) {
			return o;
		}
		push(this, o, nstat);
	}

	get() {
		return this._arr;
	}
}
