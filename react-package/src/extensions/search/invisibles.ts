import { useLayoutEffect } from "react"
import { PrismEditor } from "../../types"
import { useEditorSearch } from "./search"
import { tokenizeInvisibles } from "../../prism/utils"

/**
 * Hook that shows selected tabs and spaces in an editor. To instead highlight
 * all spaces and tabs, use {@link tokenizeInvisibles}.
 *
 * Requires styling from `prism-react-editor/invisibles.css`.
 */
const useShowInvisibles = (editor: PrismEditor) => {
	const searchAPI = useEditorSearch(editor, "pce-invisibles")

	useLayoutEffect(() => {
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []
		const update = () => {
			const value = editor.value
			const [start, end] = editor.getSelection()

			searchAPI.search(" |\t", true, false, true, [start, end])
			for (let i = 0, l = matches.length; i < l; i++) {
				if ((value[matches[i][0]] == "\t") == !tabs[i]) {
					nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
				}
			}
		}

		if (editor.value) update()
		return editor.on("selectionChange", update)
	}, [])
}

export { useShowInvisibles }
