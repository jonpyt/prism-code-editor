import { languages, rest } from '../core.js';

var string = /"(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*'/g;
var stringSrc = string.source;

var atruleInside = {
	'rule': /^@[\w-]+/,
	'selector-function-argument': {
		pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^)]*\))*\))+(?=\s*\))/,
		lookbehind: true,
		alias: 'selector'
	},
	'keyword': {
		pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
		lookbehind: true
	}
	// See rest below
};

atruleInside[rest] = languages.css = {
	'comment': /\/\*[\s\S]*?\*\//,
	'atrule': {
		pattern: RegExp(`@[\\w-](?:[^\\s;{"']|\\s+(?!\\s)|${stringSrc})*?(?:;|(?=\\s*\\{))`),
		inside: atruleInside
	},
	'url': {
		// https://drafts.csswg.org/css-values-3/#urls
		pattern: RegExp(`\\burl\\((?:${stringSrc}|(?:[^\\\\\n"')=]|\\\\[\\s\\S])*)\\)`, 'gi'),
		inside: {
			'function': /^url/i,
			'punctuation': /^\(|\)$/,
			'string': {
				pattern: /^["'][\s\S]+/,
				alias: 'url'
			}
		}
	},
	'selector': {
		pattern: RegExp(`(^|[{}\\s])[^\\s{}](?:[^\\s{};"']|\\s+(?![\\s{])|${stringSrc})*(?=\\s*\\{)`),
		lookbehind: true
	},
	'string': string,
	'variable': {
		pattern: /(^|[^-\w\xa0-\uffff])--(?:(?!\s)[-\w\xa0-\uffff])*/,
		lookbehind: true
	},
	'property': {
		pattern: /(^|[^-\w\xa0-\uffff])(?!\d)(?:(?!\s)[-\w\xa0-\uffff])+(?=\s*:)/,
		lookbehind: true
	},
	'important': /!important\b/i,
	'function': {
		pattern: /(^|[^-a-z\d])[-a-z\d]+(?=\()/i,
		lookbehind: true
	},
	'punctuation': /[(){},:;]/
};
