// Prism's greedy core test
// https://github.com/PrismJS/prism/blob/v1.29.0/tests/core/greedy.js

'use-strict';

import { assert } from 'chai';
import { simplify } from './helper/token-stream-transformer.js';
import { tokenizeText } from '../core.js';

function testTokens({ grammar, code, expected }) {
	const simpleTokens = simplify(tokenizeText(code, grammar));

	assert.deepStrictEqual(simpleTokens, expected);
}

describe('Greedy matching', () => {

	it('should correctly handle tokens with the same name', () => {
		testTokens({
			grammar: {
				'comment': [
					/\/\/.*/,
					{
						pattern: /\/\*[\s\S]*?(?:\*\/|$)/g
					}
				]
			},
			code: '// /*\n/* comment */',
			expected: [
				['comment', '// /*'],
				['comment', '/* comment */']
			]
		});
	});

	it('should support patterns with top-level alternatives that do not contain the lookbehind group', () => {
		testTokens({
			grammar: {
				'a': /'[^']*'/,
				'b': {
					// This pattern has 2 top-level alternatives:  foo  and  (^|[^\\])"[^"]*"
					pattern: /foo|(^|[^\\])"[^"]*"/g,
					lookbehind: true
				}
			},
			code: 'foo "bar" \'baz\'',
			expected: [
				['b', 'foo'],
				['b', '"bar"'],
				['a', "'baz'"]
			]
		});
	});

	it('should correctly rematch tokens', () => {
		testTokens({
			grammar: {
				'a': {
					pattern: /'[^'\r\n]*'/,
				},
				'b': {
					pattern: /"[^"\r\n]*"/g,
				},
				'c': {
					pattern: /<[^>\r\n]*>/g,
				}
			},
			code: `<'> '' ''\n<"> "" ""`,
			expected: [
				['c', "<'>"],
				" '",
				['a', "' '"],
				"'\n",

				['c', '<">'],
				['b', '""'],
				['b', '""'],
			]
		});
	});

	it('should always match tokens against the whole text', () => {
		// this is to test for a bug where greedy tokens where matched like non-greedy ones if the token stream ended on
		// a string
		testTokens({
			grammar: {
				'a': /a/,
				'b': {
					pattern: /^b/g
				}
			},
			code: 'bab',
			expected: [
				['b', 'b'],
				['a', 'a'],
				'b'
			]
		});
	});

	it('issue3052', () => {
		// If a greedy pattern creates an empty token at the end of the string, then this token should be discarded
		testTokens({
			grammar: {
				'oh-no': {
					pattern: /$/g
				}
			},
			code: 'foo',
			expected: ['foo']
		});
	});

});
