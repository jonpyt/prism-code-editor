import { useLayoutEffect } from "react"
import { InputSelection, PrismEditor } from "../types"
import { getLineBefore } from "../utils"
import { getLineEnd, getPosition, scrollToEl, updateNode } from "../utils/local"
import { createTemplate, addTextareaListener } from "../utils/local"
import { useDefaultCommands } from "./commands"

/** Postion of the cursor relative to the editor's overlays. */
export type CursorPosition = {
	top: number
	bottom: number
	left: number
	right: number
	height: number
}

export interface Cursor {
	/** Gets the cursor position relative to the editor's overlays. */
	getPosition(): CursorPosition
	/** Scrolls the cursor into view. */
	scrollIntoView(): void
}

const cursorTemplate = /* @__PURE__ */ createTemplate(
	"<div style=position:absolute;top:0;opacity:0;padding-right:inherit> <span><span></span> ",
)
/**
 * Hook making it easier to calculate the position of the cursor and scroll it into view.
 * This is used by {@link useDefaultCommands} to keep the cursor in view while typing.
 *
 * The extension can be accessed from `editor.extensions.cursor` after layout effects
 * have been run.
 */
export const useCursorPosition = (editor: PrismEditor) => {
	useLayoutEffect(() => {
		const cursorContainer = cursorTemplate()
		const [before, span] = <[Text, HTMLSpanElement]>(<unknown>cursorContainer.childNodes)
		const [cursor, after] = <[HTMLSpanElement, Text]>(<unknown>span.childNodes)
		const selectionChange = (selection: InputSelection) => {
			const value = editor.value
			const activeLine = editor.lines![editor.activeLine]
			const position = selection[selection[2] < "f" ? 0 : 1]

			updateNode(before, getLineBefore(value, position))
			updateNode(after, value.slice(position, getLineEnd(value, position)) + "\n")
			if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer)
		}
		const scrollIntoView = () => scrollToEl(editor, cursor)

		const cleanup1 = editor.on("selectionChange", selectionChange)
		const cleanup2 = addTextareaListener(editor, "input", e => {
			if (/history/.test((<InputEvent>e).inputType)) scrollIntoView()
		})

		editor.extensions.cursor = {
			scrollIntoView,
			getPosition: () => getPosition(editor, cursor),
		}

		return () => {
			delete editor.extensions.cursor
			cleanup1()
			cleanup2()
			cursor.remove()
		}
	}, [])
}
