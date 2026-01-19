import { useBracketMatcher } from "../extensions/match-brackets/index.js"
import { Token, TokenStream } from "../prism/index.js"
import { testBracket } from "../utils/local.js"

let stack: [Token, number][] = []
let sp: number

const addAlias = (token: Token, newAlias = "bracket-error") => {
	let alias = token.alias
	token.alias = alias ? alias + " " + newAlias : newAlias
}

const matchRecursive = (tokens: TokenStream, pairs: string) => {
	let token: string | Token
	let i = 0
	for (; (token = tokens[i++]); ) {
		if (typeof token == "string") continue

		let content = token.content
		let alias = token.alias

		if (Array.isArray(content)) {
			matchRecursive(content, pairs)
		} else if ((alias || token.type) == "punctuation") {
			let last = token.length - 1
			let bracketType = testBracket(content, pairs, last)

			if (bracketType) {
				if (bracketType % 2) stack[sp++] = [token, bracketType + 1]
				else {
					let i = sp
					let entry: [Token, number]

					while ((entry = stack[--i])) {
						let entry = stack[--i]
						if (bracketType == entry[1]) {
							let alias = "bracket-level-" + (i % 12)
							let j = i
							while (++j < sp) {
								addAlias(stack[j][0])
							}
							addAlias(token, alias)
							addAlias(entry[0], alias)
							sp = i
							break
						}
					}
					if (!entry) addAlias(token)
				}
			}
		}
	}
}

/**
 * Function that runs the same bracket matching algorithm as the {@link useBracketMatcher}
 * hook. This is useful to add rainbow brackets outside an editor such as in code blocks.
 *
 * @param pairs Which characters to match together. The opening character must be followed
 * by the closing character. Defaults to `"()[]{}"`.
 * @returns A function that accepts a token stream and adds extra classes to the brackets.
 */
const rainbowBrackets = (pairs = "()[]{}") => {
	return (tokens: TokenStream) => {
		sp = 0
		matchRecursive(tokens, pairs)
		stack = []
	}
}

export { rainbowBrackets }
