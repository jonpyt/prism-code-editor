import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

languages.yang = {
	// https://tools.ietf.org/html/rfc6020#page-34
	// http://www.yang-central.org/twiki/bin/view/Main/YangExamples
	'comment': clikeComment,
	'string': /"(?:\\.|[^\\"])*"|'[^']*'/g,
	'keyword': {
		pattern: /(^|[{};\n][ \t]*)[a-z_][\w.-]*/i,
		lookbehind: true
	},
	'namespace': {
		pattern: /(\s)[a-z_][\w.-]*(?=:)/i,
		lookbehind: true
	},
	'boolean': boolean,
	'operator': /\+/,
	'punctuation': /[{}:;]/
};
