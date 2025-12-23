import { createEffect } from "solid-js"
import { Extension } from "../.."
import { createSearchAPI } from "./search"
import { tokenizeInvisibles } from "../../prism/utils"

/**
 * Extension that shows selected tabs and spaces. To instead highlight all spaces and
 * tabs, use {@link tokenizeInvisibles}.
 *
 * Requires styling from `solid-prism-editor/invisibles.css`.
 */
const showInvisibles = (): Extension => {
	return editor => {
		let prev: string
		const searchAPI = createSearchAPI(editor)
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []

		container.className = "pce-invisibles"
		createEffect(() => {
			const value = editor.value
			const [start, end] = editor.selection()

			if (prev != (prev = value)) {
				searchAPI.search(" |\t", true, false, true, [start, end])
				for (let i = 0, l = matches.length; i < l; i++) {
					if ((value[matches[i][0]] == "\t") == !tabs[i]) {
						nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
					}
				}
			}
		})

		return container
	}
}

export { showInvisibles }
