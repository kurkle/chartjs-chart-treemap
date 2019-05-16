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

function sort(values, key) {
	if (key) {
		values.sort(function(a, b) {
			return b[key] - a[key];
		});
	} else {
		values.sort(function(a, b) {
			return b - a;
		});
	}
}

function sum(values, key) {
	var s, i, n;

	for (s = 0, i = 0, n = values.length; i < n; ++i) {
		s += key ? values[i][key] : values[i];
	}

	return s;
}

export default {
	flatten: flatten,
	sort: sort,
	sum: sum
};
