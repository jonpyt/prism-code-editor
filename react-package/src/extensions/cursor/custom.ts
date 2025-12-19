import { useLayoutEffect } from "react"
import { PrismEditor } from "../.."
import { createTemplate } from "../../utils/local"
import { addOverlay } from "../../utils"
import { useCursorPosition } from "./position"

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
 * Requires the {@link useCursorPosition} extension and styling from
 * `prism-react-editor/cursor.css` to work.
 */
const useCustomCursor = (editor: PrismEditor) => {
	useLayoutEffect(() => {
		let textareaStyle = editor.textarea!.style
		let cursor = template()
		let toggle: number
		let remove = editor.on("selectionChange", () => {
			const pos = editor.extensions.cursor?.getPosition()

			if (pos) {
				cursor.style = `left:${pos.left}px;top:${pos.top}px;height:${
					pos.height
				}px;animation-name:pce-blink${(toggle = +!toggle)}`
			}
		})

		textareaStyle.zIndex = textareaStyle.caretColor = "auto"
		addOverlay(editor, cursor)

		return () => {
			remove()
			cursor.remove()
			textareaStyle.zIndex = textareaStyle.caretColor = ""
		}
	}, [])
}

export { useCustomCursor }
