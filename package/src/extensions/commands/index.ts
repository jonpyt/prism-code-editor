/** @module commands */

import { InputSelection, BasicExtension, PrismEditor } from "../../index.js"
import { preventDefault, languageMap } from "../../core.js"
import {
	getLanguage,
	insertText,
	getLines,
	getModifierCode,
	prevSelection,
	setSelection,
	isMac,
	getLineBefore,
} from "../../utils/index.js"
import { addTextareaListener } from "../../utils/local.js"
import { EditHistory, EditorHotkey } from "./types.js"
import { mod, addEditorHotkey } from "./utils.js"
import { scroll } from "./commands.js"

/**
 * Extension that will add automatic closing of brackets, quotes, and tags along
 * with the specified commands.
 *
 * @param hotkeyMap Commands that will be added to the editor.
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
): BasicExtension => {
	return (editor, options) => {
		let prevCopy: string
		const inputCommandMap = editor.inputCommandMap
		const clipboard = navigator.clipboard

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
				const tabSize = options.tabSize || 2
				const isPair = selfClosePairs.includes(value.slice(start - 1, start + 1))
				const indenationCount = /[^ ]/.test(line) ? 0 : ((line.length - 1) % tabSize) + 1

				if ((isPair || indenationCount > 1) && start == end) {
					insertText(editor, "", start - (isPair ? 1 : indenationCount), start + <any>isPair)
					return scroll(editor)
				}
			}
		}

		inputCommandMap["<"] = (_e, selection, value) => selfClose(selection, "<>", value, true)

		selfClosePairs.forEach(([open, close]) => {
			const isQuote = open == close
			inputCommandMap[open] = (_e, selection, value) =>
				((isQuote && skipIfEqual(selection, close, value)) ||
					selfClose(selection, open + close, value)) &&
				scroll(editor)
			if (!isQuote)
				inputCommandMap[close] = (_e, selection, value) =>
					skipIfEqual(selection, close, value) && scroll(editor)
		})

		inputCommandMap[">"] = (e, selection, value) => {
			const closingTag = languageMap[getLanguage(editor)]?.autoCloseTags?.(selection, value, editor)
			if (closingTag) {
				insertText(editor, ">" + closingTag, null, null, selection[0] + 1)
				preventDefault(e)
			}
		}

		addEditorHotkey(editor, "Backspace", backspaceCommand)
		addEditorHotkey(editor, "8+Backspace", backspaceCommand)

		for (const key in hotkeyMap) {
			addEditorHotkey(editor, key, hotkeyMap[key])
		}

		;(["copy", "cut", "paste"] as const).forEach(type =>
			addTextareaListener(editor, type, e => {
				const [start, end] = editor.getSelection()
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
			},
		})
	}

	const reset = (self.clear = () => {
		update(0)
		allowMerge = false
	})

	self.has = offset => sp + offset in stack
	self.go = offset => setEditorState(sp + offset)

	return self
}

export { editorCommands, editHistory }
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
export * from "./deprecated.js"
export * from "./types.js"
