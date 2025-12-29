import { languages, tokenize } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';
import './php.js';

var markupLatte = clone(languages.html);
insertBefore(markupLatte.tag.inside, 'attr-value', {
	'n-attr': {
		pattern: /n:[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=>]+))?/g,
		inside: {
			'attr-value': {
				pattern: /(=\s*)[\s\S]+/,
				lookbehind: true,
				inside: {
					'punctuation': /^["']|["']$/,
					'php': {
						pattern: /\S(?:[\s\S]*\S)?/,
						inside: 'php'
					}
				}
			},
			'attr-equals': /=/,
			'attr-name': {
				pattern: /\S+/,
				alias: 'important'
			}
		}
	},
});

languages.latte = {
	'latte': {
		pattern: /\{\*[\s\S]*?\*\}|\{[^\s{}"'*](?:[^"'/{}]|\/(?![*/])|(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1|\/\*(?:[^*]|\*(?!\/))*\*\/)*\}/,
		alias: 'language-latte',
		inside: {
			'comment': /^\{\*[\s\S]+/,
			'latte-tag': {
				// https://latte.nette.org/en/tags
				pattern: /(^\{(?:\/(?=[a-z]))?)(?:[=_]|[a-z]\w*\b(?!\())/i,
				lookbehind: true,
				alias: 'important'
			},
			'delimiter': {
				pattern: /^\{\/?|\}$/,
				alias: 'punctuation'
			},
			'php': {
				pattern: /\S(?:[\s\S]*\S)?/,
				alias: 'language-php',
				inside: 'php'
			}
		}
	},
	[tokenize]: embeddedIn(markupLatte)
};
