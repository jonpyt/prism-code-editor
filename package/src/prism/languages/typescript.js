import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './javascript.js';

var className = {
	pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/g,
	lookbehind: true
};
var ts = languages.ts = languages.typescript = extend('js', {
	'class-name': className
});

insertBefore(ts, 'operator', {
	'builtin': /\b(?:Array|Function|Promise|any|boolean|never|number|string|symbol|unknown)\b/
});

// The keywords TypeScript adds to JavaScript
ts.keyword.push(
	/\b(?:abstract|declare|is|keyof|readonly|require)\b|\b(?:asserts|infer|interface|module|namespace|type)\b(?!\s*[^\s{_$a-zA-Z\xa0-\uffff])|\btype(?=\s*\*)/
);

// doesn't work with TS because TS is too complex
delete ts['parameter'];
delete ts['literal-property'];

// a version of typescript specifically for highlighting types
var typeInside = className.inside = Object.assign({}, ts);
delete typeInside['class-name'];
delete typeInside['maybe-class-name'];

insertBefore(ts, 'constant', {
	'decorator': {
		pattern: /@[$\w\xa0-\uffff]+/,
		inside: {
			'at': {
				pattern: /^@/,
				alias: 'operator'
			},
			'function': /.+/
		}
	},
	'generic-function': {
		// e.g. foo<T extends "bar" | "baz">( ...
		pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+\s*<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/g,
		inside: {
			'generic': {
				pattern: /<[\s\S]+/, // everything after the first <
				alias: 'class-name',
				inside: typeInside
			},
			'function': /\S+/
		}
	}
});
