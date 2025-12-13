import { useLayoutEffect } from "react"
import { PrismEditor } from "../.."
import { createTemplate } from "../../utils/local"
import { addOverlay } from "../../utils"
import { useStableRef } from "../../core"
import { useCursorPosition } from "./position"

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
 * Requires the {@link useCursorPosition} extension and styling from
 * `prism-react-editor/cursor.css` to work.
 *
 * @param config Allows customizing the appearance of the cursor.
 */
const useCustomCursor = (editor: PrismEditor, config: CursorConfig = {}) => {
	const conf = useStableRef([config])
	conf[0] = config

	useLayoutEffect(() => {
		const textareaStyle = editor.textarea!.style
		const cursor = template()
		const style = cursor.style
		const remove = editor.on("selectionChange", () => {
			const pos = editor.extensions.cursor?.getPosition()

			if (pos) {
				style.height = pos.height + "px"
				style.width = conf[0].width || "2px"
				style.animationTimingFunction = conf[0].smooth ? "linear" : "steps(1)"

				// Appending every time resets the blinking animation
				addOverlay(editor, cursor)

				// Triggering a reflow allows the position to animate
				if (conf[0].animate) cursor.offsetTop

				style.left = pos.left + "px"
				style.top = pos.top + "px"
			}
		})

		textareaStyle.zIndex = textareaStyle.caretColor = "auto"

		return () => {
			remove()
			cursor.remove()
			textareaStyle.zIndex = textareaStyle.caretColor = ""
		}
	}, [])
}

export { useCustomCursor }
