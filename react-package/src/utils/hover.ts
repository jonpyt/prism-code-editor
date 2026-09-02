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
		number | undefined,
		number | undefined,
		boolean,
		...unknown[],
	],
) => {
	let current: HTMLSpanElement | null
	let openTimeout: number
	let cooldownTimeout: number
	let isWarm: boolean
	const container = template()
	const editorContainer = editor.container!
	const style = container.style
	const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>

	const show = (target: HTMLElement) => {
		if (current == target) return

		if (ref[3] && !isWarm) {
			clearTimeout(openTimeout)
			openTimeout = setTimeout(() => showDelayed(target), ref[3])
		} else {
			clearTimeout(cooldownTimeout)
			showDelayed(target)
		}
		current = target
	}

	const showDelayed = (target: HTMLElement) => {
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
			if (ref[4]) {
				tooltip.classList.toggle("pce-instant", isWarm)
			}
			container.parentNode || addOverlay(editor, container)

			let placeAbove =
				!ref[5] == top > bottom && (ref[5] ? top : bottom) < container.clientHeight
					? !ref[5]
					: ref[5]

			style[placeAbove ? "bottom" : "top"] = height + (placeAbove ? bottom : top) + "px"
			style[placeAbove ? "top" : "bottom"] = "auto"
			current?.removeAttribute("aria-describedby")
			target.setAttribute("aria-describedby", tooltip.id)
			isWarm = true
		} else hide()
	}

	const hide = () => {
		clearTimeout(openTimeout)

		if (current) {
			current.removeAttribute("aria-describedby")
			current = null
			container.remove()

			if (ref[4]) {
				clearTimeout(cooldownTimeout)
				cooldownTimeout = setTimeout(() => (isWarm = false), ref[4])
			}
		}
	}

	tooltip.id = "pce-hover-" + counter++

	return [show, hide, tooltip] as const
}

export { createHoverTooltip }
