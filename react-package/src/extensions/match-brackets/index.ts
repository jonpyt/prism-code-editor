import { useLayoutEffect } from "react"
import { Token, TokenStream } from "../../prism"
import { PrismEditor } from "../../types"
import { testBracket } from "../../utils/local"

export interface BracketMatcher {
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
 * Hook that matches punctuation tokens together. Intended for matching brackets.
 *
 * Note that when adding the extension dynamically with rainbow brackets, they won't be
 * added until the next time the editor rerenders.
 *
 * @param rainbowBrackets Whether to add extra classes to brackets for styling. Defaults
 * to `true`.
 * @param pairs Which characters to match together. The opening character must be followed
 * by the corresponding closing character. Defaults to `"()[]{}"`.
 */
export const useBracketMatcher = (
	editor: PrismEditor,
	rainbowBrackets = true,
	pairs = "()[]{}",
) => {
	useLayoutEffect(() => {
		let bracketIndex: number
		let sp: number
		const stack: [number, number][] = []
		const brackets: Bracket[] = []
		const pairMap: number[] = []

		const matchRecursive = (tokens: TokenStream, position: number) => {
			for (let i = 0, token: string | Token; (token = tokens[i++]); ) {
				let length = token.length
				if (typeof token != "string") {
					let content = token.content

					if (Array.isArray(content)) {
						matchRecursive(content, position)
					} else if ((token.alias || token.type) == "punctuation") {
						let bracketType = testBracket(content, pairs, length - 1)
						let isOpening = bracketType % 2
						if (bracketType) {
							brackets[bracketIndex] = [
								token,
								position,
								position + length,
								sp,
								content,
								!!isOpening,
							]

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

		const cleanup = editor.on("tokenize", tokens => {
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
		})

		editor.extensions.matchBrackets = {
			brackets,
			pairs: pairMap,
		}

		return () => {
			delete editor.extensions.matchBrackets
			cleanup()
		}
	}, [rainbowBrackets, pairs])
}
