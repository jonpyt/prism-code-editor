import { languages, tokenize } from '../core.js';
import { boolean } from '../utils/patterns.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.mustache = languages.hbs = languages.handlebars = {
	'handlebars': {
		pattern: /\{\{(?:\{[\s\S]+?\}|[\s\S]+?)\}\}/,
		alias: 'language-handlebars',
		inside: {
			'comment': /\{\{![\s\S]*?\}\}/,
			'delimiter': {
				pattern: /^..\{?|\}\}\}?$/g,
				alias: 'punctuation'
			},
			'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/,
			'number': /\b0x[a-fA-F\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
			'boolean': boolean,
			'block': {
				pattern: /^(\s*(?:~\s*)?)[#/]\S+?(?=\s|~?\s*$)/,
				lookbehind: true,
				alias: 'keyword'
			},
			'brackets': {
				pattern: /\[[^\]]+\]/,
				inside: {
					punctuation: /[[\]]/,
					variable: /[\s\S]+/
				}
			},
			'punctuation': /[%&|^!=<>/*+#"'()[\]{}.,:;@\\`~]/,
			'variable': /\S+/
		}
	},
	[tokenize]: embeddedIn('html')
};
