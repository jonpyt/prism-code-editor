import { createTemplate } from "../../core.js"
import { PrismEditor } from "../../index.js"
import { highlightText, languages, Token } from "../../prism/core.js"
import { TokenName, TokenStream } from "../../prism/types.js"
import { updateNode } from "../../utils/local.js"
import { matchTemplate } from "../search/search.js"
import { map } from "./tooltip.js"
import { Completion, CompletionContext, CompletionSource } from "./types.js"

const optionsFromKeys = (obj: object, icon?: string): Completion[] =>
	Object.keys(obj).map(tag => ({ label: tag, icon }))

const updateMatched = (container: HTMLElement, matched: number[], text: string) => {
	let nodes = container.childNodes
	let nodeCount = nodes.length - 1
	let pos = 0
	let i = 0
	let l = matched.length

	for (; i < l; ) {
		if (i >= nodeCount) {
			nodes[i].before("", matchTemplate())
		}
		updateNode(nodes[i] as Text, text.slice(pos, (pos = matched[i++])))
		updateNode(nodes[i].firstChild as Text, text.slice(pos, (pos = matched[i++])))
	}
	for (; nodeCount > i; ) {
		nodes[--nodeCount].remove()
	}
	updateNode(nodes[l] as Text, text.slice(pos))
}

/**
 * Completion source that returns a list of options if `path` property of the context
 * is present and only contains a single string.
 * @param options Options to complete.
 */
const completeFromList = (options: Completion[]): CompletionSource<{ path: string[] | null }> => {
	return ({ path, explicit, pos }) => {
		if (path?.length == 1 && (path[0] || explicit)) {
			return {
				from: pos - path[0].length,
				options: options,
			}
		}
	}
}

/**
 * Utility that searches the editor's {@link TokenStream} for strings. This utility will
 * only search parts of the document whose language has the same completion definition
 * registered.
 * @param context Current completion context.
 * @param editor Editor to search in.
 * @param filter Function used to filter tokens you want to search in. Is called with the
 * type of the token and its starting position. If the filter returns true, the token
 * will be searched.
 * @param pattern Pattern used to search for words. Must have the `g` flag.
 * @param init Words that should be completed even if they're not found in the document.
 * @param tokensOnly If `true` only the text of tokens whose `content` is a string will
 * be searched. If `false`, any string inside the {@link TokenStream} can be searched.
 * @returns A set with found identifers/words.
 */
const findWords = (
	context: CompletionContext,
	editor: PrismEditor,
	filter: (type: TokenName, start: number) => boolean,
	pattern: RegExp,
	init?: Iterable<string>,
	tokensOnly?: boolean,
) => {
	const cursorPos = context.pos
	const definition = map[context.language]
	const result = new Set(init)
	const search = (tokens: TokenStream, pos: number, isCorrectLang: boolean) => {
		let i = 0
		let token: string | Token

		for (; (token = tokens[i++]); ) {
			if (typeof token == "string") {
				if (!tokensOnly && isCorrectLang) match(token, pos)
			} else {
				const type = token.type
				const content = token.content
				const aliasType = token.alias || type

				if (Array.isArray(content)) {
					if (!isCorrectLang || filter(type, pos)) {
						search(
							content,
							pos,
							aliasType.slice(0, 9) == "language-"
								? definition == map[aliasType.slice(9)]
								: isCorrectLang,
						)
					}
				} else if (isCorrectLang && filter(type, pos)) match(content, pos)
			}
			pos += token.length
		}
	}
	const match = (token: string, pos: number) => {
		let match: RegExpExecArray | null
		while ((match = pattern.exec(token))) {
			let start = pos + match.index
			let str = match[0]
			if (start > cursorPos || start + str.length < cursorPos) result.add(str)
		}
	}

	search(editor.tokens, 0, definition == map[editor.options.language])

	return result
}

const attrSnippet = (
	name: string,
	quotes: string,
	icon?: Completion["icon"],
	boost?: number,
): Completion => ({
	label: name,
	icon,
	insert: name + "=" + quotes,
	tabStops: [name.length + 2, name.length + 2, name.length + 3],
	boost,
})

const completionsFromRecords = (
	records: (Record<string, unknown> | undefined)[],
	icon?: Completion["icon"],
): Completion[] => {
	const names = new Set<string>()

	records.forEach(tags => {
		for (let key in tags) names.add(key)
	})

	return Array.from(names, name => ({
		label: name,
		icon: icon,
	}))
}

const createPre = /* @__PURE__ */ createTemplate<HTMLPreElement>("<pre>")

/**
 * @param snippet String of code to highlight.
 * @param language Language to highlight the snippet with.
 * @param className Additional classes to add to the `<pre>` element.
 * @returns `<pre><code>` element with the snippet highlighted using the specified
 * language.
 */
const renderSnippet = (snippet: string, language: string, className?: string) => {
	const pre = createPre()

	pre.innerHTML = `<code>${highlightText(snippet, languages[language] || {})}</code>`
	pre.className = `language-${language}${className ? " " + className : ""}`

	return pre
}

export {
	optionsFromKeys,
	updateMatched,
	findWords,
	completeFromList,
	attrSnippet,
	completionsFromRecords,
	renderSnippet,
}
