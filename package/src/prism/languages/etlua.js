import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';
import './lua.js';

languages.etlua = {
	'etlua': {
		pattern: /<%[\s\S]+?%>/,
		inside: {
			'delimiter': {
				pattern: /^..[=-]?|-?%>$/g,
				alias: 'punctuation'
			},
			'language-lua': {
				pattern: /[\s\S]+/,
				inside: 'lua'
			}
		}
	},
	[tokenize]: embeddedIn('html')
};
