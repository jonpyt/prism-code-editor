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
	var token;
	var j = 0;
	var textStartPos;
	var content;
	var last;
	var addStoredText = () => {
		if (textStartPos) {
			content = code.slice(textStartPos, position);
			tokens[j++] = new Token('plain-text', content, content);
			textStartPos = 0;
		}
	};

	for ( ; token = tokens[i]; i++, position += length) {
		var length = token.length;
		var isNeverText = token.type;
		var tag, start;

		if (isNeverText) {
			content = token.content;
			if (isNeverText == 'tag') {
				// We found a tag, now find its kind
				start = content[0].length;
				tag = content[2] ? code.substr(position + start, content[1].length) : '';
				if (start > 1) {
					// Closing tag
					if (l && last[0] == tag) {
						// Pop matching opening tag
						last = openedTags[--l - 1];
					}
				} else {
					if (content[content.length - 1].length < 2) {
						// Opening tag
						openedTags[l++] = last = [tag, 0];
					}
				}
			} else if (l && isNeverText == 'punctuation') {
				if (content == '{') last[1]++;
				else if (last[1] && content == '}') last[1]--;
				else {
					isNeverText = "}()[]".includes(content);
				}
			} else {
				isNeverText = false;
			}
		}
		if (!isNeverText && l && !last[1]) {
			// Here we are inside a tag, and not inside a JSX context.
			// That's plain text: drop any tokens matched.
			if (!textStartPos) {
				textStartPos = position;
			}
		} else {
			addStoredText();
			tokens[j++] = token;
		}
	}
	addStoredText();
	tokens.length = j;
	return tokens;
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
						'punctuation': /^["']|["']$/g
					}
				},
				'expression': {
					pattern: RegExp(braces, 'g'),
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
