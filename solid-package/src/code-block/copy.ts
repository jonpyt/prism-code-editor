import { CodeBlockOverlay } from "."
import { addListener, doc } from "../core"
import { createCopyButton } from "../extensions/copy-button"

/**
 * Adds a copy button to a code block. Requires styles from
 * `solid-prism-editor/copy-button.css`.
 *
 * By default, the copy button is only shown when the code block is hovered. To always
 * show it, change the default opacity with the following CSS:
 *
 * ```less
 * button.pce-copy {
 *   opacity: 1; // or a lower value for a semi-transparent button
 * }
 * ```
 */
const addCopyButton: CodeBlockOverlay = (codeBlock, props) => {
	const container = createCopyButton()
	const btn = container.firstChild as HTMLButtonElement

	addListener(btn, "click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(props.code)) {
			const selection = getSelection()!
			const range = new Range()
			selection.removeAllRanges()
			selection.addRange(range)
			range.setStartAfter(codeBlock.lines[0])
			range.setEndAfter(codeBlock.wrapper)
			doc!.execCommand("copy")
			range.collapse()
		}
	})

	addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	return container
}

export { addCopyButton }
