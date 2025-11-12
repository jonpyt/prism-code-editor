import { Token, TokenStream } from "../prism/index"
import { Extension } from ".."
import { createEffect, onCleanup, untrack } from "solid-js"
import { getClosestToken } from "../utils"
import { voidlessLangs, voidTags } from "../utils/local"

/**
 * Tuple containing in the following order:
 * - The tag's `Token`
 * - Its starting position
 * - Its ending position
 * - Its tag name
 * - Whether it's a closing tag
 * - Whether it isn't self-closing
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
	 * - Whether it isn't self-closing
	 */
	readonly tags: Tag[]
	/** Array mapping the index of a tag to the index of its matching tag. */
	readonly pairs: (number | undefined)[]
}

/**
 * Extension that traverses the tokens and matches tags together.
 * Used by {@link highlightMatchingTags} and {@link highlightTagPunctuation}
 */
const matchTags = (): Extension => editor => {
	let pairMap: number[] = []
	let code: string
	let tags: Tag[] = []
	let tagIndex: number
	let sp: number
	let stack: [number, string][] = []

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

	createEffect(() => {
		code = editor.value
		tags.length = pairMap.length = sp = tagIndex = 0
		matchTagsRecursive(
			editor.tokens(),
			untrack(() => editor.props.language),
			0,
		)
	})

	editor.extensions.matchTags = {
		tags,
		pairs: pairMap,
	}

	onCleanup(() => {
		delete editor.extensions.matchTags
	})
}

const getClosestTagIndex = (pos: number, tags: TagMatcher["tags"]) => {
	for (let i = 0, l = tags.length; i < l; i++) if (tags[i][1] <= pos && tags[i][2] >= pos) return i
}

/**
 * Extension that adds an `active-tagname` class to matching HTML/XML/JSX tags when the
 * cursor is on either tag. It's required to have the {@link matchTags} extension for this
 * to work. Use the CSS selector `.active-tagname` to style the elements.
 */
const highlightMatchingTags = (): Extension => editor => {
	let openEl: Element | undefined, closeEl: Element | undefined
	let highlight = (remove?: boolean) =>
		[openEl, closeEl].forEach(el => {
			el && el.classList.toggle("active-tagname", !remove)
		})

	createEffect(() => {
		let [start, end] = editor.selection()
		let newEl1: Element | undefined
		let newEl2: Element | undefined
		let index: number
		let matcher = editor.extensions.matchTags
		if (start == end && matcher && untrack(editor.focused)) {
			index = getClosestTagIndex(start, matcher.tags)!

			if (index + 1) {
				index = matcher.pairs[index]!

				if (index + 1 && (newEl1 = getClosestToken(editor, ".tag>.tag"))) {
					newEl2 = getClosestToken(editor, ".tag>.tag", 2, 0, matcher.tags[index][1])
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
 * It's required to have the {@link matchTags} extension for this to work.
 * @param className Class added to the active punctuation you can use to style them with CSS.
 * @param alwaysHighlight If true, the punctuation will always be highlighted when the cursor
 * is inside a tag. If not it will only be highlighted when the cursor is on the punctuation.
 */
const highlightTagPunctuation = (className: string, alwaysHighlight?: boolean): Extension => {
	return editor => {
		let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
		let getPunctuation = (pos?: number) => getClosestToken(editor, ".tag>.punctuation", 0, 0, pos)
		let highlight = (remove?: boolean) =>
			[openEl, closeEl].forEach(el => {
				el && el.classList.toggle(className, !remove)
			})

		createEffect(() => {
			let [start, end] = editor.selection()
			let matcher = editor.extensions.matchTags
			let newEl1: HTMLSpanElement
			let newEl2: HTMLSpanElement
			if (editor.focused() && matcher && start == end) {
				let tag = matcher.tags[getClosestTagIndex(start, matcher.tags)!]

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
		})
	}
}

export { matchTags, highlightTagPunctuation, highlightMatchingTags }
