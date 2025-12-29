import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { boolean, clikeString } from '../utils/patterns.js';
import { re } from '../utils/shared.js';
import './javascript.js';
import './javadoclike.js';
import './typescript.js';

var javascript = languages.js;

var type = /\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/.source;
var parameterPrefix = `(@(?:arg|argument|param|property)\\s+(?:${type}\\s+)?)`;

insertBefore(
	languages.jsdoc = extend('javadoclike', {
		'parameter': {
			// @param {string} foo - foo bar
			pattern: RegExp(parameterPrefix + /(?:(?!\s)[$\w\xa0-\uffff.])+(?!\S)/.source),
			lookbehind: true,
			inside: {
				'punctuation': /\./
			}
		}
	}),
	'keyword', {
		'optional-parameter': {
			// @param {string} [baz.foo="bar"] foo bar
			pattern: RegExp(parameterPrefix + /\[(?:(?!\s)[$\w\xa0-\uffff.])+(?:=[^[\]]+)?\](?!\S)/.source),
			lookbehind: true,
			inside: {
				'code': {
					pattern: /(=)[\s\S]+(?=.)/,
					lookbehind: true,
					alias: 'language-javascript',
					inside: javascript
				},
				'punctuation': /[=[\]]/,
				'parameter': {
					pattern: /[\s\S]+/,
					inside: {
						'punctuation': /\./
					}
				}
			}
		},
		'class-name': [
			{
				pattern: re(/(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<0>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source, [type]),
				lookbehind: true,
				inside: {
					'punctuation': /\./
				}
			},
			{
				pattern: RegExp('(@[a-z]+\\s+)' + type),
				lookbehind: true,
				inside: {
					'string': clikeString,
					'number': javascript.number,
					'boolean': boolean,
					'keyword': languages.ts.keyword,
					'operator': /=>|\.{3}|[&|?:*]/,
					'punctuation': /[()[\]{}.,;<>=]/
				}
			}
		],
		'example': {
			pattern: /(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/,
			lookbehind: true,
			inside: {
				'code': {
					pattern: /^([ \t]*(?:\*[ \t]*|(?!\*)))\S.*/m,
					lookbehind: true,
					alias: 'language-javascript',
					inside: javascript
				}
			}
		}
	}
);
