/**
 * The symbol used to add a grammar that will get appended to this grammar.
 *
 * The `rest` property can be the name of a language in {@link languages}.
 * If that grammar doesn't yet exist, the `rest` property persists, and the
 * the rest grammar will be appended once it exists.
 */
export declare const rest: unique symbol
/**
 * The symbol used to add a custom tokenizer to a grammar.
 *
 * For example the markdown code block grammar uses a custom tokenizer to highlight code blocks.
 * This custom tokenizer first tokenizes the code as normal, then finds the language of the code block.
 * If that language has a registered grammar, the content of the code block is tokenized using
 * that language's grammar.
 *
 * @see {@link CustomTokenizer} for the type definition of a custom tokenizer.
 *
 * ### Note:
 *
 * It's very important that you use {@link withoutTokenizer} and not {@link tokenizeText} inside a
 * custom tokenizer since the latter will call the custom tokenizer again leading to infinite recursion.
 *
 * @example
 * // A custom tokenizer will often look more or less like this:
 * const myGrammar = {
 *   // some tokens ...
 *   [tokenize](code, grammar) {
 *     const tokens = withoutTokenizer(code, grammar);
 *     // Do something with the tokens
 *     return tokens;
 *   }
 * };
 */
export declare const tokenize: unique symbol

export declare class Token {
	/**
	 * The type of the token.
	 *
	 * This is usually the key of a pattern in a {@link Grammar}.
	 *
	 * @see {@link GrammarToken}
	 */
	type: TokenName

	/**
	 * The strings or tokens contained by this token.
	 *
	 * This will be a token stream if the pattern matched also defined an `inside` grammar.
	 */
	content: string | TokenStream

	/** Length of the full string this token was created from. */
	length: number

	/**
	 * The alias(es) of the token.
	 * Multiple aliases are separated by spaces.
	 *
	 * @see {@link GrammarToken.alias}
	 */
	alias?: TokenName

	/**
	 * Creates a new token.
	 *
	 * @param type See {@link Token.type}
	 * @param content See {@link Token.content}
	 * @param matchedStr A copy of the full string this token was created from.
	 * @param alias The alias(es) of the token.
	 */
	constructor(type: TokenName, content: string | TokenStream, matchedStr: string, alias?: TokenName)
}

/**
 * This record contains all currently loaded Prism languages.
 */
export declare const languages: Record<string, Grammar>

/**
 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
 * and the language definitions to use, and returns an array with the tokenized code.
 *
 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
 *
 * This method could be useful in other contexts as well, as a very crude parser.
 *
 * @param text A string with the code to be highlighted.
 * @param grammar An object containing the tokens to use.
 *
 * Usually a language definition like `languages.markup`.
 * @returns An array of strings and tokens, a token stream.
 * @example
 * let code = `var foo = 0;`;
 * let tokens = tokenizeText(code, languages.javascript);
 * tokens.forEach(token => {
 *   if (token instanceof Token && token.type == 'number') {
 *     console.log(`Found numeric literal: ${token.content}`);
 *   }
 * });
 */
export declare const tokenizeText: (text: string, grammar: Grammar) => TokenStream

/**
 * Same as {@link tokenizeText}, but doesn't call the potential custom tokenizer of the grammar.
 * This is useful inside a custom tokenizer where {@link tokenizeText} can cause infinite recursion.
 *
 * @see {@link tokenize} for more info on custom tokenizers.
 *
 * @param text A string with the code to be highlighted.
 * @param grammar An object containing the tokens to use.
 */
export declare const withoutTokenizer: (text: string, grammar: Grammar) => TokenStream

/**
 * This function takes in a {@link TokenStream} and returns a string of HTML code.
 *
 * This HTML differs slightly from the HTML that's produced by PrismJS. Firstly, it can safely
 * be split into lines with something like `html.split('\n')`. This is because all span elements are
 * closed and immediately opened again on a line break, which ensures no context is lost when
 * splitting by lines. Secondly, behavior identical to the
 * {@link https://prismjs.com/plugins/highlight-keywords/ Highlight Keywords} plugin is present by
 * default.
 *
 * @param tokens The tokens you want to highlight.
 */
export declare const highlightTokens: (tokens: TokenStream) => string

/**
 * High level utility that tokenizes the code using {@link tokenizeText} and then
 * highlights the {@link TokenStream} using {@link highlightTokens}.
 *
 * @param text A string with the code to be highlighted.
 * @param ref Either a grammar object or a language name used to index {@link languages}. The resolved
 * grammar is then used to highlight the text.
 */
export declare const highlightText: (text: string, ref: Grammar | string) => string

export declare const resolve: (ref: string | null | undefined | Grammar) => Grammar | undefined

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
	| "atrule"
	| "attr-name"
	| "attr-value"
	| "bold"
	| "boolean"
	| "builtin"
	| "cdata"
	| "char"
	| "class-name"
	| "comment"
	| "constant"
	| "deleted"
	| "doctype"
	| "entity"
	| "function"
	| "important"
	| "inserted"
	| "italic"
	| "keyword"
	| "namespace"
	| "number"
	| "operator"
	| "prolog"
	| "property"
	| "punctuation"
	| "regex"
	| "selector"
	| "string"
	| "symbol"
	| "tag"
	| "url"

// eslint-disable-next-line
export type TokenName = (string & {}) | StandardTokenName

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

export type GrammarTokens = Partial<
	Record<TokenName, RegExp | GrammarToken | (RegExp | GrammarToken)[]>
>
export type GrammarSymbols = {
	[rest]?: Grammar | string | null
	[tokenize]?: CustomTokenizer | null
}
export type Grammar = GrammarTokens & GrammarSymbols
