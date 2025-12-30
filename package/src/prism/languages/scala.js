import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './java.js';

var scala = languages.scala = extend('java', {
	'triple-quoted-string': {
		pattern: /"""[\s\S]*?"""/g,
		alias: 'string'
	},
	'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
	'keyword': /<-|=>|\b(?:abstract|case|[cm]atch|class|def|derives|do|else|enum|extends|extension|final|finally|for|forSome|given|if|implicit|import|infix|inline|lazy|new|null|object|opaque|open|override|package|private|protected|return|sealed|self|super|this|throw|trait|transparent|try|type|using|val|var|while|with|yield)\b/,
	'number': /\b0x(?:[a-f\d]*\.)?[a-f\d]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e\d+)?[dfl]?/i,
	'builtin': /\b(?:Any|AnyRef|AnyVal|Boolean|Byte|Char|Double|Float|Int|Long|Nothing|Short|String|Unit)\b/,
	'symbol': /'[^\d\s\\]\w*/
});

insertBefore(scala, 'triple-quoted-string', {
	'string-interpolation': {
		pattern: /\b[a-z]\w*(?:"""(?:[^$]|\$(?:[^{]|\{(?:[^{}]|\{[^}]*\})*\}))*?"""|"(?:[^$"\n]|\$(?:[^{]|\{(?:[^{}]|\{[^}]*\})*\}))*")/gi,
		inside: {
			'id': {
				pattern: /^\w+/g,
				alias: 'function'
			},
			'escape': {
				pattern: /\\\$"|\$[$"]/g,
				alias: 'symbol'
			},
			'interpolation': {
				pattern: /\$(?:\w+|\{(?:[^{}]|\{[^}]*\})*\})/g,
				inside: {
					'punctuation': /^.\{?|\}$/g,
					'expression': {
						pattern: /[\s\S]+/,
						inside: scala
					}
				}
			},
			'string': /[\s\S]+/
		}
	}
});

delete scala['class-name'];
delete scala['function'];
delete scala['constant'];
