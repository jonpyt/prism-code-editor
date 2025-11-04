import { BasicExtension } from "../../index.js"
import { tokenizeInvisibles } from "../../prism/utils/invisibles.js"
import { createSearchAPI } from "./search.js"

/**
 * Extension that highlights selected tabs and spaces as an overlay.
 *
 * @param alwaysShow By passing `true`, they're always shown. This is not recommended
 * and will be removed in the future. Instead use {@link tokenizeInvisibles} to highlight
 * tabs and spaces as tokens for better performance.
 *
 * Requires styling from `prism-code-editor/invisibles.css`.
 */
const showInvisibles = (alwaysShow?: boolean): BasicExtension => {
	return editor => {
		let prev: string
		const searchAPI = createSearchAPI(editor)
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []
		const update = () => {
			const value = editor.value
			const [start, end] = editor.getSelection()

			if (!alwaysShow || prev != (prev = value)) {
				searchAPI.search(" |\t", true, false, true, alwaysShow ? undefined : [start, end])
				for (let i = 0, l = matches.length; i < l; i++) {
					if ((value[matches[i][0]] == "\t") == !tabs[i]) {
						nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
					}
				}
			}
		}

		container.className = "pce-invisibles"
		if (editor.value) update()
		editor.on("selectionChange", update)
	}
}

export { showInvisibles }
