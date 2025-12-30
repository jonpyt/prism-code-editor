import { languages } from '../core.js';
import { re } from '../utils/shared.js';
import './ruby.js';

var haml = languages.haml = {
	// Multiline stuff should appear before the rest

	'multiline-comment': {
		pattern: /(^[ \t]*)(?:\/|-#).*(?:$\s*?\n\1[ \t]+\S.*)*/m,
		lookbehind: true,
		alias: 'comment'
	},

	'multiline-code': {
		pattern: /(^([ \t]*)(?:[~-]|[&!]?=)).*(?:,[ \t]*(?:\n\2[ \t].*,[ \t]*)*(?:\n\2[ \t].+)|\|[ \t]*(?:\n\2[ \t].*\|[ \t]*)*)/m,
		lookbehind: true,
		inside: 'ruby'
	}
};

var filter_pattern = /(^[ \t]*):<0>(?:$\s*?\n\1[ \t]+\S.*)+/.source;

// Non exhaustive list of available filters and associated languages
[
	'css',
	'coffee',
	'erb',
	'javascript',
	'less',
	'markdown',
	'ruby',
	'scss',
	'textile'
].forEach(filter => {
	var language = filter == 'coffee' ? 'coffeescript' : filter;
	haml['filter-' + filter] = {
		pattern: re(filter_pattern, [filter], 'm'),
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:.+/,
				alias: 'symbol'
			},
			'text': {
				pattern: /[\s\S]+/,
				alias: 'language-' + language,
				inside: language
			}
		}
	};
})

Object.assign(haml, {
	'filter': {
		pattern: re(filter_pattern, ['[\\w-]+'], 'm'),
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:.+/,
				alias: 'symbol'
			}
		}
	},

	'markup': {
		pattern: /(^[ \t]*)<.+/m,
		lookbehind: true,
		inside: 'markup'
	},
	'doctype': {
		pattern: /(^[ \t]*)!!!(?: .+)?/m,
		lookbehind: true
	},
	'tag': {
		// Allows for one nested group of braces
		pattern: /(^[ \t]*)[%.#][\w#.-]*[\w-](?:\([^)]*\)|\{(?:[^{}]|\{[^}]*\})*\}|\[[^\]]*\])*[<>/]*/m,
		lookbehind: true,
		inside: {
			'attributes': [
				{
					// Lookbehind tries to prevent interpolations from breaking it all
					// Allows for one nested group of braces
					pattern: /(^|[^#])\{(?:[^{}]|\{[^}]*\})*\}/,
					lookbehind: true,
					inside: 'ruby'
				},
				{
					pattern: /\([^)]+\)/,
					inside: {
						'attr-value': {
							pattern: /(=\s*)(?:"(?:\\.|[^\\\n"])*"|[^)\s]+)/,
							lookbehind: true
						},
						'attr-name': /[\w:-]+(?=\s*!?=|\s*[,)])/,
						'punctuation': /[=(),]/
					}
				},
				{
					pattern: /\[[^\]]+\]/,
					inside: 'ruby'
				}
			],
			'punctuation': /<|>/
		}
	},
	'code': {
		pattern: /(^[ \t]*(?:[~-]|[&!]?=)).+/m,
		lookbehind: true,
		inside: 'ruby'
	},
	// Interpolations in plain text
	'interpolation': {
		pattern: /#\{[^}]+\}/,
		inside: {
			'delimiter': {
				pattern: /^..|\}$/g,
				alias: 'punctuation'
			},
			'ruby': {
				pattern: /[\s\S]+/,
				inside: 'ruby'
			}
		}
	},
	'punctuation': {
		pattern: /(^[ \t]*)[~=&!-]+/m,
		lookbehind: true
	}
});
