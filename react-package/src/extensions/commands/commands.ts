import { Language, languageMap } from "../.."
import { PrismEditor } from "../../types.js"
import {
	getLanguage,
	getLineBefore,
	getLines,
	insertText,
	isMac,
	regexEscape,
} from "../../utils/index.js"
import { getLineEnd, getLineStart } from "../../utils/local"
import { getStyleValue } from "../../utils/other.js"
import { useDefaultCommands } from "./deprecated.js"
import { EditorHotkey } from "./types.js"

let ignoreTab = false

/**
 * Sets whether editors should ignore tab or use it for indentation. Users can toggle
 * this using `Ctrl` + `M` / `Ctrl` + `Shift` + `M` (Mac) when the {@link defaultKeymap}
 * or {@link useDefaultCommands} extension is used.
 */
const setIgnoreTab = (newState: boolean) => (ignoreTab = newState)
const whitespaceEnd = (str: string) => str.search(/\S|$/)

const getIndent = ({ props: { insertSpaces = true, tabSize } }: PrismEditor) =>
	[insertSpaces ? " " : "\t", insertSpaces ? tabSize || 2 : 1] as const

const scroll = (editor: PrismEditor) =>
	!editor.props.readOnly && !editor.extensions.cursor?.scrollIntoView()

/**
 * Inserts slightly altered lines while keeping the same selection.
 * Used when toggling comments and indenting.
 */
const insertLines = (
	editor: PrismEditor,
	old: string[],
	newL: string[],
	start: number,
	end: number,
	selectionStart: number,
	selectionEnd: number,
) => {
	let newLines = newL.join("\n")

	if (newLines == old.join("\n")) return

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

/**
 * Command that indents or outdents all user-selected lines in the editor unless the
 * editor is `readOnly`.
 * @param editor Editor to execute the command on.
 * @param less By default lines are indented. By passing `true`, lines are outdented
 * instead.
 */
const indentSelectedLines = (editor: PrismEditor, less?: boolean) => {
	const [start, end] = editor.getSelection()
	const [lines, start1, end1] = getLines(editor.value, start, end)
	const [indentChar, tabSize] = getIndent(editor)

	insertLines(
		editor,
		lines,
		lines.map(
			less
				? str => str.slice(whitespaceEnd(str) ? tabSize - (whitespaceEnd(str) % tabSize) : 0)
				: str => str && indentChar.repeat(tabSize - (whitespaceEnd(str) % tabSize)) + str,
		),
		start1,
		end1,
		start,
		end,
	)

	return scroll(editor)
}

/**
 * Command that inserts spaces if `insertSpaces` isn't `false` or a tab character
 * otherwise at the specified position unless the editor is `readOnly`.
 * @param editor Editor to execute the command on.
 * @param pos Position to insert the tab.
 */
const insertTab = (editor: PrismEditor, pos: number) => {
	const [indentChar, tabSize] = getIndent(editor)

	insertText(
		editor,
		indentChar.repeat(tabSize - ((pos - getLineStart(editor.value, pos)) % tabSize)),
	)

	return scroll(editor)
}

/**
 * Command that inserts a new line replacing the current selection unless the editor is
 * `readOnly`. It uses the `autoIndent` behavior of the current language to determine
 * whether to preserve the indentation or increase it.
 * @param editor Editor to execute the command on.
 * @param eol If `true`, the new line is inserted at the end of the line instead of at
 * the cursor's position.
 */
const insertLineAndIndent = (editor: PrismEditor, eol?: boolean) => {
	let selection = editor.getSelection()
	let value = editor.value

	if (eol) selection[0] = selection[1] = getLineEnd(value, selection[1])

	const [indentChar, tabSize] = getIndent(editor)
	const [start, end] = selection
	const autoIndent = languageMap[getLanguage(editor, start)]?.autoIndent
	const indenationCount = Math.floor(whitespaceEnd(getLineBefore(value, start)) / tabSize) * tabSize
	const extraIndent = autoIndent?.[0]?.(selection, value, editor) ? tabSize : 0
	const extraLine = autoIndent?.[1]?.(selection, value, editor)
	const newText =
		"\n" +
		indentChar.repeat(indenationCount + extraIndent) +
		(extraLine ? "\n" + indentChar.repeat(indenationCount) : "")

	if (newText[1] || value[end]) {
		insertText(editor, newText, start, end, start + indenationCount + extraIndent + 1)
		return scroll(editor)
	}
}

/**
 * Command that moves all selected lines unless the editor is `readOnly`.
 * @param editor Editor to execute the command on.
 * @param up Whether to move the lines up. Defaults to `false`.
 */
const moveSelectedLines = (editor: PrismEditor, up?: boolean) => {
	const [start, end] = editor.getSelection()
	const value = editor.value
	const newStart = up ? getLineStart(value, start) - 1 : start
	const newEnd = up ? end : value.indexOf("\n", end) + 1

	if (newStart > -1 && newEnd > 0) {
		const [lines, start1, end1] = getLines(value, newStart, newEnd)
		const line = lines[up ? "shift" : "pop"]()!
		const offset = (line.length + 1) * (up ? -1 : 1)

		lines[up ? "push" : "unshift"](line)
		insertText(editor, lines.join("\n"), start1, end1, start + offset, end + offset)
	}

	return scroll(editor)
}

/**
 * Command that copies all selected lines unless the editor is `readOnly`.
 * @param editor Editor to execute the command on.
 * @param up Whether or not the selection should remain on the top copy. Defaults to
 * `false`.
 */
const copySelectedLines = (editor: PrismEditor, up?: boolean) => {
	const [start, end] = editor.getSelection()
	const value = editor.value
	const [lines, start1, end1] = getLines(value, start, end)
	const str = lines.join("\n")
	const offset = up ? 0 : str.length + 1

	insertText(editor, str + "\n" + str, start1, end1, start + offset, end + offset)
	return scroll(editor)
}

/**
 * Command that scrolls the editor by one line.
 * @param editor Editor to execute the command on.
 * @param up Whether to scroll up. Defaults to `false`.
 */
const scrollByOneLine = (editor: PrismEditor, up?: boolean) => {
	editor.container?.scrollBy(0, getStyleValue(editor.container, "lineHeight") * (up ? -1 : 1))
	return true
}

/**
 * Command that deletes all selected lines unless the editor is `readOnly`.
 * @param editor Editor to execute the command on.
 */
const deleteSelectedLines = (editor: PrismEditor) => {
	const [start, end, dir] = editor.getSelection()
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
	return scroll(editor)
}

/**
 * Command that toggles the comment around the current selection unless the editor is
 * `readOnly`. Comment syntax is determined using the current {@link Language}. It will
 * use the `getComments()` method if present and the `comments` property otherwise.
 * @param editor Editor to execute the command on.
 * @param isBlock Whether or not to toggle the comment using block syntax.
 */
const toggleComment = (editor: PrismEditor, isBlock?: boolean) => {
	const [start, end] = editor.getSelection()
	const value = editor.value
	const position = isBlock ? start : getLineStart(value, start)
	const lang = languageMap[getLanguage(editor, position)] || {}
	const { line, block } = lang.getComments?.(editor, position, value) || lang.comments || {}
	const [lines, start1, end1] = getLines(value, start, end)
	const last = lines.length - 1

	if (isBlock) {
		if (block) {
			const [open, close] = block
			const text = value.slice(start, end)
			const pos = value.slice(0, start).search(regexEscape(open) + " ?$")

			if (pos + 1 && RegExp("^ ?" + regexEscape(close)).test(value.slice(end))) {
				insertText(
					editor,
					text,
					pos,
					end + <any>(value[end] == " ") + close.length,
					pos,
					pos + end - start,
				)
			} else {
				insertText(
					editor,
					`${open} ${text} ${close}`,
					start,
					end,
					start + open.length + 1,
					end + open.length + 1,
				)
			}
		}
	} else {
		if (line) {
			const escaped = regexEscape(line)
			const regex = RegExp(`^\\s*(${escaped} ?|$)`)
			const regex2 = RegExp(escaped + " ?")
			const allWhiteSpace = !/\S/.test(value.slice(start1, end1))
			const newLines = lines.map(
				!allWhiteSpace && lines.every(line => regex.test(line))
					? str => str.replace(regex2, "")
					: str => (allWhiteSpace || /\S/.test(str) ? str.replace(/(?!\s)/, line + " ") : str),
			)
			insertLines(editor, lines, newLines, start1, end1, start, end)
		} else if (block) {
			const [open, close] = block
			const first = lines[0]
			const insertionPoint = whitespaceEnd(first)
			const hasComment = first.startsWith(open, insertionPoint) && lines[last].endsWith(close)

			lines[0] = first.replace(
				hasComment ? RegExp(regexEscape(open) + " ?") : /(?!\s)/,
				hasComment ? "" : open + " ",
			)
			let diff = lines[0].length - first.length
			lines[last] = hasComment
				? lines[last].replace(RegExp(` ?${regexEscape(close)}$`), "")
				: lines[last] + " " + close

			let newText = lines.join("\n")
			let firstInsersion = insertionPoint + start1
			let newStart = firstInsersion > start ? start : Math.max(start + diff, firstInsersion)
			let newEnd =
				firstInsersion > end - <any>(start != end)
					? end
					: Math.min(Math.max(firstInsersion, end + diff), start1 + newText.length)
			insertText(editor, newText, start1, end1, newStart, Math.max(newStart, newEnd))
		}
	}

	return block || (line && !isBlock) ? scroll(editor) : false
}

/**
 * Default keymapping that includes the following commands:
 *
 * - `Alt` + `ArrowUp`: Move line up
 * - `Alt` + `ArrowDown`: Move line down
 * - `Ctrl` + `ArrowUp`: Scroll one line up (Windows/Linux only)
 * - `Ctrl` + `ArrowDown`: Scroll one line down (Windows/Linux only)
 * - `Shift` + `Alt` + `ArrowUp`: Copy line up
 * - `Shift` + `Alt` + `ArrowDown`: Copy line down
 * - `Enter`: Insert line and indent
 * - `Shift` + `Enter`: Insert line and indent
 * - `Mod` + `Enter`: Insert blank line
 * - `Mod` + `]`: Indent line
 * - `Mod` + `[`: Outdent line
 * - `Tab`: Indent line (Tab capture enabled)
 * - `Shift` + `Tab`: Outdent line (Tab capture enabled)
 * - `Shift` + `Mod` + `K`: Delete line
 * - `Mod` + `/`: Toggle comment
 * - `Shift` + `Alt` + `A`: Toggle block comment
 * - `Ctrl` + `M`: Toggle tab capturing (Windows/Linux)
 * - `Ctrl` + `Shift` + `M`: Toggle tab capturing (Mac)
 *
 * Here, `Mod` refers to `Cmd` on Mac and `Ctrl` otherwise.
 */
const defaultKeymap: Record<string, EditorHotkey> = {
	Tab(editor) {
		if (!ignoreTab) {
			const [start, end] = editor.getSelection()
			return start == end ? insertTab(editor, start) : indentSelectedLines(editor)
		}
	},
	"8+Tab": editor => !ignoreTab && indentSelectedLines(editor, true),
	"1+ArrowDown": editor => moveSelectedLines(editor),
	"1+ArrowUp": editor => moveSelectedLines(editor, true),
	"9+ArrowDown": editor => copySelectedLines(editor),
	"9+ArrowUp": editor => copySelectedLines(editor, true),
	Enter: editor => insertLineAndIndent(editor),
	"8+Enter": editor => insertLineAndIndent(editor),
	"Mod+Enter": editor => insertLineAndIndent(editor, true),
	"Mod+]": editor => indentSelectedLines(editor),
	"Mod+[": editor => indentSelectedLines(editor, true),
	"8+Mod+k": deleteSelectedLines,
	"Mod+/": editor => toggleComment(editor),
	"1+A": editor => toggleComment(editor, true),
	[isMac ? "10+m" : "2+m"]: () => ((ignoreTab = !ignoreTab), true),
	...(isMac
		? {}
		: {
				"2+ArrowDown": editor => scrollByOneLine(editor),
				"2+ArrowUp": editor => scrollByOneLine(editor, true),
		  }),
}

export {
	whitespaceEnd,
	scroll,
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
}
