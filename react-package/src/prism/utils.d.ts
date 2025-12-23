import type { useBracketMatcher } from "../extensions/match-brackets/index.js"
import type { useTagMatcher } from "../extensions/match-tags.js"
import type { useShowInvisibles } from "../extensions/search/invisibles.js"
import type { CustomTokenizer, Grammar, GrammarTokens, TokenName, TokenStream } from "./index.js"

/**
 * Creates a deep clone of the given grammar definition.
 * @param grammar Grammar object you want to clone.
 */
export declare const clone: (grammar: Grammar) => Grammar

/**
 * Inserts tokens _before_ another token in the given grammar.
 *
 * ## Usage
 *
 * This helper method makes it easy to modify existing grammars. For example, the markup language definition
 * defines highlighting for CSS embedded in HTML through `<style>` elements. To do this, it needs to modify
 * `languages.markup` and add the appropriate tokens. However, `languages.markup` is a regular JavaScript
 * object literal, so if you do this:
 *
 * ```js
 * markup.style = {
 *     // token
 * };
 * ```
 *
 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
 * before existing tokens. For the markup example above, you would use it like this:
 *
 * ```js
 * insertBefore(markup, 'cdata', {
 *   'style': {
 *     // token
 *   }
 * });
 * ```
 *
 * ## Special cases
 *
 * If the grammars of `grammar` and `insert` have tokens with the same name, the tokens in `grammar`'s grammar
 * will be ignored.
 *
 * This behavior can be used to insert tokens after `before`:
 *
 * ```js
 * insertBefore(markup, 'comment', {
 *   'comment': markup.comment,
 *   // tokens after 'comment'
 * });
 * ```
 *
 * @param grammar The grammar to be modified.
 * @param before The key to insert before.
 * @param insert An object containing the key-value pairs to be inserted.
 */
export declare const insertBefore: (
	grammar: Grammar,
	before: TokenName,
	insert: GrammarTokens,
) => void

/**
 * Creates a deep copy of the language with the given id and appends the given tokens.
 *
 * If a token in `reDef` also appears in the copied language, then the existing token in the copied language
 * will be overwritten at its original position.
 *
 * ## Best practices
 *
 * Since the position of overwriting tokens (token in `reDef` that overwrite tokens in the copied language)
 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
 *
 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
 *
 * @param id The id of the language to extend.
 * @param reDef The new tokens to append.
 * @returns The new language created.
 * @example
 * languages['css-with-colors'] = extend('css', {
 *   // languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
 *   // at its original position
 *   'comment': { ... },
 *   // CSS doesn't have a 'color' token, so this token will be appended
 *   'color': /\b(?:red|green|blue)\b/
 * });
 */
export declare const extend: (id: string, reDef?: Grammar) => Grammar

/**
 * Custom tokenizer for languages that are embedded in another language.
 * 
 * This works by first tokenizing everything using the grammar of the embedded language.
 * Then, all tokens whose name doesn't start with `ignore` are replaced with whitespace
 * of the same length. This new string is then tokenized using `hostGrammar`, and all the
 * replaced tokens are inserted into the new token stream.
 * 
 * @param hostGrammar The grammar this language is embedded in. Can either be a grammar object
 * or the name of a grammar.
 */
export declare const embeddedIn: (hostGrammar: Grammar | string) => CustomTokenizer

/**
 * Tokenizes all strings in the token stream with the given tokenization function.
 *
 * @param tokens Tokens to mutate.
 * @param tokenize Function applied to all strings in the token stream. The token stream
 * returned must have the same text content as the given text.
 */
export function tokenizeStrings(tokens: TokenStream, tokenize: (code: string) => TokenStream): void

/**
 * Function that will highlight all tabs and spaces in a token stream. Similar to
 * {@link useShowInvisibles}, but this highlights all spaces and tabs as tokens instead.
 * This also works with code blocks. If you only want to show spaces and tabs that are
 * selected, then {@link useShowInvisibles} must be used instead.
 *
 * Requires styling from `prism-react-editor/invisibles.css`.
 *
 * ## Usage
 *
 * Note that this function should be the last tokenization function that's called. This
 * is not just a performance optimization since {@link tokenizeDataUris} doesn't work
 * when it's called after.
 *
 * To use this function add it to `onTokenize`.
 *
 * ```jsx
 * <Editor
 *   language="jsx" value="foo"
 *   onTokenize={tokenizeInvisibles}
 * />
 *
 * <CodeBlock
 *   language="jsx" code="foo"
 *   onTokenize={tokenizeInvisibles}
 * />
 * ```
 *
 * Alternatively, you can create an extension for editors.
 *
 * ```ts
 * const MyExtension = ({ editor }: { editor: PrismEditor }) => {
 *   // Call extensions like useMatchBrackets before
 *
 *   useLayoutEffect(() => {
 *     return editor.on("tokenize", tokenizeInvisibles)
 *   }, [])
 * }
 * ```
 *
 * @param tokens Tokens to mutate.
 */
export function tokenizeInvisibles(tokens: TokenStream): void

/**
 * Function that will highlight the body of data URIs. If you have
 * `'data:image/svg+xml,<svg></svg>'`, then this will highlight `<svg></svg>` as XML for
 * example.
 *
 * ## Usage
 *
 * Note that this function should be the first tokenization function that's called. If
 * {@link useBracketMatcher} or {@link useTagMatcher} are called before this function is
 * added as a `tokenize` listener, then tags and brackets created by this won't be
 * matched together.
 *
 * ### With editors
 *
 * To use this function with editors, add it as a `tokenize` listener inside an extension.
 *
 * ```ts
 * const MyExtension = ({ editor }: { editor: PrismEditor }) => {
 *   useLayoutEffect(() => {
 *     return editor.on("tokenize", tokenizeDataUris)
 *   }, [])
 * 
 *   // Call extensions like useMatchBrackets after
 * }
 * ```
 *
 * ### With code blocks
 *
 * To use this function with code blocks, call it inside `onTokenize`.
 *
 * ```jsx
 * <CodeBlock
 *   language="jsx" code="foo"
 *   onTokenize={useCallback(tokens => {
 *     tokenizeInvisibles(tokens)
 *
 *     // Other tokenizers after
 *   }, [])}
 * />
 * ```
 *
 * @param tokens Tokens to mutate.
 */
export function tokenizeDataUris(tokens: TokenStream): void
