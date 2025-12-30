import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.twig = {
	'twig': {
		pattern: /\{(?:#[\s\S]*?#|%[\s\S]*?%|\{[\s\S]*?\})\}/,
		alias: 'language-twig',
		inside: {
			'comment': /^\{#[\s\S]+/,
			'tag-name': {
				pattern: /(^\{%-?\s*)\w+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'delimiter': {
				pattern: /^..-?|-?[%}]\}$/g,
				alias: 'punctuation'
			},
		
			'string': {
				pattern: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/,
				inside: {
					'punctuation': /^.|["']$/g
				}
			},
			'keyword': /\b(?:even|if|odd)\b/,
			'boolean': /\b(?:false|true|null)\b/,
			'number': /\b0x[a-fA-F\d]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
			'operator': [
				{
					pattern: /(\s)(?:and|b-and|b-x?or|ends with|in|is|matches|not|or|same as|starts with)(?!\S)/,
					lookbehind: true
				},
				/[=<>]=?|!=|\*\*?|\/\/?|\?:?|[~%|+-]/
			],
			'punctuation': /[()[\]{}.,:]/
		}
	},
	[tokenize]: embeddedIn('html')
};
