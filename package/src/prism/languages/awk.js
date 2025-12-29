import { languages } from '../core.js';

languages.gawk = languages.awk = {
	'hashbang': {
		pattern: /^#!.*/g,
		alias: 'comment'
	},
	'comment': /#.*/g,
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\\n"])*"/g,
		lookbehind: true
	},
	'regex': {
		pattern: /((?:^|[^\w\s)])\s*)\/(?:\\.|[^\\\n/])*\//g,
		lookbehind: true
	},

	'variable': /\$\w+/,
	'keyword': /\b(?:BEGIN|BEGINFILE|END|ENDFILE|break|case|continue|default|delete|do|else|exit|for|function|getline|if|in|next|nextfile|printf?|return|switch|while)\b|@(?:include|load)\b/,

	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'number': /\b(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|0x[a-fA-F\d]+)\b/,

	'operator': /--|\+\+|!?~|>&|>>|<<|(?:\*\*|[%^!=<>/*+-])=?|&&|\|[|&]|[?:]/,
	'punctuation': /[()[\]{},;]/
};
