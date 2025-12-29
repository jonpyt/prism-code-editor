import { languages, rest } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';

var inside = {
	'format-spec': {
		pattern: /(:)[^(){}:]+(?=\}$)/,
		lookbehind: true
	},
	'conversion-option': {
		pattern: /![sra](?=[:}]$)/,
		alias: 'punctuation'
	}
};

inside[rest] = languages.py = languages.python = {
	'comment': /#.*/g,
	'string-interpolation': {
		pattern: /(?:fr?|rf)(?:("""|''')[\s\S]*?\1|(["'])(?:\\[\s\S]|(?!\2)[^\\\n])*\2)/gi,
		inside: {
			'interpolation': {
				// "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
				pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
				lookbehind: true,
				inside: inside
			},
			'string': /[\s\S]+/
		}
	},
	'triple-quoted-string': {
		pattern: /(?:br?|rb?|u)?("""|''')[\s\S]*?\1/gi,
		alias: 'string'
	},
	'string': /(?:br?|rb?|u)?(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/gi,
	'function': {
		pattern: /((?:^|\s)def[ \t]+)(?!\d)\w+(?=\s*\()/,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: true
	},
	'decorator': {
		pattern: /(^[ \t]*)@\w+(?:\.\w+)*/m,
		lookbehind: true,
		alias: 'annotation punctuation',
		inside: {
			'punctuation': /\./
		}
	},
	'keyword': /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|de[fl]|elif|else|except|exec|finally|f?or|from|global|i[fns]|import|lambda|match|nonlocal|not|pass|print|raise|return|try|while|with|yield)\b/,
	'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|ma[px]|memoryview|min|next|object|oct|open|ord|pow|property|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|x?range|zip)\b/,
	'boolean': /\b(?:False|True|None)\b/,
	'number': /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f\d])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
	'operator': /!=|:=|\*\*=?|\/\/=?|<>|>>|<<|[%=<>/*+-]=?|[&|^~]/,
	'punctuation': clikePunctuation
};
