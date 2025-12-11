/** @module code-folding */

import { Extension, PrismEditor, numLines } from "../.."
import { getLineBefore } from "../../utils"
import { addListener, languageMap } from "../../core"
import { BracketMatcher } from "../match-brackets"
import { TagMatcher } from "../match-tags"
import { TokenStream, Token } from "../../prism"
import { getLineEnd, updateNode } from "../../utils/local"
import { template as _template } from "solid-js/web"
import { createEffect, onCleanup, onMount } from "solid-js"

/**
 * Callback used to add extra foldable ranges to an editor.
 * @param editor Editor the folding ranges are added to.
 * @param currentFolds The ranges that are currently foldable.
 * @returns An array of extra foldable ranges.
 */
export type FoldingRangeProvider = (
	editor: PrismEditor,
	currentFolds: [number, number][],
) => [number, number][] | undefined

export interface ReadOnlyCodeFolding {
	/** The code in the editor with no ranges collapsed. */
	readonly fullCode: string
	/**
	 * Toggles whether a range is folded. Does not cause a rerender so it's possible to
	 * toggle multiple folds simultaneously.
	 * @param lineNumber The line number of the fold.
	 * @param force If set to `true`, the range will only be folded.
	 * If `false`, the range will only be unfolded.
	 * If `undefined`, it will be toggled.
	 * @returns A boolean indicating whether or not a fold was toggled which means
	 * calling {@link updateFolds} in the near future is necessary.
	 */
	toggleFold(lineNumber: number, force?: boolean): boolean
	/** Call this after the {@link toggleFold} method to rerender the editor. */
	updateFolds(): void
}

const template = /* @__PURE__ */ _template('<div class="pce-fold"><div> ')
const template2 = /* @__PURE__ */ _template(
	'<div class="pce-unfold"> <span title="Unfold">   </span> ',
)

const isMultiline = (str: string, start: number, end: number) =>
	str.slice(start, end).includes("\n")

/**
 * Extension only supporting read-only editors which adds code folding to the editor.
 *
 * @param providers By default, this extension does not add any foldable ranges and you
 * must add folding range providers. This package defines multiple folding range providers
 * you can import like {@link bracketFolding}, {@link tagFolding},
 * {@link blockCommentFolding}, and {@link markdownFolding}. You can also define your own
 * providers.
 *
 * Very minimal downsides to adding this extension dynamically.
 *
 * Requires styles from `solid-prism-editor/code-folding.css`
 */
const readOnlyCodeFolding = (...providers: FoldingRangeProvider[]): Extension => {
	return editor => {
		let value: string
		let code: string
		let lineNumberWidth: string
		let foldPositions: (undefined | [number, number])[]

		const foldToggles: HTMLDivElement[] = []
		const foldPlaceholders: HTMLDivElement[] = []
		const foldedLines = new Set<number>()
		const foldedRanges = new Set<[number, number]>()
		const extensions = editor.extensions
		const lines = editor.lines
		const container = editor.container

		const getPosition = (pos: number) => {
			let result = pos
			for (let [start, end] of foldedRanges) {
				if (pos > start) {
					if (pos < end) return -1
					result -= end - start - 3
				}
			}
			return result
		}

		const toggleFold = (line: number) => {
			const start = foldPositions[line]![0]
			const addFold = (line: number) => {
				let [start, end] = foldPositions[line]!
				let expanded: boolean
				for (let range of foldedRanges) {
					if (start <= range[0] && end > range[0]) {
						if (expanded!) foldedRanges.delete(range)
						else {
							range[0] = start
							if (end > range[1]) range[1] = end
							expanded = true
						}
					}
				}
				if (!expanded!) foldedRanges.add([start, end])
			}

			if (foldedLines.has(line)) {
				foldedLines.delete(line)
				for (let range of foldedRanges) {
					if (start == range[0]) {
						foldedRanges.delete(range)
						for (let currentLine of foldedLines) {
							const pos = foldPositions[currentLine]![0]
							if (pos > start) addFold(currentLine)
						}
						break
					}
				}
			} else {
				foldedLines.add(line)
				addFold(line)
			}
		}

		const update = (line?: number) => {
			value = ""
			let pos = 0
			let textarea = editor.textarea

			for (let [start, end] of [...foldedRanges].sort((a, b) => a[0] - b[0])) {
				value += code.slice(pos, start) + "   "
				pos = end
			}

			textarea.value = value += code.slice(pos)
			if (line) textarea.setSelectionRange((pos = getPosition(foldPositions[line]![0])), pos)
			editor.update()

			container.style.setProperty("--number-width", lineNumberWidth)
			updateFolds()
		}

		const updateFolds = () => {
			for (let line = 0, l = foldPositions.length, prev: Element; line < l; line++) {
				if (!foldPositions[line]) continue
				let pos = getPosition(foldPositions[line]![0])
				if (pos + 1) {
					let parent = lines[numLines(value, 0, pos)]
					let el = foldToggles[line]
					let isClosed = foldedLines.has(line)
					let pos2 = getPosition(foldPositions[line]![1])
					if (!el) {
						el = foldToggles[line] = template() as HTMLDivElement
						addListener(el, "click", () => toggleAndUpdate(line))
					}
					if (parent != el.parentNode && parent != prev!) parent.prepend(el)
					prev = parent
					el.classList.toggle("closed-fold", isClosed)
					el.title = `${isClosed ? "Unf" : "F"}old line`
					el = foldPlaceholders[line]
					if (isClosed) {
						if (!el) {
							el = foldPlaceholders[line] = template2() as HTMLDivElement
							addListener(el, "click", () => toggleAndUpdate(line))
						}
						el.style.counterIncrement = `line ${numLines(code, ...foldPositions[line]!) - 1}`
						updateNode(el.firstChild as Text, getLineBefore(value, pos))
						updateNode(el.lastChild as Text, value.slice(pos2, getLineEnd(value, pos2)))
						if (parent != el.parentNode) parent.prepend(el)
					} else el?.remove()
				}
			}
		}

		const toggleAndUpdate = (line: number) => {
			toggleFold(line)
			update(line)
		}

		const createFolds = () => {
			foldPositions = []
			value = code = editor.value
			foldedRanges.clear()
			foldedLines.clear()
			lineNumberWidth = (0 | Math.log10(numLines(code))) + 1 + ".001ch"
			const folds: [number, number][] = []
			providers.forEach(clb => folds.push(...(clb(editor, folds) || [])))

			for (let i = 0, l = folds.length; i < l; i++) {
				const [start, end] = folds[i]
				const index = numLines(value, 0, start)

				if (!foldPositions[index] || end > foldPositions[index]![1])
					foldPositions[index] = [start, end]
			}
			updateFolds()
		}

		createEffect(() => {
			editor.props.value
			editor.props.language
			queueMicrotask(createFolds)
		})

		createEffect(() => {
			container.style.setProperty(
				"--padding-left",
				editor.props.lineNumbers == false ? "calc(var(--_pse) + var(--_ns))" : "",
			)
		})

		onCleanup(() => {
			delete extensions.folding
			if (foldToggles) {
				foldToggles.forEach((el, i) => {
					el.remove()
					foldPlaceholders[i]?.remove()
				})
			}
			if (foldedRanges.size) {
				foldedRanges.clear()
				foldPositions = []
				update()
			}
		})

		extensions.folding = {
			get fullCode() {
				return code
			},
			toggleFold: (lineNumber, force) =>
				!!foldPositions[lineNumber] &&
				foldedLines.has(lineNumber) != force &&
				!toggleFold(lineNumber)!,
			updateFolds: () => update(),
		}
	}
}

/**
 * Folding range provider that adds folding of square, round, and curly brackets.
 * Requires a {@link BracketMatcher} added to the editor to work.
 */
const bracketFolding: FoldingRangeProvider = ({ value, extensions: { matchBrackets } }) => {
	if (matchBrackets) {
		let folds: [number, number][] = []
		let { brackets, pairs } = matchBrackets
		let i = 0
		let j: number
		let l = pairs.length
		for (; i < l; i++) {
			if ((j = pairs[i]!) > i && isMultiline(value, brackets[i][1], brackets[j][1])) {
				folds.push([brackets[i][2], brackets[j][1]])
			}
		}
		return folds
	}
}

/**
 * Folding range provider that adds folding of HTML/XML elements.
 * Requires a {@link TagMatcher} added to the editor to work.
 */
const tagFolding: FoldingRangeProvider = ({ value, extensions: { matchTags } }) => {
	if (matchTags) {
		let folds: [number, number][] = []
		let { tags, pairs } = matchTags
		let i = 0
		let j: number
		let l = pairs.length
		for (; i < l; i++) {
			if ((j = pairs[i]!) > i && isMultiline(value, tags[i][2], tags[j][1])) {
				folds.push([tags[i][2], tags[j][1]])
			}
		}
		return folds
	}
}

/**
 * Folding range provider that allows folding of block comments. For this to work,
 * you need to befine block comments in the {@link languageMap} for the language.
 *
 * Simply pass this function as one of the arguments when calling {@link readOnlyCodeFolding}.
 */
const blockCommentFolding: FoldingRangeProvider = ({ tokens, value, props: { language } }) => {
	const folds: [number, number][] = []
	const findBlockComments = (tokens: TokenStream, position: number, language: string) => {
		for (let i = 0, l = tokens.length; i < l; ) {
			const token = <Token>tokens[i++]
			const content = token.content
			const length = token.length
			const aliasType = token.alias || token.type
			if (aliasType == "comment" && isMultiline(value, position, position + length)) {
				let comment = languageMap[language]?.comments?.block
				if (comment && value.indexOf(comment[0], position) == position)
					folds.push([position + comment[0].length, position + length - comment[1].length])
			} else if (Array.isArray(content)) {
				findBlockComments(
					content,
					position,
					aliasType.slice(0, 9) == "language-" ? aliasType.slice(9) : language,
				)
			}
			position += length
		}
	}

	findBlockComments(tokens(), 0, language)

	return folds
}

/**
 * Folding range provider that allows folding of titles and code blocks in markdown.
 *
 * Simply pass this function as one of the arguments when calling {@link readOnlyCodeFolding}.
 */
const markdownFolding: FoldingRangeProvider = ({ tokens, value, props: { language } }) => {
	if (language == "markdown" || language == "md") {
		let folds: [number, number][] = []
		let pos = 0
		let openTitles: number[] = []
		let tokenList = tokens()
		let levels: number
		let closeTitles = (level: number) => {
			for (let end = value.slice(0, pos).trimEnd().length; level <= levels; ) {
				folds.push([openTitles[level++], end])
			}
		}
		let i = 0
		let l = tokenList.length

		for (; i < l; ) {
			const token = <Token>tokenList[i++]
			const length = token.length
			const type = token.type
			if (type == "code" && !token.alias) {
				let content = <Token[]>(<Token>token).content
				folds.push([
					pos + content[0].length + (content[1].content || "").length,
					pos + length - content[content.length - 1].length - 1,
				])
			}
			if (type == "title") {
				let [token1, token2] = <Token[]>(<Token>token).content
				let level = token1.type ? token1.length - 1 : (<string>token2.content)[0] == "=" ? 0 : 1
				closeTitles(level)
				openTitles[(levels = level)] = pos + (token1.type ? length : token1.length - 1)
			}

			pos += length
		}

		closeTitles(0)
		return folds
	}
}

export { readOnlyCodeFolding, markdownFolding, blockCommentFolding, tagFolding, bracketFolding }
