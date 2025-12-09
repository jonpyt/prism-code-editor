import { languages, tokenizeText, tokenize, withoutTokenizer } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { re, replace } from '../utils/shared.js';
import './markup.js';

// Allow only one line break
var inner = [/(?:\\.|[^\\\n]|\n(?!\n))/.source];

/**
 * This function is intended for the creation of the bold or italic pattern.
 *
 * This also adds a lookbehind group to the given pattern to ensure that the pattern is not backslash-escaped.
 *
 * _Note:_ Keep in mind that this adds a capturing group.
 *
 * @param {string} pattern
 * @returns {RegExp}
 */
var createInline = pattern => re(`((?:^|[^\\\\])(?:\\\\\\\\)*)(?:${pattern})`, inner, 'g');
var tableCell = /(?:\\.|``(?:[^\n`]|`(?!`))+``|`[^\n`]+`|[^\\\n|`])+/;
var tableRow = replace(/\|?<0>(?:\|<0>)+\|?(?:\n|(?![\s\S]))/.source, [tableCell.source]);
var tableLine = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?\n/.source;
var markdown = languages.md = languages.markdown = clone(languages.html);

insertBefore(markdown, 'prolog', {
	'front-matter-block': {
		pattern: /(^(?:\s*\n)?)---(?!.)[\s\S]*?\n---(?!.)/g,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^---|---$/,
			'front-matter': {
				pattern: /\S(?:[\s\S]*\S)?/,
				alias: 'language-yaml',
				inside: 'yaml'
			}
		}
	},
	'blockquote': {
		// > ...
		pattern: /^>(?:[ \t]*>)*/m,
		alias: 'punctuation'
	},
	'table': {
		pattern: RegExp('^' + tableRow + tableLine + '(?:' + tableRow + ')*', 'm'),
		inside: {
			'table-header-row': {
				pattern: /^.+/,
				inside: {
					'table-header': {
						pattern: tableCell,
						alias: 'important',
						inside: markdown
					},
					'punctuation': /\|/
				}
			},
			'table-data-rows': {
				pattern: /(.+\n)[\s\S]+/,
				lookbehind: true,
				inside: {
					'table-data': {
						pattern: tableCell,
						inside: markdown
					},
					'punctuation': /\|/
				}
			},
			'table-line': {
				pattern: /.+/,
				inside: {
					'punctuation': /\S+/
				}
			},
		}
	},
	'code': [
		{
			// Prefixed by 4 spaces or 1 tab and preceded by an empty line
			pattern: /(^[ \t]*\n)(?:    |\t).+(?:\n(?:    |\t).+)*/m,
			lookbehind: true,
			alias: 'keyword'
		},
		{
			// ```optional language
			// code block
			// ```
			pattern: /^(```+)[^`][\s\S]*?^\1`*$/mg,
			greedy: true,
			inside: {
				'punctuation': /^`+|`+$/,
				'code-language': /^.+/,
				'code-block': /(?!^)[\s\S]+(?=\n)/,
				[tokenize](code, grammar) {
					var tokens = withoutTokenizer(code, grammar);
					var language;

					if (tokens[5]) {
						language = (/[a-z][\w-]*/i.exec(
							tokens[1].content.replace(/\b#/g, 'sharp').replace(/\b\+\+/g, 'pp')
						) || [''])[0].toLowerCase();

						tokens[3].alias = 'language-' + language;
	
						if (grammar = languages[language]) {
							tokens[3].content = tokenizeText(tokens[3].content, grammar);
						}
					}

					return tokens;
				}
			}
		}
	],
	'title': [
		{
			// title 1
			// =======

			// title 2
			// -------
			pattern: /\S.*\n(?:==+|--+)(?=[ \t]*$)/m,
			alias: 'important',
			inside: {
				punctuation: /=+$|-+$/
			}
		},
		{
			// # title 1
			// ###### title 6
			pattern: /(^\s*)#.+/m,
			lookbehind: true,
			alias: 'important',
			inside: {
				punctuation: /^#+|#+$/
			}
		}
	],
	'hr': {
		// ***
		// ---
		// * * *
		// -----------
		pattern: /(^\s*)([*-])(?:[ \t]*\2){2,}(?=\s*$)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'list': {
		// * item
		// + item
		// - item
		// 1. item
		pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[ \t].)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'url-reference': {
		// [id]: http://example.com "Optional title"
		// [id]: http://example.com 'Optional title'
		// [id]: http://example.com (Optional title)
		// [id]: <http://example.com> "Optional title"
		pattern: /!?\[[^\]]+\]:[ \t]+(?:\S+|<(?:\\.|[^\\>])+>)(?:[ \t]+(?:"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\((?:\\.|[^\\)])*\)))?/,
		inside: {
			'variable': {
				pattern: /^(!?\[)[^\]]+/,
				lookbehind: true
			},
			'string': /(?:"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\((?:\\.|[^\\)])*\))$/,
			'punctuation': /^[[\]!:]|<|>/
		},
		alias: 'url'
	},
	'bold': {
		// **strong**
		// __strong__

		// allow one nested instance of italic text using the same delimiter
		pattern: createInline(/\b__(?:(?!_)<0>|_(?:(?!_)<0>)+_)+__\b|\*\*(?:(?!\*)<0>|\*(?:(?!\*)<0>)+\*)+\*\*/.source),
		lookbehind: true,
		greedy: true,
		inside: {
			'content': {
				pattern: /(^..)[\s\S]+(?=..)/,
				lookbehind: true,
				inside: {} // see below
			},
			'punctuation': /../
		}
	},
	'italic': {
		// *em*
		// _em_

		// allow one nested instance of bold text using the same delimiter
		pattern: createInline(/\b_(?:(?!_)<0>|__(?:(?!_)<0>)+__)+_\b|\*(?:(?!\*)<0>|\*\*(?:(?!\*)<0>)+\*\*)+\*/.source),
		lookbehind: true,
		greedy: true,
		inside: {
			'content': {
				pattern: /(?!^)[\s\S]+(?=.)/,
				inside: {} // see below
			},
			'punctuation': /./
		}
	},
	'strike': {
		// ~~strike through~~
		// ~strike~
		// eslint-disable-next-line regexp/strict
		pattern: createInline(/(~~?)(?:(?!~)<0>)+\2/.source),
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^~~?|~~?$/,
			'content': {
				pattern: /[\s\S]+/,
				inside: {} // see below
			},
		}
	},
	'code-snippet': {
		// `code`
		// ``code``
		pattern: /(^|[^\\`])(`+)[^\n`](?:|.*?[^\n`])\2(?!`)/g,
		lookbehind: true,
		greedy: true,
		alias: 'code keyword'
	},
	'url': {
		// [example](http://example.com "Optional title")
		// [example][id]
		// [example] [id]
		pattern: createInline(/!?\[(?:(?!\])<0>)+\](?:\([^\s)]+(?:[ \t]+"(?:\\.|[^\\"])*")?\)|[ \t]?\[(?:(?!\])<0>)+\])/.source),
		lookbehind: true,
		greedy: true,
		inside: {
			'operator': /^!/,
			'content': {
				pattern: /(^\[)[^\]]+(?=\])/,
				lookbehind: true,
				inside: {} // see below
			},
			'variable': {
				pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
				lookbehind: true
			},
			'url': {
				pattern: /(^\]\()[^\s)]+/,
				lookbehind: true
			},
			'string': {
				pattern: /(^[ \t]+)"(?:\\.|[^\\"])*"(?=\)$)/,
				lookbehind: true
			},
			'markup-bracket': markdown['markup-bracket']
		}
	}
});

['url', 'bold', 'italic', 'strike'].forEach(token => {
	['url', 'bold', 'italic', 'strike', 'code-snippet', 'markup-bracket'].forEach(inside => {
		if (token != inside) {
			markdown[token].inside.content.inside[inside] = markdown[inside];
		}
	});
});
