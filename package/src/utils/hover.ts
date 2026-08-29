import { addOverlay, getTokenLanguage } from "./index.js"
import { PrismEditor } from ".."
import { HoverOptions, PrismCodeBlock } from "../client/code-block.js"
import { createTemplate } from "../core.js"
import { getPosition } from "./local.js"
import { HoverCallback } from "../extensions/hover.js"

let counter = 0

const template = /* @__PURE__ */ createTemplate(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex><div></div><div class=pce-hover-tooltip style=flex-shrink:0>",
)

const createHoverTooltip = (
	editor: PrismEditor | PrismCodeBlock,
	callback: HoverCallback,
	options: HoverOptions,
) => {
	let current: HTMLSpanElement | null
	const { above, maxHeight, maxWidth } = options
	const container = template()
	const editorContainer = editor.container
	const style = container.style
	const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>

	const show = (target: HTMLElement) => {
		if (current == target) return
		const types = target.className.slice(6).split(" ")
		const text = target.textContent
		const content = callback(types, getTokenLanguage(target), text, target)
		if (content) {
			let { left, right, top, bottom, height } = getPosition(editor, target)
			let { clientHeight, clientWidth } = editorContainer
			let max = bottom > top ? bottom : top

			tooltip.style.maxWidth = `min(${
				maxWidth ? maxWidth + "," : ""
			}${clientWidth}px - var(--padding-left) - 1em)`
			tooltip.style.maxHeight = `min(${maxHeight ? maxHeight + "," : ""}${max}px, ${
				clientHeight * 0.6
			}px - 2em)`
			spacer.style.width = (editorContainer.matches(".pce-rtl") ? right : left) + "px"
			tooltip.textContent = ""
			tooltip.append(...content)
			container.parentNode || addOverlay(editor, container)

			let placeAbove =
				!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above

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
