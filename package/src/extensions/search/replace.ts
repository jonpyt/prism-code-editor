import { PrismEditor } from "../../index.js"
import { insertText, setSelection } from "../../utils/index.js"
import { addTextareaListener, scrollToEl } from "../../utils/local.js"
import { SearchAPI, createSearchAPI } from "./search.js"

/**
 * Object with methods useful for performing a search
 * and both highlighting and replacing the matches.
 */
export interface ReplaceAPI extends SearchAPI {
	/** Index of the match ahead of the cursor. */
	next(): number
	/** Index of the match behind the cursor. */
	prev(): number
	/** Index of the closest match. */
	closest(): number
	/**
	 * Selects the match with the passed index and scrolls
	 * it into view with the specified scroll padding.
	 */
	selectMatch(index: number, scrollPadding?: number): void
	/**
	 * If a match is selected and it's different to the provided string, it's replaced,
	 * else the index of the closest match is returned.
	 * If there's no selected match, the index of the closest match is returned.
	 */
	replace(replacement: string): number | undefined
	/**
	 * Replaces all search matches with the specified string.
	 * @param replacement String to replace all matches with.
	 * @param selection Does nothing. Kept for backwards compatibility.
	 */
	replaceAll(replacement: string, selection?: [number, number]): void
	/** Removes the highlight container from the DOM and all potential event listeners. */
	destroy(): void
}

/** Function adding both search and replace functionality to an editor. */
const createReplaceAPI = (editor: PrismEditor): ReplaceAPI => {
	const getSelection = editor.getSelection
	const search = createSearchAPI(editor)
	const container = search.container
	const matches = search.matches
	const closest = () => {
		const caretPos = getSelection()[0]
		const l = matches.length
		for (let i = l; i; ) {
			if (caretPos >= matches[--i][1]) return (i + <any>(matches[i][0] < caretPos)) % l
		}
		return l ? 0 : -1
	}

	const toggleClasses = () => {
		currentLine?.classList.toggle("match-highlight")
		currentMatch?.classList.toggle("pce-match")
	}

	const removeSelection = () => {
		if (hasSelected) {
			toggleClasses()
			hasSelected = false
		}
	}

	const removeHandler = addTextareaListener(editor, "focus", removeSelection)

	let currentLine: HTMLDivElement
	let currentMatch: HTMLSpanElement
	let hasSelected = false

	return Object.assign(search, {
		next() {
			const cursor = getSelection()[1]
			const l = matches.length
			for (let i = 0, match: [number, number]; i < l; i++) {
				match = matches[i]
				if (match[0] - <any>(match[0] == match[1]) >= cursor) return i
			}
			return l ? 0 : -1
		},
		prev() {
			const cursor = getSelection()[0]
			const l = matches.length
			for (let i = l, match: [number, number]; i; ) {
				match = matches[--i]
				if (match[1] + <any>(match[0] == match[1]) <= cursor) return i
			}
			return l - 1
		},
		closest,
		selectMatch(index: number, scrollPadding?: number) {
			removeSelection()
			if (matches[index]) {
				setSelection(editor, ...matches[index])
				currentLine = editor.lines[editor.activeLine]
				currentMatch = <HTMLSpanElement>container.children[index]
				hasSelected = true
				toggleClasses()
				if (currentMatch) {
					scrollToEl(editor, currentMatch, scrollPadding)
				}
			}
		},
		replace(str: string) {
			if (matches[0]) {
				let index = closest()
				let [start, end] = matches[index]
				let [caretStart, caretEnd] = getSelection()
				let notSelected = start != caretStart || end != caretEnd

				if (notSelected) return index
				if (editor.value.slice(start, end) == str) return matches[++index] ? index : 0
				return insertText(editor, str)!
			}
		},
		replaceAll(str: string) {
			if (!matches[0]) return
			let value = editor.value
			let [start, end] = getSelection()
			let newLen = str.length
			let newStart = start
			let newEnd = end
			let newValue = ""
			let l = matches.length

			for (let i = 0; i < l; i++) {
				const [matchStart, matchEnd] = matches[i]
				const lengthDiff = newLen - matchEnd + matchStart
				const move = (pos: number) =>
					matchStart > pos
						? 0
						: pos >= matchEnd
						? lengthDiff
						: lengthDiff < 0 && pos > matchStart + newLen
						? newLen + matchStart - pos
						: 0

				newEnd += move(end)
				newStart += move(start)
				newValue += i ? value.slice(matches[i - 1][1], matchStart) + str : str
			}

			insertText(editor, newValue, matches[0][0], matches[l - 1][1], newStart, newEnd)
		},
		destroy() {
			removeHandler()
			removeSelection()
			container.remove()
		},
	})
}

export { createReplaceAPI }
