import { languages } from '../core.js';
import { clikeComment } from '../utils/patterns.js';

var statement = {
	pattern: /[\s\S]+/
}

statement.inside = languages.mel = {
	'comment': clikeComment,
	'code': {
		pattern: /`(?:\\.|[^\\`])*`/g,
		alias: 'italic',
		inside: {
			'delimiter': {
				pattern: /^`|`$/,
				alias: 'punctuation'
			},
			'statement': statement
		}
	},
	'string': /"(?:\\.|[^\\\n"])*"/g,
	'variable': /\$\w+/,
	'number': /\b0x[a-fA-F\d]+\b|\b\d+(?:\.\d*)?|\B\.\d+/,
	'flag': {
		pattern: /-[^\d\W]\w*/,
		alias: 'operator'
	},
	'keyword': /\b(?:break|case|continue|default|do|else|float|for|global|if|int?|matrix|proc|return|string|switch|vector|while)\b/,
	'function': {
		pattern: /((?:^|[{;])[ \t]*)[a-z_]\w*\b(?!\s*(?:\.(?!\.)|[[{=]))|\b[a-z_]\w*(?=[ \t]*\()/img,
		lookbehind: true
	},

	'tensor-punctuation': {
		pattern: /<<|>>/,
		alias: 'punctuation'
	},
	'operator': /--|\+\+|&&|\|\||[!=<>/*+-]=?|[%^]/,
	'punctuation': /[()[\]{}.,:;?]/
};
