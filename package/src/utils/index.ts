import { InputSelection, PrismEditor } from "../index.js"
import { numLines, addListener, selectionChange, doc } from "../core.js"
import { getLineEnd, getLineStart } from "./local.js"
import { PrismCodeBlock } from "../client/code-block.js"
import { escapeHtml } from "../prism/core.js"

/**
 * If {@link insertText} has been called, this variable stores the editor's selection
 * before the call. This variable is set to 0 right before {@link insertText} returns.
 * This can therefore be used inside a `beforeinput` handler to determine if
 * {@link insertText} fired the event, and if true, get the selection before the call.
 *
 * Intended for internal use only.
 */
let prevSelection: InputSelection | 0

/** Escapes all special regex characters with a backslash and returns the escaped string. */
const regexEscape = (str: string) => str.replace(/[$+?|.^*()[\]{}\\]/g, "\\$&")

/** Returns the string between the position and the previous \n. */
const getLineBefore = (text: string, position: number) =>
	text.slice(getLineStart(text, position), position)

/**
 * Gets all lines that are at least partially between `start` and `end`.
 * @param text Text to search in.
 * @param start Start of the selection.
 * @param end End of the selection. Defaults to `start`.
 * @returns A tuple containing an array of lines, the starting position of the first line,
 * and the ending position of the last line.
 */
const getLines = (text: string, start: number, end = start) =>
	[
		text.slice((start = getLineStart(text, start)), (end = getLineEnd(text, end))).split("\n"),
		start,
		end,
	] as const

/**
 * Searches a full line for a token that matches a selector and contains `position`
 * within the specified margins. Tokens are searched in reverse document order which means
 * children are searched before their parents.
 * @param editor Editor you want to search in.
 * @param selector CSS selector for the tokens you want to search for.
 * @param marginLeft How far to the left of the token the position can be. Defaults to 0.
 * @param marginRight How far to the right of the token the position can be. Defaults to `marginLeft`.
 * @param position Position to search in. Defaults to `selectionStart`.
 * @returns A span element if one's found or undefined if not.
 * @example
 * This will return a string token if the cursor
 * is at least 1 character inside a string token
 * ```javascript
 * getClosestToken(editor, '.string', -1)
 * ```
 */
const getClosestToken = (
	editor: PrismEditor,
	selector: string,
	marginLeft = 0,
	marginRight = marginLeft,
	position = editor.getSelection()[0],
) => {
	const value = editor.value
	const line = editor.lines[numLines(value, 0, position)]
	// We unfortunitely have to include elements, else we can't get empty tokens
	const walker = doc!.createTreeWalker(line, 5)

	let node = walker.lastChild()
	let offset = getLineEnd(value, position) + 1 - position - (<Text>node).length

	while (-offset <= marginRight && (node = walker.previousNode())) {
		if (node.lastChild) continue
		offset -= (<Text>node).length || 0

		if (offset <= marginLeft) {
			for (; node != line; node = node.parentNode!) {
				if ((<Element>node).matches?.(selector)) return <HTMLSpanElement>node
			}
		}
	}
}

/**
 * Gets the current language at a position.
 * Useful if you want to run different logic based on the language.
 * @param editor Editor to search in.
 * @param position Position to search in. Defaults to `selectionStart`.
 */
const getLanguage = (editor: PrismEditor, position?: number) =>
	getClosestToken(editor, "[class*=language-]", 0, 0, position)?.className.match(
		/language-(\S*)/,
	)![1] || editor.options.language

/**
 * Inserts text into the editor (unless it's read-only) while keeping undo/redo history.
 * Focuses the `textarea` if it isn't already.
 * @param editor Target editor.
 * @param text Text to insert.
 * @param start Position to start the insertion. Defaults to `selectionStart`.
 * @param end Position to end the insertion. Defaults to `start` if specified, else `selectionEnd`.
 * @param newCursorStart New starting position for the cursor. Defaults to the end of the inserted text.
 * @param newCursorEnd New ending position for the cursor. Defaults to `newCursorStart`.
 */
const insertText = (
	editor: PrismEditor,
	text: string,
	start?: number | null,
	end?: number | null,
	newCursorStart?: number | null,
	newCursorEnd?: number | null,
) => {
	if (editor.options.readOnly) return
	prevSelection = editor.getSelection()
	end ??= start

	let textarea = editor.textarea
	let value = editor.value
	// Bug inserting new lines at the end if the editor ends with an empty line
	let avoidBug =
		isChrome && !value[end ?? prevSelection[1]] && /\n$/.test(text) && /^$|\n$/.test(value)
	let removeListener: () => any

	editor.focused || textarea.focus()
	if (start != null) textarea.setSelectionRange(start, end!)

	if (newCursorStart != null) {
		removeListener = editor.on("update", () => {
			textarea.setSelectionRange(
				newCursorStart,
				newCursorEnd ?? newCursorStart,
				(<InputSelection>prevSelection)[2],
			)
			removeListener()
		})
	}

	// Only Safari dispatches a beforeinput event
	isWebKit || textarea.dispatchEvent(new InputEvent("beforeinput", { data: text }))

	// Inserting escaped HTML in Chrome and Safari instead for much better performance
	if (isChrome || isWebKit) {
		if (avoidBug) {
			// This means the last new line won't be inserted if there's
			// no selection, but that's less annoying than the bug.
			textarea.selectionEnd--
			text = text.slice(0, -1)
		}
		// New line at the end is always ignored in Safari
		if (isWebKit) text += "\n"
		doc!.execCommand(text ? "insertHTML" : "delete", false, escapeHtml(text, /</g, "&lt;"))
		if (avoidBug) textarea.selectionStart++
	} else doc!.execCommand(text ? "insertText" : "delete", false, text)

	prevSelection = 0
}

/**
 * Sets the selection for the `textarea` and synchronously runs the selectionChange listeners.
 * If you don't want to synchronously run the listeners, use `textarea.setSelectionRange` instead.
 * @param editor Editor you want to change the selection of.
 * @param start New selectionStart.
 * @param end New selectionEnd. Defaults to `start`.
 * @param direction New direction.
 */
const setSelection = (
	editor: PrismEditor,
	start: number,
	end = start,
	direction?: "backward" | "forward" | "none",
) => {
	let focused = editor.focused
	let textarea = editor.textarea
	let relatedTarget!: HTMLElement | null
	if (!focused) {
		addListener(
			textarea,
			"focus",
			e => {
				relatedTarget = e.relatedTarget as HTMLElement
			},
			{ once: true },
		)
		textarea.focus()
	}
	textarea.setSelectionRange(start, end, direction)

	// Blurs the textarea if it wasn't focused before and calls `selectionChange` with `true`
	// This will set `selectionChange` to null, so we must access the variable before
	selectionChange!(!(!focused && (relatedTarget ? relatedTarget.focus() : textarea.blur())))
}

const userAgent = doc ? navigator.userAgent : ""
/** Whether the user is on an Apple-based system. */
const isMac = doc ? /Mac|iPhone|iP[ao]d/.test(navigator.platform) : false
/** Whether the browser is Chromium based. */
const isChrome = /Chrome\//.test(userAgent)
/** Whether the browser uses the WebKit browser engine. */
const isWebKit = !isChrome && /AppleWebKit\//.test(userAgent)

/**
 * Returns a 4 bit integer where each bit represents whether
 * each modifier is pressed in the order Shift, Meta, Ctrl, Alt.
 *
 * ```javascript
 * e.shiftKey && !e.metaKey && e.ctrlKey && e.altKey
 * // is equivalent to
 * getModifierCode(e) == 0b1011
 * ```
 */
const getModifierCode = (
	e: KeyboardEvent, // @ts-expect-error
): number => e.altKey + e.ctrlKey * 2 + e.metaKey * 4 + e.shiftKey * 8

/**
 * Adds an overlay by appending the element to the editor's overlays.
 * Equivalent to calling `editor.lines[0].append(overlay)`.
 * @param editor Editor or code block you want to add an overlay to.
 * @param overlay The overlay you want to add.
 */
const addOverlay = (editor: PrismEditor | PrismCodeBlock, overlay: HTMLElement) =>
	editor.lines[0].append(overlay)

/**
 * Gets the position of the cursor in the document. It returns a tuple with three numbers:
 *
 * 1. The line number of the cursor
 * 2. The 1-based column of the cursor
 * 3. Number of characters selected
 *
 * @example
 * const [line, col, selected] = getDocumentPosition(editor)
 */
const getDocumentPosition = (editor: PrismEditor): [number, number, number] => {
	let [start, end, dir] = editor.getSelection()
	let pos = dir < "f" ? start : end
	let value = editor.value
	let col = 0
	let chars = 0
	let tabSize = editor.options.tabSize || 2

	for (const char of getLineBefore(value, pos)) {
		col += char == "\t" ? tabSize - (col % tabSize) : 1
	}

	for (const _ of value.slice(start, end)) chars++

	return [editor.activeLine, col + 1, chars]
}

export {
	regexEscape,
	getLineBefore,
	getLines,
	getClosestToken,
	getLanguage,
	insertText,
	getModifierCode,
	setSelection,
	addOverlay,
	getDocumentPosition,
	isMac,
	isChrome,
	isWebKit,
	prevSelection,
}
