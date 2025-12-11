/** @module code-folding */

import { Extension, PrismEditor, numLines } from "../../index.js"
import { getLineBefore } from "../../utils/index.js"
import { createTemplate, languageMap, addListener } from "../../core.js"
import { BracketMatcher } from "../matchBrackets/index.js"
import { TagMatcher } from "../matchTags.js"
import { TokenStream, Token } from "../../prism/index.js"
import { getLineEnd, updateNode } from "../../utils/local.js"

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

export interface ReadOnlyCodeFolding extends Extension {
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

const template = /* @__PURE__ */ createTemplate("<div><div> ")
const template2 = /* @__PURE__ */ createTemplate(
	"<div class=pce-unfold> <span title=Unfold>   </span> ",
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
 * Requires styles from `prism-code-editor/code-folding.css`
 */
const readOnlyCodeFolding = (...providers: FoldingRangeProvider[]): ReadOnlyCodeFolding => {
	let cEditor: PrismEditor
	let value: string
	let code: string
	let lines: HTMLCollection
	let lineNumberWidth: string
	let textarea: HTMLTextAreaElement
	let foldPositions: (undefined | [number, number])[]

	const foldToggles: HTMLDivElement[] = []
	const foldPlaceholders: HTMLDivElement[] = []
	const foldedLines = new Set<number>()
	const foldedRanges = new Set<[number, number]>()

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

		for (let [start, end] of [...foldedRanges].sort((a, b) => a[0] - b[0])) {
			value += code.slice(pos, start) + "   "
			pos = end
		}

		textarea.value = value += code.slice(pos)
		if (line) textarea.setSelectionRange((pos = getPosition(foldPositions[line]![0])), pos)
		cEditor.update()

		cEditor.container.style.setProperty("--number-width", lineNumberWidth)
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
					el = foldToggles[line] = template()
					addListener(el, "click", () => toggleAndUpdate(line))
				}
				if (parent != el.parentNode && parent != prev!) parent.prepend(el)
				prev = parent
				el.className = `pce-fold${isClosed ? " closed-fold" : ""}`
				el.title = `${isClosed ? "Unf" : "F"}old line`
				el = foldPlaceholders[line]
				if (isClosed) {
					if (!el) {
						el = foldPlaceholders[line] = template2()
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
		foldedRanges.clear()
		foldedLines.clear()
		value = code = cEditor.value
		lineNumberWidth = (0 | Math.log10(numLines(code))) + 1 + ".001ch"
		const folds: [number, number][] = []

		providers.forEach(clb => folds.push(...(clb(cEditor, folds) || [])))

		for (let i = 0, l = folds.length; i < l; i++) {
			const [start, end] = folds[i]
			const index = numLines(value, 0, start)

			if (!foldPositions[index] || end > foldPositions[index]![1])
				foldPositions[index] = [start, end]
		}
		updateFolds()
	}

	return {
		update(editor, options) {
			if (!cEditor) {
				cEditor = editor
				textarea = editor.textarea
				editor.extensions.codeFold = this
				lines = editor.lines
				if (editor.tokens[0]) createFolds()
			}
			editor.container.style.setProperty(
				"--padding-left",
				options.lineNumbers == false ? "calc(var(--_pse) + var(--_ns))" : "",
			)
			setTimeout(editor.on("update", createFolds))
		},
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
const blockCommentFolding: FoldingRangeProvider = ({ tokens, value, options: { language } }) => {
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

	findBlockComments(tokens, 0, language)

	return folds
}

/**
 * Folding range provider that allows folding of titles and code blocks in markdown.
 *
 * Simply pass this function as one of the arguments when calling {@link readOnlyCodeFolding}.
 */
const markdownFolding: FoldingRangeProvider = ({ tokens, value, options: { language } }) => {
	if (language == "markdown" || language == "md") {
		let folds: [number, number][] = []
		let pos = 0
		let openTitles: number[] = []
		let levels: number
		let closeTitles = (level: number) => {
			for (let end = value.slice(0, pos).trimEnd().length; level <= levels; ) {
				folds.push([openTitles[level++], end])
			}
		}
		let i = 0
		let l = tokens.length

		for (; i < l; ) {
			const token = <Token>tokens[i++]
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
