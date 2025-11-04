/** @import { TokenStream } from '../types.js' */

/**
 * Tokenizes all strings in the token stream with the given tokenization function.
 *
 * @param {TokenStream} tokens Tokens to mutate.
 * @param {(code: string) => TokenStream} tokenize Function applied to all strings in the
 * token stream. The token stream returned must have the same text content as the given
 * text.
 */
var tokenizeStrings = (tokens, tokenize) => {
	/** @type {TokenStream} */
	var result = [];
	for (var i = 0, token; token = tokens[i++]; ) {
		/** @type {string | TokenStream | undefined} */
		var content = token.content;
		var stream;

		if (content) {
			if (Array.isArray(content)) {
				tokenizeStrings(content, tokenize);
			} else {
				stream = tokenize(content);
				if (stream[0] != content) token.content = stream;
			}
			result.push(token)
		} else {
			result.push(...tokenize(token))
		}
	}
	for (i = 0; token = result[i]; ) tokens[i++] = token;
};

export { tokenizeStrings };
