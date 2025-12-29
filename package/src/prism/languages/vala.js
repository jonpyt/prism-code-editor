import { languages, rest } from '../core.js';
import { boolean, clikeComment, clikePunctuation, clikeString } from '../utils/patterns.js';

var dotPunctuation = {
	punctuation: /\./
};

languages.vala = {
	'comment': clikeComment,
	'raw-string': {
		pattern: /"""[\s\S]*?"""/g,
		alias: 'string'
	},
	'template-string': {
		pattern: /@"[^"]*"/g,
		inside: {
			'interpolation': {
				pattern: /\$(?:\([^)]*\)|[a-zA-Z]\w*)/,
				inside: {
					'delimiter': {
						pattern: /^\$\(?|\)$/,
						alias: 'punctuation'
					},
					[rest]: 'vala'
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string': clikeString,
	// Classes copied from prism-csharp
	'class-name': [
		{
			// (Foo bar, Bar baz)
			// [Foo]
			pattern: /\b[A-Z]\w*(?:\.\w+)*\b(?=(?:\?\s+|\*?\s+\*?)\w)|(\[)[A-Z]\w*(?:\.\w+)*\b/,
			lookbehind: true,
			inside: dotPunctuation
		},
		{
			// class Foo : Bar
			pattern: /(\b(?:class|interface)\s+[A-Z]\w*(?:\.\w+)*\s*:\s*)[A-Z]\w*(?:\.\w+)*\b/,
			lookbehind: true,
			inside: dotPunctuation
		},
		{
			// class Foo
			pattern: /((?:\b(?:class|enum|interface|new|struct)\s+)|(?:catch\s+\())[A-Z]\w*(?:\.\w+)*\b/,
			lookbehind: true,
			inside: dotPunctuation
		}
	],
	'regex': {
		pattern: /\/(?:\[(?:\\.|[^\\\n\]])*\]|\\.|[^\\\n/[])+\/[imsx]{0,4}(?=\s*(?:$|[\n,.;})\]]))/g,
		inside: {
			'regex-flags': /\w+$/,
			'regex-delimiter': /^\/|\/$/,
			'regex-source': {
				pattern: /[\s\S]+/,
				alias: 'language-regex',
				inside: 'regex'
			},
		}
	},
	'keyword': /\b(?:abstract|as|assert|async|[bc]ase|bool|break|catch|class|const|construct|continue|default|delegate|delete|do|double|dynamic|else|ensures|enum|errordomain|extern|finally|float|for|foreach|[gs]et|i[fns]|inline|interface|internal|lock|namespace|new|null|out|override|owned|params|private|protected|public|ref|requires|return|signal|sizeof|ss?ize_t|static|string|struct|switch|this|throws?|try|typeof|u?char|u?int(?:8|16|32|64)?|u?long|unichar|unowned|u?short|using|value|var|virtual|void|volatile|weak|while|yield)\b/i,
	'boolean': boolean,
	'function': /\b\w+(?=\s*\()/,
	'number': /(?:\b0x[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)(?:f|u?l?)?/i,
	'operator': /--|\+\+|&&|\|\||=>|->|~|>>=?|<<=?|[%&|^!=<>/*+-]=?|\?\??|\.{3}/,
	'punctuation': clikePunctuation,
	'constant': /\b[A-Z\d_]+\b/
};
