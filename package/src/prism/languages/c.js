import { languages } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';

// https://en.cppreference.com/w/c/language/character_constant
var char = /'(?:\\[\s\S]|[^\\\n']){0,32}'/g;

var comment = /\/\/(?:[^\\\n]|\\\n?)*|\/\*[\s\S]*?(?:\*\/|$)/g;

// https://en.cppreference.com/w/c/language/string_literal
var string = /"(?:\\[\s\S]|[^\\\n"])*"/g;

var macroExpression = {
	pattern: /\S[\s\S]*/
};

macroExpression.inside = languages.c = {
	'comment': comment,
	'char': char,
	'macro': {
		// allow for multiline macro definitions
		// spaces after the # character compile fine with gcc
		pattern: /(^[ \t]*)#\s*[a-z](?:[^\\\n/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\[\s\S])*/img,
		lookbehind: true,
		alias: 'property',
		inside: {
			'string': [
				{
					// highlight the path of the include statement as a string
					pattern: /^(#\s*include\s*)<[^>]+>/,
					lookbehind: true
				},
				string
			],
			'char': char,
			'comment': comment,
			'macro-name': [
				{
					pattern: /(^#\s*define\s+)\w+\b(?!\()/i,
					lookbehind: true
				},
				{
					pattern: /(^#\s*define\s+)\w+/i,
					lookbehind: true,
					alias: 'function'
				}
			],
			// highlight macro directives as keywords
			'directive': {
				pattern: /^(#\s*)[a-z]+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'directive-hash': /^#/g,
			'punctuation': /##|\\(?=\n)/,
			'expression': macroExpression
		}
	},
	'string': string,
	'class-name': {
		pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
		lookbehind: true
	},
	'keyword': /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,
	// highlight predefined macros as constants
	'constant': /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'number': /(?:\b0x(?:[a-f\d]+(?:\.[a-f\d]*)?|\.[a-f\d]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
	'operator': /->|([&|:+-])\1|[?:~]|>>=?|<<=?|[%&|^!=<>/*+-]=?/,
	'punctuation': clikePunctuation
};
