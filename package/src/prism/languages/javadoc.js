import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { replace } from '../utils/shared.js';
import { dotPunctuation } from '../utils/patterns.js';
import './markup.js';
import './java.js';
import './javadoclike.js';

var codeLinePattern = /(^[ \t]*(?:\*\s*)*)[^\s*].*/m;

var memberReference = /#\s*\w+(?:\s*\([^()]*\))?/.source;
var reference = replace(/(?:\b[a-zA-Z]\w+\s*\.\s*)*\b[A-Z]\w*(?:\s*<0>)?|<0>/.source, [memberReference]);

var java = languages.java;
var markup = languages.markup;
var javadoc = languages.javadoc = clone(languages.javadoclike);

insertBefore(javadoc, 'keyword', {
	'reference': {
		pattern: RegExp(`(@(?:exception|link|linkplain|see|throws|value)\\s+(?:\\*\\s*)?)(?:${reference})`),
		lookbehind: true,
		inside: {
			'function': {
				pattern: /(#\s*)\w+(?=\s*\()/,
				lookbehind: true
			},
			'field': {
				pattern: /(#\s*)\w+/,
				lookbehind: true
			},
			'namespace': {
				pattern: /\b(?:[a-z]\w*\s*\.\s*)+/,
				inside: dotPunctuation
			},
			'class-name': /\b[A-Z]\w*/,
			'keyword': java.keyword,
			'punctuation': /[()[\].,#]/
		}
	},
	'class-name': {
		// @param <T> the first generic type parameter
		pattern: /(@param\s+)<[A-Z]\w*>/,
		lookbehind: true,
		inside: {
			'punctuation': /[.<>]/
		}
	},
	'code-section': [
		{
			pattern: /(\{@code\s+(?!\s))(?:[^\s{}]|\s+(?![\s}])|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})*\})+(?=\s*\})/,
			lookbehind: true,
			inside: {
				'code': {
					// there can't be any HTML inside of {@code} tags
					pattern: codeLinePattern,
					lookbehind: true,
					alias: 'language-java',
					inside: java
				}
			}
		},
		{
			pattern: /(<(code|pre|tt)>(?!<code>)\s*)\S(?:\S|\s+\S)*?(?=\s*<\/\2>)/,
			lookbehind: true,
			inside: {
				'line': {
					pattern: codeLinePattern,
					lookbehind: true,
					inside: {
						// highlight HTML tags and entities
						'tag': markup.tag,
						'entity': markup.entity,
						'code': {
							// everything else is Java code
							pattern: /.+/,
							alias: 'language-java',
							inside: java
						}
					}
				}
			}
		}
	],
	'tag': markup.tag,
	'entity': markup.entity,
});
