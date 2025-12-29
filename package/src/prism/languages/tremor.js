import { languages } from '../core.js';

var interpolationPattern = /#\{(?:[^"{}]|\{[^{}]*\}|"(?:\\[\s\S]|[^\\\n"])*")*\}/.source;

languages.trickle = languages.troy = languages.tremor = {
	'comment': /\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*/,
	'interpolated-string': {
		pattern: RegExp(
			`(^|[^\\\\])(?:"""(?:\\\\[\\s\\S]|[^\\\\"#]|"(?!"")|#(?!\\{)|${interpolationPattern})*"""|"(?:\\\\[\\s\\S]|[^\\\\\n"#]|#(?!\\{)|${interpolationPattern})*")`, 'g'
		),
		lookbehind: true,
		inside: {
			'interpolation': {
				pattern: RegExp(interpolationPattern),
				inside: {
					'punctuation': /^#\{|\}$/,
					'expression': {
						pattern: /[\s\S]+/,
						inside: 'tremor'
					}
				}
			},
			'string': /[\s\S]+/
		}
	},
	'extractor': {
		pattern: /\b[a-z_]\w*\|(?:\\[\s\S]|[^\\\n|])*\|/gi,
		inside: {
			'regex': {
				pattern: /(^re)\|[\s\S]+/,
				lookbehind: true
			},
			'function': /^\w+/,
			'value': /\|[\s\S]+/
		}
	},
	'identifier': /`[^`]*`/g,

	'function': /\b[a-z_]\w*(?=\s*(?:::\s*<|\())\b/,

	'keyword': /\b(?:args|as|by|case|config|connect|connector|const|copy|create|default|define|deploy|drop|each|emit|end|erase|event|flow|fn|for|from|group|having|insert|into|intrinsic|[ls]et|links|[mp]atch|merge|mod|move|of|operator|pipeline|recur|script|select|sliding|state|stream|to|tumbling|update|use|when|where|window|with)\b/,
	'boolean': /\b(?:false|true|null)\b/i,

	'number': /\b(?:0b[01_]*|0x[a-fA-F\d_]*|\d[\d_]*(?:\.\d[\d_]*)?(?:[Ee][+-]?[\d_]+)?)\b/,

	'pattern-punctuation': {
		pattern: /%(?=[({[])/,
		alias: 'punctuation'
	},
	'operator': /=>|&&|\|\||<<=?|>>>?=?|[~%&|^!=<>/*+-]=?|(?:absent|and|not|x?or|present)\b/,
	'punctuation': /::|[()[\]{}.,:;]/,
};
