import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

languages.dataweave = {
	'url': /\b[a-zA-Z]+:\/\/[\w/:.?=&-]+|\burn:[\w:.?=&-]+/,
	'property': /(?:\b\w+#)?(?:"(?:\\.|[^\\\n"])*"|\b\w+)(?=\s*[:@])/g,
	'string': /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
	'mime-type': /\b(?:application|audio|image|multipart|text|video)\/[\w+-]+/,
	'date': /\|[\w:+-]+\|/g,
	'comment': clikeComment,
	'regex': /\/(?:[^\\\n/]|\\[^\n])+\//g,
	'keyword': /\b(?:and|as|at|case|do|else|fun|if|input|is|match|not|ns|null|or|output|type|unless|update|using|var)\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'punctuation': /[()[\]{}.,:;@]/,
	'operator': /<<|>>|->|[~!=<>]=?|--?-?|\+\+?|\?/,
	'boolean': boolean,
};
