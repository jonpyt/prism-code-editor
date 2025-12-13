/** @module commands */

import { InputSelection, BasicExtension, PrismEditor } from "../index.js"
import { preventDefault, languageMap } from "../core.js"
import {
	getLanguage,
	insertText,
	getLineBefore,
	getLines,
	regexEscape,
	getModifierCode,
	prevSelection,
	setSelection,
	isMac,
} from "../utils/index.js"
import { addTextareaListener, getLineEnd, getLineStart, getStyleValue } from "../utils/local.js"

let ignoreTab = false
const mod = isMac ? 4 : 2
/**
 * Sets whether editors should ignore tab or use it for indentation.
 * Users can always toggle this using Ctrl+M / Ctrl+Shift+M (Mac).
 */
const setIgnoreTab = (newState: boolean) => (ignoreTab = newState)
const whitespaceEnd = (str: string) => str.search(/\S|$/)

/**
 * Extension that will add automatic indentation, closing of brackets,
 * quotes and tags along with the following commands:
 *
 * - Alt+ArrowUp/Down: Move line up/down
 * - Ctrl+ArrowUp/Down (Not on MacOS): Scroll up/down 1 line
 * - Shift+Alt+ArrowUp/Down: Copy line up/down
 * - Ctrl+Enter (Cmd+Enter on MacOS): Insert blank line
 * - Ctrl+[ (Cmd+[ on MacOS): Outdent line
 * - Ctrl+] (Cmd+] on MacOS): Indent line
 * - Shift+Ctrl+K (Shift+Cmd + K on MacOS): Delete line
 * - Ctrl+/ (Cmd+/ on MacOS): Toggle comment
 * - Shift+Alt+A: Toggle block comment
 * - Ctrl+M (Ctrl+Shift+M on MacOS): Toggle Tab capturing
 *
 * The shortcuts for the commands are not easily customizable. If you want to customize
 * them, you can copy the {@link https://github.com/jonpyt/prism-code-editor/blob/main/package/src/extensions/commands.ts|source}
 * and change the conditions.
 *
 * @param selfClosePairs Pairs of self-closing brackets and quotes.
 * Must be an array of strings with 2 characters each.
 * Defaults to `['""', "''", '``', '()', '[]', '{}']`.
 * @param selfCloseRegex Regex controlling whether or not a bracket/quote should
 * automatically close based on the character before and after the cursor.
 * Defaults to ``/([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s``.
 */
const defaultCommands =
	(
		selfClosePairs = ['""', "''", "``", "()", "[]", "{}"],
		selfCloseRegex = /([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s,
	): BasicExtension =>
	(editor, options) => {
		let prevCopy: string
		const { keyCommandMap, inputCommandMap, getSelection, container } = editor

		const clipboard = navigator.clipboard

		const getIndent = ({ insertSpaces = true, tabSize } = options) =>
			[insertSpaces ? " " : "\t", insertSpaces ? tabSize || 2 : 1] as const

		const scroll = () => !options.readOnly && !editor.extensions.cursor?.scrollIntoView()

		/**
		 * Automatically closes quotes and brackets if text is selected,
		 * or if the character before and after the cursor matches a regex
		 * @param wrapOnly If true, the character will only be closed if text is selected.
		 */
		const selfClose = (
			[start, end]: InputSelection,
			[open, close]: string,
			value: string,
			wrapOnly?: boolean,
		) =>
			(start < end ||
				(!wrapOnly && selfCloseRegex.test((value[end - 1] || " ") + open + (value[end] || " ")))) &&
			!insertText(editor, open + value.slice(start, end) + close, null, null, start + 1, end + 1)!

		const skipIfEqual = ([start, end]: InputSelection, char: string, value: string) =>
			start == end && value[end] == char && !setSelection(editor, start + 1)!

		/**
		 * Inserts slightly altered lines while keeping the same selection.
		 * Used when toggling comments and indenting.
		 */
		const insertLines = (
			old: string[],
			newL: string[],
			start: number,
			end: number,
			selectionStart: number,
			selectionEnd: number,
		) => {
			let newLines = newL.join("\n")
			if (newLines != old.join("\n")) {
				const last = old.length - 1
				const lastLine = newL[last]
				const oldLastLine = old[last]
				const lastDiff = oldLastLine.length - lastLine.length
				const firstDiff = newL[0].length - old[0].length
				const firstInsersion = start + whitespaceEnd((firstDiff < 0 ? newL : old)[0])
				const lastInsersion =
					end - oldLastLine.length + whitespaceEnd(lastDiff > 0 ? lastLine : oldLastLine)
				const offset = start - end + newLines.length + lastDiff
				const newCursorStart =
					firstInsersion > selectionStart
						? selectionStart
						: Math.max(firstInsersion, selectionStart + firstDiff)
				const newCursorEnd = selectionEnd + start - end + newLines.length
				insertText(
					editor,
					newLines,
					start,
					end,
					newCursorStart,
					selectionEnd < lastInsersion
						? newCursorEnd + lastDiff
						: Math.max(lastInsersion + offset, newCursorEnd),
				)
			}
		}

		const indent = (
			outdent: boolean,
			lines: string[],
			start1: number,
			end1: number,
			start: number,
			end: number,
			indentChar: string,
			tabSize: number,
		) => {
			insertLines(
				lines,
				lines.map(
					outdent
						? str => str.slice(whitespaceEnd(str) ? tabSize - (whitespaceEnd(str) % tabSize) : 0)
						: str => str && indentChar.repeat(tabSize - (whitespaceEnd(str) % tabSize)) + str,
				),
				start1,
				end1,
				start,
				end,
			)
		}

		inputCommandMap["<"] = (_e, selection, value) => selfClose(selection, "<>", value, true)

		selfClosePairs.forEach(([open, close]) => {
			const isQuote = open == close
			inputCommandMap[open] = (_e, selection, value) =>
				((isQuote && skipIfEqual(selection, close, value)) ||
					selfClose(selection, open + close, value)) &&
				scroll()
			if (!isQuote)
				inputCommandMap[close] = (_e, selection, value) =>
					skipIfEqual(selection, close, value) && scroll()
		})

		inputCommandMap[">"] = (e, selection, value) => {
			const closingTag = languageMap[getLanguage(editor)]?.autoCloseTags?.(selection, value, editor)
			if (closingTag) {
				insertText(editor, ">" + closingTag, null, null, selection[0] + 1)
				preventDefault(e)
			}
		}

		keyCommandMap.Tab = (e, [start, end], value) => {
			if (ignoreTab || options.readOnly || getModifierCode(e) & 6) return
			const [indentChar, tabSize] = getIndent(options)
			const shiftKey = e.shiftKey
			const [lines, start1, end1] = getLines(value, start, end)
			if (start < end || shiftKey) {
				indent(shiftKey, lines, start1, end1, start, end, indentChar, tabSize)
			} else insertText(editor, indentChar.repeat(tabSize - ((start - start1) % tabSize)))
			return scroll()
		}

		keyCommandMap.Enter = (e, selection, value) => {
			const code = getModifierCode(e) & 7
			if (!code || code == mod) {
				if (code) selection[0] = selection[1] = getLines(value, selection[1])[2]
				const [indentChar, tabSize] = getIndent()
				const [start, end] = selection
				const autoIndent = languageMap[getLanguage(editor)]?.autoIndent
				const indenationCount =
					Math.floor(whitespaceEnd(getLineBefore(value, start)) / tabSize) * tabSize
				const extraIndent = autoIndent?.[0]?.(selection, value, editor) ? tabSize : 0
				const extraLine = autoIndent?.[1]?.(selection, value, editor)
				const newText =
					"\n" +
					indentChar.repeat(indenationCount + extraIndent) +
					(extraLine ? "\n" + indentChar.repeat(indenationCount) : "")

				if (newText[1] || value[end]) {
					insertText(editor, newText, start, end, start + indenationCount + extraIndent + 1)
					return scroll()
				}
			}
		}

		keyCommandMap.Backspace = (_e, [start, end], value) => {
			if (start == end) {
				const line = getLineBefore(value, start)
				const tabSize = options.tabSize || 2
				const isPair = selfClosePairs.includes(value.slice(start - 1, start + 1))
				const indenationCount = /[^ ]/.test(line) ? 0 : ((line.length - 1) % tabSize) + 1

				if (isPair || indenationCount > 1) {
					insertText(editor, "", start - (isPair ? 1 : indenationCount), start + <any>isPair)
					return scroll()
				}
			}
		}

		for (let i = 0; i < 2; i++) {
			keyCommandMap[i ? "ArrowDown" : "ArrowUp"] = (e, [start, end], value) => {
				const code = getModifierCode(e)

				if (code == 1) {
					// Moving lines
					const newStart = i ? start : getLineStart(value, start) - 1
					const newEnd = i ? value.indexOf("\n", end) + 1 : end
					if (newStart > -1 && newEnd > 0) {
						const [lines, start1, end1] = getLines(value, newStart, newEnd)
						const line = lines[i ? "pop" : "shift"]()!
						const offset = (line.length + 1) * (i ? 1 : -1)

						lines[i ? "unshift" : "push"](line)
						insertText(editor, lines.join("\n"), start1, end1, start + offset, end + offset)
					}
					return scroll()
				} else if (code == 9) {
					// Copying lines
					const [lines, start1, end1] = getLines(value, start, end)
					const str = lines.join("\n")
					const offset = i ? str.length + 1 : 0
					insertText(editor, str + "\n" + str, start1, end1, start + offset, end + offset)
					return scroll()
				} else if (code == 2 && !isMac) {
					container.scrollBy(0, getStyleValue(container, "lineHeight") * (i ? 1 : -1))
					return true
				}
			}
		}

		addTextareaListener(editor, "keydown", e => {
			const code = getModifierCode(e)
			const keyCode = e.keyCode
			const [start, end, dir] = getSelection()

			if (code == mod && (keyCode == 221 || keyCode == 219)) {
				indent(keyCode == 219, ...getLines(editor.value, start, end), start, end, ...getIndent())
				scroll()
				preventDefault(e)
			} else if (code == (isMac ? 0b1010 : 0b0010) && keyCode == 77) {
				setIgnoreTab(!ignoreTab)
				preventDefault(e)
			} else if ((keyCode == 191 && code == mod) || (keyCode == 65 && code == 9)) {
				const value = editor.value
				const isBlock = code == 9
				const position = isBlock ? start : getLineStart(value, start)
				const language = languageMap[getLanguage(editor, position)] || {}
				const { line, block } =
					language.getComments?.(editor, position, value) || language.comments || {}
				const [lines, start1, end1] = getLines(value, start, end)
				const last = lines.length - 1

				if (isBlock) {
					if (block) {
						const [open, close] = block
						const text = value.slice(start, end)
						const pos = value.slice(0, start).search(regexEscape(open) + " ?$")
						const matches = RegExp("^ ?" + regexEscape(close)).test(value.slice(end))

						if (pos + 1 && matches)
							insertText(
								editor,
								text,
								pos,
								end + +(value[end] == " ") + close.length,
								pos,
								pos + end - start,
							)
						else
							insertText(
								editor,
								`${open} ${text} ${close}`,
								start,
								end,
								start + open.length + 1,
								end + open.length + 1,
							)
						scroll()
						preventDefault(e)
					}
				} else {
					if (line) {
						const escaped = regexEscape(line)
						const regex = RegExp(`^\\s*(${escaped} ?|$)`)
						const regex2 = RegExp(escaped + " ?")
						const allWhiteSpace = !/\S/.test(value.slice(start1, end1))
						const newLines = lines.map(
							lines.every(line => regex.test(line)) && !allWhiteSpace
								? str => str.replace(regex2, "")
								: str =>
										allWhiteSpace || /\S/.test(str) ? str.replace(/^\s*/, `$&${line} `) : str,
						)
						insertLines(lines, newLines, start1, end1, start, end)
						scroll()
						preventDefault(e)
					} else if (block) {
						const [open, close] = block
						const insertionPoint = whitespaceEnd(lines[0])
						const hasComment =
							lines[0].startsWith(open, insertionPoint) && lines[last].endsWith(close)
						const newLines = lines.slice()

						newLines[0] = lines[0].replace(
							hasComment ? RegExp(regexEscape(open) + " ?") : /(?=\S)|$/,
							hasComment ? "" : open + " ",
						)
						let diff = newLines[0].length - lines[0].length
						newLines[last] = hasComment
							? newLines[last].replace(RegExp(`( ?${regexEscape(close)})?$`), "")
							: newLines[last] + " " + close

						let newText = newLines.join("\n")
						let firstInsersion = insertionPoint + start1
						let newStart = firstInsersion > start ? start : Math.max(start + diff, firstInsersion)
						let newEnd =
							firstInsersion > end - <any>(start != end)
								? end
								: Math.min(Math.max(firstInsersion, end + diff), start1 + newText.length)
						insertText(editor, newText, start1, end1, newStart, Math.max(newStart, newEnd))
						scroll()
						preventDefault(e)
					}
				}
			} else if (code == 8 + mod && keyCode == 75) {
				const value = editor.value
				const [lines, start1, end1] = getLines(value, start, end)
				const column = dir > "f" ? end - end1 + lines.pop()!.length : start - start1
				const newLineLen = getLineEnd(value, end1 + 1) - end1 - 1
				insertText(
					editor,
					"",
					start1 - <any>!!start1,
					end1 + <any>!start1,
					start1 + Math.min(column, newLineLen),
				)
				scroll()
				preventDefault(e)
			}
		})
		;(["copy", "cut", "paste"] as const).forEach(type =>
			addTextareaListener(editor, type, e => {
				const [start, end] = getSelection()
				if (start == end && clipboard) {
					const [[line], start1, end1] = getLines(editor.value, start, end)
					if (type == "paste") {
						if (e.clipboardData!.getData("text/plain") == prevCopy) {
							insertText(editor, prevCopy + "\n", start1, start1, start + prevCopy.length + 1)
							scroll()
							preventDefault(e)
						}
					} else {
						clipboard.writeText((prevCopy = line))
						if (type == "cut") insertText(editor, "", start1, end1 + 1), scroll()
						preventDefault(e)
					}
				}
			}),
		)
	}

export interface EditHistory extends BasicExtension {
	/** Clears the history stack. Usually wanted after changing the value of the editor. */
	clear(): void
	/**
	 * Sets the active entry relative to the current entry.
	 *
	 * @param offset The position you want to move to relative to the current entry.
	 *
	 * `EditHistory.go(-1)` would be equivalent to an undo while `EditHistory.go(1)` would
	 * be equivalent to a redo.
	 *
	 * If there's no entry at the specified offset, the call does nothing.
	 */
	go(offset: number): void
	/**
	 * Returns whether or not there exists a history entry at the specified offset relative
	 * to the current entry.
	 *
	 * This method can be used to determine whether a call to {@link EditHistory.go} with the
	 * same offset will succeed or do nothing.
	 */
	has(offset: number): boolean
}

/**
 * History extension that overrides the undo/redo behavior of the browser.
 *
 * Without this extension, the browser's native undo/redo is used, which can be sufficient
 * in some cases.
 *
 * Once added to an editor, this extension can be accessed from `editor.extensions.history`.
 *
 * If you want to create a new editor with different extensions while keeping the undo/redo
 * history of an old editor, you can! Just add the old editor's history extension instance
 * to the new editor. Keep in mind that this will fully break the undo/redo behavior of the
 * old editor.
 *
 * @param historyLimit The maximum size of the history stack. Defaults to 999.
 */
const editHistory = (historyLimit = 999) => {
	let sp = 0
	let currentEditor: PrismEditor
	let allowMerge: boolean
	let isTyping = false
	let prevInputType: string
	let prevData: string | null
	let prevTime: number
	let isMerge: boolean
	let textarea: HTMLTextAreaElement
	let getSelection: PrismEditor["getSelection"]

	const stack: [string, InputSelection, InputSelection][] = []
	const update = (index: number) => {
		if (index >= historyLimit) {
			index--
			stack.shift()
		}
		stack.splice((sp = index), historyLimit, [currentEditor.value, getSelection(), getSelection()])
	}
	const setEditorState = (index: number) => {
		if (stack[index]) {
			textarea.value = stack[index][0]
			textarea.setSelectionRange(...stack[index][index < sp ? 2 : 1])
			currentEditor.update()
			currentEditor.extensions.cursor?.scrollIntoView()
			sp = index
			allowMerge = false
		}
	}

	const self: EditHistory = (editor, options) => {
		editor.extensions.history = self
		currentEditor = editor
		getSelection = editor.getSelection
		textarea || update(0)
		textarea = editor.textarea

		editor.on("selectionChange", () => {
			allowMerge = isTyping
			isTyping = false
		})

		addTextareaListener(editor, "beforeinput", e => {
			let data = e.data
			let inputType = e.inputType
			let time = e.timeStamp

			if (/history/.test(inputType)) {
				setEditorState(sp + (inputType[7] == "U" ? -1 : 1))
				preventDefault(e)
			} else if (
				!(isMerge =
					allowMerge &&
					(prevInputType == inputType || (time - prevTime < 99 && inputType.slice(-4) == "Drop")) &&
					!prevSelection &&
					(data != " " || prevData == data))
			) {
				stack[sp][2] = prevSelection || getSelection()
			}
			isTyping = true
			prevData = data
			prevTime = time
			prevInputType = inputType
		})
		addTextareaListener(editor, "input", () => update(sp + <any>!isMerge))
		addTextareaListener(editor, "keydown", e => {
			if (!options.readOnly) {
				const code = getModifierCode(e)
				const keyCode = e.keyCode
				const isUndo = code == mod && keyCode == 90
				const isRedo =
					(code == mod + 8 && keyCode == 90) || (!isMac && code == mod && keyCode == 89)
				if (isUndo) {
					setEditorState(sp - 1)
					preventDefault(e)
				} else if (isRedo) {
					setEditorState(sp + 1)
					preventDefault(e)
				}
			}
		})

		editor.addExtensions({
			update() {
				if (editor.value != textarea.value) reset()
			}
		})
	}

	const reset = self.clear = () => {
		update(0)
		allowMerge = false
	}

	self.has = offset => sp + offset in stack
	self.go = offset => setEditorState(sp + offset)

	return self
}

export { defaultCommands, setIgnoreTab, ignoreTab, editHistory }
