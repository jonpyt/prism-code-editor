import { useContext, useEffect, useState } from "react"
import { EditorContext } from "../core"
import { PrismEditor } from ".."

/**
 * Hook used to access the editor and its props from an extension.
 *
 * @throws {Error} when called outside an editor extension.
 * 
 * @example
 * const [editor, props] = usePrismEditor()
 */
const usePrismEditor = () => {
	const context = useContext(EditorContext)

	if (!context) throw Error("'usePrismEditor' called outside editor")

	return context
}

/**
 * Hook used to access an editor's value and rerender when it changes.
 */
const useEditorValue = (editor: PrismEditor) => {
	const [value, setValue] = useState(editor.value)

	useEffect(() => editor.on("update", setValue), [])

	return value
}

/**
 * Hook used to access an editor's selection and rerender when it changes.
 */
const useEditorSelection = (editor: PrismEditor) => {
	const [selection, setSelection] = useState(editor.getSelection)

	useEffect(() => editor.on("selectionChange", setSelection), [])

	return selection
}

export { usePrismEditor, useEditorValue, useEditorSelection }
