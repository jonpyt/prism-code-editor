import { languages } from '../core.js';
import { boolean, clikeComment, clikePunctuation } from '../utils/patterns.js';

// based loosely upon: https://github.com/Azure/bicep/blob/main/src/textmate/bicep.tmlanguage
languages.bicep = {
	'comment': clikeComment,
	'property': {
		pattern: /(\n[ \t]*)(?:[a-z_]\w*(?=[ \t]*:)|'(?:\\.|\$(?!\{)|[^\\\n'$])*'(?=[ \t]*:))/gi,
		lookbehind: true
	},
	'string': [
		/'''[^'][\s\S]*?'''/g,
		{
			pattern: /(^|[^\\'])'(?:\\.|\$(?!\{)|[^\\\n'$])*'/g,
			lookbehind: true,
		}
	],
	'interpolated-string': {
		pattern: /(^|[^\\'])'(?:\\.|\$(?:(?!\{)|\{[^{}\n]*\})|[^\\\n'$])*'/g,
		lookbehind: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^{}\n]*\}/,
				inside: {
					'punctuation': /^\$\{|\}$/,
					'expression': {
						pattern: /[\s\S]+/,
						inside: 'bicep'
					},
				}
			},
			'string': /[\s\S]+/
		}
	},

	'datatype': {
		pattern: /(\b(?:output|param)\b[ \t]+\w+[ \t]+)\w+/,
		lookbehind: true,
		alias: 'class-name'
	},

	'boolean': boolean,
	// https://github.com/Azure/bicep/blob/114a3251b4e6e30082a58729f19a8cc4e374ffa6/src/textmate/bicep.tmlanguage#L184
	'keyword': /\b(?:existing|for|if|in|module|null|output|param|resource|targetScope|var)\b/,

	'decorator': /@\w+/,
	'function': /\b[a-z_]\w*(?=[ \t]*\()/i,

	'number': /(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /--|\+\+|=>|(?:\*\*|&&|\|\||\?\?|[!=]=|<<|>>>?|[%&|^!=<>/*+-])=?|\.{3}|\?\.?|[~:]/,
	'punctuation': clikePunctuation,
};
