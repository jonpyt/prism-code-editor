/** @import { TokenStream } from "../types.js" */
/** @import { matchTags } from "../../extensions/matchTags.js" */
/** @import { matchBrackets } from "../../extensions/matchBrackets/index.js" */

import { languages, Token, tokenizeText } from "../core.js"
import { tokenizeStrings } from "./tokenize-strings.js"

var pattern = /(['"]?)\s*data:[^,/]+\/(?:[^,+]+\+)?(css|javascript|json|html|xml),([\s\S]+)\1$/g;

/**
 * Function that will highlight the body of data URIs. If you have
 * `'data:image/svg+xml,<svg></svg>'`, then this will highlight `<svg></svg>` as XML for
 * example.
 *
 * ## Usage
 *
 * Note that this function should be the first tokenization function that's called. If
 * {@link matchBrackets} or {@link matchTags} are called before this function is added
 * as a `tokenize` listener, then tags and brackets created by this won't be matched
 * together. 
 *
 * ### With editors
 *
 * To use this function with editors, add it as a `tokenize` listener.
 *
 * ```js
 * createEditor(
 *   "#editor",
 *   { ... },
 *   editor => editor.on("tokenize", tokenizeDataUris),
 *   // Other tokenizers after
 *   matchBrackets()
 * )
 * ```
 *
 * ### With code blocks
 *
 * To use this function with code blocks, call it inside `tokenizeCallback`.
 *
 * ```js
 * renderCodeBlock({
 *   language: "js",
 *   code: "const foo = 'bar'",
 *   tokenizeCallback(tokens) {
 *     tokenizeDataUris(tokens)
 *
 *     // Other tokenizers after
 *   }
 * })
 * ```
 *
 * @param {TokenStream} tokens Tokens to mutate.
 */
var tokenizeDataUris = tokens => {
	return tokenizeStrings(tokens, code => {
		/** @type {TokenStream} */
		var result = [];
		var pos = 0;
		var match;
		var body;
		while (match = pattern.exec(code)) {
			result.push(
				code.slice(pos, pos = code.indexOf(",", match.index) + 1),
				new Token(
					"language-" + match[2],
					tokenizeText(
						body = match[3],
						languages[match[2]] || {},
					),
					body
				)
			);
			pos += body.length;
		}

		if (code[pos]) result.push(code.slice(pos));
		return result;
	});
};

export { tokenizeDataUris };
