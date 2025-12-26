import { Token, languages, tokenize, withoutTokenizer } from '../core.js';
import { clone, insertBefore } from './language.js';
import { replace, re } from './shared.js';

var space = /\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\//.source;
var braces = /\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})*\}/.source;

/**
 * @param {string} code
 * @param {*} grammar
 */
var tokenizer = (code, grammar) => {
	var position = 0, tokens = withoutTokenizer(code, grammar);
	var i = 0, openedTags = [], l = 0;
	var result = [];
	var token;
	var j = 0;
	var textStartPos;
	var content;
	var addStoredText = () => {
		if (textStartPos) {
			content = code.slice(textStartPos, position);
			result[j++] = new Token('plain-text', content, content);
			textStartPos = 0;
		}
	};

	for ( ; token = tokens[i]; i++, position += length) {
		var length = token.length;
		var isNeverText = token.type;
		var last, tag, start;

		if (isNeverText) {
			content = token.content;
			if (isNeverText == 'tag') {
				// We found a tag, now find its kind
				start = content[0].length;
				tag = content[2] ? code.substr(position + start, content[1].length) : '';
				if (start > 1) {
					// Closing tag
					if (l && openedTags[l - 1][0] == tag) {
						// Pop matching opening tag
						l--;
					}
				} else {
					if (content[content.length - 1].length < 2) {
						// Opening tag
						openedTags[l++] = [tag, 0];
					}
				}
			} else if (l && isNeverText == 'punctuation') {
				last = openedTags[l - 1];
				if (content == '{') last[1]++;
				else if (last[1] && content == '}') last[1]--;
				else {
					isNeverText = "}()[]".includes(content);
				}
			} else {
				isNeverText = false;
			}
		}
		if (!isNeverText && l && !openedTags[l - 1][1]) {
			// Here we are inside a tag, and not inside a JSX context.
			// That's plain text: drop any tokens matched.
			if (!textStartPos) {
				textStartPos = position;
			}
		} else {
			addStoredText();
			result[j++] = token;
		}
	}
	addStoredText();
	return result;
};

/**
 * Adds JSX tags along with the custom tokenizer to the grammar
 * @param {any} grammar
 * @param {string} name
 */
var addJsxTag = (grammar, name) => {
	insertBefore(languages[name] = grammar = clone(grammar), 'regex', {
		'tag': {
			pattern: re(
				/<\/?(?:(?!\d)[^\s%=<>/]+(?:<0>(?:<0>*(?:[^\s{=<>/*]+(?:<0>*=<0>*(?!\s)(?:"[^"]*"|'[^']*'|<1>)?|(?=[\s/>]))|<1>))*)?<0>*\/?)?>/.source, [space, braces], 'g'
			),
			greedy: true,
			inside: {
				'punctuation': /^<\/?|\/?>$/,
				'tag': {
					pattern: /^[^\s/<]+/,
					inside: {
						'namespace': /^[^:]+:/,
						'class-name': /^[A-Z]\w*(?:\.[A-Z]\w*)*$/
					}
				},
				'attr-value': {
					pattern: re(/(=<0>*)(?:"[^"]*"|'[^']*')/.source, [space]),
					lookbehind: true,
					inside: {
						'punctuation': /^["']|["']$/
					}
				},
				'expression': {
					pattern: RegExp(braces, 'g'),
					greedy: true,
					alias: 'language-' + name,
					inside: grammar
				},
				'comment': grammar['comment'],
				'attr-equals': /=/,
				'attr-name': {
					pattern: /\S+/,
					inside: {
						'namespace': /^[^:]+:/
					}
				}
			}
		}
	});

	grammar[tokenize] = tokenizer;
	return grammar;
};

export { addJsxTag, space, braces };
