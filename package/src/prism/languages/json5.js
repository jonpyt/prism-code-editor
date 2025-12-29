import { languages } from '../core.js';
import { extend } from '../utils/language.js';
import { clikeString } from '../utils/patterns.js';
import './json.js';

languages.json5 = extend('json', {
	'property': [
		RegExp(clikeString.source + '(?=\\s*:)'),
		{
			pattern: /(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*:)/,
			alias: 'unquoted'
		}
	],
	'string': clikeString,
	'number': /[+-]?\b(?:NaN|Infinity|0x[a-fA-F\d]+)\b|[+-]?(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[eE][+-]?\d+\b)?/
});
