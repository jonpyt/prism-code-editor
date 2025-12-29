import { languages } from '../core.js';
import { boolean, clikeNumber, clikePunctuation, clikeString } from '../utils/patterns.js';

languages['firestore-security-rules'] = {
	'comment': /\/\/.*/,
	'string': clikeString,
	'path': {
		pattern: /(^|[\s(),])(?:\/(?:[\w\xa0-\uffff]+|\{[\w\xa0-\uffff]+(?:=\*\*)?\}|\$\([\w\xa0-\uffff.]+\)))+/g,
		lookbehind: true,
		inside: {
			'variable': {
				pattern: /\{[\w\xa0-\uffff]+(?:=\*\*)?\}|\$\([\w\xa0-\uffff.]+\)/,
				inside: {
					'operator': /=/,
					'keyword': /\*\*/,
					'punctuation': /[(){}.$]/
				}
			},
			'punctuation': /\//
		}
	},
	'method': {
		// to make the pattern shorter, the actual method names are omitted
		pattern: /(\ballow\s+)[a-z]+(?:\s*,\s*[a-z]+)*(?=\s*[:;])/,
		lookbehind: true,
		alias: 'builtin',
		inside: {
			'punctuation': /,/
		}
	},
	'keyword': /\b(?:allow|function|if|match|null|return|rules_version|service)\b/,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'number': clikeNumber,
	'operator': /&&|\|\||[!=<>]=?|[%/*+-]|\bi[ns]\b/,
	'punctuation': clikePunctuation
};
