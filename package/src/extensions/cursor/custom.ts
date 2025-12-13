import { createTemplate } from "../../core.js"
import { BasicExtension } from "../../types.js"
import { addOverlay } from "../../utils/index.js"
import { cursorPosition } from "./position.js"

export type CursorConfig = {
	/** Whether or not to animate the position. @default false */
	animate?: boolean
	/** Whether or not the blinking animation is smooth. @default false */
	smooth?: boolean
	/** CSS length value for the width of the cursor. @default "2px" */
	width?: string
}

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
 *
 * @param config Allows customizing the appearance of the cursor. This object can be
 * mutated later to update the cursor.
 */
const customCursor = (config?: CursorConfig): BasicExtension => {
	return editor => {
		const cursor = template()
		const style = cursor.style
		const textareaStyle = editor.textarea.style

		textareaStyle.zIndex = textareaStyle.caretColor = "auto"

		editor.on("selectionChange", () => {
			const pos = editor.extensions.cursor?.getPosition()

			if (pos) {
				style.height = pos.height + "px"
				style.width = config?.width || "2px"
				style.animationTimingFunction = config?.smooth ? "linear" : "steps(1)"

				// Appending every time resets the blinking animation
				addOverlay(editor, cursor)

				// Triggering a reflow allows the position to animate
				if (config?.animate) cursor.offsetTop

				style.left = pos.left + "px"
				style.top = pos.top + "px"
			}
		})
	}
}

export { customCursor }
