import { languages } from '../core.js';
import { boolean } from '../utils/patterns.js';
import { re } from '../utils/shared.js';

/** @param {string} pattern */
var insertKey = pattern => re(pattern, [`(?:[\\w-]+|'[^\n']*'|"(?:\\\\.|[^\\\\"\n])*")`], 'mg');

languages.toml = {
	'comment': /#.*/g,
	'table': {
		pattern: insertKey(/(^[ \t]*\[\s*(?:\[\s*)?)<0>(?:\s*\.\s*<0>)*(?=\s*\])/.source),
		lookbehind: true,
		alias: 'class-name'
	},
	'key': {
		pattern: insertKey(/(^[ \t]*|[{,]\s*)<0>(?:\s*\.\s*<0>)*(?=\s*=)/.source),
		lookbehind: true,
		alias: 'property'
	},
	'string': /"""(?:\\[\s\S]|[^\\])*?"""|'''[\s\S]*?'''|'[^\n']*'|"(?:\\.|[^\\\n"])*"/g,
	'date': {
		// Offset Date-Time, Local Date-Time, Local Date, Local Time
		pattern: /\b(?:\d{4}-\d\d-\d\d(?:[t\s]\d\d:\d\d:\d\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?)?|\d\d:\d\d:\d\d(?:\.\d+)?)\b/i,
		alias: 'number'
	},
	'number': /(?:\b0(?:x[a-zA-Z\d]+(?:_[a-zA-Z\d]+)*|o[0-7]+(?:_[0-7]+)*|b[10]+(?:_[10]+)*))\b|[+-]?\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b|[+-]?\b(?:inf|nan)\b/,
	'boolean': boolean,
	'punctuation': /[[\]{}.,=]/
};
