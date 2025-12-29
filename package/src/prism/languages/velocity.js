import { languages, rest } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { boolean } from '../utils/patterns.js';
import './markup.js';

var vel = languages.velocity = clone(languages.html);

var string = /"[^"]*"|'[^']*'/g;

var punctuation = /[()[\]{}.,:]/;
var number = /\b\d+\b/;

var variable = {
	pattern: /(^|[^\\](?:\\\\)*)\$!?(?:[a-z][\w-]*(?:\([^)]*\))?(?:\.[a-z][\w-]*(?:\([^)]*\))?|\[[^\]]+\])*|\{[^}]+\})/i,
	lookbehind: true,
	inside: {
		'string': string,
		'function': {
			pattern: /([^\w-])[a-z][\w-]*(?=\()/,
			lookbehind: true
		},
		'number': number,
		'boolean': boolean,
		'punctuation': punctuation
	}
};

insertBefore(vel, 'comment', {
	'unparsed': {
		pattern: /(^|[^\\])#\[\[[\s\S]*?\]\]#/g,
		lookbehind: true,
		inside: {
			'punctuation': /^#\[\[|\]\]#$/
		}
	},
	'velocity-comment': [
		{
			pattern: /(^|[^\\])#\*[\s\S]*?\*#/g,
			lookbehind: true,
			alias: 'comment'
		},
		{
			pattern: /(^|[^\\])##.*/g,
			lookbehind: true,
			alias: 'comment'
		}
	],
	'directive': {
		pattern: /(^|[^\\](?:\\\\)*)#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})(?:\s*\((?:[^()]|\([^)]*\))*\))?/i,
		lookbehind: true,
		inside: {
			'keyword': {
				pattern: /^#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})|\bin\b/,
				inside: {
					'punctuation': /[{}]/
				}
			},
			'variable': variable,
			'string': string,
			'number': number,
			'boolean': boolean,
			'operator': /[!=<>]=?|[%/*+-]|&&|\|\||\.\.|\b(?:eq|[gl][et]|ne|not)\b/,
			'punctuation': punctuation
		}
	},
	'variable': variable
});

vel['tag'].inside['attr-value'][2].inside[rest] = vel;
