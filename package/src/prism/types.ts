import { tokenize, rest, Token } from "./core.js"

/**
 * A token stream is an array of strings and {@link Token} objects.
 *
 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
 * them.
 *
 * 1. No adjacent strings.
 * 2. No empty strings.
 *
 * The only exception here is the token stream that only contains the empty string and nothing else.
 */
export type TokenStream = (string | Token)[]

export type StandardTokenName =
	| 'atrule'
	| 'attr-name'
	| 'attr-value'
	| 'bold'
	| 'boolean'
	| 'builtin'
	| 'cdata'
	| 'char'
	| 'class-name'
	| 'comment'
	| 'constant'
	| 'deleted'
	| 'doctype'
	| 'entity'
	| 'function'
	| 'important'
	| 'inserted'
	| 'italic'
	| 'keyword'
	| 'namespace'
	| 'number'
	| 'operator'
	| 'prolog'
	| 'property'
	| 'punctuation'
	| 'regex'
	| 'selector'
	| 'string'
	| 'symbol'
	| 'tag'
	| 'url'

export type TokenName = string & {} | StandardTokenName

/**
 * The expansion of a simple `RegExp` literal to support additional properties.
 */
export interface GrammarToken {
	/**
	 * The regular expression of the token.
	 */
	pattern: RegExp
	/**
	 * If `true`, then the first capturing group of `pattern` will (effectively) behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
	 *
	 * @default false
	 */
	lookbehind?: boolean
	/**
	 * No longer specifies whether the token is greedy. Set the global regex flag on the pattern instead.
	 */
	greedy?: never
	/**
	 * An optional alias. Multiple aliases are separated by spaces.
	 */
	alias?: TokenName
	/**
	 * The nested grammar of this token.
	 *
	 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
	 *
	 * This can be used to make nested and even recursive language definitions.
	 *
	 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
	 * each another.
	 */
	inside?: Grammar | string | null
}

/**
 * A custom tokenizer for a grammar.
 * 
 * @see {@link tokenize} symbol for more info.
 * 
 * @param code A string with the code this grammar needs to tokenize.
 * @param grammar The grammar with the custom tokenizer
 * @returns A token stream representing the matched code.
 */
export type CustomTokenizer = (code: string, grammar: Grammar) => TokenStream

export type GrammarTokens = Partial<Record<TokenName, RegExp | GrammarToken | (RegExp | GrammarToken)[]>>
export type GrammarSymbols = {
	[rest]?: Grammar | string | null
	[tokenize]?: CustomTokenizer | null
}
export type Grammar = GrammarTokens & GrammarSymbols
