import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/patterns.js';

// https://wren.io/

languages.wren = {
	// Multiline comments in Wren can have nested multiline comments
	// Comments: // and /* */
	// support 3 levels of nesting
	// regex: \/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\/
	'comment': /\/\/.*|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*))*\*\/)*\*\/)*\*\//g,

	// Triple quoted strings are multiline but cannot have interpolation (raw strings)
	// Based on prism-python.js
	'triple-quoted-string': {
		pattern: /"""[\s\S]*?"""/g,
		alias: 'string'
	},

	'string-literal': {
		// A single quote string is multiline and can have interpolation (similar to JS backticks ``)
		pattern: /(^|[^\\"])"(?:\\[\s\S]|[^\\"%]|%(?!\()|%\((?:[^()]|\((?:[^()]|\([^)]*\))*\))*\))*"/g,
		lookbehind: true,
		inside: {
			'interpolation': {
				// "%(interpolation)"
				pattern: /((?:^|[^\\])(?:\\\\)*)%\((?:[^()]|\((?:[^()]|\([^)]*\))*\))*\)/,
				lookbehind: true,
				inside: {
					'expression': {
						pattern: /^(..)[\s\S]+(?=.)/,
						lookbehind: true,
						inside: 'wren'
					},
					'interpolation-punctuation': {
						pattern: /.+/,
						alias: 'punctuation'
					},
				}
			},
			'string': /[\s\S]+/
		}
	},

	// #!/usr/bin/env wren on the first line
	'hashbang': {
		pattern: /^#!\/.+/g,
		alias: 'comment'
	},

	// Attributes are special keywords to add meta data to classes
	'attribute': {
		// #! attributes are stored in class properties
		// #!myvar = true
		// #attributes are not stored and dismissed at compilation
		pattern: /#!?[ \t　]*\w+/,
		alias: 'keyword'
	},
	'class-name': {
		// class definition
		// class Meta {}
		// A class must always start with an uppercase.
		// File.read
		pattern: /(\bclass\s+)\w+|\b[A-Z][a-z\d_]*\b/,
		lookbehind: true
	},

	// A constant can be a variable, class, property or method. Just named in all uppercase letters
	'constant': /\b[A-Z][A-Z\d_]*\b/,

	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	},
	'keyword': /\b(?:as|break|class|construct|continue|else|for|foreign|i[fns]|import|return|static|super|this|var|while)\b/,
	'boolean': boolean,
	'number': /\b(?:0x[a-f\d]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i,

	// Functions can be Class.method()
	'function': /\b[a-z_]\w*(?=\s*[({])/i,

	'operator': /<<|>>|[!=<>]=?|&&|\|\||[%&|^~?:/*+-]|\.{2,3}/,
	'punctuation': clikePunctuation
};
