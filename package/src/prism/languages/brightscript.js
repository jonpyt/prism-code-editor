import { languages } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';

var expression = {
	pattern: /[\s\S]+/
};

expression.inside = languages.brightscript = {
	'comment': /(?:\brem|').*/i,
	'directive-statement': {
		pattern: /(^[ \t]*)#(?:const|else(?:[ \t]+if)?|end[ \t]+if|error|if).*/im,
		lookbehind: true,
		alias: 'property',
		inside: {
			'error-message': {
				pattern: /(^#error).+/,
				lookbehind: true
			},
			'directive': {
				pattern: /^#(?:const|else(?:[ \t]+if)?|end[ \t]+if|error|if)/,
				alias: 'keyword'
			},
			'expression': expression
		}
	},
	'property': {
		pattern: /([\n{,][ \t]*)(?:(?!\d)\w+|"(?:[^\n"]|"")*"(?!"))(?=[ \t]*:)/g,
		lookbehind: true
	},
	'string': /"(?:[^\n"]|"")*"(?!")/g,
	'class-name': {
		pattern: /(\bas[ \t]+)\w+/i,
		lookbehind: true
	},
	'keyword': /\b(?:as|dim|each|else|elseif|end|exit|for|function|goto|if|in|print|return|step|stop|sub|then|to|while)\b/i,
	'boolean': /\b(?:false|true)\b/i,
	'function': /\b(?!\d)\w+(?=[ \t]*\()/,
	'number': /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	'operator': /--|\+\+|<>|>>=?|<<=?|[\\<>/*+-]=?|[?:^=]|\b(?:and|mod|not|or)\b/i,
	'punctuation': clikePunctuation,
	'constant': /\b(?:line_num)\b/i
};
