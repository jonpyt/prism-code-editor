import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

languages.magma = {
	'output': {
		pattern: /^(>.*\n)(?!>)(?:.+|\n(?!>).*)(?:\n(?!>).*)*/mg,
		lookbehind: true
	},

	'comment': clikeComment,
	'string': {
		pattern: /(^|[^\\"])"(?:\\.|[^\\\n"])*"/g,
		lookbehind: true
	},

	// http://magma.maths.usyd.edu.au/magma/handbook/text/82
	'keyword': /\b(?:_|adj|[ae]nd|assert[23]?|assigned|break|by|case|cat|catch|clear|cmpeq|cmpne|continue|declare|default|delete|div|do|elif|else|eq|error|eval|exists|exit|for|forall|forward|fprintf|freeze|function|[gl][et]|i[fns]|i?load|import|intrinsic|join|local|meet|mod|ne|not|notadj|notin|notsubset|procedure|quit|random|readi?|repeat|require|requirege|requirerange|restore|return|save|s?diff|select|subset|[tw]hen|to|try|until|v?printf?|v?time|where|while|x?or)\b/,
	'boolean': boolean,

	'generator': {
		pattern: /\b[a-z_]\w*(?=\s*<)/i,
		alias: 'class-name'
	},
	'function': /\b[a-z_]\w*(?=\s*\()/i,

	'number': {
		pattern: /(^|[^\w.]|\.\.)(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?:_[a-z]?)?(?=$|[^\w.]|\.\.)/,
		lookbehind: true
	},

	'operator': /->|[~#|^!=/*+-]|:=|\.\./,
	'punctuation': /[()[\]{}.,:;<>]/
};
