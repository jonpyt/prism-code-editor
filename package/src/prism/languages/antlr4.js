import { languages } from '../core.js';
import { clikeComment } from '../utils/patterns.js';

languages.g4 = languages.antlr4 = {
	'comment': clikeComment,
	'string': /'(?:\\.|[^\\\n'])*'/g,
	'character-class': {
		pattern: /\[(?:\\.|[^\\\]\n])*\]/g,
		alias: 'regex',
		inside: {
			'range': {
				pattern: /([^[]|(?:^|[^\\])(?:\\\\)*\\\[)-(?!\])/,
				lookbehind: true,
				alias: 'punctuation'
			},
			'escape': /\\(?:u(?:[a-fA-F\d]{4}|\{[a-fA-F\d]+\})|[pP]\{[=\w-]+\}|[^\nupP])/,
			'punctuation': /[[\]]/
		}
	},
	'action': {
		pattern: /\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})*\}/g,
		inside: {
			'content': /(?!^)[\s\S]+(?=.)/,
			'punctuation': /./
		}
	},
	'command': {
		pattern: /(->\s*(?!\s))(?:\s*(?:,\s*)?\b[a-z]\w*(?:\s*\([^()\n]*\))?)+(?=\s*;)/i,
		lookbehind: true,
		inside: {
			'function': /\b\w+(?!\s*[^\s,(])/,
			'punctuation': /[(),]/
		}
	},
	'annotation': {
		pattern: /@\w+(?:::\w+)*/,
		alias: 'keyword'
	},
	'label': {
		pattern: /#[ \t]*\w+/,
		alias: 'punctuation'
	},
	'keyword': /\b(?:catch|channels|finally|fragment|grammar|import|lexer|locals|mode|options|parser|returns|throws|tokens)\b/,
	'definition': [
		{
			pattern: /\b[a-z]\w*(?=\s*:)/,
			alias: 'rule class-name'
		},
		{
			pattern: /\b[A-Z]\w*(?=\s*:)/,
			alias: 'token constant'
		},
	],
	'constant': /\b[A-Z][A-Z_]*\b/,
	'operator': /\.\.|->|[|~]|[*+?]\??/,
	'punctuation': /[():;=]/
};
