import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './javascript.js';
import './markup.js';

languages.eta = languages.ejs = {
	'ejs': {
		pattern: /<%[^%][\s\S]*?%>/,
		inside: {
			'comment': /^<%#[\s\S]+/,
			'delimiter': {
				pattern: /^..[-_=]?|[-_]?%>$/g,
				alias: 'punctuation'
			},
			'language-javascript': {
				pattern: /[\s\S]+/,
				inside: 'js'
			}
		}
	},
	'escape': /<%%|%%>/,
	[tokenize]: embeddedIn('html')
};
