import { template } from "solid-js/web"
import { Extension } from "../.."
import { createRenderEffect, onCleanup } from "solid-js"
import { cursorPosition } from "./position"
import { addTextareaListener } from "../../utils/local"

const cursorTemplate = template("<div class=pce-cursor>")

/**
 * Extension that overrides the browser's default cursor.
 *
 * Due to a known issue, it's **not recommended** to use this extension with `wordWrap`
 * enabled.
 *
 * Use the `--pce-cursor` CSS variable to change the cursor's color and the `.pce-cursor`
 * selector for other styling.
 *
 * Requires the {@link cursorPosition} extension and styling from
 * `solid-prism-editor/cursor.css` to work.
 */
const customCursor = (): Extension => {
	return editor => {
		let cursor = cursorTemplate() as HTMLDivElement
		let textareaStyle = editor.textarea.style
		let toggle: number

		createRenderEffect(() => {
			editor.selection()
			const pos = editor.extensions.cursor?.getPosition()

			if (pos) {
				textareaStyle.zIndex = textareaStyle.caretColor = "auto"
				cursor.style = `left:${pos.left}px;top:${pos.top}px;height:${
					pos.height
				}px;animation-name:pce-blink${(toggle = +!toggle)}`
			}
		})

		onCleanup(() => {
			textareaStyle.zIndex = textareaStyle.caretColor = ""
		})
		onCleanup(
			addTextareaListener(editor, "dragover", () => {
				textareaStyle.caretColor = ""
			}),
		)

		return cursor
	}
}

export { customCursor }
