import { languages } from '../core.js';
import { re } from '../utils/shared.js';

var ID = /(?:(?!d)[\w\x80-\uffff]+|-?(?:\.\d+|\d+(?:\.\d*)?)|"[^\\"]*(?:\\[\s\S][^\\"]*)*"|<(?:[^<>]|(?!<!--)<(?:[^<>"']|"[^"]*"|'[^']*')+>|<!--(?:[^-]|-(?!->))*-->)*>)/.source;

var IDInside = {
	'markup': {
		pattern: /(^<)[\s\S]+(?=>)/,
		lookbehind: true,
		alias: 'language-markup',
		inside: 'markup'
	}
};

languages.gv = languages.dot = {
	'comment': /\/\/.*|\/\*[\s\S]*?\*\/|^#.*/mg,
	'graph-name': {
		pattern: re(/(\b(?:digraph|graph|subgraph)[ \t\n]+)<0>/.source, [ID], 'gi'),
		lookbehind: true,
		alias: 'class-name',
		inside: IDInside
	},
	'attr-value': {
		pattern: re(/(=[ \t\n]*)<0>/.source, [ID], 'g'),
		lookbehind: true,
		inside: IDInside
	},
	'attr-name': {
		pattern: re(/([\[;, \t\n])<0>(?=[ \t\n]*=)/.source, [ID], 'g'),
		lookbehind: true,
		inside: IDInside
	},
	'keyword': /\b(?:digraph|edge|graph|node|strict|subgraph)\b/i,
	'compass-point': {
		pattern: /(:[ \t\n]*)(?:[ewc_]|[ns][ew]?)(?![\w\x80-\uffff])/,
		lookbehind: true,
		alias: 'builtin'
	},
	'node': {
		pattern: re(/(^|[^\\\w\x80-\uffff.-])<0>/.source, [ID], 'g'),
		lookbehind: true,
		inside: IDInside
	},
	'operator': /[=:]|-[->]/,
	'punctuation': /[[\]{},;]/
};
