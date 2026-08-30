import { addOverlay, getTokenLanguage } from "./index.js"
import { PrismEditor } from ".."
import { createTemplate, getPosition } from "./local.js"
import { PrismCodeBlock } from "../code-block/index.js"

let counter = 0

const template = /* @__PURE__ */ createTemplate(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex><div></div><div class=pce-hover-tooltip style=flex-shrink:0>",
)

const createHoverTooltip = <T extends PrismEditor | PrismCodeBlock>(
	editor: T,
	ref: [
		(
			types: string[],
			language: string,
			text: string,
			element: HTMLSpanElement,
			editor: T,
		) => (string | Node)[] | null | undefined,
		string | undefined,
		string | undefined,
		boolean,
		...unknown[],
	],
) => {
	let current: HTMLSpanElement | null
	const container = template()
	const editorContainer = editor.container!
	const style = container.style
	const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>

	const show = (target: HTMLElement) => {
		if (current == target) return
		const types = target.className.slice(6).split(" ")
		const text = target.textContent
		const content = ref[0](types, getTokenLanguage(target), text, target, editor)
		if (content) {
			let { left, right, top, bottom, height } = getPosition(editor, target)
			let { clientHeight, clientWidth } = editorContainer
			let max = bottom > top ? bottom : top

			tooltip.style.maxWidth = `min(${
				ref[1] ? ref[1] + "," : ""
			}${clientWidth}px - var(--padding-left) - 1em)`
			tooltip.style.maxHeight = `min(${ref[2] ? ref[2] + "," : ""}${max}px, ${
				clientHeight * 0.6
			}px - 2em)`
			spacer.style.width = (editorContainer.matches(".pce-rtl") ? right : left) + "px"
			tooltip.textContent = ""
			tooltip.append(...content)
			container.parentNode || addOverlay(editor, container)

			let placeAbove =
				!ref[3] == top > bottom && (ref[3] ? top : bottom) < container.clientHeight
					? !ref[3]
					: ref[3]

			style[placeAbove ? "bottom" : "top"] = height + (placeAbove ? bottom : top) + "px"
			style[placeAbove ? "top" : "bottom"] = "auto"
			current?.removeAttribute("aria-describedby")
			target.setAttribute("aria-describedby", tooltip.id)
			current = target
		} else hide()
	}
	const hide = () => {
		current?.removeAttribute("aria-describedby")
		current = null
		container.remove()
	}

	tooltip.id = "pce-e-hover-" + counter++

	return [show, hide, tooltip] as const
}

export { createHoverTooltip }
