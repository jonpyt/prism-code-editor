import { languages } from '../core.js';
import { boolean } from '../utils/patterns.js';

languages.rip = {
	'comment': /#.*/g,

	'char': /\B`[^\s"'`#/\\<>()[\]{}.,:;]\b/g,
	'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,

	'regex': {
		pattern: /(^|[^/])\/(?!\/)(?:\[[^\n\]]*\]|\\.|[^\\\n/[])+\/(?=\s*(?:$|[\n.,;})]))/g,
		lookbehind: true
	},

	'keyword': /(?:=>|->)|\b(?:case|catch|class|else|exit|finally|if|raise|return|switch|try)\b/,

	'builtin': /@|\bSystem\b/,

	'boolean': boolean,

	'date': /\b\d{4}-\d\d-\d\d\b/,
	'time': /\b\d\d:\d\d:\d\d\b/,
	'datetime': /\b\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\b/,

	'symbol': /:(?!\d)[^\s"'`#/\\<>()[\]{}.,:;]+/,
	'number': /[+-]?\b(?:\d+\.\d+|\d+)\b/,

	'punctuation': /\.{2,3}|[`\\<>=/()[\]{}.,:;]/,

	'reference': /(?!\d)[^\s"'`#/\\<>()[\]{}.,:;]+/
};
