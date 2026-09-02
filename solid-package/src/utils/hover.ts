import { getTokenLanguage } from "./index.js"
import { PrismEditor } from ".."
import { getPosition } from "./local.js"
import { template } from "solid-js/web"
import { createComponent, createSignal, Show } from "solid-js"
import { HoverOptions, PrismCodeBlock } from "../code-block/index.js"

let counter = 0

const tooltipTemplate = /* @__PURE__ */ template(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex><div></div><div class=pce-hover-tooltip style=flex-shrink:0>",
)

const createHoverTooltip = <T extends PrismEditor | PrismCodeBlock>(
	editor: T,
	callback: (
		types: string[],
		language: string,
		text: string,
		element: HTMLSpanElement,
		editor: T,
	) => (string | Node)[] | null | undefined,
	options: HoverOptions,
) => {
	let current: HTMLSpanElement | null
	let openTimeout: number
	let cooldownTimeout: number
	let isWarm: boolean
	const { above, maxHeight, maxWidth, delay, warmDuration } = options
	const container = tooltipTemplate() as HTMLDivElement
	const editorContainer = editor.container
	const style = container.style
	const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>
	const [open, setOpen] = createSignal(false)

	const show = (target: HTMLElement) => {
		if (current == target) return

		if (delay && !isWarm) {
			clearTimeout(openTimeout)
			openTimeout = setTimeout(() => showDelayed(target), delay)
		} else {
			clearTimeout(cooldownTimeout)
			showDelayed(target)
		}
		current = target
	}

	const showDelayed = (target: HTMLElement) => {
		const types = target.className.slice(6).split(" ")
		const text = target.textContent
		const content = callback(types, getTokenLanguage(target), text, target, editor)
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
			if (warmDuration) {
				tooltip.classList.toggle("pce-instant", isWarm)
			}
			setOpen(true)

			let placeAbove =
				!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above

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
			setOpen(false)

			if (warmDuration) {
				clearTimeout(cooldownTimeout)
				cooldownTimeout = setTimeout(() => (isWarm = false), warmDuration)
			}
		}
	}

	tooltip.id = "pce-hover-" + counter++

	return [
		show,
		hide,
		tooltip,
		// @ts-expect-error keyed: false overload doesn't work
		createComponent(Show, {
			get when() {
				return open()
			},
			children: container,
		}),
	] as const
}

export { createHoverTooltip }
