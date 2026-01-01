import { customCursor } from "prism-code-editor/cursor"
import { editors } from "../editor/mount"
import { getDocumentPosition } from "prism-code-editor/utils"

const [posText, selText] = document.querySelector(".document-pos")!.children
const sheet = document.body.appendChild(document.createElement("style")).sheet!
const [animate, smooth, selection] = document
	.querySelector(".cursor-options")!
	.getElementsByTagName("input")

editors.forEach(e => {
	e.addExtensions(customCursor())
})

editors[2].on("selectionChange", () => {
	const [line, col, selected] = getDocumentPosition(editors[2])

	;(posText.firstChild as Text).data = `Ln ${line}, Col ${col}`
	;(selText.firstChild as Text).data = `${selected} selected`
})

sheet.insertRule(".pce-has-selection .pce-cursor{}")
sheet.insertRule("div.pce-cursor{}")

const style1 = (sheet.cssRules[0] as CSSStyleRule).style
const style2 = (sheet.cssRules[1] as CSSStyleRule).style

;(animate.oninput = () => {
	style1.transition = animate.checked ? "top 0.1s ease-out, left 0.1s ease-out" : ""
})()
;(smooth.oninput = () => {
	style1.animationTimingFunction = smooth.checked ? "linear" : ""
})()
;(selection.oninput = () => {
	style2.display = selection.checked ? "none" : ""
})()
