/** @module match-brackets */

import { BasicExtension } from "../../index.js"
import { Token, TokenStream } from "../../prism/index.js"
import { testBracket } from "../../utils/bracket.js"

export interface BracketMatcher extends BasicExtension {
	/**
	 * Array of tuples containing in the following order:
	 * - The bracket's `Token`
	 * - Its starting position
	 * - Its ending position
	 * - Its level of nesting
	 * - Its text content
	 * - Whether it's an opening bracket
	 */
	readonly brackets: Bracket[]
	/** Array mapping the index of a bracket to the index of its matching bracket. */
	readonly pairs: (number | undefined)[]
}

/**
 * Tuple containing in the following order:
 * - The bracket's `Token`
 * - Its starting position
 * - Its ending position
 * - Its level of nesting
 * - Its text content
 * - Whether it's an opening bracket
 */
export type Bracket = [Token, number, number, number, string, boolean]

/**
 * Extension that matches punctuation tokens together. Intended for matching brackets.
 *
 * Without rainbow brackets, this extension can be added dynamically with no downsides.
 *
 * @param rainbowBrackets Whether to add extra classes to brackets for styling. Defaults
 * to `true`. When enabled, adding the extension dynamically will force a rerender to add
 * these extra classes.
 * @param pairs Which characters to match together. The opening character must be followed
 * by the corresponding closing character. Defaults to `"()[]{}"`.
 */
export const matchBrackets = (rainbowBrackets = true, pairs = "()[]{}") => {
	let bracketIndex: number
	let sp: number
	const stack: [number, number][] = []
	const self: BracketMatcher = editor => {
		editor.extensions.matchBrackets = self
		editor.on("tokenize", matchBrackets)
		if (rainbowBrackets && editor.tokens[0]) editor.update()
		else matchBrackets(editor.tokens)
	}
	// @ts-expect-error
	const brackets: Bracket[] = (self.brackets = [])
	// @ts-expect-error
	const pairMap: number[] = (self.pairs = [])
	const matchBrackets = (tokens: TokenStream) => {
		pairMap.length = brackets.length = sp = bracketIndex = 0
		matchRecursive(tokens, 0)

		if (rainbowBrackets) {
			for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
				let alias = bracket[0].alias

				bracket[0].alias =
					(alias ? alias + " " : "") +
					`bracket-${i++ in pairMap ? "level-" + (bracket[3] % 12) : "error"}`
			}
		}
	}
	const matchRecursive = (tokens: TokenStream, position: number) => {
		let token: string | Token
		let i = 0
		for (; (token = tokens[i++]); ) {
			let length = token.length
			if (typeof token != "string") {
				let content = token.content

				if (Array.isArray(content)) {
					matchRecursive(content, position)
				} else if ((token.alias || token.type) == "punctuation") {
					let bracketType = testBracket(content, pairs, length - 1)
					let isOpening = bracketType % 2
					if (bracketType) {
						brackets[bracketIndex] = [token, position, position + length, sp, content, !!isOpening]

						if (isOpening) stack[sp++] = [bracketIndex, bracketType + 1]
						else {
							for (let i = sp, entry: [number, number]; (entry = stack[--i]); ) {
								if (bracketType == entry[1]) {
									pairMap[(pairMap[bracketIndex] = entry[0])] = bracketIndex
									brackets[bracketIndex][3] = sp = i
									break
								}
							}
						}
						bracketIndex++
					}
				}
			}
			position += length
		}
	}

	return self
}
