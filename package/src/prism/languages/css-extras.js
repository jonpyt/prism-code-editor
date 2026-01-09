import { languages } from '../core.js';
import { insertBefore } from '../utils/language.js';
import './css.js';

var css = languages.css;

css.selector.inside = css['atrule'].inside['selector-function-argument'].inside = {
	'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,
	'pseudo-class': /:[-\w]+/,
	'class': /\.[-\w]+/,
	'id': /#[-\w]+/,
	'attribute': {
		pattern: /\[(?:[^[\]"']|(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1)*\]/g,
		inside: {
			'punctuation': /^\[|\]$/,
			'case-sensitivity': {
				pattern: /(\s)[si]$/i,
				lookbehind: true,
				alias: 'keyword'
			},
			'namespace': {
				pattern: /^(\s*)(?:(?!\s)[-*\w\xa0-\uffff])*\|(?!=)/,
				lookbehind: true,
				inside: {
					'punctuation': /\|$/
				}
			},
			'attr-name': {
				pattern: /^(\s*)(?:(?!\s)[-\w\xa0-\uffff])+/,
				lookbehind: true
			},
			'attr-value': {
				pattern: /(=\s*)(?:(?!\s)[-\w\xa0-\uffff])+(?=\s*$)|(["'])(?:\\[\s\S]|(?!\2)[^\\\n])*\2/,
				lookbehind: true
			},
			'operator': /[|~*^$]?=/
		}
	},
	'n-th': [
		{
			pattern: /(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,
			lookbehind: true,
			inside: {
				'number': /[\dn]+/,
				'operator': /[+-]/
			}
		},
		{
			pattern: /(\(\s*)(?:even|odd)(?=\s*\))/i,
			lookbehind: true
		}
	],
	'combinator': /[>+~]|\|\|/,

	// the `tag` token has been existed and removed.
	// because we can't find a perfect tokenize to match it.
	// if you want to add it, please read https://github.com/PrismJS/prism/pull/2373 first.

	'punctuation': /[(),]/
};

insertBefore(css, 'function', {
	'operator': {
		pattern: /(\s)[/*+-](?!\S)/,
		lookbehind: true
	},
	'hexcode': {
		pattern: /\B#[a-f\d]{3,8}\b/i,
		alias: 'color'
	},
	// it's important that there is no boundary assertion after the hex digits
	'entity': /\\[a-f\d]{1,8}/i,
	'unit': {
		pattern: /(\b\d+)(?:%|[a-z]+(?![\w-]))/,
		lookbehind: true
	},
	// 123 -123 .123 -.123 12.3 -12.3
	'number': {
		pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,
		lookbehind: true
	}
});
