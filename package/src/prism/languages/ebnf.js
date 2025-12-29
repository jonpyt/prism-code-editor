import { languages } from '../core.js';

languages.ebnf = {
	'comment': /\(\*[\s\S]*?\*\)/,
	'string': /"[^\n"]*"|'[^\n']*'/g,
	'special': {
		pattern: /\?[^\n?]*\?/g,
		alias: 'class-name'
	},

	'definition': {
		pattern: /^([ \t]*)[a-z]\w*(?:[ \t]+[a-z]\w*)*(?=\s*=)/im,
		lookbehind: true,
		alias: 'rule keyword'
	},
	'rule': /\b[a-z]\w*(?:[ \t]+[a-z]\w*)*\b/i,

	'punctuation': /\([:/]|[:/]\)|[()[\]{}.,;]/,
	'operator': /[|!=/*-]/
};
