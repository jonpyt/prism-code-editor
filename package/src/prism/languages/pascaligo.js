import { languages } from '../core.js';
import { re, replace } from '../utils/shared.js';

// Pascaligo is a layer 2 smart contract language for the tezos blockchain

var type = replace(/(?:\b\w+<0>?|<0>)/.source, [/\((?:[^()]|\((?:[^()]|\([^)]*\))*\))*\)/.source]);

var classNameInside = {};

var className = [
	{
		pattern: re(/(\btype\s+\w+\s+is\s+)<0>/.source, [type], 'i'),
		lookbehind: true,
		inside: classNameInside
	},
	{
		pattern: re(/<0>(?=\s+is\b)/.source, [type], 'i'),
		inside: classNameInside
	},
	{
		pattern: re(/(:\s*)<0>/.source, [type]),
		lookbehind: true,
		inside: classNameInside
	}
];

var pascaligo = languages.pascaligo = {
	'comment': /\(\*[\s\S]+?\*\)|\/\/.*/,
	'string': /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1|\^[a-z]/gi,
	'class-name': className,
	'keyword': {
		pattern: /(^|[^&])\b(?:begin|block|case|const|else|end|fail|for|from|function|if|is|nil|of|remove|return|skip|then|type|var|while|with)\b/i,
		lookbehind: true
	},
	'boolean': {
		pattern: /(^|[^&])\b(?:false|true)\b/i,
		lookbehind: true
	},
	'builtin': {
		pattern: /(^|[^&])\b(?:bool|int|list|map|nat|record|string|unit)\b/i,
		lookbehind: true
	},
	'function': /\b\w+(?=\s*\()/,
	'number': [
		// Hexadecimal, octal and binary
		/%[01]+|&[0-7]+|\$[a-f\d]+/i,
		// Decimal
		/\b\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:mtz|n)?/i
	],
	'operator': /->|=\/=|\.\.|\*\*|:=|<>|>>|<<|[<>/*+-]=?|[@|^=]|\b(?:and|mod|or)\b/,
	'punctuation': /\(\.|\.\)|[()[\]{}.,:;]/
};

['comment', 'keyword', 'builtin', 'operator', 'punctuation'].forEach(key => {
	classNameInside[key] = pascaligo[key];
});
