import { languages } from '../core.js';

var variable = /\$(?:\w[a-z\d]*(?:_[^\0-\x1f\s"'\\()$]*)?|\{[^\\\s}"']+\})/i;

languages.nginx = {
	'comment': {
		pattern: /(^|[\s{};])#.*/g,
		lookbehind: true
	},
	'directive': {
		pattern: /(^|\s)\w(?:\\.|[^\\\s"'{};]|"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\s+(?:#.*(?!.)|(?![#\s])))*?(?=\s*[;{])/g,
		lookbehind: true,
		inside: {
			'string': {
				pattern: /((?:^|[^\\])(?:\\\\)*)(?:"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*')/g,
				lookbehind: true,
				inside: {
					'escape': {
						pattern: /\\["'\\nrt]/,
						alias: 'entity'
					},
					'variable': variable
				}
			},
			'comment': {
				pattern: /(\s)#.*/g,
				lookbehind: true
			},
			'keyword': /^\S+/g,

			// other patterns

			'boolean': {
				pattern: /(\s)(?:off|on)(?!\S)/,
				lookbehind: true
			},
			'number': {
				pattern: /(\s)\d+[a-z]*(?!\S)/i,
				lookbehind: true
			},
			'variable': variable
		}
	},
	'punctuation': /[{};]/
};
