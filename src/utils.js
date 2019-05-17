'use strict';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(input) {
	const stack = [...input];
	const res = [];
	while (stack.length) {
		// pop value from stack
		const next = stack.pop();
		if (Array.isArray(next)) {
			// push back array items, won't modify the original input
			stack.push(...next);
		} else {
			res.push(next);
		}
	}
	// reverse to restore input order
	return res.reverse();
}

function group(values, grp, key, mainGrp, mainValue) {
	var tmp = Object.create(null);
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
		}
		tmp[g] += +v[key];
	}

	Object.keys(tmp).forEach(function(k) {
		v = {};
		v[key] = +tmp[k];
		v[grp] = k;
		if (mainGrp) {
			v[mainGrp] = mainValue;
		}
		ret.push(v);
	});

	return ret;
}

function sort(values, key) {
	if (key) {
		values.sort(function(a, b) {
			return +b[key] - +a[key];
		});
	} else {
		values.sort(function(a, b) {
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

export default {
	flatten: flatten,
	group: group,
	sort: sort,
	sum: sum
};
