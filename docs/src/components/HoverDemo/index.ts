import { editors } from "../editor/mount"
import { getTokenOffset } from "prism-code-editor/utils"
import { addPointerListener, editorHoverDescriptions } from "prism-code-editor/hover"
import "./hover.css"

let current: HTMLElement | undefined

const clearHover = () => {
	delete current?.dataset.hover
	current = undefined
}

const handler = (e: PointerEvent, target: HTMLElement) => {
	if (target == current) return

	clearHover()

	if (target.matches(".token") && (e.pointerType != "mouse" || !e.buttons)) {
		target.dataset.hover = ""
		current = target
	}
}

editors.forEach(editor => {
	editor.addExtensions(
		editorHoverDescriptions(
			(types, _language, _text, token) => {
				return [`.token.${types.join(".")} (${getTokenOffset(editor, token)})`]
			},
			{
				allowChildren: true,
				above: true,
				delay: 500,
				warmDuration: 500,
			},
		),
	)

	addPointerListener(editor, "pointermove", handler)
	addPointerListener(editor, "pointerdown", handler)

	editor.textarea.addEventListener("mouseleave", clearHover)
	editor.on("selectionChange", clearHover)
})
