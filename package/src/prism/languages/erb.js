import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';
import './ruby.js';

languages.erb = {
	'erb': {
		pattern: /<%=?(?:[^\n]|\n(?!=begin)|\n=begin\s(?:[^\n]|\n(?!=end))*\n=end)+?%>/,
		inside: {
			'delimiter': {
				pattern: /^..=?|%>$/g,
				alias: 'punctuation'
			},
			'ruby': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'language-ruby',
				inside: 'ruby'
			}
		}
	},
	[tokenize]: embeddedIn('html')
};
