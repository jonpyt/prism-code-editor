/** @module guides */

import { createTemplate, doc } from "../core.js"
import { Extension, PrismEditor } from "../types.js"

const template = /* @__PURE__ */ createTemplate("<div class=guide-indents>\t")

/**
 * Extension adding indent guides to an editor. Does not work with word wrap.
 * Requires styles from `prism-code-editor/guides.css`
 */
const indentGuides = (): Extension => {
	let tabSize: number
	let prevLength = 0
	let lineIndentMap: number[]
	let active: HTMLDivElement | undefined
	let currentEditor: PrismEditor

	let lines: HTMLDivElement[] = []
	let indents: number[][] = []
	let container: HTMLDivElement

	let update = (code: string) => {
		lineIndentMap = []
		const newIndents = getIndentGuides(code, tabSize)
		const l = newIndents.length

		for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
			const style = (lines[i] ||= doc!.createElement("div")).style
			const [top, left, height] = next
			const old = indents[i]

			next = newIndents[i + 1]

			if (top != old?.[0]) style.top = top + "00%"
			if (left != old?.[1]) style.left = left + "00%"
			if (height != old?.[2]) style.height = height + "00%"

			const isSingleIndent = prev[0] != top && next?.[0] != top,
				isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

			for (let j = -isSingleIndent, l = height + <any>isSingleOutdent; j < l; j++)
				lineIndentMap[j + top] = i

			prev = indents[i] = newIndents[i]
		}

		for (let i = l; i < prevLength; ) lines[i++].remove()
		container.append(...lines.slice(prevLength, (prevLength = l)))
	}

	let updateActive = () => {
		const newActive = lines[lineIndentMap[currentEditor.activeLine - 1]]

		if (newActive != active) {
			if (active) active.className = ""
			if (newActive) newActive.className = "active-indent"
			active = newActive
		}
	}

	return {
		update(editor, options) {
			if (currentEditor != editor) {
				currentEditor = editor

				let overlays = editor.lines[0]
				if ((container = overlays.querySelector(".guide-indents")!)) {
					lines.push(...(container.children as HTMLCollectionOf<HTMLDivElement>))
					active = lines.find(line => line.className)
				} else {
					overlays.append((container = template()))
				}

				editor.on("update", update)
				editor.on("selectionChange", updateActive)
			}
			container.style.display = options.wordWrap ? "none" : ""

			if (tabSize != (tabSize = options.tabSize || 2)) {
				update(editor.value)
				updateActive()
			}
		},
	}
}

/**
 * Calculates the position and height of indentation guides for a string of code.
 * @param code Code you want to calculate indentation lines for.
 * @param tabSize Number of spaces a tab is equal to.
 * @returns An array of indentation guides.
 * Each guide is a tuple containing 3 numbers with the following values:
 * - The starting line of the guide.
 * - How many tabs the guide is offset to the right.
 * - How many lines tall the guide is.
 */
const getIndentGuides = (code: string, tabSize: number) => {
	const lines = code.split("\n")
	const l = lines.length
	const stack: [number, number, number][] = []
	const results: [number, number, number][] = []

	for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
		let last = i == l
		let line = lines[i]
		let pos = last ? 0 : line.search(/\S/)
		let indent = 0
		let j = 0
		if (pos < 0) {
			if (emptyPos < 0) emptyPos = i
		} else {
			for (; j < pos; ) {
				indent += line[j++] == "\t" ? tabSize - (indent % tabSize) : 1
			}
			if (indent) indent = Math.ceil(indent / tabSize)
			for (j = indent; j < prevIndent; j++) {
				// Updating height of the closed lines
				stack[j][2] = (emptyPos < 0 || (j == indent && !last) ? i : emptyPos) - stack[j][0]
			}
			for (j = prevIndent; j < indent; ) {
				// Adding new indentation lines
				results[p++] = stack[j] = [emptyPos < 0 || j > prevIndent ? i : emptyPos, j++, 0]
			}
			emptyPos = -1
			prevIndent = indent
		}
		if (last) break
	}
	return results
}

export { indentGuides, getIndentGuides }
