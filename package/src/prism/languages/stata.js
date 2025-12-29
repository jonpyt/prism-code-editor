import { languages } from '../core.js';
import './mata.js';
import './java.js';
import './python.js';

// https://www.stata.com/manuals/u.pdf
// https://www.stata.com/manuals/p.pdf

var expression = {
	pattern: /[\s\S]+/
};

expression.inside = languages.stata = {
	'comment': [
		{
			pattern: /(^[ \t]*)\*.*/mg,
			lookbehind: true
		},
		{
			pattern: /(^|\s)\/\/.*|\/\*[\s\S]*?\*\//g,
			lookbehind: true
		}
	],
	'string-literal': {
		pattern: /"[^\n"]*"|[‘`']".*?"[’`']/g,
		inside: {
			'interpolation': {
				pattern: /\$\{[^{}]*\}|[‘`']\w[^’`'\n]*[’`']/,
				inside: {
					'punctuation': /^\$\{|\}$/,
					'expression': expression
				}
			},
			'string': /[\s\S]+/
		}
	},

	'mata': {
		pattern: /(^[ \t]*mata[ \t]*:)[\s\S]+?(?=^end\b)/mg,
		lookbehind: true,
		alias: 'language-mata',
		inside: languages.mata
	},
	'java': {
		pattern: /(^[ \t]*java[ \t]*:)[\s\S]+?(?=^end\b)/mg,
		lookbehind: true,
		alias: 'language-java',
		inside: languages.java
	},
	'python': {
		pattern: /(^[ \t]*python[ \t]*:)[\s\S]+?(?=^end\b)/mg,
		lookbehind: true,
		alias: 'language-python',
		inside: languages.py
	},


	'command': {
		pattern: /(^[ \t]*(?:\.[ \t]+)?(?:(?:bayes|bootstrap|by|bysort|capture|collect|fmm|frame|jackknife|m?fp|mi|nestreg|noisily|permute|quietly|rolling|simulate|statsby|stepwise|svy|version|xi)\b[^\n:]*:[ \t]*|(?:capture|noisily|quietly|version)[ \t]+)?)[a-zA-Z]\w*/mg,
		lookbehind: true,
		alias: 'keyword'
	},
	'variable': /\$\w+|[‘`']\w[^’`'\n]*[’`']/,
	'keyword': /\b(?:bayes|bootstrap|by|bysort|capture|clear|collect|fmm|frame|if|in|jackknife|mi[ \t]+estimate|m?fp|nestreg|noisily|of|permute|quietly|rolling|simulate|sort|statsby|stepwise|svy|varlist|version|xi)\b/,


	'boolean': /\b(?:off|on)\b/,
	'number': /\b\d+(?:\.\d+)?\b|\B\.\d+/,
	'function': /\b[a-z_]\w*(?=\()/i,

	'operator': /--|\+\+|##?|[~!=<>]=?|[&|^/*+-]/,
	'punctuation': /[()[\]{},:]/
};
