import { languages, tokenize } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.jinja2 = languages.django = {
	'django': {
		pattern: /\{(?:\{[\s\S]*?\}|%[\s\S]*?%|#[\s\S]*?#)\}/,
		alias: 'language-django',
		inside: {
			'comment': /^\{#[\s\S]+/,
			'tag': {
				pattern: /(^\{%[+-]?\s*)\w+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'delimiter': {
				pattern: /^\{[{%][+-]?|[+-]?[}%]\}$/,
				alias: 'punctuation'
			},
			'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
			'filter': {
				pattern: /(\|)\w+/,
				lookbehind: true,
				alias: 'function'
			},
			'test': {
				pattern: /(\bis\s+(?:not\s+)?)(?!not\b)\w+/,
				lookbehind: true,
				alias: 'function'
			},
			'function': /\b(?!\d)\w+(?=\s*\()/,
			'keyword': /\b(?:and|as|by|else|f?or|i[fns]|import|loop|not|recursive|with|without)\b/,
			'operator': /!=|\*\*=?|\/\/=?|<>|>>|<<|[%=<>/*+-]=?|[&|^~]/,
			'number': /\b\d+(?:\.\d+)?\b/,
			'boolean': /[Ff]alse|[Nn]one|[Tt]rue/,
			'variable': /\w+/,
			'punctuation': clikePunctuation
		}
	},
	[tokenize]: embeddedIn('html')
};
