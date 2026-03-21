import { addTextareaListener } from "../../utils/local"
import { Extension, InputSelection } from "../../types"
import { createEffect, on, onCleanup } from "solid-js"
import {
	getLanguage,
	getLineBefore,
	getLines,
	getModifierCode,
	insertText,
	isMac,
	prevSelection,
	setSelection,
} from "../../utils"
import { languageMap, preventDefault } from "../../core"
import { addCommand } from "./deprecated"
import { scroll } from "./commands"
import { addEditorHotkey, mod } from "./utils"
import { EditorHotkey } from "./types"

/**
 * Extension that will add automatic closing of brackets, quotes, and tags along with the
 * specified commands.
 *
 * @param selfClosePairs Pairs of self-closing brackets and quotes.
 * Must be an array of strings with 2 characters each.
 * Defaults to `['""', "''", '``', '()', '[]', '{}']`.
 * @param selfCloseRegex Regex controlling whether or not a bracket/quote should
 * automatically close based on the character before and after the cursor.
 * Defaults to ``/([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s``.
 */
const editorCommands = (
	hotkeyMap: Record<string, EditorHotkey>,
	selfClosePairs = ['""', "''", "``", "()", "[]", "{}"],
	selfCloseRegex = /([^$\w'"`]["'`]|.[[({])[.,:;\])}>\s]|.[[({]`/s,
): Extension => {
	return editor => {
		let prevCopy: string
		const inputCommandMap = editor.inputCommandMap

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

		const backspaceCommand = () => {
			const [start, end] = editor.getSelection()

			if (start == end) {
				const value = editor.value
				const line = getLineBefore(value, start)
				const tabSize = editor.props.tabSize || 2
				const isPair = selfClosePairs.includes(value.slice(start - 1, start + 1))
				const indenationCount = /[^ ]/.test(line) ? 0 : ((line.length - 1) % tabSize) + 1

				if ((isPair || indenationCount > 1) && start == end) {
					insertText(editor, "", start - (isPair ? 1 : indenationCount), start + <any>isPair)
					return scroll(editor)
				}
			}
		}

		const cleanUps: (() => void)[] = []

		addCommand(cleanUps, inputCommandMap, "<", (_e, selection, value) =>
			selfClose(selection, "<>", value, true),
		)

		selfClosePairs.forEach(([open, close]) => {
			const isQuote = open == close
			addCommand(
				cleanUps,
				inputCommandMap,
				open,
				(_e, selection, value) =>
					((isQuote && skipIfEqual(selection, close, value)) ||
						selfClose(selection, open + close, value)) &&
					scroll(editor),
			)
			if (!isQuote)
				addCommand(
					cleanUps,
					inputCommandMap,
					close,
					(_e, selection, value) => skipIfEqual(selection, close, value) && scroll(editor),
				)
		})

		addCommand(cleanUps, inputCommandMap, ">", (e, selection, value) => {
			const closingTag = languageMap[getLanguage(editor)]?.autoCloseTags?.(selection, value, editor)
			if (closingTag) {
				insertText(editor, ">" + closingTag, null, null, selection[0] + 1)
				preventDefault(e)
			}
		})

		cleanUps.push(
			addEditorHotkey(editor, "Backspace", backspaceCommand),
			addEditorHotkey(editor, "8+Backspace", backspaceCommand),
		)

		for (const key in hotkeyMap) {
			cleanUps.push(addEditorHotkey(editor, key, hotkeyMap[key]))
		}

		;(["copy", "cut", "paste"] as const).forEach(type => {
			cleanUps.push(
				addTextareaListener(editor, type, e => {
					const [start, end] = editor.getSelection()
					const clipboard = navigator.clipboard
					if (start == end && clipboard) {
						const [[line], start1, end1] = getLines(editor.value, start, end)
						if (type == "paste") {
							if (e.clipboardData!.getData("text/plain") == prevCopy) {
								insertText(editor, prevCopy + "\n", start1, start1, start + prevCopy.length + 1)
								scroll(editor)
								preventDefault(e)
							}
						} else {
							clipboard.writeText((prevCopy = line))
							if (type == "cut") insertText(editor, "", start1, end1 + 1), scroll(editor)
							preventDefault(e)
						}
					}
				}),
			)
		})

		onCleanup(() => {
			cleanUps.forEach(cleanUp => cleanUp())
		})
	}
}

/**
 * History extension that overrides the undo/redo behavior of the browser.
 *
 * Without this extension, the browser's native undo/redo is used, which can be sufficient
 * in some cases.
 *
 * Once added to an editor, this extension can be accessed from `editor.extensions.history`.
 *
 * @param historyLimit The maximum size of the history stack. Defaults to 999.
 */
const editHistory = (historyLimit = 999): Extension => {
	return editor => {
		let sp = 0
		let allowMerge: boolean
		let isTyping = false
		let prevInputType: string
		let prevData: string | null
		let isMerge: boolean
		let prevTime: number

		const extensions = editor.extensions
		const getSelection = editor.getSelection
		const textarea = editor.textarea
		const stack: [string, InputSelection, InputSelection][] = []
		const update = (index: number) => {
			if (index >= historyLimit) {
				index--
				stack.shift()
			}
			stack.splice((sp = index), historyLimit, [editor.value, getSelection(), getSelection()])
		}
		const setEditorState = (index: number) => {
			if (stack[index]) {
				textarea.value = stack[index][0]
				textarea.setSelectionRange(...stack[index][index < sp ? 2 : 1])
				editor.update()
				extensions.cursor?.scrollIntoView()
				sp = index
				allowMerge = false
			}
		}

		const clear = () => {
			update(0)
			allowMerge = false
		}

		const cleanUps = [
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
						(prevInputType == inputType ||
							(time - prevTime < 99 && inputType.slice(-4) == "Drop")) &&
						!prevSelection &&
						(data != " " || prevData == data))
				) {
					stack[sp][2] = prevSelection || getSelection()
				}
				isTyping = true
				prevData = data
				prevTime = time
				prevInputType = inputType
			}),
			addTextareaListener(editor, "input", () => update(sp + <any>!isMerge)),
			addTextareaListener(editor, "keydown", e => {
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
		]

		createEffect(
			on(editor.selection, () => {
				allowMerge = isTyping
				isTyping = false
			}),
		)

		extensions.history = {
			clear,
			has: offset => sp + offset in stack,
			go(offset) {
				setEditorState(sp + offset)
			},
		}

		createEffect(on(() => editor.props.value, clear))

		onCleanup(() => {
			cleanUps.forEach(cleanUp => cleanUp())
			delete extensions.history
		})
	}
}

export { editHistory, editorCommands }
export { normalizeKey, getKeysFromEvent, addEditorHotkey, runHotkeys } from "./utils.js"
export {
	indentSelectedLines,
	insertTab,
	insertLineAndIndent,
	moveSelectedLines,
	copySelectedLines,
	scrollByOneLine,
	deleteSelectedLines,
	toggleComment,
	setIgnoreTab,
	defaultKeymap,
	ignoreTab,
} from "./commands.js"
export { defaultCommands } from "./deprecated.js"
export * from "./types.js"
