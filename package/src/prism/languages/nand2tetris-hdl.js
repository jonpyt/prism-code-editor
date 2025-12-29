import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

languages['nand2tetris-hdl'] = {
	'comment': clikeComment,
	'keyword': /\b(?:BUILTIN|CHIP|CLOCKED|IN|OUT|PARTS)\b/,
	'boolean': boolean,
	'function': /\b[a-zA-Z][A-Za-z\d]*(?=\()/,
	'number': /\b\d+\b/,
	'operator': /=|\.\./,
	'punctuation': /[()[\]{},:;]/
};
