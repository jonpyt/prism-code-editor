import { useEffect } from "react"
import {
	blockCommentFolding,
	bracketFolding,
	markdownFolding,
	tagFolding,
	useReadOnlyCodeFolding,
} from "../extensions/folding"
import { useReactTooltip } from "../tooltips"
import { addTextareaListener } from "../utils/local"
import { usePrismEditor } from "../extensions"

export default function ReadOnly() {
	const [editor] = usePrismEditor()
	const [show, hide, portal] = useReactTooltip(
		editor,
		<div className="tooltip">Cannot edit read-only editor.</div>,
		false,
	)

	useEffect(() => {
		return addTextareaListener(editor, "beforeinput", () => show(), true)
	}, [])

	useEffect(() => {
		return addTextareaListener(editor, "click", hide)
	}, [])

	useEffect(() => {
		return editor.on("selectionChange", () => hide())
	}, [])

	useReadOnlyCodeFolding(editor, tagFolding, bracketFolding, blockCommentFolding, markdownFolding)

	return portal
}
