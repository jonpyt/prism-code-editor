/** @module match-tags */

import { PrismEditor, BasicExtension } from "../index.js"
import { Token, TokenStream } from "../prism/index.js"
import { getClosestToken } from "../utils/index.js"
import { addTextareaListener, voidlessLangs, voidTags } from "../utils/local.js"

/**
 * Tuple containing in the following order:
 * - The tag's `Token`
 * - Its starting position
 * - Its ending position
 * - Its tag name
 * - Whether it's a closing tag
 * - Whether it's not self-closing
 */
export type Tag = [Token, number, number, string, boolean, boolean]

export interface TagMatcher {
	/**
	 * Array of tuples containing in the following order:
	 * - The tag's `Token`
	 * - Its starting position
	 * - Its ending position
	 * - Its tag name
	 * - Whether it's a closing tag
	 * - Whether it's not self-closing
	 *
	 * The tags are sorted by their ending position
	 */
	readonly tags: Tag[]
	/** Array mapping the index of a tag to the index of its matching tag. */
	readonly pairs: (number | undefined)[]
}

/**
 * Function that adds tag matching to the editor.
 * @returns An object containing all tags and pairs.
 */
export const createTagMatcher = (editor: PrismEditor): TagMatcher => {
	let pairMap: number[] = []
	let code: string
	let tags: Tag[] = []
	let tagIndex: number
	let sp: number
	let stack: [number, string][] = []

	let matchTags = (tokens: TokenStream, language: string, value: string) => {
		code = value
		tags.length = pairMap.length = tagIndex = sp = 0
		matchTagsRecursive(tokens, language, 0)
	}

	let matchTagsRecursive = (tokens: TokenStream, language: string, position: number) => {
		let noVoidTags = voidlessLangs.has(language)
		let i = 0
		let l = tokens.length
		for (; i < l; ) {
			const token = <Token>tokens[i++]
			const content = token.content
			const length = token.length
			if (Array.isArray(content)) {
				if (token.type == "tag" && code[position] == "<") {
					const openLen = content[0].length
					const tagName = content[2] ? code.substr(position + openLen, content[1].length) : ""
					const notSelfClosing =
						content[content.length - 1].length < 2 && (noVoidTags || !voidTags.test(tagName))

					if (content[2]) matchTagsRecursive(content, language, position)

					if (notSelfClosing) {
						if (openLen > 1) {
							for (let i = sp; i; ) {
								if (tagName == stack[--i][1]) {
									pairMap[(pairMap[tagIndex] = stack[(sp = i)][0])] = tagIndex
									i = 0
								}
							}
						} else {
							stack[sp++] = [tagIndex, tagName]
						}
					}

					tags[tagIndex++] = [
						token,
						position,
						position + length,
						tagName,
						openLen > 1,
						notSelfClosing,
					]
				} else {
					let lang = token.alias || token.type
					matchTagsRecursive(
						content,
						lang.slice(0, 9) == "language-" ? lang.slice(9) : language,
						position,
					)
				}
			}
			position += length
		}
	}

	editor.on("tokenize", matchTags)

	matchTags(editor.tokens, editor.options.language, editor.value)

	return {
		tags,
		pairs: pairMap,
	}
}

const getClosestTagIndex = (pos: number, tags: TagMatcher["tags"]) => {
	for (let i = 0, l = tags.length; i < l; i++) if (tags[i][1] <= pos && tags[i][2] >= pos) return i
}

/**
 * Extension that adds an `active-tagname` class to matching HTML/XML/JSX tags when the
 * cursor is on either tag. If the editor doesn't have a {@link TagMatcher}, one is
 * created. Use the CSS selector `.active-tagname` to style the elements. Obviously don't
 * add this if the languages used don't have tags.
 */
export const matchTags = (): BasicExtension => editor => {
	let openEl: Element | undefined, closeEl: Element | undefined
	const { tags, pairs } = (editor.extensions.matchTags ||= createTagMatcher(editor))
	const highlight = (remove?: boolean) =>
		[openEl, closeEl].forEach(el => {
			el && el.classList.toggle("active-tagname", !remove)
		})

	editor.on("selectionChange", ([start, end]) => {
		let newEl1: Element | undefined
		let newEl2: Element | undefined
		let index: number
		if (start == end && editor.focused) {
			index = getClosestTagIndex(start, tags)!

			if (index + 1) {
				index = pairs[index]!

				if (index + 1 && (newEl1 = getClosestToken(editor, ".tag>.tag"))) {
					newEl2 = getClosestToken(editor, ".tag>.tag", 2, 0, tags[index][1])
				}
			}
		}
		if (openEl != newEl1) {
			highlight(true)
			openEl = newEl1
			closeEl = newEl2
			highlight()
		}
	})
}

/**
 * Extension that highlights `<` and `>` punctuation in XML tags.
 * @param className Class added to the active punctuation you can use to style them with CSS.
 * @param alwaysHighlight If true, the punctuation will always be highlighted when the cursor
 * is inside a tag. If not it will only be highlighted when the cursor is on the punctuation.
 */
export const highlightTagPunctuation =
	(className: string, alwaysHighlight?: boolean): BasicExtension =>
	editor => {
		let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
		const { tags } = (editor.extensions.matchTags ||= createTagMatcher(editor))
		const getPunctuation = (pos?: number) => getClosestToken(editor, ".tag>.punctuation", 0, 0, pos)
		const highlight = (remove?: boolean) =>
			[openEl, closeEl].forEach(el => {
				el && el.classList.toggle(className, !remove)
			})

		const selectionChange = () => {
			let [start, end] = editor.getSelection()
			let newEl1: HTMLSpanElement
			let newEl2: HTMLSpanElement
			if (start == end && editor.focused) {
				let tag = tags[getClosestTagIndex(start, tags)!]

				if (
					tag &&
					(alwaysHighlight || (!getClosestToken(editor, ".tag>.tag") && getPunctuation()))
				) {
					newEl1 = getPunctuation(tag[1])!
					newEl2 = getPunctuation(tag[2] - 1)!
				}
			}
			if (openEl != newEl1! || closeEl != newEl2!) {
				highlight(true)
				openEl = newEl1!
				closeEl = newEl2!
				highlight()
			}
		}
		editor.on("selectionChange", selectionChange)
		addTextareaListener(editor, "focus", selectionChange)
		addTextareaListener(editor, "blur", selectionChange)
	}
