/** @import { TokenStream } from "../types.js" */
/** @import { showInvisibles } from "../../extensions/search/invisibles.js" */
/** @import { tokenizeDataUris } from "./data-uri.js"; */

import { Token } from "../core.js";
import { tokenizeStrings } from "./tokenize-strings.js";

var pattern = / |\t/g;

/**
 * Function that will highlight all tabs and spaces in a token stream. Similar to
 * {@link showInvisibles}, but this highlights all spaces and tabs as tokens instead.
 * This also works with code blocks. If you only want to show spaces and tabs that are
 * selected, then {@link showInvisibles} must be used instead.
 *
 * Requires styling from `prism-code-editor/invisibles.css`.
 *
 * ## Usage
 *
 * Note that this function should be the last tokenization function that's called. This
 * is not just a performance optimization since {@link tokenizeDataUris} doesn't work
 * when it's called after.
 *
 * ### With editors
 *
 * To use this function with editors, add it to `onTokenize` or as a `tokenize` listener.
 *
 * ```js
 * createEditor(
 *   "#editor",
 *   { 
 *     ...
 *     onTokenize: tokenizeInvisibles
 *   },
 *   matchBrackets()
 * )
 * ```
 *
 * Or
 *
 * ```js
 * createEditor(
 *   "#editor",
 *   { ... },
 *   // Other tokenizers before
 *   matchBrackets(),
 *   editor => editor.on("tokenize", tokenizeInvisibles)
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
 *   value: "const foo = 'bar'",
 *   tokenizeCallback(tokens) {
 *     // Other tokenizers before
 *
 *     tokenizeInvisibles(tokens)
 *   }
 * })
 * ```
 *
 * @param {TokenStream} tokens Tokens to mutate.
 */
var tokenizeInvisibles = (tokens) => {
	return tokenizeStrings(tokens, code => {
		/** @type {TokenStream} */
		var result = [];
		var pos = 0;
		var match, i = 0;
		while (match = pattern.exec(code)) {
			if (match.index > pos) result[i++] = code.slice(pos, pos = match.index);
			result[i++] = new Token(match[0] == " " ? "space" : "tab", match[0], match[0]);
			pos++;
		}

		if (code[pos]) result.push(code.slice(pos));
		return result;
	});
};

export { tokenizeInvisibles };
