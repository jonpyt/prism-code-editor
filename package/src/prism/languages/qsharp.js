import { languages } from '../core.js';
import { boolean } from '../utils/patterns.js';
import { nested, re, replace } from '../utils/shared.js';

// https://docs.microsoft.com/en-us/azure/quantum/user-guide/language/typesystem/
// https://github.com/microsoft/qsharp-language/tree/main/Specifications/Language/5_Grammar
var keywords = /\b(?:Adj|BigInt|Bool|Ctl|Double|false|true|Int|One|Pauli[IXYZ]?|Qubit|Range|Result|String|Unit|Zero|[Aa]djoint|apply|as|auto|body|borrow|borrowing|[Cc]ontrolled|distribute|elif|else|fail|fixup|for|function|i[fns]|internal|intrinsic|invert|[ls]et|mutable|namespace|new|newtype|open|operation|repeat|return|self|until|use|using|while|within)\b/;

// types
var identifier = /\b(?!\d)\w+\b/.source;
var qualifiedName = replace(/<0>(?:\s*\.\s*<0>)*/.source, [identifier]);

var typeInside = {
	'keyword': keywords,
	'punctuation': /[<>()?,.:[\]]/
};

// strings
var regularString = /"(?:\\.|[^\\"])*"/.source;

// single line
var interpolationExpr = nested(replace(/\{(?:[^"{}]|<0>|<self>)*\}/.source, [regularString]), 2);

languages.qs = languages.qsharp = {
	'comment': /\/\/.*/,
	'interpolation-string': {
		pattern: re(/\$"(?:\\.|<0>|[^\\"{])*"/.source, [interpolationExpr], 'g'),
		inside: {
			'interpolation': {
				pattern: re(/((?:^|[^\\])(?:\\\\)*)<0>/.source, [interpolationExpr]),
				lookbehind: true,
				inside: {
					'punctuation': /^\{|\}$/,
					'expression': {
						pattern: /[\s\S]+/,
						alias: 'language-qsharp',
						inside: 'qs'
					}
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string': {
		pattern: re(/(^|[^\\$])<0>/.source, [regularString], 'g'),
		lookbehind: true
	},
	'class-name': [
		{
			// open Microsoft.Quantum.Canon;
			// open Microsoft.Quantum.Canon as CN;
			pattern: re(/(\b(?:as|open)\s+)<0>(?=\s*(?:;|as\b))/.source, [qualifiedName]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// namespace Quantum.App1;
			pattern: re(/(\bnamespace\s+)<0>(?=\s*\{)/.source, [qualifiedName]),
			lookbehind: true,
			inside: typeInside
		},
	],
	'keyword': keywords,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'range': {
		pattern: /\.\./,
		alias: 'operator'
	},
	'number': /(?:\b0(?:x[a-f\d]+|b[01]+|o[0-7]+)|(?:\B\.\d+|\b\d+(?:\.\d*)?)(?:e[+-]?\d+)?)l?\b/i,
	'operator': /\b(?:and\b=?|or\b=?|not\b)|<[=-]|[=-]>|(?:>>>|<<<|\^\^\^|\|\|\||&&&|w\/|[*/^!=%+-])=?|~~~/,
	'punctuation': /::|[()[\]{}.,:;]/
};
