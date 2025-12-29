import { languages } from '../core.js';

languages.gcode = {
	'comment': /;.*|\B\(.*?\)\B/,
	'string': /"(?:""|[^"])*"/g,
	'keyword': /\b[GM]\d+(?:\.\d+)?\b/,
	'property': /\b[A-Z]/,
	'checksum': {
		pattern: /(\*)\d+/,
		lookbehind: true,
		alias: 'number'
	},
	// T0:0:0
	'punctuation': /[:*]/
};
