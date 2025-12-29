import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/patterns.js';

// https://www.openpolicyagent.org/docs/latest/policy-reference/

languages.rego = {
	'comment': /#.*/,
	'property': {
		pattern: /(^|[^\\.])(?:"(?:\\.|[^\\\n"])*"|`[^`]*`|\b[a-z_]\w*\b)(?=\s*:(?!=))/gi,
		lookbehind: true
	},
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\\n"])*"|`[^`]*`/g,
		lookbehind: true
	},

	'keyword': /\b(?:as|default|else|import|not|null|package|set(?=\s*\()|some|with)\b/,
	'boolean': boolean,

	'function': {
		pattern: /\b[a-z_]\w*\b(?:\s*\.\s*\b[a-z_]\w*\b)*(?=\s*\()/i,
		inside: {
			'namespace': /\b\w+(?=\s*\.)/,
			'punctuation': /\./
		}
	},

	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'operator': /[%&|/*+-]|[:=<>]=?|!=|\b_\b/,
	'punctuation': clikePunctuation
};
