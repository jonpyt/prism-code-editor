import { languages, rest, tokenize } from '../core.js';
import { boolean, clikePunctuation } from '../utils/patterns.js';
import { nested, re } from '../utils/shared.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

// https://freemarker.apache.org/docs/dgui_template_exp.html

// FTL expression with 4 levels of nesting supported
var FTL_EXPR = [nested(/[^<()"']|\((?:<self>)*\)|<(?!#--)|<#--(?:[^-]|-(?!->))*-->|"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'/.source, 2)];

var interpolationInside = {
	'interpolation-punctuation': {
		pattern: /^\$\{|\}$/,
		alias: 'punctuation'
	}
};

var ftl = interpolationInside[rest] = {
	'comment': /<#--[\s\S]*?-->/,
	'string': [
		// raw string
		/\br(["'])(?:\\.|(?!\1)[^\\])*\1/g,
		{
			pattern: re(/(["'])(?:\\.|(?!\1|\$\{)[^\\]|\$\{(?:(?!\})<0>)*\})*\1/.source, FTL_EXPR, 'g'),
			inside: {
				'interpolation': {
					pattern: re(/((?:^|[^\\])(?:\\\\)*)\$\{(?:(?!\})<0>)*\}/.source, FTL_EXPR),
					lookbehind: true,
					inside: interpolationInside
				}
			}
		}
	],
	'keyword': /\b(?:as)\b/,
	'boolean': boolean,
	'builtin-function': {
		pattern: /((?:^|[^?])\?\s*)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'function': /\b\w+(?=\s*\()/,
	'number': /\b\d+(?:\.\d+)?\b/,
	'operator': /\.\.[<*!]?|->|--|\+\+|&&|\|\||\?\??|[%!=<>/*+-]=?|\b[gl]te?\b/,
	'punctuation': clikePunctuation
};

languages.ftl = {
	'ftl-comment': {
		pattern: /<#--[\s\S]*?-->/g,
		alias: 'comment'
	},
	'ftl-directive': {
		pattern: re(/<\/?[#@][a-zA-Z]<0>*?>/.source, FTL_EXPR, 'gi'),
		inside: {
			'punctuation': /^<\/?|\/?>$/,
			'directive': {
				pattern: /^[#@][a-z]\w*/i,
				alias: 'keyword'
			},
			'ftl': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'language-ftl',
				inside: ftl
			}
		}
	},
	'ftl-interpolation': {
		pattern: re(/\$\{<0>*?\}/.source, FTL_EXPR, 'gi'),
		inside: {
			'punctuation': /^\$\{|\}$/,
			'ftl': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'language-ftl',
				inside: ftl
			}
		}
	},
	[tokenize]: embeddedIn('html')
};
