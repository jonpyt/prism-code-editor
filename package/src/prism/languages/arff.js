import { languages } from '../core.js';

languages.arff = {
	'comment': /%.*/,
	'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
	'keyword': /@(?:attribute|data|end|relation)\b/i,
	'number': /\b\d+(?:\.\d+)?\b/,
	'punctuation': /[{},]/
};
