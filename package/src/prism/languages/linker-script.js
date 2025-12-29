import { languages } from '../core.js';

languages['ld'] = languages['linker-script'] = {
	'identifier': /"[^\n"]*"/,
	'comment': {
		pattern: /(^|\s)\/\*[\s\S]*?(?:$|\*\/)/g,
		lookbehind: true
	},

	'location-counter': {
		pattern: /\B\.\B/,
		alias: 'important'
	},

	'section': {
		pattern: /(^|[^\w*])\.\w+/,
		lookbehind: true,
		alias: 'keyword'
	},
	'function': /\b[A-Z][A-Z_]*(?=\s*\()/,

	'number': /\b(?:0[xX][a-fA-F\d]+|\d+)[KM]?\b/,

	'operator': /->|--|\+\+|&&|\|\||::|[?:~]|>>=?|<<=?|[%&|^!=<>/*+-]=?/,
	'punctuation': /[(){},;]/
};
