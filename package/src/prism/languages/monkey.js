import { languages } from '../core.js';

languages.monkey = {
	'comment': /^#rem\s[\s\S]*?^#end|'.+/img,
	'string': /"[^\n"]*"/g,
	'preprocessor': {
		pattern: /(^[ \t]*)#.+/mg,
		lookbehind: true,
		alias: 'property'
	},

	'function': /\b\w+(?=\()/,
	'type-char': {
		pattern: /\b[?%#$]/,
		alias: 'class-name'
	},
	'number': {
		pattern: /(\.\.)?(?:(?:\b|\B-\.?|\B\.)\d+(?:(?!\.\.)\.\d*)?|\$[a-f\d]+)/i,
		lookbehind: true
	},
	'keyword': /\b(?:abstract|array|bool|case|catch|class|const|continue|default|eachin|else|elseif|end|endif|exit|extends|extern|false|true|field|final|float|for|forever|function|global|if|implements|import|inline|int|interface|local|method|module|new|next|null|object|private|property|public|repeat|return|select|self|step|strict|string|super|then|throw|to|try|until|void|wend|while)\b/i,
	'operator': /\.\.|<[=>]?|>=?|:?=|(?:[~&|/*+-]|\b(?:mod|shl|shr)\b)=?|\b(?:and|not|or)\b/i,
	'punctuation': /[()[\].,:;]/
};
