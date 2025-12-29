import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

// https://www.json.org/json-en.html
languages.webmanifest = languages.json = {
	'property': /"(?:\\.|[^\\\n"])*"(?=\s*:)/g,
	'string': /"(?:\\.|[^\\\n"])*"/g,
	'comment': clikeComment,
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'operator': /:/,
	'punctuation': /[[\]{},]/,
	'boolean': boolean,
	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	}
};
