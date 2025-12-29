import { languages } from '../core.js';
import { clikeComment } from '../utils/patterns.js';

// GitHub: https://github.com/apache/avro
// Docs: https://avro.apache.org/docs/current/idl.html

languages.avdl =languages['avro-idl'] = {
	'comment': clikeComment,
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\\n"])*"/g,
		lookbehind: true
	},

	'annotation': {
		pattern: /@(?:[$\w.-]|`[^\n`]+`)+/g,
		alias: 'function'
	},
	'function-identifier': {
		pattern: /`[^\n`]+`(?=\s*\()/g,
		alias: 'function'
	},
	'identifier': /`[^\n`]+`/g,

	'class-name': {
		pattern: /(\b(?:enum|error|protocol|record|throws)\b\s+)[$\w]+/g,
		lookbehind: true
	},
	'keyword': /\b(?:array|boolean|bytes|date|decimal|double|enum|error|false|true|fixed|float|idl|import|int|local_timestamp_ms|long|map|null|oneway|protocol|record|schema|string|throws|time_ms|timestamp_ms|union|uuid|void)\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,

	'number': [
		{
			pattern: /(^|[^\w.])-?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|0x(?:[a-f\d]+(?:\.[a-f\d]*)?|\.[a-f\d]+)(?:p[+-]?\d+)?)[dfl]?(?![\w.])/i,
			lookbehind: true
		},
		/-?\b(?:Infinity|NaN)\b/
	],

	'operator': /=/,
	'punctuation': /[()[\]{}<>.,:;-]/
};
