import { languages, rest } from '../core.js';
import { nested, re } from '../utils/shared.js';
import './scheme.js';

// allow for up to pow(2, recursivenessLog2) many levels of recursive brace expressions
// For some reason, this can't be 4
var schemeExpression = nested(/\((?:\\[\s\S]|[^\\"();#]|;.*(?!.)|"(?:\\.|[^\\"])*"|#(?:\{(?:(?!#\})[\s\S])*#\}|[^{])|<self>)*\)/.source, 5);

var inside = {
	pattern: /[\s\S]+/,
	alias: 'language-lilypond'
};

inside.inside = languages.ly = languages.lilypond = {
	'comment': /%\{[\s\S]*?%\}|%.*/,
	'embedded-scheme': {
		pattern: re(/(^|[=\s])#(?:"(?:\\.|[^\\"])*"|[^\s()"]*(?:[^\s()]|<0>))/.source, [schemeExpression], 'mg'),
		lookbehind: true,
		inside: {
			'scheme': {
				pattern: /(?!^)[\s\S]+/,
				alias: 'language-scheme',
				inside: {
					'embedded-lilypond': {
						pattern: /#\{[\s\S]*?#\}/g,
						inside: {
							'punctuation': /^..|#\}$/g,
							'lilypond': inside
						}
					},
					[rest]: languages.scheme
				}
			},
			'punctuation': /#/
		}
	},
	'string': /"(?:\\.|[^\\"])*"/g,
	'class-name': {
		pattern: /(\\new\s+)[\w-]+/,
		lookbehind: true
	},
	'keyword': {
		pattern: /\\[a-z][-\w]*/i,
		inside: {
			'punctuation': /^\\/
		}
	},
	'operator': /[=|]|<<|>>/,
	'punctuation': {
		pattern: /(^|[a-z\d])(?:'+|,+|[_^]?-[_^]?(?:[!>._^+-]|(?=\d))|[_^]\.?|[.!])|[()[\]{}<>^~]|\\[()[\]<>\\!]|--|__/,
		lookbehind: true
	},
	'number': /\b\d+(?:\/\d+)?\b/
};
