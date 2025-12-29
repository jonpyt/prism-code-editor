import { languages } from '../core.js';

// ABNF grammar:
// https://github.com/dhall-lang/dhall-lang/blob/master/standard/dhall.abnf

var expression = {
	pattern: /(^..)[\s\S]+(?=.)/,
	lookbehind: true,
	alias: 'language-dhall'
}

expression.inside = languages.dhall = {
	// Multi-line comments can be nested. E.g. {- foo {- bar -} -}
	// The multi-line pattern is essentially this:
	//   \{-(?:[^-{]|-(?!\})|\{(?!-)|<SELF>)*-\}
	'comment': /--.*|\{-(?:[^-{]|-(?!\})|\{(?!-)|\{-(?:[^-{]|-(?!\})|\{(?!-))*-\})*-\}/,
	'string': {
		pattern: /"(?:\\.|[^\\"])*"|''(?:[^']|'(?!')|'''|''\$\{)*''(?!'|\$)/g,
		inside: {
			'interpolation': {
				pattern: /\$\{[^{}]*\}/,
				inside: {
					'expression': expression,
					'punctuation': /.+/
				}
			}
		}
	},
	'label': /`[^`]*`/g,
	// https://github.com/dhall-lang/dhall-lang/blob/5fde8ef1bead6fb4e999d3c1ffe7044cd019d63a/standard/dhall.abnf#L596
	'url': /\bhttps?:\/\/[\w.:%!$&'*+;=@~-]+(?:\/[\w.:%!$&'*+;=@~-]*)*(?:\?[/?\w.:%!$&'*+;=@~-]*)?/g,
	'env': {
		// https://github.com/dhall-lang/dhall-lang/blob/5fde8ef1bead6fb4e999d3c1ffe7044cd019d63a/standard/dhall.abnf#L661
		pattern: /\benv:(?:(?!\d)\w+|"(?:\\.|[^\\"=])*")/g,
		inside: {
			'function': /^env/,
			'operator': /^:/,
			'variable': /[\s\S]+/
		}
	},
	'hash': {
		// https://github.com/dhall-lang/dhall-lang/blob/5fde8ef1bead6fb4e999d3c1ffe7044cd019d63a/standard/dhall.abnf#L725
		pattern: /\bsha256:[a-fA-F\d]{64}\b/,
		inside: {
			'function': /sha256/,
			'operator': /:/,
			'number': /[a-fA-F\d]{64}/
		}
	},

	// https://github.com/dhall-lang/dhall-lang/blob/5fde8ef1bead6fb4e999d3c1ffe7044cd019d63a/standard/dhall.abnf#L359
	'keyword': /\b(?:as|assert|else|forall|if|in|let|merge|missing|then|toMap|using|with)\b|∀/,
	'builtin': /\b(?:None|Some)\b/,

	'boolean': /\b(?:False|True)\b/,
	'number': /\bNaN\b|-?\bInfinity\b|[+-]?\b(?:0x[a-fA-F\d]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/,
	'operator': /\/\\|\/\/\\\\|===|[!=]=|\/\/|->|\+\+|&&|\|\||::|[+*#@:?=<>|\\∧⩓≡⫽λ→]/,
	'punctuation': /\.\.|[()[\]{}.,/]/,

	// we'll just assume that every capital word left is a type name
	'class-name': /\b[A-Z]\w*\b/
};
