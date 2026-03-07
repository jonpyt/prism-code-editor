import { useEffect } from "react"
import { languageMap, preventDefault, useStableRef } from "../core"
import { InputCommandCallback, InputSelection, KeyCommandCallback, PrismEditor } from "../types"
import {
	getLanguage,
	getLineBefore,
	getLines,
	getModifierCode,
	insertText,
	prevSelection,
	regexEscape,
	isMac,
	setSelection,
} from "../utils"
import { addListener2, addTextareaListener, getLineEnd, getLineStart } from "../utils/local"
import { getStyleValue } from "../utils/other"

let ignoreTab = false

const addCommand = <T extends KeyCommandCallback | InputCommandCallback>(
	cleanups: (() => void)[],
	commands: Record<string, T | null | undefined>,
	key: string,
	command: T,
) => {
	commands[key] = command
	cleanups.push(() => delete commands[key])
}

const mod = isMac ? 4 : 2
/**
 * Sets whether editors should ignore tab or use it for indentation.
 * Users can always toggle this using Ctrl+M / Ctrl+Shift+M (Mac).s
 */
const setIgnoreTab = (newState: boolean) => (ignoreTab = newState)
const whitespaceEnd = (str: string) => str.search(/\S|$/)

/**
 * Hook that will add automatic indentation, closing of brackets,
 * quotes and tags along with the following commands.
 *
 * ## Commands (Windows/Linux)
 *
 * - `Alt` + `ArrowUp`: Move line up
 * - `Alt` + `ArrowDown`: Move line down
 * - `Ctrl` + `ArrowUp`: Scroll one line up
 * - `Ctrl` + `ArrowDown`: Scroll one line down
 * - `Shift` + `Alt` + `ArrowUp`: Copy line up
 * - `Shift` + `Alt` + `ArrowDown`: Copy line down
 * - `Ctrl` + `Enter`: Insert blank line
 * - `Ctrl` + `]`: Indent line
 * - `Ctrl` + `[`: Outdent line
 * - `Tab`: Indent line (Tab capture enabled)
 * - `Shift` + `Tab`: Outdent line (Tab capture enabled)
 * - `Shift` + `Ctrl` + `K`: Delete line
 * - `Ctrl` + `/`: Toggle comment
 * - `Shift` + `Alt` + `A`: Toggle block comment
 * - `Ctrl` + `M`: Toggle tab capturing
 *
 * ## Commands (Mac)
 *
 * - `Alt` + `ArrowUp`: Move line up
 * - `Alt` + `ArrowDown`: Move line down
 * - `Shift` + `Alt` + `ArrowUp`: Copy line up
 * - `Shift` + `Alt` + `ArrowDown`: Copy line down
 * - `Cmd` + `Enter`: Insert blank line
 * - `Tab`: Indent line (Tab capture enabled)
 * - `Shift` + `Tab`: Outdent line (Tab capture enabled)
 * - `Shift` + `Cmd` + `K`: Delete line
 * - `Cmd` + `/`: Toggle comment
 * - `Shift` + `Alt` + `A`: Toggle block comment
 * - `Ctrl` + `Shift` + `M`: Toggle tab capturing
 *
 * @param selfClosePairs Pairs of self-closing brackets and quotes.
 * Must be an array of strings with 2 characters each.
 * Defaults to `['""', "''", '``', '()', '[]', '{}']`.
 * @param selfCloseRegex Regex controlling whether or not a bracket/quote should
 * automatically close based on the character before and after the cursor.
 * Defaults to ``/([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s``.
 */
const useDefaultCommands = (
	editor: PrismEditor,
	selfClosePairs = ['""', "''", "``", "()", "[]", "{}"],
	selfCloseRegex = /([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s,
) => {
	const props = useStableRef<[string[], RegExp]>([selfClosePairs, selfCloseRegex])
	props[0] = selfClosePairs
	props[1] = selfCloseRegex
	useEffect(() => {
		let prevCopy: string
		const { keyCommandMap, inputCommandMap, getSelection, container } = editor
		const clipboard = navigator.clipboard

		const getIndent = ({ insertSpaces = true, tabSize } = editor.props) =>
			[insertSpaces ? " " : "\t", insertSpaces ? tabSize || 2 : 1] as const

		const scroll = () => !editor.props.readOnly && !editor.extensions.cursor?.scrollIntoView()

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
				(!wrapOnly && props[1].test((value[end - 1] || " ") + open + (value[end] || " ")))) &&
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

		const cleanUps: (() => void)[] = []

		addCommand(cleanUps, inputCommandMap, "<", (_e, selection, value) =>
			selfClose(selection, "<>", value, true),
		)

		props[0].forEach(([open, close]) => {
			const isQuote = open == close
			addCommand(
				cleanUps,
				inputCommandMap,
				open,
				(_e, selection, value) =>
					((isQuote && skipIfEqual(selection, close, value)) ||
						selfClose(selection, open + close, value)) &&
					scroll(),
			)
			if (!isQuote)
				addCommand(
					cleanUps,
					inputCommandMap,
					close,
					(_e, selection, value) => skipIfEqual(selection, close, value) && scroll(),
				)
		})

		addCommand(cleanUps, inputCommandMap, ">", (e, selection, value) => {
			const closingTag = languageMap[getLanguage(editor)]?.autoCloseTags?.(selection, value, editor)
			if (closingTag) {
				insertText(editor, ">" + closingTag, null, null, selection[0] + 1)
				preventDefault(e)
			}
		})

		addCommand(cleanUps, keyCommandMap, "Tab", (e, [start, end], value) => {
			if (ignoreTab || editor.props.readOnly || getModifierCode(e) & 6) return
			const [indentChar, tabSize] = getIndent()
			const shiftKey = e.shiftKey
			const [lines, start1, end1] = getLines(value, start, end)
			if (start < end || shiftKey) {
				indent(shiftKey, lines, start1, end1, start, end, indentChar, tabSize)
			} else insertText(editor, indentChar.repeat(tabSize - ((start - start1) % tabSize)))
			return scroll()
		})

		addCommand(cleanUps, keyCommandMap, "Enter", (e, [start, end, dir], value) => {
			const code = getModifierCode(e) & 7
			if (!code || code == mod) {
				if (code) start = end = getLineEnd(value, dir > "f" ? end : start)
				const [indentChar, tabSize] = getIndent()
				const selection: InputSelection = [start, end, dir]
				const autoIndent = languageMap[getLanguage(editor, start)]?.autoIndent
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
		})

		addCommand(cleanUps, keyCommandMap, "Backspace", (_e, [start, end], value) => {
			if (start == end) {
				const line = getLineBefore(value, start)
				const tabSize = editor.props.tabSize || 2
				const isPair = selfClosePairs.includes(value.slice(start - 1, start + 1))
				const indenationCount = /[^ ]/.test(line) ? 0 : ((line.length - 1) % tabSize) + 1

				if (isPair || indenationCount > 1) {
					insertText(editor, "", start - (isPair ? 1 : indenationCount), start + <any>isPair)
					return scroll()
				}
			}
		})

		for (let i = 0; i < 2; i++)
			addCommand(cleanUps, keyCommandMap, i ? "ArrowDown" : "ArrowUp", (e, [start, end], value) => {
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
					container!.scrollBy(0, getStyleValue(container!, "lineHeight") * (i ? 1 : -1))
					return true
				}
			})

		cleanUps.push(
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
					const column = dir == "forward" ? end - end1 + lines.pop()!.length : start - start1
					const newLineLen = getLines(value, end1 + 1)[0][0].length
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
			}),
			...(["copy", "cut", "paste"] as const).map(type =>
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
			),
		)

		return () => {
			cleanUps.forEach(cleanUp => cleanUp())
		}
	}, [])
}

export interface EditHistory {
	/** Clears the history stack. */
	clear(): void
	/**
	 * Sets the active entry relative to the current entry.
	 *
	 * @param offset The position you want to move to relative to the current entry.
	 *
	 * `EditHistory.go(-1)` would be equivalent to an undo while `EditHistory.go(1)` would
	 * be equivalent to a redo.
	 *
	 * If there's no entry at the specified position, the call does nothing.
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
 * Hook that overrides the browser's undo/redo behavior for the editor.
 *
 * Without this hook, the browser's native undo/redo is used, which can be sufficient
 * in some cases.
 *
 * The extension can be accessed from `editor.extensions.history` after effects have been
 * run.
 *
 * @param historyLimit The maximum size of the history stack. Defaults to 999.
 */
const useEditHistory = (editor: PrismEditor, historyLimit = 999) => {
	const limit = useStableRef([historyLimit])
	limit[0] = historyLimit
	useEffect(() => {
		let sp = 0
		let allowMerge: boolean
		let isTyping = false
		let prevInputType: string
		let prevData: string | null
		let isMerge: boolean
		let prevTime: number

		const getSelection = editor.getSelection
		const extensions = editor.extensions
		const textarea = editor.textarea
		const stack: [string, InputSelection, InputSelection][] = []
		const update = (index: number) => {
			if (index >= limit[0]) {
				index--
				stack.shift()
			}
			stack.splice((sp = index), limit[0], [editor.value, getSelection(), getSelection()])
		}
		const setEditorState = (index: number) => {
			if (stack[index]) {
				textarea!.value = stack[index][0]
				textarea!.setSelectionRange(...stack[index][index < sp ? 2 : 1])
				editor.update()
				extensions.cursor?.scrollIntoView()
				sp = index
				allowMerge = false
			}
		}

		const cleanUps = [
			addListener2(textarea!, "beforeinput", e => {
				let data = e.data
				let inputType = e.inputType
				let time = e.timeStamp

				if (/history/.test(inputType)) {
					setEditorState(sp + (inputType[7] == "U" ? -1 : 1))
					preventDefault(e)
				} else if (
					!(isMerge =
						allowMerge &&
						(prevInputType == inputType ||
							(time - prevTime < 99 && inputType.slice(-4) == "Drop")) &&
						!prevSelection &&
						(data != " " || prevData == data))
				) {
					stack[sp][2] = prevSelection || getSelection()
				}
				isTyping = true
				prevTime = time
				prevData = data
				prevInputType = inputType
			}),
			addListener2(textarea!, "input", () => update(sp + <any>!isMerge)),
			addListener2(textarea!, "keydown", e => {
				if (!editor.props.readOnly) {
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
			}),
			editor.on("selectionChange", () => {
				allowMerge = isTyping
				isTyping = false
			}),
		]

		extensions.history = {
			clear() {
				update(0)
				allowMerge = false
			},
			has: offset => sp + offset in stack,
			go(offset) {
				setEditorState(sp + offset)
			},
		}

		update(0)

		return () => {
			cleanUps.forEach(cleanUp => cleanUp())
			delete extensions.history
		}
	}, [editor.props.value])
}

export { useDefaultCommands, useEditHistory }
