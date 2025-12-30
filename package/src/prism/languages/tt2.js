import { languages, tokenize } from '../core.js';
import { clikeClass } from '../utils/clike-class.js';
import { boolean, clikeNumber } from '../utils/patterns.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.tt2 = {
	'tt2': {
		pattern: /\[%[\s\S]*?%\]/,
		alias: 'language-tt2',
		inside: {
			'comment': /#.*|^..#[\s\S]+/g,
			'string': [
				/'[^\\']*(?:\\[\s\S][^\\']*)*'/g,
				{
					pattern: /"[^\\"]*(?:\\[\s\S][^\\"]*)*"/g,
					inside: {
						'variable': /\$(?:[a-z]\w*(?:\.(?:\d+|\$?[a-z]\w*))*)/i
					}
				}
			],
			'class-name': clikeClass(),
			'delimiter': {
				pattern: /^..-?|-?%\]$/g,
				alias: 'punctuation'
			},
			'keyword': /\b(?:BLOCK|CALL|CASE|CATCH|CLEAR|DEBUG|DEFAULT|ELSE|ELSIF|END|FILTER|FINAL|FOREACH|[GS]ET|IF|IN|INCLUDE|INSERT|LAST|MACRO|META|NEXT|PERL|PROCESS|RAWPERL|RETURN|STOP|SWITCH|TAGS|THROW|TRY|UNLESS|USE|WHILE|WRAPPER)\b/,
			'boolean': boolean,
			'function': /\b\w+(?=\()/,
			'operator': /=>|[!=<>]=?|&&|\|\|?|\b(?:and|not|or)\b/,
			'variable': /\b[a-z]\w*(?:\s*\.\s*(?:\d+|\$?[a-z]\w*))*\b/i,
			'number': clikeNumber,
			'punctuation': /[()[\]{},]/
		}
	},
	[tokenize]: embeddedIn('html')
};
