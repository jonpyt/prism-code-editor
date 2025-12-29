import { languages } from '../core.js';

languages.oz = {
	'comment': /\/\*[\s\S]*?\*\/|%.*/g,
	'string': /"(?:\\[\s\S]|[^\\"])*"/g,
	'atom': {
		pattern: /'(?:\\[\s\S]|[^\\'])*'/g,
		alias: 'builtin'
	},
	'keyword': /\$|\[\]|\b(?:_|at|attr|case|catch|choice|class|cond|declare|define|dis|else(?:case|if)?|end|export|fail|false|true|feat|finally|from|fun|functor|if|import|in|local|lock|meth|nil|not|of|or|prepare|pro[cp]|raise|require|self|skip|then|thread|try|unit)\b/,
	'function': {
		pattern: /\b[a-z][A-Za-z\d]*(?=\()|(\{)[A-Z][A-Za-z\d]*\b/,
		lookbehind: true
	},
	'number': /\b(?:0[bx][a-f\d]+|\d+(?:\.\d*)?(?:e~?\d+)?)\b|&(?:[^\\]|\\(?:\d{3}|.))/i,
	'variable': /`(?:\\.|[^\\`])+`/,
	'attr-name': /\b\w+(?=[ \t]*:(?![:=]))/,
	'operator': /:=|:::?|<[-:=]?|==|=<?:?|>=?:?|\\=:?|!!?|[|#,~^@/*+-]|\b(?:andthen|div|mod|orelse)\b/,
	'punctuation': /[()[\]{}.:;?]/
};
