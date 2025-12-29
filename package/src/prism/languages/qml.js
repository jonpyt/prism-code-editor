import { languages } from '../core.js';
import { clikeComment } from '../utils/patterns.js';
import { nested, re } from '../utils/shared.js';
import './javascript.js';

var jsExpr = nested(/(?:[^\\()[\]{}"'/]|"(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*'|\/(?![*/])|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/|\(<self>*\)|\[<self>*\]|\{<self>*\}|\\[\s\S])/.source, 2);


languages.qml = {
	'comment': clikeComment,
	'javascript-function': {
		pattern: re(/((?:^|;)[ \t]*)function\s+(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+\s*\(<0>*\)\s*\{<0>*\}/.source, [jsExpr], 'mg'),
		lookbehind: true,
		alias: 'language-javascript',
		inside: languages.js
	},
	'class-name': {
		pattern: /((?:^|[:;])[ \t]*)(?!\d)\w+(?=[ \t]*\{|[ \t]+on\b)/m,
		lookbehind: true
	},
	'property': [
		{
			pattern: /((?:^|[;{])[ \t]*)(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
			lookbehind: true
		},
		{
			pattern: /((?:^|[;{])[ \t]*)property[ \t]+(?!\d)\w+(?:\.\w+)*[ \t]+(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
			lookbehind: true,
			inside: {
				'keyword': /^property/,
				'property': /\w+(?:\.\w+)*/
			}
		}
	],
	'javascript-expression': {
		pattern: re(/(:[ \t]*)(?![\s;}[])(?:(?!$|[;}])<0>)+/.source, [jsExpr], 'mg'),
		lookbehind: true,
		alias: 'language-javascript',
		inside: languages.js
	},
	'string': /"(?:\\.|[^\\\n"])*"/g,
	'keyword': /\b(?:as|import|on)\b/,
	'punctuation': /[[\]{},:;]/
};
