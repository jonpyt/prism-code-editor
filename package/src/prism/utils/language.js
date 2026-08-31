import { languages, rest, tokenize } from "../core.js";

var _clone = (o, visited) => {
	if (visited.has(o)) return visited.get(o);
	var copy = o, t = toString.call(o).slice(8, -1);

	if (t == "Object") {
		visited.set(o, copy = {});
		for (var key in o) {
			copy[key] = _clone(o[key], visited);
		}
		if (o[rest]) copy[rest] = _clone(o[rest], visited);
		if (o[tokenize]) copy[tokenize] = o[tokenize];
	}
	else if (t == "Array") {
		visited.set(o, copy = []);
		for (var i = 0, l = o.length; i < l; i++) {
			copy[i] = _clone(o[i], visited);
		}
	}

	return copy;
}

var clone = o => _clone(o, new Map);

var extend = (id, redef) => Object.assign(clone(languages[id]), redef);

var insertBefore = (grammar, before, insert) => {
	var temp = {};

	for (var token in grammar) {
		temp[token] = grammar[token];
		delete grammar[token];
	}

	for (var token in temp) {
		if (token == before) Object.assign(grammar, insert);

		// Do not insert token which also occur in insert. See #1525
		if (!insert.hasOwnProperty(token)) {
			grammar[token] = temp[token];
		}
	}
}

var addAlias = (token, alias) => {
	return token.alias = token.alias ? token.alias + " " + alias : alias;
}

var toString = {}.toString;

export { clone, insertBefore, extend, addAlias };
