import { createTemplate } from "../../core.js"
import { BasicExtension } from "../../types.js"
import { addOverlay } from "../../utils/index.js"
import { addTextareaListener } from "../../utils/local.js"
import { cursorPosition } from "./position.js"

const template = createTemplate("<div class=pce-cursor>")

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
 * `prism-code-editor/cursor.css` to work.
 */
const customCursor = (): BasicExtension => {
	return editor => {
		let cursor = template()
		let textareaStyle = editor.textarea.style
		let toggle: number

		editor.on("selectionChange", () => {
			const pos = editor.extensions.cursor?.getPosition()

			if (pos) {
				textareaStyle.zIndex = textareaStyle.caretColor = "auto"
				cursor.style = `left:${pos.left}px;top:${pos.top}px;height:${
					pos.height
				}px;animation-name:pce-blink${(toggle = +!toggle)}`
			}
		})

		addTextareaListener(editor, "dragover", () => {
			textareaStyle.caretColor = ""
		})

		addOverlay(editor, cursor)
	}
}

export { customCursor }
