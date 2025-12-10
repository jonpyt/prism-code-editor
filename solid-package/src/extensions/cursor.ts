import { Extension } from "../types"
import { onCleanup, createComputed } from "solid-js"
import { getLineBefore } from "../utils"
import {
	addTextareaListener,
	getLineEnd,
	getPosition,
	scrollToEl,
	updateNode,
} from "../utils/local"
import { template } from "solid-js/web"
import { defaultCommands } from "./commands"

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

const cursorTemplate = /* @__PURE__ */ template(
	"<div style=position:absolute;top:0;opacity:0;padding-right:inherit> <span><span></span> ",
)

/**
 * Extension making it easier to calculate the position of the cursor and scroll it into view.
 * This is used by {@link defaultCommands} to keep the cursor in view while typing.
 *
 * Once called, the extension can be accessed from `editor.extensions.cursor`.
 */
export const cursorPosition = (): Extension => editor => {
	const container = cursorTemplate() as HTMLDivElement
	const [before, span] = container.childNodes as unknown as [Text, HTMLSpanElement]
	const [cursor, after] = span.childNodes as unknown as [HTMLSpanElement, Text]
	const scrollIntoView = () => scrollToEl(editor, cursor)

	const remove = addTextareaListener(editor, "input", e => {
		if (/history/.test((e as InputEvent).inputType)) scrollIntoView()
	})

	createComputed(() => {
		const selection = editor.selection()
		const value = editor.value
		const position = selection[selection[2] < "f" ? 0 : 1]
		const index = editor.activeLine
		const activeLine = editor.lines[index]

		if (index) {
			updateNode(before, getLineBefore(value, position))
			updateNode(after, value.slice(position, getLineEnd(value, position)) + "\n")
			if (container.parentNode != activeLine) activeLine.prepend(container)
		}
	})

	onCleanup(() => {
		delete editor.extensions.cursor
		container.remove()
		remove()
	})

	editor.extensions.cursor = {
		scrollIntoView,
		getPosition: () => getPosition(editor, cursor),
	}
}
